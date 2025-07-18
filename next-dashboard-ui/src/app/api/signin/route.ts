"use server";
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET_KEY || 'your-secret-key'; // Đặt biến môi trường thực tế khi deploy

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Tìm user theo email hoặc phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { phone: email }, // Cho phép đăng nhập bằng số điện thoại
        ],
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'Tài khoản không tồn tại.' }), { status: 401 });
    }

    // Kiểm tra mật khẩu
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return new Response(JSON.stringify({ error: 'Mật khẩu không đúng.' }), { status: 401 });
    }

    // Tạo JWT
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role, // role: "student" | "teacher"
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    console.log('JWT Token:', token);
    // Set cookie session
    return new Response(JSON.stringify({ message: 'Đăng nhập thành công', token, role: user.role }), {
      status: 200,
      headers: {
        'Set-Cookie': `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Lỗi máy chủ.' }), { status: 500 });
  }
}