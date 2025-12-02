import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || "default_secret_key"
);

// 1. BỎ "/dashboard" ra khỏi publicRoutes
const publicRoutes = [
  "/",
  "/sign-in", 
  "/sign-up",
  // "/dashboard" <--- Đã xóa dòng này
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Bỏ qua API routes
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }
  
  // Bỏ qua file tĩnh
  if (pathname.includes('.')) {
    return NextResponse.next();
  }
  
  // Bỏ qua Next.js internal routes
  if (pathname.startsWith("/_next/")) {
    return NextResponse.next();
  }
  
  // Kiểm tra nếu là public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );
  
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Tất cả routes khác đều cần bảo vệ (bao gồm /dashboard)
  const token = req.cookies.get("session")?.value;

  if (!token) {
    const url = new URL("/sign-in", req.url);
    return NextResponse.redirect(url);
  }

  try {
    // Giải mã token để lấy thông tin user (bao gồm role)
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // 2. THÊM LOGIC CHECK QUYỀN ADMIN CHO DASHBOARD
    // Nếu đang truy cập vào đường dẫn bắt đầu bằng /dashboard
    if (pathname.startsWith("/dashboard")) {
      // Kiểm tra role trong payload (giả sử bạn lưu role là 'admin')
      if (payload.role !== "admin") {
        // Nếu không phải admin -> Đẩy về trang chủ (hoặc trang báo lỗi 403)
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Lỗi xác thực JWT middleware:", err);
    const url = new URL("/sign-in", req.url);
    const response = NextResponse.redirect(url);
    response.cookies.delete("session");
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};