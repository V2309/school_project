"use client";

import { useState } from 'react';

interface QuestionCardGridProps {
  numQuestions: number;
  answers: string[];
  totalPoints: number;
  onNumQuestionsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnswerChange: (index: number, value: string) => void;
  onPointsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBulkAnswerChange?: (answers: string[]) => void;
  disabled?: boolean;
}

export default function QuestionCardGrid({
  numQuestions,
  answers,
  totalPoints,
  onNumQuestionsChange,
  onAnswerChange,
  onPointsChange,
  onBulkAnswerChange,
  disabled = false
}: QuestionCardGridProps) {
  const [quickAnswers, setQuickAnswers] = useState('');

  // Nhập nhanh đáp án
  const handleQuickAnswers = () => {
    const inputString = quickAnswers.trim();
    const inputArray = inputString.split("");
    
    console.log("Quick input:", inputString);
    console.log("Input array:", inputArray);
    console.log("Num questions:", numQuestions);
    console.log("Current answers:", answers);
    
    if (onBulkAnswerChange) {
      // Sử dụng bulk update nếu có
      const newAnswers = [...answers];
      for (let i = 0; i < Math.min(inputArray.length, numQuestions); i++) {
        newAnswers[i] = inputArray[i];
      }
      console.log("Bulk updating answers:", newAnswers);
      onBulkAnswerChange(newAnswers);
    } else {
      // Fallback về cách cũ
      inputArray.forEach((char, index) => {
        if (index < numQuestions) {
          console.log(`Setting answer ${index} to '${char}'`);
          onAnswerChange(index, char);
        }
      });
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Câu Hỏi</h2>
      
      {/* Controls */}
      <div className="mb-4 flex gap-4 items-end">
        <div>
          <label className="block mb-2">Số lượng câu hỏi:</label>
          <input
            type="number"
            min="0"
            value={numQuestions}
            onChange={onNumQuestionsChange}
            disabled={disabled}
            className="border rounded px-3 py-2 w-20"
          />
        </div>
        <div>
          <label className="block mb-2">Tổng điểm:</label>
          <input
            type="number"
            min="1"
            value={totalPoints}
            onChange={onPointsChange}
            disabled={disabled}
            className="border rounded px-3 py-2 w-24"
          />
        </div>
      </div>
      
      {/* Quick Answer Input */}
      <div className="mb-4 flex gap-2 items-center">
        <input
          type="text"
          placeholder="Nhập chuỗi đáp án (VD: ACDABCAD)"
          value={quickAnswers}
          onChange={e => setQuickAnswers(e.target.value.toUpperCase())}
          disabled={disabled}
          className="border rounded px-3 py-2 w-64"
        />
        <button
          type="button"
          onClick={handleQuickAnswers}
          disabled={disabled}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          Nhập nhanh đáp án
        </button>
      </div>
      
      <p className='mb-4'>Số lượng đáp án đã nhập: <b className='text-red-600'>{quickAnswers.length}</b></p>
      
      {/* Question Cards Grid với scroll */}
      <div className="relative">
        {/* Scroll container với scroll indicator */}
        <div className="max-h-[500px] overflow-y-auto border rounded-lg p-3 bg-gray-50 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: numQuestions }).map((_, index) => (
              <div key={index} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow min-h-[140px]">
                <div className="font-semibold text-blue-700 mb-3 text-center bg-blue-50 py-1 rounded">
                  Câu {index + 1}
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đáp án</label>
                    <input
                      type="text"
                      value={answers[index] || ''}
                      onChange={(e) => onAnswerChange(index, e.target.value)}
                      disabled={disabled}
                      placeholder="Nhập đáp án..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Điểm</label>
                    <input
                      type="number"
                      value={
                        numQuestions > 0 
                          ? index === numQuestions - 1 
                            ? (totalPoints - (Math.round((totalPoints / numQuestions) * 100) / 100) * (numQuestions - 1)).toFixed(2)
                            : (Math.round((totalPoints / numQuestions) * 100) / 100).toFixed(2)
                          : '0'
                      }
                      readOnly
                      className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-600 text-sm text-center font-medium"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Scroll indicator */}
        {numQuestions > 9 && (
          <div className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full opacity-75">
            Scroll để xem thêm
          </div>
        )}
      </div>
    </div>
  );
}