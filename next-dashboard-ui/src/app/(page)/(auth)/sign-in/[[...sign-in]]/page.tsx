"use client";
import { useFormState } from "react-dom";
import { loginAction } from "@/lib/actions/auth.action"; // Adjust the import path as necessary
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

type LoginState = {
  error?: string;
  success?: boolean;
  role?: string;
};

export default function SignInPage () {
  const [state, formAction] = useFormState(loginAction, { error: "" } as LoginState);
  const router = useRouter();

  // Xử lý redirect sau khi đăng nhập thành công
  useEffect(() => {
    if (state?.success && state?.role) {
      // Trigger custom event để notify các component khác
      window.dispatchEvent(new CustomEvent('user-logged-in'));
      
      // Redirect theo role
      setTimeout(() => {
        if (state.role === "teacher") {
          window.location.href = "/class";
        } else if (state.role === "student") {
          window.location.href = "/overview";
        } else {
          window.location.href = "/";
        }
      }, 100);
    }
  }, [state]);
  

  return (
    <div className="h-screen flex items-center justify-between p-8">
      {/* Logo */}
      <div className="hidden lg:flex w-1/2 items-center justify-center gap-4">
        <svg
          className="w-64 h-64 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-3xl font-bold text-dark">DocuS</span>
      </div>

      {/* Form */}
      <div className="w-full lg:w-1/2 flex flex-col gap-4">
        <h2 className="text-2xl md:text-4xl font-bold">Đăng nhập tài khoản của bạn</h2>

        {/* Google Sign In */}
        <button
          className="bg-white rounded-full p-2 text-black w-72 flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-xl transition-shadow duration-200"
          onClick={() => {
            // TODO: xử lý đăng nhập bằng Google (Clerk / Firebase / OAuth...)
            console.log("Đăng nhập Google");
          }}
        >
          <svg viewBox="0 0 24 24" width={24} height={24}>
            {/* Icon Google */}
            <path
              d="M18.977 4.322L16 7.3c-1.023-.838-2.326-1.35-3.768-1.35-2.69 0-4.95 1.73-5.74 4.152l-3.44-2.635c1.656-3.387 5.134-5.705 9.18-5.705 2.605 0 4.93.977 6.745 2.56z"
              fill="#EA4335"
            ></path>
            <path
              d="M6.186 12c0 .66.102 1.293.307 1.89L3.05 16.533C2.38 15.17 2 13.63 2 12s.38-3.173 1.05-4.533l3.443 2.635c-.204.595-.307 1.238-.307 1.898z"
              fill="#FBBC05"
            ></path>
            <path
              d="M18.893 19.688c-1.786 1.667-4.168 2.55-6.66 2.55-4.048 0-7.526-2.317-9.18-5.705l3.44-2.635c.79 2.42 3.05 4.152 5.74 4.152 1.32 0 2.474-.308 3.395-.895l3.265 2.533z"
              fill="#34A853"
            ></path>
            <path
              d="M22 12c0 3.34-1.22 5.948-3.107 7.688l-3.265-2.53c1.07-.67 1.814-1.713 2.093-3.063h-5.488V10.14h9.535c.14.603.233 1.255.233 1.86z"
              fill="#4285F4"
            ></path>
          </svg>
          Sign in with Google
        </button>

        {/* OR divider */}
        <div className="w-72 flex items-center gap-4">
          <div className="h-px bg-borderGray flex-grow" />
          <span className="text-textGrayLight">or</span>
          <div className="h-px bg-borderGray flex-grow" />
        </div>

        {/* Login Form */}
          <form action={formAction} className="flex flex-col gap-4">
          <input
            name="email"
            placeholder="Email hoặc Số điện thoại"
            className="py-2 px-6 rounded-full text-black w-72 placeholder:text-sm border border-borderDark focus:border-iconBlue focus:outline-none"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Mật khẩu"
            className="py-2 px-6 rounded-full text-black w-72 placeholder:text-sm border border-borderDark focus:border-iconBlue focus:outline-none"
            required
          />
          {state?.error && (
            <div className="text-red-500 text-sm px-2">{state.error}</div>
          )}
          <button
            type="submit"
            className="bg-iconBlue bg-blue-500 text-white rounded-full p-2 border border-iconBlue font-bold w-72 shadow-md text-center hover:bg-blue-600 hover:text-white transition"
          >
            Đăng nhập
          </button>
        </form>

        {/* Sign up link */}
        <Link
          href="/sign-up"
          className="bg-white border border-borderGray rounded-full p-2 font-bold w-72 text-center"
        >
          Tạo tài khoản mới
        </Link>

        <p className="w-72 text-xs">
          Bằng cách đăng ký, bạn đồng ý với <span className="text-iconBlue">Điều khoản dịch vụ</span> và <span className="text-iconBlue">Chính sách bảo mật</span>, bao gồm cả <span className="text-iconBlue">Sử dụng Cookie</span>.
        </p>
      </div>
    </div>
  );
}




