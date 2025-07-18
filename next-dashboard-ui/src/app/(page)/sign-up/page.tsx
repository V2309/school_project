"use client";
import Head from 'next/head';
import Link from 'next/link';
import ProvinceSelect from '@/components/ProvinceSelect';
import Header from '@/components/Header';
import { useState, useRef } from "react";
export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const contact = formData.get("info") as string;
    let email = undefined;
    let phone = undefined;
    if (contact.includes("@")) {
      email = contact;
    } else {
      phone = contact;
    }

    // Lấy dữ liệu từ form
    const data = {
      // id: Math.random().toString(36).substring(2, 8),
      username: formData.get("username"),
      class_name: formData.get("class_name"),
      schoolname: formData.get("school"),
      birthday: formData.get("birthday"),
      address: formData.get("province"),
      email: email,
      phone: phone,
      role: formData.get("role"),
      password: formData.get("password"),
    };

    // Validate đơn giản phía client (có thể mở rộng)
    if (!data.username || !data.class_name || !data.schoolname || !data.birthday || !data.address || !data.password) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      setLoading(false);
      autoHideAlert();
      return;
    }

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        setError(result.error || "Đăng ký thất bại.");
        autoHideAlert();
      } else {
        setSuccess(true);
        form.reset();
        autoHideAlert();
      }
    } catch (err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
      autoHideAlert();
    } finally {
      setLoading(false);
    }
  }

  // Hàm tự động ẩn alert sau 3s
  function autoHideAlert() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setError(null);
      setSuccess(false);
    }, 3000);
  }

  return (
    <div className="min-h-screen bg-gray-50">


      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <span className="ml-2 text-xl font-bold text-gray-900">YourLogo</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
            <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">

          {/* Alert hiển thị bên phải */}
          {(error || success) && (
            <div className={`fixed top-8 right-8 z-50 transition-all duration-300
              ${error ? "bg-red-500" : "bg-green-500"} text-white px-6 py-3 rounded shadow-lg flex items-center gap-2`}>
              {error && (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
                  </svg>
                  <span>{error}</span>
                </>
              )}
              {success && (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Đăng ký thành công!</span>
                </>
              )}
            </div>
          )}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
            <p className="text-gray-600">Join our platform to get started</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Full Name Field */}
            <div>
              <label htmlFor="info" className="block text-sm font-medium text-gray-700 mb-1">
                Thông tin cá nhân
              </label>
              <input
                id="info"
                name="username"
                type="text"
                autoComplete="info"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Họ tên"
              />
            </div>

            {/* Class and School in one line */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  id="class"
                  name="class_name"
                  type="text"
                  autoComplete="class_name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Lớp"
                />
              </div>
              <div>
                <input
                  id="school"
                  name="school"
                  type="text"
                  autoComplete="school"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tên trường"
                />
              </div>
            </div>

            {/* Date of Birth and Province in one line */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  id="birthday"
                  name="birthday"
                  type="date"
                  autoComplete="bday"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>

                <ProvinceSelect />
              </div>
            </div>
            <div>
              <label htmlFor="info" className="block text-sm font-medium text-gray-700 mb-1">
               Chọn vai trò của bạn?
              </label>
              <select
                id="role"
                name="role"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn vai trò của bạn</option>
                <option value="student">Học sinh</option>
                <option value="teacher">Giáo viên</option>
              
              </select>
            </div>
            {/* Email Field */}
            <div>
              <label htmlFor="info" className="block text-sm font-medium text-gray-700 mb-1">
                Email address or Phone number
              </label>
              <input
                id="info"
                name="info"
                type="text"
                placeholder='Email address or Phone number'
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"

              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="At least 8 characters"
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm your password"
              />
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  I agree to the <Link href="/terms" className="text-blue-600 hover:text-blue-500">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</Link>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Account
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.933.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
              </svg>
              <span className="ml-2">GitHub</span>
            </button>
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
              </svg>
              <span className="ml-2">Twitter</span>
            </button>
          </div>

          {/* Already have an account */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}