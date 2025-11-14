// api/user/logout/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Xóa session/token cookies
    const response = NextResponse.json({ success: true });
    
    // Xóa các cookies liên quan đến auth
    response.cookies.delete("token");
    response.cookies.delete("session");
    
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}