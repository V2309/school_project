
// api/user/route.ts - 
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || "default_secret_key"
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const full = searchParams.get('full'); // ?full=true để lấy data đầy đủ

  // Nếu không cần full data, chỉ trả JWT payload (cho Stream, Navigation)
  if (!full) {
    const token = cookies().get("session")?.value;
    if (!token) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return NextResponse.json(payload);
    } catch (err) {
      console.error("API - JWT Error:", err);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  }

  // Nếu cần full data, lấy từ database (cho Profile)
  try {
    const userSession = await getCurrentUser();
    
    if (!userSession) {
      return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userSession.id as string },
      include: {
        student: true,
        teacher: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy thông tin người dùng." }, { status: 404 });
    }

    // Chuẩn hóa dữ liệu trả về cho Profile
    const userData = {
      id: user.id,
      username: user.username,
      phone: user.phone,
      email: user.email,
      birthday: user.birthday,
      address: user.address,
      schoolname: user.schoolname,
      role: user.role,
      img: user.img, // Thêm field img
      name: user.student?.username || user.teacher?.username || user.username,
      isPhoneVerified: user.isPhoneVerified || false,
      isEmailVerified: user.isEmailVerified || false,
      facebookLinked: false,
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error("API User Error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}