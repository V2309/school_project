import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma"; // 1. Import Prisma

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || 'jwt-default'
);

export async function getCurrentUser() {
  const session = cookies().get("session")?.value;
  if (!session) return null;
  
  try {
    // 2. Giải mã token để lấy payload (vẫn như cũ)
    const { payload } = await jwtVerify(session, JWT_SECRET);

    // 3. Lấy ID từ payload
    // (JWT chuẩn dùng 'sub', nhưng có thể bạn dùng 'id'. Code này kiểm tra cả hai)
    const userId = (payload.id || payload.sub) as string | undefined;

    if (!userId) {
      console.error("JWT payload không chứa 'id' hoặc 'sub'");
      return null;
    }

    // 4. DÙNG ID ĐỂ GỌI DATABASE (Đây là bước bị thiếu)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      // 5. Chọn các trường bạn muốn trả về (quan trọng là 'email' và 'isEmailVerified')
      select: {
        id: true,
        username: true,
        email: true, // <-- Lấy email
        isEmailVerified: true, // <-- Lấy trạng thái xác minh
        role: true,
        img: true,
        // (Không lấy 'password')
      }
    });

    return user; // 6. Trả về đối tượng USER đầy đủ từ Prisma

  } catch (err) {
    console.error("Lỗi xác thực (auth.ts):", err);
    return null;
  }
}