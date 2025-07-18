"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";

interface QuizQuestion {
  question_number: number;
  question_text: string;
  options: string[];
  correct_answer_char: string;
  correct_answer_index: number;
}

interface QuizData {
  success: boolean;
  filename: string;
  quiz_data: QuizQuestion[];
  total_questions: number;
}

export default function AutoExtractPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const classId = params.id;
  
  // File states
  const [file, setFile] = useState<File | null>(null);
  
  // AI extraction states
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Kiểm tra định dạng file
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Chỉ hỗ trợ file PDF và Word (.docx)");
      return;
    }

    setFile(selectedFile);
    setIsExtracting(true);
    setError("");

    try {
      // Trích xuất câu hỏi qua Flask API
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:5000/api/extract-quiz', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Lưu dữ liệu vào localStorage và tự động chuyển hướng
        localStorage.setItem('extractedQuiz', JSON.stringify(result));
        
        // Chuyển hướng ngay lập tức
        router.push(`/teacher/class/${classId}/homework/add/create?type=extracted`);
      } else {
        setError(result.error || "Có lỗi xảy ra khi xử lý file");
      }
    } catch (err) {
      setError("Không thể kết nối đến server. Vui lòng thử lại.");
      console.error("Upload error:", err);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="container mx-auto h-full">
      <div className="flex flex-col h-full">
        <div className="w-full bg-white p-4 rounded-lg mb-4">
          <Breadcrumb
            items={[
              { label: "Bài tập", href: `/teacher/class/${classId}/homework/list` },
              { label: "Chọn dạng đề", href: `/teacher/class/${classId}/homework/add` },
              { label: "Tách câu tự động", active: true }
            ]}
          />
        </div>

        <div className="bg-white flex-1 px-4 py-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Tải File Lên</h1>
          
          <div className="max-w-2xl mx-auto">
            {/* Upload file */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <div className="flex flex-col items-center">
                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                
                {isExtracting ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-lg font-medium text-blue-600">Đang xử lý file...</p>
                    <p className="text-sm text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Chọn file để tải lên</h3>
                    <p className="text-gray-500 mb-6">Hỗ trợ file PDF và Word (.docx)</p>
                    
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg cursor-pointer transition-colors"
                    >
                      Chọn File
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Hiển thị tên file đã chọn */}
            {file && !isExtracting && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-600">File đã chọn:</p>
                <p className="font-medium text-blue-800">{file.name}</p>
              </div>
            )}

            {/* Hiển thị lỗi */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Nút quay lại */}
            <div className="mt-8 text-center">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => router.back()}
              >
                ← Quay lại chọn dạng đề
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}