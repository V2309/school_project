Nguyên tắc Phát triển Next.js 14 & React 18 - PHẢI TUÂN THEO CÁCH XỬ LÝ LOGIC CODE CỦA NHỮNG TRANG TÔI ĐÃ LÀM


1. Triết lý Cốt lõi: Ưu tiên Server (Server-First)

Đây là nguyên tắc quan trọng nhất. Nó quyết định hiệu suất và bảo mật của toàn bộ ứng dụng.

1.1. Mặc định là Server Component (RSC)

Mọi component bạn yêu cầu AI tạo ra PHẢI là Server Component theo mặc định. Không thêm "use client" trừ khi bắt buộc.

1.2. Chỉ dùng "use client" khi BẮT BUỘC

Chỉ thêm "use client" khi component đó cần các tính năng của trình duyệt:

useState, useEffect, useContext (React Hooks).

Các sự kiện (Event Listeners) như onClick, onChange, onSubmit.

Các API của trình duyệt (ví dụ: localStorage, window).

1.3. Cô lập Client Component

KHÔNG đặt "use client" ở file layout.tsx cấp cao nhất nếu có thể tránh. Điều này sẽ biến tất cả các trang con thành Client Component, làm mất hiệu suất.

TỐT (Nên làm): Tạo component con (ví dụ: Navigation.tsx), đặt "use client" trong đó, và import nó vào layout.tsx (là Server Component).

TỐT (Nên làm): Truyền Server Component làm children cho Client Component.

// layout.tsx (Server)
import ClientWrapper from './client-wrapper'
import ServerLogo from './server-logo'

export default function Layout({ children }) {
  return (
    <ClientWrapper>
      <ServerLogo /> {/* Server Component */}
      {children} {/* Server Component */}
    </ClientWrapper>
  )
}


2. Lấy & Thay đổi Dữ liệu

2.1. Lấy dữ liệu (Fetch) trong Server Component

LUÔN LUÔN lấy dữ liệu ban đầu (initial data) trực tiếp bên trong Server Component (page.tsx hoặc layout.tsx) bằng async/await.

// app/page.tsx (Server Component)
import prisma from '@/lib/prisma'

export default async function Page() {
  const posts = await prisma.post.findMany(); // Lấy data trực tiếp
  
  return <PostList posts={posts} />
}


2.2. Dùng Server Actions cho mọi Tương tác

Mọi hành động tạo, cập nhật, xóa (C-U-D) PHẢI sử dụng Server Actions.

KHÔNG tạo API Routes (app/api/...) cho các logic nội bộ của ứng dụng (như login, createPost).

LUÔN LUÔN dùng revalidatePath hoặc revalidateTag bên trong Server Action để làm mới cache dữ liệu.

2.3. Tối ưu Truy vấn Database

Để tránh load chậm (như trang Bảng điểm):

Chạy song song: Dùng Promise.all để chạy các truy vấn độc lập cùng một lúc.

Tránh N+1: Luôn dùng include của Prisma khi lấy dữ liệu quan hệ.

Lấy ít nhất: Luôn dùng select để chỉ lấy các trường cần thiết cho UI.

// TỆ ❌ (Chạy 3 truy vấn tuần tự)
const user = await prisma.user.findUnique(...);
const posts = await prisma.post.findMany(...);
const products = await prisma.product.findMany(...);

// TỐT ✅ (Chạy 3 truy vấn song song)
const [user, posts, products] = await Promise.all([
  prisma.user.findUnique(...),
  prisma.post.findMany(...),
  prisma.product.findMany(...)
]);


3. Cấu trúc Code & Tổ chức

3.1. Chia nhỏ Server Actions

NGHIÊM CẤM tạo một file actions.ts "biết tuốt" (God file) dài 1000+ dòng. Đây là nguyên nhân chính gây lỗi JavaScript heap out of memory khi build.

PHẢI: Tách các action ra theo domain (nghiệp vụ).

lib/actions/user.action.ts (chứa loginAction, signupAction, updateUserProfile)

lib/actions/class.action.ts (chứa joinClassAction, createClass)

lib/actions/post.action.ts (chứa createPost, likePost)

3.2. Sử dụng Route Groups ( )

Sử dụng Route Groups để tổ chức các layout khác nhau mà không ảnh hưởng đến URL.

(auth): Chứa các trang sign-in, sign-up với layout đơn giản.

(main): Chứa các trang chính của ứng dụng (dashboard, class) với layout có Navigation.

(fullpage): Chứa trang join (tham gia lớp) với layout "sạch" (không có gì cả).

4. Tối ưu Hiệu suất (Client)

4.1. Tối ưu Font

LUÔN LUÔN sử dụng next/font (ví dụ: Inter) trong file layout.tsx gốc để tối ưu và tránh "nháy" font (FOUT/CLS).

4.2. Tối ưu Ảnh

LUÔN LUÔN sử dụng component <Image /> của next/image.

PHẢI thêm priority cho các ảnh lớn, quan trọng xuất hiện trong màn hình đầu tiên (LCP).

4.3. Tải động (Lazy Loading)

PHẢI dùng next/dynamic để tải các component nặng (như thư viện biểu đồ, trình phát video YouTube, trình soạn thảo văn bản).

const LazyChart = dynamic(() => import('@/components/MyChart'), { 
  ssr: false,
  loading: () => <p>Đang tải biểu đồ...</p> 
});


5. Forms, Validation & Xử lý lỗi

5.1. Ưu tiên useFormState

Sử dụng hook useFormState (React 18) và useFormStatus để xử lý form, trạng thái pending và lỗi trả về từ Server Action.

5.2. Validation trên Server

KHÔNG BAO GIỜ import các thư viện server (như prisma, bcrypt) vào file Zod schema (formValidationSchema.ts) nếu file đó được import bởi một Client Component.

TỐT ✅: Validate logic đơn giản (min, max, email) bằng Zod ở Client Component.

TỐT HƠN ✅: Gửi formData lên Server Action và để Zod validate mọi thứ (kể cả logic phức tạp) bên trong Server Action. Điều này giữ cho Client Component của bạn siêu nhẹ.

// app/sign-up/page.tsx ("use client")
// KHÔNG import Zod, KHÔNG import Prisma

export default function SignUpPage() {
  const [state, formAction] = useFormState(signupAction, ...);
  
  return (
    <form action={formAction}>
      {/* ... */}
      <SubmitButton />
    </form>
  )
}


// lib/actions/user.action.ts ("use server")
// Import Zod và Prisma ở đây
import { z } from "zod";
import prisma from "@/lib/prisma";

const signupSchema = z.object({ ... }); // Định nghĩa schema ở đây

export async function signupAction(prevState, formData) {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  
  if (!parsed.success) {
    return { error: "Validation thất bại" };
  }
  
  // Kiểm tra email tồn tại (Prisma)
  const user = await prisma.user.findUnique(...);
  if (user) {
    return { error: "Email đã tồn tại" };
  }
  
  // ... (Tạo user)
  return { success: true };
}
