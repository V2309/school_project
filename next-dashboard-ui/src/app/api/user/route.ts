import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || "default_secret_key"
);

export async function GET() {
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