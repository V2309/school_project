"use client";

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { useRouter } from "next/navigation";
import { useHomeworkSession } from "@/hooks/useHomeworkSession";
import { ExtractedQuestionsView } from "./ExtractedQuestionsView";

interface Homework {
  id: number;
  title: string;
  description?: string;
  duration?: number;
  type?: string; // Thêm type để phân biệt "original" vs "extracted"
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  fileSize?: number; // Kích thước file, nếu cần
  startTime?: string | Date | null;
  endTime?: string | Date | null;
  maxAttempts?: number | null;
}

interface Question {
  id: number;
  content: string;
  options: string[]; // ["A", "B", "C", "D"]
  point?: number;
}

interface ExamTestProps {
  homework?: Homework;
  questions: Question[];
  duration: number; // phút
  userId: string; // ID của người dùng
  classCode: string; // Mã lớp học
  role: string;
}

export function TestHomeWork({ homework, questions, duration, userId, classCode, role }: ExamTestProps) {
  const router = useRouter();

  if (!homework) {
    return <div>Không tìm thấy bài tập.</div>;
  }

  const [submission, setSubmission] = useState<any>(null); // Lưu kết quả bài làm
  const [current, setCurrent] = useState(0);

  // Sử dụng custom hook để quản lý session
  const {
    answers,
    timeLeft,
    isInitialized,
    updateAnswer,
    getTimeSpent,
    clearSession,
    getUnansweredQuestions,
    minutes,
    seconds,
  } = useHomeworkSession({
    homeworkId: homework.id,
    duration,
    onTimeUp: handleSubmit,
  });

  const handleSelect = (qid: number, value: string) => {
    updateAnswer(qid, value);
  };

  const handleInput = (qid: number, value: string) => {
    const v = value.toUpperCase().replace(/[^A-D]/g, "").slice(0, 1);
    updateAnswer(qid, v);
  };

  async function handleSubmit() {
    if (!homework) return;
    
    console.log({
      homeworkId: homework.id,
      studentId: userId,
      answers,
      role,
    });

    const unanswered = getUnansweredQuestions(questions.map(q => q.id));
    if (unanswered.length > 0) {
      toast.error(
        `Bạn chưa trả lời các câu: ${unanswered.join(", ")}`
      );
      return;
    }

    // Tính thời gian làm bài chính xác
    const timeSpent = getTimeSpent();
    
    const response = await fetch("/api/homework/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homeworkId: homework.id,
        studentId: userId,
        answers,
        timeSpent, // thời gian làm bài
        // nộp luôn file đề thi 
        file: {
          name: homework.fileName,
          type: homework.fileType,
          url: homework.fileUrl,
          size:homework.fileSize || 0, // Kích thước file (nếu có)
        }
      }),
    });

    const result = await response.json();
    // nếu mà role là teacher có nghĩa là đang làm thử khi nộp bài quay về route home/listlist
    if (result.success && role === "student") {
      toast.success("Đã nộp bài!");
      clearSession(); // Xóa trạng thái sau khi nộp bài
      router.push(`/student/class/${classCode}/homework/${homework.id}/detail?utid=${result.submission.id}`);
    } else {
      if (role === "teacher") {
        toast.success("Đã nộp bài!");
        clearSession(); // Xóa trạng thái sau khi nộp bài
        router.push(`/teacher/class/${classCode}/homework/list`);
      }
      else {
        toast.error(result.error || "Có lỗi xảy ra khi nộp bài.");
      }
     
    }
  }

  return (
    <div className="flex gap-8 min-h-screen h-screen overflow-hidden">
      {/* Đề bài bên trái */}
      {!submission ? (
        <div className="flex-1 bg-white rounded shadow p-6 h-full overflow-auto">
          {homework && (
            <div className="mb-6">
              <h2 className="text-xl font-bold">{homework.title}</h2>
              <div className="text-sm text-gray-500 mb-2">
                Thời lượng: {homework.duration || duration} phút
              </div>
              
              {/* Hiển thị theo loại homework */}
              {homework.type === "extracted" ? (
                // Hiển thị câu hỏi đã tách
                <ExtractedQuestionsView questions={questions} />
              ) : (
                // Hiển thị file PDF/Word gốc (dạng original)
                <div>
                  {homework.fileUrl && homework.fileType === "application/pdf" && (
                    <div className="border rounded p-2 mb-4 h-[600px] bg-white">
                      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <Viewer fileUrl={homework.fileUrl} />
                      </Worker>
                    </div>
                  )}
                  
                  {homework.fileUrl && homework.fileType?.includes("word") && (
                    <div className="border rounded p-4 mb-4 bg-gray-50">
                      <div className="text-center">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold mb-2">Đề thi Word</h3>
                          <p className="text-gray-600 mb-4">
                            Tệp Word không thể hiển thị trực tiếp. Vui lòng tải xuống để xem đề thi.
                          </p>
                        </div>
                        <a
                          href={homework.fileUrl}
                          download={homework.fileName}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Tải xuống đề thi
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {!homework.fileUrl && (
                    <div className="text-center text-gray-500 py-8">
                      Không có file đề thi
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>Hiển thị kết quả bài làm...</div>
      )}

      {/* Phiếu trả lời bên phải */}
      <div className="w-[350px] bg-white rounded shadow p-6 flex flex-col gap-4 h-full">
        <div className="font-bold text-blue-700 text-lg mb-2">
          Thời gian còn lại: {minutes}:{seconds.toString().padStart(2, "0")}
        </div>
        <div className="mb-2">
          <div className="font-semibold mb-1">Phiếu trả lời</div>
          <div className="grid grid-cols-5 gap-2 mb-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                className={`w-12 h-12 rounded border ${
                  current === idx
                    ? "bg-blue-500 text-white"
                    : answers[q.id]
                    ? "bg-green-200"
                    : ""
                }`}
                onClick={() => setCurrent(idx)}
                type="button"
              >
                {idx + 1} {answers[q.id] || ""}
              </button>
            ))}
          </div>
          <div>
            <div className="mb-1">Đáp án câu {current + 1}:</div>
            <div className="flex gap-2 mb-2">
              {["A", "B", "C", "D"].map((opt) => (
                <button
                  key={opt}
                  className={`px-3 py-1 border rounded ${
                    answers[questions[current].id] === opt
                      ? "bg-blue-500 text-white"
                      : ""
                  }`}
                  onClick={() => handleSelect(questions[current].id, opt)}
                  type="button"
                >
                  {opt}
                </button>
              ))}
            </div>
            <input
              className="border px-2 py-1 rounded w-full"
              placeholder="Nhập đáp án..."
              value={answers[questions[current].id] || ""}
              onChange={(e) =>
                handleInput(questions[current].id, e.target.value)
              }
              maxLength={1}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-auto">
          <button
            className="bg-gray-200 px-4 py-2 rounded"
            onClick={() =>
              window.confirm("Bạn có chắc muốn rời khỏi?") &&
              window.history.back()
            }
          >
            Rời khỏi
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            Nộp bài
          </button>
        </div>
        <ToastContainer position="top-right" autoClose={2000} />
      </div>
    </div>
  );
}