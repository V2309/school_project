// app/(page)/class/[id]/documents/page.tsx
import { getCurrentUser } from "@/hooks/auth";
import DocumentPageClient from "@/components/DocumentPageClient";
import prisma from "@/lib/prisma";

interface DocumentPageProps {
  params: { id: string };
  searchParams: { [key: string]: string | undefined };
}

export default async function Document({ params, searchParams }: DocumentPageProps) {
  // Lấy thông tin user từ server
  const user = await getCurrentUser();
  const classCode = params.id;

  if (!user) {
    return <div>Bạn cần đăng nhập để xem tài liệu.</div>;
  }

  // Lấy danh sách tài liệu từ server
  let whereClause: any = { classCode };
  
  // Nếu là teacher, chỉ lấy files do họ upload
  if (user.role === "teacher") {
    whereClause.uploadedBy = user.id;
  }

  // Thêm điều kiện search nếu có
  if (searchParams?.search) {
    whereClause.name = {
      contains: searchParams.search,
      mode: "insensitive",
    };
  }

  const files = await prisma.file.findMany({
    where: whereClause,
    include: {
      teacher: {
        select: {
          username: true,
        },
      },
      class: {
        select: {
          name: true,
          class_code: true,
        },
      },
      views: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: {
          viewedAt: 'asc' // Sắp xếp theo thời gian xem để lấy lần đầu tiên
        }
      },
      _count: {
        select: {
          views: true,
        },
      },
    },
    orderBy: {
      uploadedAt: "desc",
    },
  });

  // Thêm thông tin về việc user hiện tại đã xem file hay chưa và convert Date thành string
  const filesWithViewStatus = files.map(file => {
    const userView = file.views.find(view => view.user.id === user.id);
    return {
      ...file,
      uploadedAt: file.uploadedAt.toISOString(),
      views: file.views.map(view => ({
        ...view,
        viewedAt: view.viewedAt.toISOString()
      })),
      viewedByCurrentUser: !!userView,
      firstViewedAt: userView?.viewedAt?.toISOString() || null
    };
  });

  return (
    <div className="px-4 py-4 bg-white rounded-lg shadow-md flex flex-col h-full">
      {/* Truyền data và role xuống client component */}
      <DocumentPageClient 
        userRole={user?.role as string} 
        initialFiles={filesWithViewStatus}
        classCode={classCode}
      />
    </div>
  );
}