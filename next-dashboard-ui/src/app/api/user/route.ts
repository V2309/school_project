import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || "71ae05550c898138fc632e4e6c0fba3f14cc10104e5697f19eb6fde9467b8d0cd19ab1faaa659f982a4c479d7f3d8827f815043d5064bec6b0c1d6e45842b77a"
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