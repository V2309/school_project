"use client";
import { ArrowLeft,ArrowRight } from "lucide-react";

import Link from "next/link";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

export default function HomeworkDetail() {
  const router = useRouter();
  const [submission, setSubmission] = useState<any>(null);

  useEffect(() => {
    const utid = new URLSearchParams(window.location.search).get("utid");
    if (!utid) {
      router.push("/404");
      return;
    }

    const fetchSubmission = async () => {
      const response = await fetch(`/api/homework/detail?utid=${utid}`);
      const result = await response.json();
      if (response.ok) {
        setSubmission(result);
      } else {
        console.error(result.error);
      }
    };

    fetchSubmission();
  }, [router]);

  if (!submission) {
    return <div>Đang tải kết quả...</div>;
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
        <Link href={`/student/class/${submission.homework.classCode}/homework/list`} className="text-xl font-bold mb-4">Bài tập</Link>
        <div className="icon line-height-1">
        <ArrowRight size={16} />
        </div>
        <h2 className="text-xl font-bold mb-4 text-blue-500">{submission.homework.title}</h2>
        </div>
        {submission.homework.attachments.length > 0 ? (
          submission.homework.attachments.map((attachment: any) => (
            <div key={attachment.id} className="mb-4">
              {attachment.type === "application/pdf" ? (
                <div className="border rounded p-2 h-[400px] lg:h-[600px] bg-white">
                  <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                    <Viewer fileUrl={attachment.url} />
                  </Worker>
                </div>
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
        )}
      </div>

      {/* Bên phải: Hiển thị thông tin chi tiết bài làm */}
      <div className="w-full lg:w-[350px] bg-white rounded shadow p-6 flex flex-col gap-4 h-full overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Kết quả bài làm</h2>
        {/* table thông tin chi tiết */}
        <div className="mb-4">
          <p className="text-lg font-semibold">Tổng điểm: {submission.grade}</p>
          <p><strong>Thời gian làm bài:</strong> {Math.floor(submission.timeSpent / 60)} phút {submission.timeSpent % 60} giây</p>
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