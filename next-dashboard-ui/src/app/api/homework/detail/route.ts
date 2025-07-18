import prisma from "@/lib/prisma";
import { tr } from "date-fns/locale";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const utid = url.searchParams.get("utid");

  if (!utid) {
    return new Response(
      JSON.stringify({ error: "Thiếu ID bài làm." }),
      { status: 400 }
    );
  }

  const submission = await prisma.homeworkSubmission.findUnique({
    where: { id: Number(utid) },
    include: {
      questionAnswers: {
        include: {
          question: true, // Bao gồm thông tin câu hỏi
        },
      },
      attachments: true, // Bao gồm thông tin file đính kèm
      homework:{
        include: {
          attachments: true, // Bao gồm thông tin file đính kèm của bài tập
        },
      }
    },
  });

  if (!submission) {
    return new Response(
      JSON.stringify({ error: "Không tìm thấy bài làm." }),
      { status: 404 }
    );
  }

  return new Response(JSON.stringify(submission), { status: 200 });
}