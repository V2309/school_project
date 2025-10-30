

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createHomeworkWithQuestions } from '@/lib/actions/actions';

export default function AddHomeworkPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Bước 1
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [previewContent, setPreviewContent] = useState<string>('');
  const [numQuestions, setNumQuestions] = useState<number>(0);
  const [answers, setAnswers] = useState<string[]>(Array(1).fill(''));
  const [quickAnswers, setQuickAnswers] = useState<string>("");

  // Bước 2
  const [title, setTitle] = useState<string>("");
  const [duration, setDuration] = useState<number>(60); // phút
  const [startTime, setStartTime] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [attempts, setAttempts] = useState<number>(1);

  const [points, setPoints] = useState<number>(100);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Upload file tạm vào local để preview
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewContent(`File: ${selectedFile.name}`);
      
      try {
        // Upload tạm vào public/uploads để preview
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const response = await fetch('/api/upload-temp', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) throw new Error('Failed to upload temp file');
        
        const data = await response.json();
        setUploadedUrl(data.url); // URL local để preview
      } catch (err) {
        console.error('Error uploading temp file:', err);
        setPreviewContent("Lỗi upload file!");
        setUploadedUrl("");
      }
    }
  };

  // Số lượng câu hỏi
  const handleNumQuestionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value) || 1;
    setNumQuestions(num);
    setAnswers((prev) => {
      const newArr = [...prev];
      newArr.length = num;
      return newArr.fill('', prev.length, num);
    });
  };

  // Đáp án từng câu
  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  // Nhập nhanh đáp án
  const handleQuickAnswers = () => {
    const arr = quickAnswers.trim().split("").slice(0, numQuestions);
    setAnswers((prev) => {
      const newArr = [...prev];
      for (let i = 0; i < arr.length; i++) {
        newArr[i] = arr[i];
      }
      return newArr;
    });
  };

  // Tổng điểm
  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPoints(parseInt(e.target.value) || 0);
  };

  // Bước 2: Tạo bài tập và upload lên S3
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (!file) throw new Error('Vui lòng chọn file bài tập');
      if (!startTime || !deadline) throw new Error('Vui lòng nhập thời gian bắt đầu và hạn chót');
      
      // Upload file lên S3 khi submit
      const formData = new FormData();
      formData.append('file', file);
      formData.append('classCode', params.id);
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) throw new Error('Failed to upload file to S3');
      
      const uploadData = await uploadResponse.json();
      
      // Tính điểm chính xác - phương pháp đơn giản
      const basePointPerQuestion = Number((points / numQuestions).toFixed(2));
      let totalAssigned = 0;

      const questionsWithPoints = answers.map((answer, index) => {
        let pointForThis;
        if (index === numQuestions - 1) {
          // Câu cuối cùng: gán phần còn lại để đảm bảo tổng = points
          pointForThis = Number((points - totalAssigned).toFixed(2));
        } else {
          pointForThis = basePointPerQuestion;
          totalAssigned += pointForThis;
        }

        return {
          questionNumber: index + 1,
          answer,
          point: pointForThis
        };
      });

      await createHomeworkWithQuestions({
        class_code: params.id as string,
        fileUrl: uploadData.fileUrl, // URL từ S3
        fileName: uploadData.fileName,
        fileType: uploadData.fileType,
        points,
        questions: questionsWithPoints,
        title,
        duration,
        startTime,
        deadline,
        attempts
      });   
      router.push(`/class/${params.id}/homework/list`);
    } catch (err) {
      setError('Có lỗi xảy ra khi tạo bài tập: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setIsLoading(false);
    }
  };

  // --- JSX ---
  return (
    <div className="container mx-auto px-4 py-8 ">
      <h1 className="text-2xl font-bold mb-6">Tạo Bài Tập Mới</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
        {/* Bên trái: Upload và xem trước */}
        <div className="border rounded-lg p-4 ">
          <h2 className="text-lg font-semibold mb-4">File Bài Tập</h2>
          {step === 1 && (
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="mb-4"
            />
          )}
          <div className="border rounded p-4 min-h-[600px] h-[80vh] overflow-auto">
            {uploadedUrl && file?.type === "application/pdf" ? (
              <iframe
                src={uploadedUrl}
                title="Xem trước PDF"
                width="100%"
                height="100%"
                className="w-full h-[70vh] min-h-[600px] border-none"
                style={{ minHeight: 600, height: "70vh" }}
              />
            ) : uploadedUrl && (file?.type === "application/msword" || file?.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") ? (
              <iframe

                src={`https://docs.google.com/gview?url=${encodeURIComponent(uploadedUrl)}&embedded=true`}
                title="Xem trước Word"
                width="100%"
                height="100%"
                className="w-full h-[70vh] min-h-[600px] border-none"
                style={{ minHeight: 600, height: "70vh" }}
              />
            ) : (
              previewContent || 'Chưa có file được chọn'
            )}
          </div>
        </div>
        {/* Bên phải: */}
        <div className="border rounded-lg p-4">
          {step === 1 ? (
            <>
              <h2 className="text-lg font-semibold mb-4">Câu Hỏi</h2>
              <div className="mb-4 flex gap-4 items-end">
                <div>
                  <label className="block mb-2">Số lượng câu hỏi:</label>
                  <input
                    type="number"
                    min="0"
                    //value={numQuestions}
                    onChange={handleNumQuestionsChange}
                    className="border rounded px-3 py-2 w-20"
                  />
                </div>
                <div>
                  <label className="block mb-2">Tổng điểm:</label>
                  <input
                    type="number"
                    min="1"
                    value={points}
                    onChange={handlePointsChange}
                    className="border rounded px-3 py-2 w-24"
                  />
                </div>
              </div>
              {/* Nhập nhanh đáp án */}
              <div className="mb-4 flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Nhập chuỗi đáp án (VD: ACDABCAD)"
                  value={quickAnswers}
                  onChange={e => setQuickAnswers(e.target.value.toUpperCase())}
                  className="border rounded px-3 py-2 w-64"
                />
                <button
                  type="button"
                  onClick={handleQuickAnswers}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Nhập nhanh đáp án
                </button>
         
              </div>
              <p className='mb-4 '>Số lượng đáp án đã nhập: <b className='text-red-600'>{quickAnswers.length}</b></p>
              <div className=" grid grid-cols-1 md:grid-cols-3 gap-2">
                {Array.from({ length: numQuestions }).map((_, index) => (
                  <div key={index} className="border rounded p-3 bg-blue-50">
                    <div className="font-semibold text-blue-700 mb-2">Câu {index + 1}</div>
                    <div className="mb-2">
                      <label className="block text-sm mb-1">Đáp án</label>
                      <input
                        type="text"
                        value={answers[index] || ''}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Điểm</label>
                      <input
                        type="number"
                        value={
                          numQuestions > 0 
                            ? index === numQuestions - 1 
                              ? (points - (Math.round((points / numQuestions) * 100) / 100) * (numQuestions - 1)).toFixed(2)
                              : (Math.round((points / numQuestions) * 100) / 100).toFixed(2)
                            : '0'
                        }
                        readOnly
                        className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  className="bg-gray-400 text-white px-6 py-2 rounded"
                  onClick={() => router.back()}
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  onClick={() => setStep(2)}
                  disabled={!file || !uploadedUrl}
                >
                  Tiếp theo
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-4">Thiết lập bài tập</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block mb-2">Tên bài tập</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Thời lượng làm bài (phút):</label>
                  <input
                    type="number"
                    min="1"
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="border rounded px-3 py-2 w-32"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Thời gian bắt đầu:</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="border rounded px-3 py-2 w-64"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Hạn chót nộp bài:</label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="border rounded px-3 py-2 w-64"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Số lần làm bài:</label>
                  <input
                    type="number"
                    min="1"
                    value={attempts}
                    onChange={e => setAttempts(Number(e.target.value))}
                    className="border rounded px-3 py-2 w-32"
                  />
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    className="bg-gray-400 text-white px-6 py-2 rounded"
                    onClick={() => setStep(1)}
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Đang tạo...' : 'Tạo Bài Tập'}
                  </button>
                </div>
                {error && <p className="text-red-500 mt-2">{error}</p>}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}