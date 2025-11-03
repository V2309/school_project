
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || 'jwt-default'
);

export async function getCurrentUser() {
  const session = cookies().get("session")?.value;
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, JWT_SECRET);
    return payload; // { id, username, role, exp }
  } catch {
    return null;
  }
 
}