import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-node';

// POST /api/groups/[id]/items/[itemId]/book - Book an item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session || !session.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, itemId } = await params;
    const { startDate, endDate } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Compare dates only (not timestamps) so booking today is allowed
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const startDay = new Date(start);
    startDay.setHours(0, 0, 0, 0);
    const endDay = new Date(end);
    endDay.setHours(0, 0, 0, 0);

    if (startDay < todayStart) {
      return NextResponse.json(
        { error: 'Start date cannot be in the past' },
        { status: 400 }
      );
    }

    if (endDay < startDay) {
      return NextResponse.json(
        { error: 'End date must be on or after the start date' },
        { status: 400 }
      );
    }

    // Limit booking window to 90 days
    const maxEnd = new Date(todayStart);
    maxEnd.setDate(maxEnd.getDate() + 90);
    if (endDay > maxEnd) {
      return NextResponse.json(
        { error: 'Bookings cannot exceed 90 days from today' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check membership and status
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: user.id
        }
      }
    });

    if (!membership || membership.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'You must be an active member to book items' },
        { status: 403 }
      );
    }

    // Check item existence
    const item = await prisma.groupItem.findUnique({
      where: { id: itemId }
    });

    if (!item || item.groupId !== id) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (item.availabilityStatus !== 'AVAILABLE' && item.availabilityStatus !== 'ON_LOAN') {
      return NextResponse.json(
        { error: 'Item is currently not available for booking' },
        { status: 400 }
      );
    }

    // Check for overlapping bookings
    const overlaps = await prisma.groupBooking.count({
      where: {
        groupItemId: itemId,
        status: 'BOOKED',
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start }
          }
        ]
      }
    });

    if (overlaps > 0) {
      return NextResponse.json(
        { error: 'Item is already booked for these dates' },
        { status: 409 }
      );
    }

    // Create booking
    const booking = await prisma.groupBooking.create({
      data: {
        groupItemId: itemId,
        bookedByUserId: user.id,
        startDate: start,
        endDate: end,
        status: 'BOOKED'
      }
    });

    return NextResponse.json({ success: true, booking });

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
