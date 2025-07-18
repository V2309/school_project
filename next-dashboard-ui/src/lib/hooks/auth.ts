import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || '71ae05550c898138fc632e4e6c0fba3f14cc10104e5697f19eb6fde9467b8d0cd19ab1faaa659f982a4c479d7f3d8827f815043d5064bec6b0c1d6e45842b77a'
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
  console.log("Current user:", session);
}

// import prisma from "@/lib/prisma";
// import { cookies } from "next/headers";
// import { jwtVerify } from "jose";

// const JWT_SECRET = new TextEncoder().encode(
//   process.env.JWT_SECRET_KEY || '71ae05550c898138fc632e4e6c0fba3f14cc10104e5697f19eb6fde9467b8d0cd19ab1faaa659f982a4c479d7f3d8827f815043d5064bec6b0c1d6e45842b77a'
// );
// export async function getCurrentUser() {
//   const session = cookies().get("session")?.value;
//   if (!session) return null;
  
//   try {
//     const { payload } = await jwtVerify(session, JWT_SECRET);
    
//     // Lấy thông tin user từ database để có id chính xác
//     const user = await prisma.user.findUnique({
//       where: { id: payload.id as string },
//       select: { id: true, role: true, username: true }
//     });
    
//     return user;
//   } catch (err) {
//     console.error("JWT verification error:", err);
//     return null;
//   }
// }


