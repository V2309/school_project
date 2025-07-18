import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { homeworkId, studentId, answers, file } = body;

  // Kiểm tra xem studentId có tồn tại không
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    return new Response(
      JSON.stringify({ success: false, error: "Student không tồn tại." }),
      { status: 400 }
    );
  }

  // Lấy danh sách câu hỏi của bài tập
  const questions = await prisma.question.findMany({
    where: { homeworkId },
  });

  let totalPoints = 0;
  const questionAnswers: { questionId: number; answer: string; isCorrect: boolean }[] = [];

  // Chấm điểm từng câu hỏi
  questions.forEach((question) => {
    const studentAnswer = answers[question.id];
    const isCorrect = studentAnswer === question.answer;
    if (isCorrect) {
      totalPoints += question.point || 0;
    }

    questionAnswers.push({
      questionId: question.id,
      answer: studentAnswer || "",
      isCorrect,
    });
  });

  // Tạo HomeworkSubmission
  const submission = await prisma.homeworkSubmission.create({
    data: {
      content: "Bài làm của học sinh",
      attemptNumber: 1,
      timeSpent: body.timeSpent, // Thời gian làm bài (tính bằng giây)
      homework: { connect: { id: homeworkId } },
      student: { connect: { id: studentId } },
      grade: totalPoints,
      questionAnswers: {
        create: questionAnswers,
      },attachments: {
        create: {
          name: file.name,
          type: file.type,
          url: file.url,
          size: file.size || 0, // Kích thước file (nếu có)
        },
      },
    },
  });

  return new Response(JSON.stringify({ success: true, submission }), {
    status: 200,
  });
}
