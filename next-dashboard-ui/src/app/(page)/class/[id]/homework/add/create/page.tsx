"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createHomeworkFromExtractedQuestions } from '@/lib/actions/actions';
import { homeworkSchema } from '@/lib/formValidationSchema';
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
  
  // State cho chức năng đảo câu hỏi và đáp án
  const [isShuffleQuestionsEnabled, setIsShuffleQuestionsEnabled] = useState(false);
  const [isShuffleAnswersEnabled, setIsShuffleAnswersEnabled] = useState(false);
  
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
  
  // State cho validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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
      .filter((item: any) => typeof item.question_number === 'number')
      .map((item: any) => item.question_number);
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
    // Clear validation error
    if (validationErrors.points) {
      setValidationErrors(prev => ({ ...prev, points: '' }));
    }
  };

  // Validation handlers
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (validationErrors.title) {
      setValidationErrors(prev => ({ ...prev, title: '' }));
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(Number(e.target.value));
    if (validationErrors.duration) {
      setValidationErrors(prev => ({ ...prev, duration: '' }));
    }
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartTime(e.target.value);
    if (validationErrors.startTime) {
      setValidationErrors(prev => ({ ...prev, startTime: '' }));
    }
  };

  const handleDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeadline(e.target.value);
    if (validationErrors.endTime) {
      setValidationErrors(prev => ({ ...prev, endTime: '' }));
    }
  };

  const handleAttemptsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttempts(Number(e.target.value));
    if (validationErrors.maxAttempts) {
      setValidationErrors(prev => ({ ...prev, maxAttempts: '' }));
    }
  };

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');
    setValidationErrors({});
    
    try {
      if (!quizData) throw new Error('Vui lòng chọn file bài tập');
      
      // Validation với homeworkSchema - sử dụng điểm gốc thay vì tính lại
      const totalPoints = points;
      const formData = {
        title,
        startTime,
        endTime: deadline,
        duration,
        maxAttempts: attempts,
        points: totalPoints,
        numQuestions,
        classCode: classId,
      };
      
      const validationResult = homeworkSchema.safeParse(formData);
      
      if (!validationResult.success) {
        const errors: Record<string, string> = {};
        validationResult.error.errors.forEach((error) => {
          const path = error.path[0];
          if (path && typeof path === 'string') {
            errors[path] = error.message;
          }
        });
        setValidationErrors(errors);
        setError('Vui lòng kiểm tra lại thông tin đã nhập');
        return;
      }
      
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
      
      // Chuẩn bị dữ liệu từ quiz_data gốc
      let processedQuizData = [...quizData.quiz_data];

      // Nếu có bật đảo, gọi API Flask để xử lý
      if (isShuffleQuestionsEnabled || isShuffleAnswersEnabled) {
        const shuffleResponse = await fetch('http://localhost:5000/api/shuffle-quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quiz_data: processedQuizData,
            shuffle_questions: isShuffleQuestionsEnabled,
            shuffle_answers: isShuffleAnswersEnabled,
          }),
        });

        if (!shuffleResponse.ok) {
          throw new Error('Không thể đảo đề thi');
        }

        const shuffleResult = await shuffleResponse.json();
        if (shuffleResult.success) {
          processedQuizData = shuffleResult.quiz_data;
        }
      }

      // Chuẩn bị dữ liệu cho homework dạng extracted với điểm chính xác
      const basePointPerQuestion = Number((points / numQuestions).toFixed(2));
      let totalAssigned = 0;

      const extractedQuestions = answers.map((answer, index) => {
        const originalQuestion = processedQuizData[index];
        
        let pointForThis;
        if (index === numQuestions - 1) {
          // Câu cuối cùng: gán phần còn lại để đảm bảo tổng = points
          pointForThis = Math.round((points - totalAssigned) * 100) / 100;
        } else {
          pointForThis = basePointPerQuestion;
          totalAssigned = Math.round((totalAssigned + pointForThis) * 100) / 100;
        }

        return {
          question_number: index + 1,
          question_text: originalQuestion?.question_text || `Câu ${index + 1}`,
          options: originalQuestion?.options || [],
          correct_answer_char: originalQuestion?.correct_answer_char || answer,
          correct_answer_index: originalQuestion?.correct_answer_index || 0,
          point: pointForThis,
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
      router.push(`/class/${classId}/homework/list`);
      
    } catch (error) {
      console.error('Error creating homework:', error);
      setError('Có lỗi xảy ra khi tạo bài tập: ' + (error instanceof Error ? error.message : ''));
    } finally {
      setIsCreating(false);
    }
  };

  if (!quizData) {
    return (
      <div className="w-full mx-auto h-full">
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-lg text-gray-600">Không có dữ liệu bài tập</p>
          <button 
            onClick={() => router.push(`/class/${classId}/homework/add`)}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto overflow-x-hidden">
      <div className=" bg-white p-4 rounded-lg mb-4">
        <Breadcrumb
          items={[
            { label: "Bài tập", href: `/class/${classId}/homework/list` },
            { label: "Chọn dạng đề", href: `/class/${classId}/homework/add` },
            { label: "Tách câu tự động", href: `/class/${classId}/homework/add/auto` },
            { label: "Tạo bài tập", active: true }
          ]}
        />
      </div>

    
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
        {/* Bên trái: Danh sách câu hỏi đã tách */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Câu Hỏi Đã Tách ({quizData.total_questions} câu)
            </h2>
            
            {/* Các nút đảo câu hỏi và đáp án */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsShuffleQuestionsEnabled(!isShuffleQuestionsEnabled)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  isShuffleQuestionsEnabled
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isShuffleQuestionsEnabled ? '✓ Đảo câu' : 'Đảo câu'}
              </button>
              <button
                type="button"
                onClick={() => setIsShuffleAnswersEnabled(!isShuffleAnswersEnabled)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  isShuffleAnswersEnabled
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isShuffleAnswersEnabled ? '✓ Đảo đáp án' : 'Đảo đáp án'}
              </button>
            </div>
          </div>
          
          <div className="border rounded p-4 min-h-[600px] h-[80vh] overflow-auto">
            <div className="space-y-4">
              {quizData.quiz_data
                .filter((item: any) => typeof item.question_number === 'number')
                .map((question: any, index: number) => (
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
                        {question.question_text}
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {question.options.map((option: string, optIndex: number) => (
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
        <div className="border rounded-lg p-4 ">
          {step === 1 ? (
            <>
              <h2 className="text-lg font-semibold mb-4">Câu Hỏi</h2>
              
              {/* Số lượng câu hỏi và tổng điểm */}
              <div className="mb-4 flex gap-4 items-end overflow-x-auto">
                <div>
                  <label className="block mb-2">Số lượng câu hỏi:</label>
                  <input
                    type="number"
                    min="1"
                    value={numQuestions}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setNumQuestions(value);
                      setAnswers((prev) => {
                        const newArr = [...prev];
                        newArr.length = value;
                        return newArr.fill('', prev.length, value);
                      });
                      // Clear validation error
                      if (validationErrors.numQuestions) {
                        setValidationErrors(prev => ({ ...prev, numQuestions: '' }));
                      }
                    }}
                    className={`border rounded px-3 py-2 w-20 ${validationErrors.numQuestions ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.numQuestions && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.numQuestions}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-2">Tổng điểm:</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={points}
                    onChange={handlePointsChange}
                    className={`border rounded px-3 py-2 w-24 ${validationErrors.points ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.points && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.points}</p>
                  )}
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
                        value={
                          numQuestions > 0 
                            ? index === numQuestions - 1 
                              ? (points - (Number((points / numQuestions).toFixed(2)) * (numQuestions - 1))).toFixed(2)
                              : (Number((points / numQuestions).toFixed(2))).toFixed(2)
                            : '0'
                        }
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
              
              {/* Thông báo trạng thái đảo */}
              {(isShuffleQuestionsEnabled || isShuffleAnswersEnabled) && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium mb-1">⚠️ Chế độ đảo đề đã được bật:</p>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {isShuffleQuestionsEnabled && <li>• Câu hỏi sẽ được đảo thứ tự ngẫu nhiên</li>}
                    {isShuffleAnswersEnabled && <li>• Đáp án trong mỗi câu sẽ được đảo thứ tự ngẫu nhiên</li>}
                  </ul>
                </div>
              )}
              
              <form onSubmit={handleCreateHomework}>
                <div className="mb-4">
                  <label className="block mb-2">Tên bài tập</label>
                  <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    className={`border rounded px-3 py-2 w-full ${validationErrors.title ? 'border-red-500' : ''}`}
                    required
                  />
                  {validationErrors.title && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2">Thời lượng làm bài (phút):</label>
                  <input
                    type="number"
                    min="1"
                    max="600"
                    value={duration}
                    onChange={handleDurationChange}
                    className={`border rounded px-3 py-2 w-32 ${validationErrors.duration ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.duration && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.duration}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2">Thời gian bắt đầu:</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={handleStartTimeChange}
                    className={`border rounded px-3 py-2 w-64 ${validationErrors.startTime ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.startTime && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.startTime}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">Thời gian bắt đầu phải sau thời điểm hiện tại</p>
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2">Hạn chót nộp bài:</label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={handleDeadlineChange}
                    className={`border rounded px-3 py-2 w-64 ${validationErrors.endTime ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.endTime && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.endTime}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">Hạn chót phải sau thời gian bắt đầu</p>
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2">Số lần làm bài:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={attempts}
                    onChange={handleAttemptsChange}
                    className={`border rounded px-3 py-2 w-32 ${validationErrors.maxAttempts ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.maxAttempts && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.maxAttempts}</p>
                  )}
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
