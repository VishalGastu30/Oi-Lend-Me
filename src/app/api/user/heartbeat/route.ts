import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth-edge";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const payload = await verifyJWT<{ userId: string }>(token);
    if (!payload) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const status = body.status; // 'online' | 'offline'

    await prisma.user.update({
      where: { id: payload.userId },
      data: {
        lastSeen: new Date(),
        // If explicitly sending 'offline' (e.g. tab close), set false. Otherwise true.
        isOnline: status === 'offline' ? false : true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Heartbeat error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
