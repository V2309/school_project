import prisma from "@/lib/prisma";
import ClassLayoutWrapper from "@/components/ClassLayoutWrapper";
import { getCurrentUser } from "@/hooks/auth";
export default async function ClassLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { id: string; }; // Thêm route nếu cần thiết
}>) {
  const classDetail = await prisma.class.findUnique({
    where: { class_code: params.id },
    include: {
      supervisor: true,
      students: true,
      grade: true,
      
    },
  });
  const user = await getCurrentUser();

  if (!classDetail) {
    return <div>Không tìm thấy lớp học.</div>;
  }

  return (
    <ClassLayoutWrapper classDetail={classDetail} role={user?.role as string}>
      {children}
    </ClassLayoutWrapper>
  );
}

