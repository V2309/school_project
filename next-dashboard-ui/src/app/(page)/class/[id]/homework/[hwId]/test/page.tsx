import prisma from "@/lib/prisma";
import { TestHomeWork } from "@/components/TestHomeWork";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/hooks/auth";

export default async function HomeworkTestPage({ params }: { params: { id: string; hwId: number } }) {
  const homework = await prisma.homework.findUnique({
    where: { id: Number(params.hwId) },
    include: {
      questions: true, // Sửa từ Question thành questions
      attachments: true, // lấy luôn file đính kèm
    },
  });

  if (!homework) {
    redirect("/404"); // Redirect đến trang 404 nếu không tìm thấy bài tập
  }
  
  const questions = homework.questions.map((q: any) => ({
    id: q.id,
    content: q.content,
    options: q.options || [], // Sử dụng trường options dạng JSON
    point: q.point,
  }));

  const duration = homework.duration || 30;
  const user = await getCurrentUser();
  const userId = user?.id;
  const role = user?.role;
  
  // Xử lý file attachment hoặc originalFile tùy theo type
  let fileInfo = {
    fileUrl: "",
    fileType: "",
    fileName: "",
  };

  if (homework.type === "extracted") {
    // Với dạng extracted, dùng originalFile nếu có
    if (homework.originalFileUrl) {
      fileInfo = {
        fileUrl: homework.originalFileUrl,
        fileType: homework.originalFileType ?? "",
        fileName: homework.originalFileName ?? "",
      };
    }
  } else {
    // Với dạng original, dùng attachment
    const file = homework.attachments?.[0];
    if (file) {
      fileInfo = {
        fileUrl: file.url ?? "",
        fileType: file.type ?? "",
        fileName: file.name ?? "",
      };
    }
  }


  return (
    <TestHomeWork
      homework={{
        id: homework.id,
        title: homework.title,
        description: homework.description ?? "",
        duration: homework.duration ?? 30,
        type: homework.type ?? "original", // Thêm type để phân biệt
        ...fileInfo,
      }}
      questions={questions}
      duration={duration}
      userId={userId as string}
      classCode={params.id}
      role={role as string}
    />
  );
}