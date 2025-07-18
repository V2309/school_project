"use client";
import { useUser } from "@/lib/hooks/useUser";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/lib/actions";

const Navigation = () => {
  // Xử lý đăng xuất
  const router = useRouter();
  // Lấy thông tin người dùng
 const { user } = useUser();

const role = user?.role;
  const handleLogout = async () => {
    try {
      await logoutAction();
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };



  // Lấy đường dẫn hiện tại
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false);
      }
    }
    if (openMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);


  return (
    <nav className="flex items-center justify-between p-4 h-[70px] bg-white shadow">
      <div className="flex items-center space-x-2">
        <svg
          className="w-8 h-8 text-primary"
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
        <span className="text-xl font-bold text-dark">DocuS</span>
      </div>
      <div className="hidden md:flex items-center space-x-8 text-sm">
        {role === "teacher" ? (
          <>
            <Link
              href="/teacher/class"
              className={`transition-colors ${pathname === `/${role}/class`
                  ? "text-primary font-bold underline underline-offset-8"
                  : "text-dark hover:text-primary"
                }`}
            >
              Lớp học
            </Link>
            <Link
              href="/teacher/materials"
              className={`transition-colors ${pathname === `/${role}/materials`
                  ? "text-primary font-bold underline underline-offset-8"
                  : "text-dark hover:text-primary"
                }`}
            >
              Học liệu
            </Link>
            <Link
              href="/teacher/schedule"
              className={`transition-colors ${pathname === `/${role}/schedule`
                  ? "text-primary font-bold underline underline-offset-8"
                  : "text-dark hover:text-primary"
                }`}
            >
              Lịch học
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/student/overview"
              className={`transition-colors ${pathname === "/student/overview"
                  ? "text-primary font-bold underline underline-offset-8"
                  : "text-dark hover:text-primary"
                }`}
            >
              Tổng quan
            </Link>
            <Link
              href="/student/class"
              className={`transition-colors ${pathname === "/student/class"
                  ? "text-primary font-bold underline underline-offset-8"
                  : "text-dark hover:text-primary"
                }`}
            >
              Lớp học
            </Link>
            <Link
              href="/student/schedule"
              className={`transition-colors ${pathname === "/student/schedule"
                  ? "text-primary font-bold underline underline-offset-8"
                  : "text-dark hover:text-primary"
                }`}
            >
              Lịch học
            </Link>
          </>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <Link
          href="#"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          Hỏi đáp
        </Link>
        <Link
          href="/sign-in"
          className="px-4 py-2 text-dark hover:text-primary transition-colors"
        >
          Hỏi đáp cùng Classroom
        </Link>
        {/* icon notification */}
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <Image src="/announcement.png" alt="" width={20} height={20} />
          <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
            1
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <div
            className="flex flex-col rounded-full items-center justify-center  p-2 cursor-pointer"
            onClick={() => setOpenMenu((prev) => !prev)}
          >
            <Image
              src="/avatar.png"
              alt="Avatar"
              width={40}
              height={40}
              className="rounded-full mt-1"
            />
            <span className="text-xs font-medium">{user?.username as string}</span>
          </div>
          {openMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded shadow border z-50 transform transition-all duration-300 ease-in-out">
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Image
                  src="/profile.png"
                  alt="Hồ sơ cá nhân"
                  width={24}
                  height={24}
                  className="mr-2"
                />
                Hồ sơ cá nhân
              </Link>
              <Link
                href="/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center "
              >
                <Image
                  src="/setting.png"
                  alt="Cài đặt"
                  width={24}
                  height={24}
                  className="mr-2"
                />
                Cài đặt
              </Link>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 flex items-center"
                onClick={handleLogout}
              >
                <Image
                  src="/logout.png"
                  alt="Đăng xuất"
                  width={24}
                  height={24}
                  className="mr-2"
                />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;