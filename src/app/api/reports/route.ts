import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-node";

// POST /api/reports - Submit a report
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.userId;

    // Parse request body
    const body = await request.json();
    const { entityType, entityId, reason, comment } = body;

    // Validate input
    if (!entityType || !entityId || !reason) {
      return NextResponse.json(
        { error: "Entity type, entity ID, and reason are required" },
        { status: 400 }
      );
    }

    const validEntityTypes = ["USER", "ITEM", "MESSAGE", "GROUP", "CHAT"];
    if (!validEntityTypes.includes(entityType)) {
      return NextResponse.json(
        { error: "Invalid entity type" },
        { status: 400 }
      );
    }

    // Check for duplicate report
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: userId,
        entityType,
        entityId,
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this" },
        { status: 400 }
      );
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        reporterId: userId,
        entityType,
        entityId,
        reason,
        comment: comment?.trim() || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Report submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}

// GET /api/reports - Get all reports (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const entityType = searchParams.get("entityType");

    // Build query
    const where: any = {};
    if (status && ["PENDING", "REVIEWED", "ACTION_TAKEN", "DISMISSED"].includes(status)) {
      where.status = status;
    }
    const validEntityTypes = ["USER", "ITEM", "MESSAGE", "GROUP", "CHAT"];
    if (entityType && validEntityTypes.includes(entityType)) {
      where.entityType = entityType;
    }

    // Fetch reports
    const reports = await prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Reports fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

