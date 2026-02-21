import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const respondSchema = z.object({
  itemId: z.string().uuid().optional(),
});

// POST /api/requirements/[id]/respond - Respond to requirement with an item
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession(req);
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { itemId: providedItemId } = respondSchema.parse(body);

    // Fetch requirement
    const requirement = await prisma.requirement.findUnique({
      where: { id },
      include: {
        requester: {
          select: { id: true, name: true },
        },
      },
    });

    if (!requirement) {
      return NextResponse.json(
        { error: "Requirement not found" },
        { status: 404 }
      );
    }

    // Check if requirement is still open
    if (requirement.status !== "OPEN") {
      return NextResponse.json(
        { error: "This requirement has already been fulfilled or closed" },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date() > requirement.expiresAt) {
      return NextResponse.json(
        { error: "This requirement has expired" },
        { status: 400 }
      );
    }

    // Cannot respond to own requirement
    if (requirement.requesterId === session.userId) {
      return NextResponse.json(
        { error: "You cannot respond to your own requirement" },
        { status: 400 }
      );
    }

    // If itemId is provided, verify ownership and availability
    if (providedItemId) {
      const item = await prisma.item.findUnique({
        where: { id: providedItemId },
        select: {
          id: true,
          name: true,
          category: true,
          status: true,
          ownerId: true,
          groupId: true,
        },
      });

      if (!item) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }

      // Check ownership (personal or group admin)
      let canLend = false;
      if (item.ownerId === session.userId) {
        canLend = true;
      } else if (item.groupId) {
        const membership = await prisma.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId: item.groupId,
              userId: session.userId,
            },
          },
        });
        if (membership?.role === "ADMIN") {
          canLend = true;
        }
      }

      if (!canLend) {
        return NextResponse.json(
          { error: "You do not have permission to lend this item" },
          { status: 403 }
        );
      }

      // Check if item is available
      if (item.status !== "AVAILABLE") {
        return NextResponse.json(
          { error: "This item is not currently available" },
          { status: 400 }
        );
      }
    }

    // Check if user already responded (to prevent double offering)
    const existingResponse = await prisma.requirementResponse.findFirst({
      where: {
        requirementId: id,
        lenderId: session.userId,
      },
    });

    if (existingResponse) {
      return NextResponse.json(
        { error: "You have already responded to this requirement" },
        { status: 400 }
      );
    }

    // Transaction to execute the "Offer to Help" logic
    // 1. Create Items (if needed)
    // 2. Create Request (APPROVED)
    // 3. Update Requirement (FULFILLED)
    // 4. Create/Link Conversation
    const result = await prisma.$transaction(async (tx) => {
      let finalItemId = providedItemId;

      // 1. If no item provided, create a temporary one
      if (!finalItemId) {
        const tempItem = await tx.item.create({
          data: {
            name: `(Offer) ${requirement.title}`,
            description: `Temporary item created to fulfill requirement: ${requirement.title}`,
            category: requirement.category,
            ownerId: session.userId,
            status: "BORROWED", // Immediately borrowed
            imageUrl: null, // Could add a placeholder if desired
          },
        });
        finalItemId = tempItem.id;
      } else {
        // Mark existing item as borrowed
        await tx.item.update({
          where: { id: finalItemId },
          data: { status: "BORROWED" },
        });
      }

      // 2. Create borrow request (directly to BORROWED for active lending)
      const borrowRequest = await tx.request.create({
        data: {
          itemId: finalItemId!,
          requesterId: requirement.requesterId,
          status: "BORROWED", // Active transaction immediately
          startDate: requirement.durationStart,
          endDate: requirement.durationEnd,
        },
      });

      // 3. Update Requirement to FULFILLED (locks it)
      await tx.requirement.update({
        where: { id },
        data: { status: "FULFILLED" },
      });

      // 4. Create or find conversation
      const existingConversation = await tx.conversation.findFirst({
        where: {
          OR: [
            {
              userAId: session.userId,
              userBId: requirement.requesterId,
            },
            {
              userAId: requirement.requesterId,
              userBId: session.userId,
            },
          ],
        },
      });

      let conversation;
      if (existingConversation) {
        conversation = existingConversation;
        // Update conversation
        await tx.conversation.update({
          where: { id: existingConversation.id },
          data: {
            lastMessageAt: new Date(),
            status: "ACTIVE", // Ensure it's active
          },
        });
      } else {
        conversation = await tx.conversation.create({
          data: {
            userAId: session.userId,
            userBId: requirement.requesterId,
            status: "ACTIVE",
          },
        });
      }

      // 5. Link conversation to borrow request
      await tx.request.update({
        where: { id: borrowRequest.id },
        data: { conversationId: conversation.id },
      });

      // 6. Create requirement response
      const response = await tx.requirementResponse.create({
        data: {
          requirementId: id,
          lenderId: session.userId,
          itemId: finalItemId!,
          borrowRequestId: borrowRequest.id,
        },
      });

      // 7. Create notification for requester
      await tx.notification.create({
        data: {
          userId: requirement.requesterId,
          type: "REQUEST",
          message: `Your request "${requirement.title}" has been fulfilled! Check the chat to coordinate.`,
          resourcePath: `/chat/${conversation.id}`,
        },
      });

      return { response, borrowRequest, conversation };
    });

    return NextResponse.json(
      {
        data: result.response,
        borrowRequest: result.borrowRequest,
        conversationId: result.conversation.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error responding to requirement:", error);
    return NextResponse.json(
      { error: "Failed to respond to requirement" },
      { status: 500 }
    );
  }
}
