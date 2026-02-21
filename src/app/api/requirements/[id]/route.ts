import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/requirements/[id] - Get single requirement
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession(req);
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requirement = await prisma.requirement.findUnique({
      where: { id },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            karmaScore: true,
            about: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        responses: {
          include: {
            lender: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                karmaScore: true,
              },
            },
            item: {
              select: {
                id: true,
                name: true,
                category: true,
                imageUrl: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!requirement) {
      return NextResponse.json(
        { error: "Requirement not found" },
        { status: 404 }
      );
    }

    // Check visibility permissions
    if (requirement.visibility === "GROUP") {
      if (!requirement.groupId) {
        return NextResponse.json({ error: "Invalid group" }, { status: 400 });
      }

      const membership = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: requirement.groupId,
            userId: session.userId,
          },
        },
      });

      if (!membership && requirement.requesterId !== session.userId) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    return NextResponse.json({ data: requirement });
  } catch (error) {
    console.error("Error fetching requirement:", error);
    return NextResponse.json(
      { error: "Failed to fetch requirement" },
      { status: 500 }
    );
  }
}

// PATCH /api/requirements/[id] - Update requirement status
export async function PATCH(
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
    const { status } = body;

    if (!["FULFILLED", "CLOSED", "EXPIRED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Check ownership
    const requirement = await prisma.requirement.findUnique({
      where: { id },
      select: { requesterId: true, status: true },
    });

    if (!requirement) {
      return NextResponse.json(
        { error: "Requirement not found" },
        { status: 404 }
      );
    }

    if (requirement.requesterId !== session.userId) {
      return NextResponse.json(
        { error: "Only the creator can update this requirement" },
        { status: 403 }
      );
    }

    // Validate status transition
    if (requirement.status !== "OPEN") {
      return NextResponse.json(
        { error: "Can only update open requirements" },
        { status: 400 }
      );
    }

    const updated = await prisma.requirement.update({
      where: { id },
      data: { status },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            karmaScore: true,
          },
        },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Error updating requirement:", error);
    return NextResponse.json(
      { error: "Failed to update requirement" },
      { status: 500 }
    );
  }
}
