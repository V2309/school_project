"use client";

import React, { useState, useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { joinClassAction } from "@/lib/actions/class.action";
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
// Import thêm icon
import { UserPlus, ArrowLeft, AlertCircle } from 'lucide-react';

export default function JoinClass() {
  const router = useRouter();
  const [codeArr, setCodeArr] = useState(["", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (idx: number, value: string) => {
    // Chỉ cho phép chữ và số
    if (!/^[A-Za-z0-9]*$/.test(value)) return; 
    
    const newArr = [...codeArr];
    newArr[idx] = value.toUpperCase().slice(0, 1);
    setCodeArr(newArr);

    // Tự động focus ô tiếp theo
    if (value && idx < 4) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Tự động lùi lại khi bấm Backspace ở ô trống
    if (e.key === "Backspace" && !codeArr[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  /**
   * TỐI ƯU UX: Xử lý khi người dùng dán (paste)
   */
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData("text");

    // Kiểm tra nếu dán 1 mã 5 ký tự
    if (pastedData.length === 5 && /^[A-Za-z0-9]{5}$/.test(pastedData)) {
      e.preventDefault(); // Ngăn hành động dán mặc định
      const newCodeArr = pastedData.toUpperCase().split("");
      setCodeArr(newCodeArr);
      inputRefs.current[4]?.focus(); // Focus ô cuối
    }
    // Nếu dán 1 ký tự, để handleInputChange xử lý
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = codeArr.join("");
    if (code.length !== 5) {
      setError("Mã lớp phải gồm đúng 5 ký tự.");
      return;
    }
    
    setError("");
    setIsLoading(true);

    try {
      const result = await joinClassAction(code);
      if (result.success) {
        // Kiểm tra nếu có message (nghĩa là cần phê duyệt)
        if (result.message) {
          setShowApprovalModal(true);
        } else {
          // Tham gia trực tiếp thành công
          toast.success("Tham gia lớp thành công!");
          router.push(`/class`);
          router.refresh(); // Force refresh để đảm bảo data mới được load
        }
      } else {
        setError(result.error || "Mã lớp không đúng hoặc có lỗi xảy ra.");
        // Xóa các ô input khi nhập sai
        setCodeArr(["", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi tham gia lớp.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    // Nền gradient
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      
      {/* Nút quay lại ở góc trên bên trái */}
      <button
        onClick={handleGoBack}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
      >
        <ArrowLeft size={16} />
        Quay lại
      </button>
      
      <div className="bg-white rounded-2xl shadow-xl p-8 pt-10 w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {/* CẬP NHẬT ICON: Dùng icon UserPlus */}
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tham gia lớp học</h1>
          <p className="text-gray-600">Nhập mã lớp 5 ký tự do giáo viên cung cấp</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Code Input */}
          <div className="flex justify-center gap-2 sm:gap-4">
            {[0, 1, 2, 3, 4].map((idx) => (
              <input
                key={idx}
                ref={el => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="text"
                maxLength={1}
                value={codeArr[idx]}
                onChange={e => handleInputChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                onPaste={handlePaste} // THÊM TÍNH NĂNG PASTE
                // CẬP NHẬT UI: Input to hơn
                className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 border-2 border-gray-300 rounded-lg text-center text-3xl font-bold text-gray-900 uppercase focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                {/* CẬP NHẬT ICON */}
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || codeArr.some(c => c === "")}
            className="w-full bg-blue-600 text-white py-3.5 px-4 rounded-lg font-semibold text-base hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-lg hover:shadow-blue-500/30"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang tham gia...
              </>
            ) : (
              "Xác nhận tham gia"
            )}
          </button>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Mã lớp gồm 5 ký tự (chữ cái và số).
          </p>
        </div>
      </div>

      {/* Modal phê duyệt */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4 transform animate-in fade-in duration-300">
            {/* Icon thành công */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                {/* Icon tick với animation */}
                <div className="relative">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {/* Hiệu ứng confetti */}
                  <div className="absolute -top-2 -left-2 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
                  <div className="absolute -top-1 -right-2 w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-green-400 rounded-full animate-bounce delay-150"></div>
                  <div className="absolute -bottom-2 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-300"></div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Yêu cầu đã được gửi
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Yêu cầu tham gia lớp của bạn đã được gửi đến giáo viên, chờ phê duyệt để vào lớp.
              </p>
              
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  router.push('/class');
                }}
                className="w-full bg-blue-600 text-white py-3.5 px-4 rounded-lg font-semibold text-base hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/30"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}