import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-node';

// POST /api/groups/[id]/items/[itemId]/return - Mark item as returned
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    const session = await getSession();
    if (!session || !session.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin access (only admins can mark return for now to ensure item condition check)
    const user = await prisma.user.findUnique({ where: { email: session.email } });
    const membership = await (prisma as any).groupMember.findUnique({
        where: { groupId_userId: { groupId: id, userId: user!.id } }
    });

    if (!membership || membership.role !== 'ADMIN') {
        const group = await (prisma as any).group.findUnique({ where: { id: id }, select: { ownerId: true } });
        if ((group as any)?.ownerId !== user?.id) {
             return NextResponse.json({ error: 'Only admins can process returns' }, { status: 403 });
        }
    }

    // Find active booking for this item
    // We assume the "active" one is the one currently "ON_LOAN" relative to today, 
    // or just the latest BOOKED one that hasn't been RETURNED.
    // For simplicity, we look for any booking where endDate >= today and status is BOOKED
    // OR just any BOOKED status for this item if we want to be loose.
    // Let's go with: Find the booking that is currently "active" (start <= now <= end) or just the most recent BOOKED one.
    
    // Actually, if an item is ON_LOAN, it implies a booking is active.
    // Let's find the booking that covers "now". 
    const now = new Date();
    
    const booking = await (prisma as any).groupBooking.findFirst({
        where: {
            groupItemId: itemId,
            status: 'BOOKED',
            startDate: { lte: now },
            // We don't strictly enforce endDate because they might be late
        },
        orderBy: { startDate: 'desc' }
    });

    if (!booking) {
         // If no current booking, maybe they are returning it early (before start date)? 
         // Or maybe they are returning a late item.
         // Let's just find the *last* booking that is BOOKED.
         const lastBooking = await (prisma as any).groupBooking.findFirst({
             where: { groupItemId: itemId, status: 'BOOKED' },
             orderBy: { startDate: 'desc' }
         });

         if (!lastBooking) {
             return NextResponse.json({ error: 'No active booking found to return' }, { status: 404 });
         }
         
         // Mark as returned
         await (prisma as any).groupBooking.update({
             where: { id: lastBooking.id },
             data: { status: 'RETURNED' }
         });
    } else {
         await (prisma as any).groupBooking.update({
             where: { id: booking.id },
             data: { status: 'RETURNED' }
         });
    }
    
    // Also update item status if we were tracking it (optional, but good for sync)
    // Prisma schema might not have status on item if derived from bookings, 
    // but we do have 'availabilityStatus' on GroupItem.
    await (prisma as any).groupItem.update({
        where: { id: itemId },
        data: { availabilityStatus: 'AVAILABLE' }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Return error:', error);
    return NextResponse.json({ error: 'Failed to return item' }, { status: 500 });
  }
}
