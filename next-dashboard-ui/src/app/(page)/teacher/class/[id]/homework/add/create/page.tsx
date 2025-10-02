"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createHomeworkFromExtractedQuestions } from '@/lib/actions/actions';
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
  originalFile?: {
    file?: File; // File object để upload S3 sau
    tempUrl?: string; // URL tạm thời để preview
    url?: string; // URL S3 sau khi upload
    name: string;
    type: string;
    size: number;
  };
}

export default function CreateHomeworkPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = params.id;
  const type = searchParams?.get('type');
  
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  // Thêm step state giống original
  const [step, setStep] = useState(1);
  
  // State giống như trang original
  const [numQuestions, setNumQuestions] = useState<number>(0);
  const [answers, setAnswers] = useState<string[]>(Array(1).fill(''));
  const [quickAnswers, setQuickAnswers] = useState<string>("");
  const [points, setPoints] = useState<number>(100);
  
  // Bước 2: thiết lập bài tập
  const [title, setTitle] = useState<string>("");
  const [duration, setDuration] = useState<number>(60);
  const [startTime, setStartTime] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [attempts, setAttempts] = useState<number>(1);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (type === 'extracted') {
      const savedData = localStorage.getItem('extractedQuiz');
      if (savedData) {
        const data = JSON.parse(savedData);
        
        // Lấy File object từ sessionStorage hoặc tạo lại từ temp file
        const fileInfo = sessionStorage.getItem('extractedQuizFile');
        if (fileInfo) {
          const fileData = JSON.parse(fileInfo);
          // Tạo lại File object từ temp URL
          if (data.originalFile?.tempUrl) {
            fetch(data.originalFile.tempUrl)
              .then(response => response.blob())
              .then(blob => {
                const file = new File([blob], fileData.name, { 
                  type: fileData.type,
                  lastModified: fileData.lastModified 
                });
                data.originalFile.file = file;
                setQuizData(data);
              })
              .catch(() => {
                // Nếu không lấy được file, vẫn set data nhưng không có file
                setQuizData(data);
              });
          } else {
            setQuizData(data);
          }
        } else {
          setQuizData(data);
        }
        
        setTitle(`Bài tập từ ${data.filename}`);
        
        // Chọn tất cả câu hỏi mặc định
        const questionNumbers = data.quiz_data
          .filter((item: any) => typeof item.question_number === 'number')
          .map((item: any) => item.question_number);
        setSelectedQuestions(questionNumbers);
        
        // Thiết lập số lượng câu hỏi và đáp án
        setNumQuestions(questionNumbers.length);
        const initialAnswers = Array(questionNumbers.length).fill('');
        questionNumbers.forEach((qNum: number, index: number) => {
          const question = data.quiz_data.find((q: any) => q.question_number === qNum);
          if (question && question.correct_answer_char) {
            initialAnswers[index] = question.correct_answer_char;
          }
        });
        setAnswers(initialAnswers);
      }
    }
  }, [type]);

  const toggleQuestionSelection = (questionNumber: number) => {
    setSelectedQuestions(prev => 
      prev.includes(questionNumber)
        ? prev.filter(num => num !== questionNumber)
        : [...prev, questionNumber]
    );
  };

  const selectAllQuestions = () => {
    if (!quizData) return;
    const allQuestions = quizData.quiz_data
      .filter(item => typeof item.question_number === 'number')
      .map(item => item.question_number);
    setSelectedQuestions(allQuestions);
  };

  const deselectAllQuestions = () => {
    setSelectedQuestions([]);
  };

  // Logic giống trang original
  const handleNumQuestionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value) || 1;
    setNumQuestions(num);
    setAnswers((prev) => {
      const newArr = [...prev];
      newArr.length = num;
      return newArr.fill('', prev.length, num);
    });
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

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

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPoints(parseInt(e.target.value) || 0);
  };

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');
    
    try {
      if (!quizData) throw new Error('Vui lòng chọn file bài tập');
      if (!startTime || !deadline) throw new Error('Vui lòng nhập thời gian bắt đầu và hạn chót');
      
      let originalFileUrl = quizData.originalFile?.url;
      
      // Nếu có file tạm thời, upload lên S3 (giống như original)
      if (quizData.originalFile?.file && !originalFileUrl) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', quizData.originalFile.file);
        uploadFormData.append('classCode', classId);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file to S3');
        }

        const uploadResult = await uploadResponse.json();
        originalFileUrl = uploadResult.fileUrl;
      }
      
      // Chuẩn bị dữ liệu cho homework dạng extracted
      const extractedQuestions = answers.map((answer, index) => {
        const originalQuestion = quizData.quiz_data[index];
        return {
          question_number: index + 1,
          question_text: originalQuestion?.question_text || `Câu ${index + 1}`,
          options: originalQuestion?.options || [],
          correct_answer_char: answer,
          correct_answer_index: originalQuestion?.correct_answer_index || 0,
          point: numQuestions > 0 ? points / numQuestions : 0,
        };
      });

      // Gọi function mới cho homework dạng extracted
      await createHomeworkFromExtractedQuestions({
        title,
        class_code: classId,
        originalFileUrl,
        originalFileName: quizData.originalFile?.name,
        originalFileType: quizData.originalFile?.type,
        extractedQuestions,
        duration,
        startTime,
        deadline,
        attempts,
      });
      
      // Xóa dữ liệu đã lưu và chuyển về danh sách bài tập
      localStorage.removeItem('extractedQuiz');
      sessionStorage.removeItem('extractedQuizFile');
      router.push(`/teacher/class/${classId}/homework/list`);
      
    } catch (error) {
      console.error('Error creating homework:', error);
      setError('Có lỗi xảy ra khi tạo bài tập: ' + (error instanceof Error ? error.message : ''));
    } finally {
      setIsCreating(false);
    }
  };

  if (!quizData) {
    return (
      <div className="container mx-auto h-full">
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-lg text-gray-600">Không có dữ liệu bài tập</p>
          <button 
            onClick={() => router.push(`/teacher/class/${classId}/homework/add`)}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="w-full bg-white p-4 rounded-lg mb-4">
        <Breadcrumb
          items={[
            { label: "Bài tập", href: `/teacher/class/${classId}/homework/list` },
            { label: "Chọn dạng đề", href: `/teacher/class/${classId}/homework/add` },
            { label: "Tách câu tự động", href: `/teacher/class/${classId}/homework/add/auto` },
            { label: "Tạo bài tập", active: true }
          ]}
        />
      </div>

      <h1 className="text-2xl font-bold mb-6">Tạo Bài Tập Từ Câu Hỏi Đã Tách</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bên trái: Danh sách câu hỏi đã tách */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">
            Câu Hỏi Đã Tách ({quizData.total_questions} câu)
          </h2>
          <div className="border rounded p-4 min-h-[600px] h-[80vh] overflow-auto">
            <div className="space-y-4">
              {quizData.quiz_data
                .filter(item => typeof item.question_number === 'number')
                .map((question, index) => (
                  <div 
                    key={index}
                    className={`border rounded-lg p-4 ${
                      selectedQuestions.includes(question.question_number)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.includes(question.question_number)}
                        onChange={() => toggleQuestionSelection(question.question_number)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-3">
                          Câu {question.question_number}: {question.question_text}
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {question.options.map((option, optIndex) => (
                            <div 
                              key={optIndex}
                              className={`p-2 rounded text-sm ${
                                question.correct_answer_index === optIndex
                                  ? 'bg-green-100 border border-green-300'
                                  : 'bg-white border border-gray-200'
                              }`}
                            >
                              {option}
                              {question.correct_answer_index === optIndex && (
                                <span className="ml-2 text-green-600 font-bold">(Đáp án)</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Bên phải: Logic 2 step giống original */}
        <div className="border rounded-lg p-4">
          {step === 1 ? (
            <>
              <h2 className="text-lg font-semibold mb-4">Câu Hỏi</h2>
              
              {/* Số lượng câu hỏi và tổng điểm */}
              <div className="mb-4 flex gap-4 items-end">
                <div>
                  <label className="block mb-2">Số lượng câu hỏi:</label>
                  <input
                    type="number"
                    min="0"
                    value={numQuestions}
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
              
              <p className='mb-4'>Số lượng đáp án đã nhập: <b className='text-red-600'>{quickAnswers.length}</b></p>
              
              {/* Grid đáp án và điểm số */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
                        value={numQuestions > 0 ? (points / numQuestions).toString() : '0'}
                        readOnly
                        className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Nút hành động Step 1 */}
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
                  disabled={numQuestions === 0}
                >
                  Tiếp theo
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-4">Thiết lập bài tập</h2>
              <form onSubmit={handleCreateHomework}>
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

                {/* Nút hành động Step 2 */}
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
                    disabled={isCreating}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isCreating ? 'Đang tạo...' : 'Tạo Bài Tập'}
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
