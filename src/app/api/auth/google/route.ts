
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "Google OAuth not yet implemented. This is a mock response." },
    { status: 200 }
  );
}
