import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/hooks/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import PDFViewer from "@/components/PDFViewer";
import DocxViewer from "@/components/DocxViewer";

interface PageProps {
  params: { id: string; hwId: string };
  searchParams: { utid?: string; homeworkId?: string; getBest?: string };
}

// Helper functions để kiểm tra loại file
function isPDF(fileType: string | null, fileName?: string | null) {
  if (!fileType) return false;
  return fileType === "application/pdf" || fileName?.toLowerCase().endsWith(".pdf");
}

function isWord(fileType: string | null, fileName?: string | null) {
  if (!fileType) return false;
  const lowerFileName = fileName?.toLowerCase();
  return fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
         fileType === "application/msword" ||
         lowerFileName?.endsWith(".doc") ||
         lowerFileName?.endsWith(".docx");
}

export default async function HomeworkDetail({ params, searchParams }: PageProps) {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'student') {
    redirect("/404");
  }

  let submission;

  if (searchParams.utid) {
    // Lấy submission cụ thể theo ID
    submission = await prisma.homeworkSubmission.findUnique({
      where: { id: Number(searchParams.utid) },
      include: {
        questionAnswers: {
          include: {
            question: true,
          },
        },
        attachments: true,
        homework: {
          include: {
            attachments: true,
          },
        }
      },
    });
  } else if (searchParams.homeworkId && searchParams.getBest) {
    // Lấy submission có điểm cao nhất
    submission = await prisma.homeworkSubmission.findFirst({
      where: {
        homeworkId: Number(searchParams.homeworkId),
        studentId: user.id as string,
        grade: { not: null }
      },
      include: {
        questionAnswers: {
          include: {
            question: true,
          },
        },
        attachments: true,
        homework: {
          include: {
            attachments: true,
          },
        }
      },
      orderBy: {
        grade: 'desc'
      }
    });
  } else {
    redirect("/404");
  }

  if (!submission) {
    redirect("/404");
  }

  // Tính toán số câu đúng, sai, và chưa làm
  const totalQuestions = submission.questionAnswers.length;
  const correctAnswers = submission.questionAnswers.filter((qa: any) => qa.isCorrect).length;
  const incorrectAnswers = submission.questionAnswers.filter((qa: any) => !qa.isCorrect && qa.answer).length;
  const unansweredQuestions = totalQuestions - correctAnswers - incorrectAnswers;

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-screen h-screen overflow-hidden">
   
      {/* Bên trái: Hiển thị đề thi */}
      <div className="flex-1 bg-white rounded shadow p-6 h-full overflow">
        <div className="flex items-baseline gap-2 mb-4">
        <Link href={`/class/${submission.homework.classCode}/homework/list`} className="text-xl font-bold mb-4">Bài tập</Link>
        <div className="icon line-height-1">
        <ArrowRight size={16} />
        </div>
        <h2 className="text-xl font-bold mb-4 text-blue-500">{submission.homework.title}</h2>
        </div>
        
        {/* Hiển thị file đề thi theo type */}
        {submission.homework.type === "extracted" ? (
          // Với bài tập extracted, hiển thị file gốc
          submission.homework.originalFileUrl ? (
            <div className="mb-4">
              {isPDF(submission.homework.originalFileType, submission.homework.originalFileName) ? (
                <PDFViewer fileUrl={submission.homework.originalFileUrl} />
              ) : isWord(submission.homework.originalFileType, submission.homework.originalFileName) ? (
                <DocxViewer fileUrl={submission.homework.originalFileUrl} />
              ) : (
                <a
                  href={submission.homework.originalFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  {submission.homework.originalFileName} ({submission.homework.originalFileType})
                </a>
              )}
            </div>
          ) : (
            <p>Không có file đề thi gốc.</p>
          )
        ) : (
          // Với bài tập original, hiển thị từ attachments
          submission.homework.attachments.length > 0 ? (
            submission.homework.attachments.map((attachment: any) => (
              <div key={attachment.id} className="mb-4">
                {isPDF(attachment.type, attachment.name) ? (
                  <PDFViewer fileUrl={attachment.url} />
                ) : isWord(attachment.type, attachment.name) ? (
                  <DocxViewer fileUrl={attachment.url} />
                ) : (
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    {attachment.name} ({attachment.type})
                  </a>
                )}
              </div>
            ))
          ) : (
            <p>Không có file đề thi.</p>
          )
        )}
      </div>

      {/* Bên phải: Hiển thị thông tin chi tiết bài làm */}
      <div className="w-full lg:w-[350px] bg-white rounded shadow p-6 flex flex-col gap-4 h-full overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Kết quả bài làm</h2>
        {/* table thông tin chi tiết */}
        <div className="mb-4">
          <p className="text-lg font-semibold">Tổng điểm: {submission.grade ? Math.round(submission.grade * 100) / 100 : 0}</p>
          <p><strong>Thời gian làm bài:</strong> {
            submission.timeSpent 
              ? `${Math.floor(submission.timeSpent / 60)} phút ${submission.timeSpent % 60} giây`
              : 'Không có dữ liệu'
          }</p>
          <p><strong>Nộp lúc:</strong> {new Date(submission.submittedAt).toLocaleString()}</p>
          <p><strong>Số câu đúng:</strong> {correctAnswers}</p>
          <p><strong>Số câu sai:</strong> {incorrectAnswers}</p>
          <p><strong>Chưa làm:</strong> {unansweredQuestions}</p>
        </div>

        <table className="table-auto w-full text-[11px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-2">Câu</th>
              <th className="px-2 py-2">Chọn</th>
              <th className="px-2 py-2">Đáp án đúng</th>
              <th className="px-2 py-2">Điểm</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(submission.questionAnswers) ? (
              submission.questionAnswers.map((qa: any, index: number) => (
                <tr key={qa.id} className="text-center">
                  <td className="px-4 py-2 flex items-center gap-2">
                    {/* Hiển thị dấu chấm tròn nhỏ trước câu hỏi */}
                    <span className="w-2 h-2 rounded-full bg-blue-400 "></span>
                    {/* Hiển thị nội dung câu hỏi */}
                    <span>{qa.question.content}</span>
                  </td>
                  <td
                    className={`px-4 py-2 ${qa.isCorrect ? "text-green-500 font-bold" : "text-red-500 font-bold"
                      }`}
                  >
                    {/* Hiển thị đáp án học sinh chọn */}
                    {qa.answer || "Chưa làm"}
                  </td>
                  <td className="px-4 py-2">{qa.question.answer}</td>
                  <td className="px-4 py-2">{qa.isCorrect ? qa.question.point : 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="border border-gray-300 px-4 py-2 text-center">
                  Không có câu trả lời nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
       
      </div>
    </div>
  );
}