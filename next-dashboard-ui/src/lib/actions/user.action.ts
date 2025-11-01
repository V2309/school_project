"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/hooks/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcryptjs from "bcryptjs";
import { changePasswordSchema } from "@/lib/formValidationSchema";
import bcrypt from "bcryptjs";

// Định nghĩa kiểu trả về của action
type ActionState = {
  success: boolean;
  error?: string;
};

// Định nghĩa các schema để validate
const phoneSchema = z.string().min(9, "Số điện thoại phải có ít nhất 9 số.");
const emailSchema = z.string().email("Email không hợp lệ.");
const nameSchema = z.string().min(2, "Tên quá ngắn.");
// (Bạn có thể thêm các schema khác ở đây)

export async function updateUserProfile(
  // Dùng `fieldKey` để biết nên update trường nào
  fieldKey: "phone" | "email" | "name" | "schoolname" | "address" | "birthday", 
  value: string
): Promise<ActionState> {
  
  const userSession = await getCurrentUser();
  if (!userSession) {
    return { success: false, error: "Bạn chưa đăng nhập." };
  }

  // 1. Validate dữ liệu
  try {
    if (fieldKey === "phone") phoneSchema.parse(value);
    if (fieldKey === "email") emailSchema.parse(value);
    if (fieldKey === "name") nameSchema.parse(value);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0].message };
    }
  }
  
  // 2. Cập nhật database
  try {
    // Nếu cập nhật trường `name` (Tên),
    // chúng ta cần cập nhật cả bảng `student` hoặc `teacher`
    if (fieldKey === "name") {
      const user = await prisma.user.findUnique({
        where: { id: userSession.id as string },
        select: { role: true }
      });
      
      if (user?.role === 'student') {
         await prisma.student.update({
            where: { userId: userSession.id as string },
            data: { username: value } // Giả sử tên học sinh lưu ở `student.username`
         });
      } else if (user?.role === 'teacher') {
         await prisma.teacher.update({
            where: { userId: userSession.id as string },
            data: { username: value } // Giả sử tên giáo viên lưu ở `teacher.username`
         });
      }
      // Vẫn cập nhật bảng user
       await prisma.user.update({
        where: { id: userSession.id as string },
        data: { username: value }, // Cập nhật cả 'user.username'
      });

      // ✅ TẠO LẠI JWT TOKEN với tên mới
      const { SignJWT } = await import('jose');
      const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET_KEY || "default_secret_key");
      
      const newToken = await new SignJWT({
        id: userSession.id,
        username: value, // ✅ Tên mới
        role: user?.role
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

      // ✅ CẬP NHẬT COOKIE
      const { cookies } = await import('next/headers');
      cookies().set('session', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    }
    else if (fieldKey === "birthday") {
      // Xử lý ngày sinh - chuyển đổi string thành Date
      const dateValue = new Date(value);
      await prisma.user.update({
        where: { id: userSession.id as string },
        data: {
          birthday: dateValue,
        },
      });
    }
    else {
      // Cập nhật các trường thông thường trên bảng User
      await prisma.user.update({
        where: { id: userSession.id as string },
        data: {
          [fieldKey]: value,
          // Nếu cập nhật SĐT/Email, bạn có thể muốn reset trạng thái xác thực
          // ...(fieldKey === 'phone' && { isPhoneVerified: false }),
          // ...(fieldKey === 'email' && { isEmailVerified: false }),
        },
      });
    }

    // 3. Làm mới cache
    revalidatePath("/profile");
    
    return { success: true };

  } catch (err: any) {
    console.error("Update Profile Error:", err);
    // Xử lý lỗi nếu SĐT/Email đã tồn tại
    if (err?.code === 'P2002') { // Mã lỗi unique constraint của Prisma
       return { success: false, error: `${fieldKey === 'phone' ? 'SĐT' : 'Email'} này đã được sử dụng.` };
    }
    return { success: false, error: "Cập nhật thất bại. Vui lòng thử lại." };
  }
}

// Action để đổi mật khẩu (bỏ mật khẩu hiện tại vì không thể so sánh với DB đã mã hóa)
export async function changePassword(
  newPassword: string,
  confirmPassword: string
): Promise<ActionState> {
  const userSession = await getCurrentUser();
  if (!userSession) {
    return { success: false, error: "Bạn chưa đăng nhập." };
  }

  try {
    // 1. Validate dữ liệu với schema
    const validationResult = changePasswordSchema.safeParse({
      newPassword,
      confirmPassword,
    });

    if (!validationResult.success) {
      return { 
        success: false, 
        error: validationResult.error.errors[0].message 
      };
    }

    // 2. Mã hóa mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 3. Cập nhật mật khẩu mới
    await prisma.user.update({
      where: { id: userSession.id as string },
      data: { password: hashedNewPassword },
    });

    // 4. Làm mới cache
    revalidatePath("/profile");
    
    return { success: true };

  } catch (err: any) {
    console.error("Change Password Error:", err);
    return { success: false, error: "Đổi mật khẩu thất bại. Vui lòng thử lại." };
  }
}
