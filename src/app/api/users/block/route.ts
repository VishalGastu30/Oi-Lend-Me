import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// POST /api/users/block - Block a user
export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = sessionCookie.value;

    // Parse request body
    const body = await request.json();
    const { blockedId } = body;

    // Validate input
    if (!blockedId) {
      return NextResponse.json(
        { error: "Blocked user ID is required" },
        { status: 400 }
      );
    }

    // Prevent self-blocking
    if (userId === blockedId) {
      return NextResponse.json(
        { error: "Cannot block yourself" },
        { status: 400 }
      );
    }

    // Check if already blocked
    const existing = await prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: userId,
          blockedId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User is already blocked" },
        { status: 400 }
      );
    }

    // Create block
    const block = await prisma.blockedUser.create({
      data: {
        blockerId: userId,
        blockedId,
      },
    });

    return NextResponse.json({
      success: true,
      data: block,
    });
  } catch (error) {
    console.error("Block user error:", error);
    return NextResponse.json(
      { error: "Failed to block user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/block - Unblock a user
export async function DELETE(request: NextRequest) {
  try {
    // Get user from session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = sessionCookie.value;

    // Parse request body
    const body = await request.json();
    const { blockedId } = body;

    // Validate input
    if (!blockedId) {
      return NextResponse.json(
        { error: "Blocked user ID is required" },
        { status: 400 }
      );
    }

    // Delete block
    await prisma.blockedUser.delete({
      where: {
        blockerId_blockedId: {
          blockerId: userId,
          blockedId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "User unblocked successfully",
    });
  } catch (error) {
    console.error("Unblock user error:", error);
    return NextResponse.json(
      { error: "Failed to unblock user" },
      { status: 500 }
    );
  }
}

// GET /api/users/block - Get list of blocked users
export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = sessionCookie.value;

    // Get blocked users
    const blocks = await prisma.blockedUser.findMany({
      where: {
        blockerId: userId,
      },
      select: {
        blockedId: true,
      },
    });

    const blockedIds = blocks.map((b: { blockedId: string }) => b.blockedId);

    return NextResponse.json({
      success: true,
      data: blockedIds,
    });
  } catch (error) {
    console.error("Get blocked users error:", error);
    return NextResponse.json(
      { error: "Failed to get blocked users" },
      { status: 500 }
    );
  }
}
