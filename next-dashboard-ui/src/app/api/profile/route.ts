// api/user/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/hooks/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const userSession = await getCurrentUser();
    
    if (!userSession) {
      return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
    }

    // Lấy thông tin user từ database
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

    // Chuẩn hóa dữ liệu trả về
    const userData = {
      username: user.username,
      phone: user.phone,
      email: user.email,
      birthday: user.birthday,
      address: user.address,
      schoolname: user.schoolname,
      role: user.role,
      name: user.student?.username || user.teacher?.username || user.username,
      isPhoneVerified: false, // Có thể thêm trường này vào database sau
      isEmailVerified: false, // Có thể thêm trường này vào database sau
      facebookLinked: false, // Có thể thêm trường này vào database sau
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error("API User Error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}