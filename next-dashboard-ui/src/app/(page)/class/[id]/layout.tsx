import prisma from "@/lib/prisma";
import ClassLayoutWrapper from "@/components/ClassLayoutWrapper";
import { getCurrentUser } from "@/hooks/auth";
import QueryProvider from "@/providers/QueryProvider";

export default async function ClassLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { id: string; }; 
}>) {
  
  // 1. Chạy 2 truy vấn song song (parallel)
  const [classDetail, user] = await Promise.all([
    
    // Truy vấn 1: Chỉ lấy data mà MenuClass cần
    prisma.class.findUnique({
      where: { class_code: params.id },
      // 2. TỐI ƯU: Dùng `select` thay vì `include`
      select: {
        id: true,
        name: true,
        class_code: true,
        capacity: true,
        grade: { // Chỉ lấy 'level' nếu MenuClass cần
          select: { level: true }
        },
        supervisor: { // Chỉ lấy 'username' và 'img'
          select: { username: true, img: true }
        },
        // BỎ HOÀN TOÀN `students: true`.
        // Thay bằng `_count` nếu bạn cần hiển thị số lượng
        _count: {
          select: { students: true }
        }
      },
    }),
    
    // Truy vấn 2: Lấy user
    getCurrentUser()
  ]);

  if (!classDetail) {
    return <div>Không tìm thấy lớp học.</div>;
  }

  // 3. Gửi dữ liệu đã được tối ưu xuống Client Component
  // (Component `ClassLayoutWrapper` của bạn không cần thay đổi gì
  // vì nó chỉ truyền `classDetail` đi)
  return (
   <QueryProvider>
     <ClassLayoutWrapper classDetail={classDetail} role={user?.role as string}>
      {children}
     </ClassLayoutWrapper>
   </QueryProvider>
  );
}

