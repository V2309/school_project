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
    answer: q.answer, // Thêm đáp án đúng từ database
  }));

  const duration = homework.duration || 30;
  const user = await getCurrentUser();
  const userId = user?.id;
  const role = user?.role;
  
  // Kiểm tra số lần đã làm và quyền làm bài của học sinh
  if (role === 'student') {
    // Đếm số lần đã làm bài
    const submissionCount = await prisma.homeworkSubmission.count({
      where: {
        homeworkId: homework.id,
        studentId: userId as string
      }
    });

    const maxAttempts = homework.maxAttempts || 1;

    // Debug log
    console.log(`DEBUG: submissionCount=${submissionCount}, maxAttempts=${maxAttempts}, blockViewAfterSubmit=${homework.blockViewAfterSubmit}`);

    // Kiểm tra đã hết lượt làm bài chưa
    if (submissionCount >= maxAttempts) {
      console.log('REDIRECT: Đã hết lượt làm bài');
      redirect(`/class/${params.id}/homework/list`);
    }

    // Kiểm tra thời gian bắt đầu và kết thúc
    const now = new Date();
    const startTime = homework.startTime ? new Date(homework.startTime) : null;
    const endTime = homework.endTime ? new Date(homework.endTime) : null;

    if (startTime && now < startTime) {
      console.log('REDIRECT: Chưa đến thời gian làm bài');
      redirect(`/class/${params.id}/homework/list`);
    }

    if (endTime && now > endTime) {
      console.log('REDIRECT: Đã hết thời gian làm bài');
      redirect(`/class/${params.id}/homework/list`);
    }

    // Chỉ kiểm tra blockViewAfterSubmit nếu có submission hoàn thành (có điểm)
    if (homework.blockViewAfterSubmit) {
      const completedSubmission = await prisma.homeworkSubmission.findFirst({
        where: {
          homeworkId: homework.id,
          studentId: userId as string,
          grade: { not: null } // Chỉ submission đã hoàn thành
        }
      });
      
      if (completedSubmission) {
        console.log('REDIRECT: Đã hoàn thành và bị chặn xem lại');
        redirect(`/class/${params.id}/homework/list`);
      }
    }
  }
  
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