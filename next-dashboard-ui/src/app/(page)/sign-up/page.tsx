"use client";
import Link from "next/link";
import { useState, useRef } from "react";
import ProvinceSelect from "@/components/ProvinceSelect";

import { signupSchema } from "@/lib/formValidationSchema";

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setFieldErrors({});
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // 1) Lấy "raw" đúng tên input hiện tại để Zod validate
    const raw = {
      username: String(formData.get("username") || ""),
      class_name: String(formData.get("class_name") || ""),
      school: String(formData.get("school") || ""),
      birthday: String(formData.get("birthday") || ""),
      province: String(formData.get("province") || ""),
      info: String(formData.get("info") || ""),
      role: String(formData.get("role") || ""),
      password: String(formData.get("password") || ""),
      "confirm-password": String(formData.get("confirm-password") || ""),
      terms: formData.get("terms") ? true : false, // checkbox
    };

    // 2) Validate bằng Zod
    const parsed = signupSchema.safeParse(raw);
    if (!parsed.success) {
      // gom lỗi theo field
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fe[key]) fe[key] = issue.message;
      }
      setFieldErrors(fe);
      setError("Vui lòng kiểm tra và sửa các lỗi bên dưới.");
      setLoading(false);
      autoHideAlert();
      return;
    }

    // 3) Nếu hợp lệ: tách info thành email/phone như bạn đang làm
    const contact = raw.info;
    let email: string | undefined = undefined;
    let phone: string | undefined = undefined;
    if (contact.includes("@")) email = contact;
    else phone = contact;

    // 4) Chuẩn bị payload đúng với API hiện tại của bạn
    const data = {
      username: raw.username,
      class_name: raw.class_name,
      schoolname: raw.school,        // API đang nhận key `schoolname`
      birthday: raw.birthday,
      address: raw.province,         // API đang nhận key `address`
      email,
      phone,
      role: raw.role,
      password: raw.password,
    };

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        setError(result.error || "Đăng ký thất bại.");
        autoHideAlert();
      } else {
        setSuccess(true);
        form.reset();
        autoHideAlert();
      }
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
      autoHideAlert();
    } finally {
      setLoading(false);
    }
  }

  function autoHideAlert() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setError(null);
      setSuccess(false);
    }, 3000);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header tối giản */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                clipRule="evenodd"
              />
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">

          {/* Alert */}
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
            {/* Họ tên */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Họ tên
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Họ tên"
              />
              {fieldErrors.username && <p className="mt-1 text-sm text-red-600">{fieldErrors.username}</p>}
            </div>

            {/* Lớp & Trường */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  id="class_name"
                  name="class_name"
                  type="text"
                  autoComplete="organization-title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Lớp"
                />
                {fieldErrors.class_name && <p className="mt-1 text-sm text-red-600">{fieldErrors.class_name}</p>}
              </div>
              <div>
                <input
                  id="school"
                  name="school"
                  type="text"
                  autoComplete="organization"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tên trường"
                />
                {fieldErrors.school && <p className="mt-1 text-sm text-red-600">{fieldErrors.school}</p>}
              </div>
            </div>

            {/* Ngày sinh & Tỉnh/TP */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  id="birthday"
                  name="birthday"
                  type="date"
                  autoComplete="bday"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {fieldErrors.birthday && <p className="mt-1 text-sm text-red-600">{fieldErrors.birthday}</p>}
              </div>
              <div>
                {/* Đảm bảo ProvinceSelect cuối cùng submit ra <input name="province" /> */}
                <ProvinceSelect />
                {fieldErrors.province && <p className="mt-1 text-sm text-red-600">{fieldErrors.province}</p>}
              </div>
            </div>

            {/* Vai trò */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Chọn vai trò của bạn?
              </label>
              <select
                id="role"
                name="role"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn vai trò của bạn</option>
                <option value="student">Học sinh</option>
                <option value="teacher">Giáo viên</option>
              </select>
              {fieldErrors.role && <p className="mt-1 text-sm text-red-600">{fieldErrors.role}</p>}
            </div>

            {/* Email / SĐT */}
            <div>
              <label htmlFor="info" className="block text-sm font-medium text-gray-700 mb-1">
                Email address or Phone number
              </label>
              <input
                id="info"
                name="info"
                type="text"
                placeholder="Email hoặc SĐT"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {fieldErrors.info && <p className="mt-1 text-sm text-red-600">{fieldErrors.info}</p>}
            </div>

            {/* Mật khẩu */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {fieldErrors.password && <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>}
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {fieldErrors["confirm-password"] && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors["confirm-password"]}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-500">Terms of Service</Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</Link>
                </label>
              </div>
            </div>
            {fieldErrors.terms && <p className="mt-1 text-sm text-red-600">{fieldErrors.terms}</p>}

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 disabled:opacity-70 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? "Processing..." : "Create Account"}
              </button>
            </div>
          </form>

          {/* (phần social + footer giữ nguyên như bạn) */}
        </div>
      </main>
    </div>
  );
}
