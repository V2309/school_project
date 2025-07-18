"use client";

interface Question {
  id: number;
  content: string;
  options: string[];
  point?: number;
}

interface ExtractedQuestionsViewProps {
  questions: Question[];
}

export function ExtractedQuestionsView({ questions }: ExtractedQuestionsViewProps) {
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="bg-gray-100 rounded-lg p-6">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium">Không có câu hỏi nào để hiển thị</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Đề thi trắc nghiệm
        </h3>
        <p className="text-blue-600 text-sm mt-1">
          Tổng số câu hỏi: <span className="font-semibold">{questions.length}</span>
        </p>
      </div>

      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
        {questions.map((question, index) => (
          <div key={question.id} className="border border-gray-200 rounded-lg p-5 bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 leading-relaxed">
                  {question.content}
                </div>
                {question.point && (
                  <div className="inline-flex items-center mt-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {question.point} điểm
                  </div>
                )}
              </div>
            </div>
            
            {/* Hiển thị các lựa chọn */}
            {question.options && question.options.length > 0 && (
              <div className="ml-11 space-y-2">
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-start gap-3 p-2 bg-white rounded border border-gray-100">
                    <div className="bg-gray-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                      {String.fromCharCode(65 + optIndex)}
                    </div>
                    <span className="text-gray-700 leading-relaxed">{option}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center gap-2 text-amber-800">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Lưu ý</span>
        </div>
        <p className="text-amber-700 text-sm mt-1">
          Hãy đọc kỹ từng câu hỏi và các lựa chọn trước khi chọn đáp án ở bên phải.
        </p>
      </div>
    </div>
  );
}
