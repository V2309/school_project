import prisma from "@/lib/prisma";
import { TestHomeWork } from "@/components/TestHomeWork";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/hooks/auth";

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

  const user = await getCurrentUser();
  const userId = user?.id;
  const role = user?.role;

  // Kiểm tra nếu là student thì validate các điều kiện
  if (role === "student") {
    const now = new Date();
    const startTime = homework.startTime ? new Date(homework.startTime) : null;
    const endTime = homework.endTime ? new Date(homework.endTime) : null;

    // Kiểm tra thời gian bắt đầu
    if (startTime && now < startTime) {
      const timeDiff = startTime.getTime() - now.getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Bài tập chưa bắt đầu</h2>
            <p className="text-gray-600 mb-2">Bài tập sẽ bắt đầu sau:</p>
            <p className="text-xl font-semibold text-blue-600">
              {hours > 0 ? `${hours} giờ ` : ""}{minutes} phút
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Thời gian bắt đầu: {startTime.toLocaleString("vi-VN")}
            </p>
          </div>
        </div>
      );
    }

    // Kiểm tra hạn nộp
    if (endTime && now > endTime) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Đã hết hạn nộp bài</h2>
            <p className="text-gray-600 mb-2">Thời gian nộp bài đã kết thúc</p>
            <p className="text-sm text-gray-500">
              Hạn chót: {endTime.toLocaleString("vi-VN")}
            </p>
          </div>
        </div>
      );
    }

    // Kiểm tra số lần làm bài
    const existingSubmissions = await prisma.homeworkSubmission.findMany({
      where: {
        homeworkId: homework.id,
        studentId: userId as string,
      },
    });

    const maxAttempts = homework.maxAttempts || 1;
    if (existingSubmissions.length >= maxAttempts) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Đã hết lượt làm bài</h2>
            <p className="text-gray-600 mb-2">
              Bạn đã làm bài {existingSubmissions.length}/{maxAttempts} lần
            </p>
            <p className="text-sm text-gray-500">
              Số lần làm bài tối đa: {maxAttempts}
            </p>
          </div>
        </div>
      );
    }
  }
  
  const questions = homework.questions.map((q: any) => ({
    id: q.id,
    content: q.content,
    options: q.options || [], // Sử dụng trường options dạng JSON
    point: q.point,
  }));

  const duration = homework.duration || 30;
  
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
        startTime: homework.startTime,
        endTime: homework.endTime,
        maxAttempts: homework.maxAttempts,
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