// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET_KEY || "71ae05550c898138fc632e4e6c0fba3f14cc10104e5697f19eb6fde9467b8d0cd19ab1faaa659f982a4c479d7f3d8827f815043d5064bec6b0c1d6e45842b77a";

// // Các route cần bảo vệ và role được phép truy cập
// const protectedRoutes: Record<string, string[]> = {
//   "/teacher": ["teacher"],
//   "/student": ["student"],
  
//   // Thêm các route khác nếu cần
// };

// export function middleware(req: NextRequest) {
//   // Kiểm tra route có cần bảo vệ không
//   const pathname = req.nextUrl.pathname;
//   const matched = Object.entries(protectedRoutes).find(([route]) =>
//     pathname.startsWith(route)
//   );
//   if (!matched) return NextResponse.next();

//   // Lấy JWT từ cookie
//   const token = req.cookies.get("session")?.value;
//   if (!token) {
//     return NextResponse.redirect(new URL("/sign-in", req.url));
//   }
//   console.log('Session cookie:', req.cookies.get("session"));
//   console.log("JWT Token cookie:", token);

//   try {
//     // Xác thực JWT
//     const payload = jwt.verify(token, JWT_SECRET) as { role: string };
//     const allowedRoles = matched[1];
//     if (!allowedRoles.includes(payload.role)) {
//       // Không đủ quyền
//       return NextResponse.redirect(new URL("/", req.url));
//     }
//     // Đúng quyền, cho qua
//     return NextResponse.next();
//   } catch (err) {
//     // JWT không hợp lệ hoặc hết hạn
//     return NextResponse.redirect(new URL("/sign-in", req.url));
//   }
// }

// export const config = {
//   matcher: [
//     "/teacher/:path*",
//     "/student/:path*",
    
//     // Thêm các route cần bảo vệ ở đây
//   ],
// };

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || "71ae05550c898138fc632e4e6c0fba3f14cc10104e5697f19eb6fde9467b8d0cd19ab1faaa659f982a4c479d7f3d8827f815043d5064bec6b0c1d6e45842b77a"
);

const protectedRoutes: Record<string, string[]> = {
  "/teacher": ["teacher"],
  "/student": ["student"],
 
};

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  console.log(`Middleware - Processing request for: ${pathname}`);

  if (pathname === "/sign-in") {
    console.log("Middleware - Skipping /sign-in");
    return NextResponse.next();
  }

  const matched = Object.entries(protectedRoutes).find(([route]) =>
    pathname.startsWith(route)
  );
  if (!matched) {
    console.log("Middleware - No protected route matched, allowing request");
    return NextResponse.next();
  }

  const token = req.cookies.get("session")?.value;
  console.log("Middleware - Token:", token);

  if (!token) {
    console.log("Middleware - No token, redirecting to /sign-in");
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log("Middleware - Payload:", payload);
    const allowedRoles = matched[1];
    if (!allowedRoles.includes(payload.role as string)) {
      console.log("Middleware - Role not allowed, redirecting to /");
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    console.log("Middleware - Access granted, proceeding to route");
    return NextResponse.next();
  } catch (err) {
    console.error("Middleware - JWT Error:", err);
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
}

export const config = {
  matcher: ["/teacher/:path*", "/student/:path*"],
};