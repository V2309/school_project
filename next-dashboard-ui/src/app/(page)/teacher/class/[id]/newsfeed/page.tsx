import prisma from "@/lib/prisma";
import Feed from "@/components/Feed";
import Share from "@/components/Share";
import { getCurrentUser } from "@/lib/hooks/auth";
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import Notification from "@/components/Notification";
import Socket from "@/components/Socket";

export default async function NewsfeedPage({ params }: { params: { id: string } }) {
  // Lấy thông tin lớp học từ class_code (vì params.id có thể là class_code)
  const classInfo = await prisma.class.findUnique({
    where: { class_code: params.id },
    select: { class_code: true, name: true }
  });

  if (!classInfo) {
    return <div>Không tìm thấy lớp học</div>;
  }

  // Lấy thông tin user hiện tại
  const user = await getCurrentUser();

  return (
    <div className="flex">
        <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 bg-white p-4 rounded-lg shadow">
        <AcademicCapIcon className="h-6 w-6 text-blue-600" />
        Bảng Tin Lớp: {classInfo.name}
      </h1>

      {/* Form tạo bài viết mới */}
      <div className="bg-white rounded-lg shadow mb-6">
        <Share classCode={classInfo.class_code!} userImg={user?.img as string || undefined} />
      </div>

      {/* Sử dụng component Feed với classCode */}
      <Feed classCode={classInfo.class_code || undefined} />
    </div>

      {/* notifi */}
      {/* <Notification /> */}
  
    </div>
  );
}
