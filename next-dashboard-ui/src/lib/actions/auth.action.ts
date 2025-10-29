"use server";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY ||
    "default_secret_key_change_this_in_production"
);

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: email }, { phone: email }],
    },
  });

  if (!user) {
    return { error: "Tài khoản không tồn tại." };
  }

  const isMatch = await compare(password, user.password);
  if (!isMatch) {
    return { error: "Mật khẩu không đúng." };
  }

  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(JWT_SECRET);

  cookies().set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
    secure: process.env.NODE_ENV === "production",
  });

  if (user.role === "teacher") {
    redirect("/teacher/class");
  } else if (user.role === "student") {
    redirect("/student/overview");
  }

  return { success: true, role: user.role };
}

export async function logoutAction() {
  cookies().delete("session");
  redirect("/");
}
