import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-node";
import { errorResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session || session.role !== "ADMIN") {
    return errorResponse("Unauthorized", 403);
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  try {
    // Admin sees ALL groups — no visibility/status filter
    const where: any = {};
    
    if (query.trim()) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
        { owner: { name: { contains: query, mode: "insensitive" } } },
        { owner: { email: { contains: query, mode: "insensitive" } } },
      ];
    }

    const groups = await prisma.group.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Flatten _count for frontend
    const formatted = groups.map((g: any) => ({
      ...g,
      memberCount: g._count?.members ?? g.memberCount ?? 0,
    }));

    return NextResponse.json({ groups: formatted });
  } catch (error) {
    console.error("Group search failed:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
