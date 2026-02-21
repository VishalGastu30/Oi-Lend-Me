import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Rate limiting: max 5 requirements per day per user
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_HOURS = 24;

const createRequirementSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().max(500).optional(),
  category: z.enum(["Electronics", "Books", "Lab", "Misc", "Chargers", "Class"]),
  durationStart: z.string().datetime(),
  durationEnd: z.string().datetime(),
  urgency: z.enum(["NORMAL", "URGENT"]).default("NORMAL"),
  visibility: z.enum(["CAMPUS", "GROUP"]).default("CAMPUS"),
  groupId: z.string().uuid().optional(),
});

// GET /api/requirements - List requirements
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "OPEN";
    const category = searchParams.get("category");
    const visibility = searchParams.get("visibility");
    const urgency = searchParams.get("urgency");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {
      status,
      expiresAt: { gte: new Date() }, // Exclude expired
    };

    if (category) where.category = category;
    if (visibility) where.visibility = visibility;
    if (urgency) where.urgency = urgency;

    // If filtering by GROUP visibility, only show user's groups
    if (visibility === "GROUP") {
      const userGroups = await prisma.groupMember.findMany({
        where: { userId: session.userId },
        select: { groupId: true },
      });
      where.groupId = { in: userGroups.map((g) => g.groupId) };
    }

    const [requirements, total] = await Promise.all([
      prisma.requirement.findMany({
        where,
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              karmaScore: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: { responses: true },
          },
        },
        orderBy: [
          { urgency: "desc" }, // Urgent first
          { createdAt: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.requirement.count({ where }),
    ]);

    return NextResponse.json({
      data: requirements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching requirements:", error);
    return NextResponse.json(
      { error: "Failed to fetch requirements" },
      { status: 500 }
    );
  }
}

// POST /api/requirements - Create requirement
export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createRequirementSchema.parse(body);

    // Rate limiting check
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - RATE_LIMIT_WINDOW_HOURS);

    const recentCount = await prisma.requirement.count({
      where: {
        requesterId: session.userId,
        createdAt: { gte: cutoffTime },
      },
    });

    if (recentCount >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: `You can only post ${RATE_LIMIT_MAX} requirements per day` },
        { status: 429 }
      );
    }

    // Validate dates
    const startDate = new Date(validated.durationStart);
    const endDate = new Date(validated.durationEnd);
    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Validate group membership if GROUP visibility
    if (validated.visibility === "GROUP") {
      if (!validated.groupId) {
        return NextResponse.json(
          { error: "Group ID required for group visibility" },
          { status: 400 }
        );
      }

      const membership = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: validated.groupId,
            userId: session.userId,
          },
        },
      });

      if (!membership) {
        return NextResponse.json(
          { error: "You are not a member of this group" },
          { status: 403 }
        );
      }
    }

    // Calculate expiry (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create requirement
    const requirement = await prisma.requirement.create({
      data: {
        title: validated.title,
        description: validated.description,
        category: validated.category,
        durationStart: startDate,
        durationEnd: endDate,
        urgency: validated.urgency,
        visibility: validated.visibility,
        requesterId: session.userId,
        groupId: validated.groupId,
        expiresAt,
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            karmaScore: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log activity
    // TODO: Add to activity feed when implemented

    return NextResponse.json({ data: requirement }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating requirement:", error);
    return NextResponse.json(
      { error: "Failed to create requirement" },
      { status: 500 }
    );
  }
}
