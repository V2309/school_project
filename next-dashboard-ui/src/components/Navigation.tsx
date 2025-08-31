"use client";

import { useUser } from "@/lib/hooks/useUser";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { logoutAction } from "@/lib/actions";
import Image from "next/image";

/* =========================
   Config menu gộp chung file
   ========================= */
export type Role = "admin" | "teacher" | "student" | "parent";

// - Teacher: class / materials / schedule
// - Student: overview / class / schedule
export const topNavItems = [
  // Teacher
  { label: "Lớp học", href: "/teacher/class", visible: ["teacher"] as Role[] },
  { label: "Học liệu", href: "/teacher/materials", visible: ["teacher"] as Role[] },
  { label: "Lịch học", href: "/teacher/schedule", visible: ["teacher"] as Role[] },

  // Student
  { label: "Tổng quan", href: "/student/overview", visible: ["student"] as Role[] },
  { label: "Lớp học", href: "/student/class", visible: ["student"] as Role[] },
  { label: "Lịch học", href: "/student/schedule", visible: ["student"] as Role[] },
] as const;

const Navigation: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();
  const role = user?.role as Role | undefined;

  const handleLogout = async () => {
    try {
      await logoutAction();
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const itemsForRole = role
    ? topNavItems.filter((i) => i.visible.includes(role))
    : [];

  return (
    <nav className="flex items-center justify-between p-4 h-[70px] bg-white shadow">
      {/* Logo SVG giữ nguyên của bạn */}
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

      {/* Menu theo role */}
      <div className="hidden md:flex items-center space-x-8 text-sm">
        {itemsForRole.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`transition-colors ${pathname === item.href
                ? "text-primary font-bold underline underline-offset-8"
                : "text-dark hover:text-primary"
              }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Actions bên phải */}
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

        {/* Thông báo */}
        <div className="relative cursor-pointer">
          <span className="text-lg">🔔</span>
          <div className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
            1
          </div>
        </div>

        {/* Avatar dropdown */}
        <div className="relative" ref={menuRef}>
          <div
            className="flex flex-col items-center justify-center p-2 cursor-pointer rounded-full hover:bg-gray-100"
            onClick={() => setOpenMenu((prev) => !prev)}
          >
            <Image
              src="/avatar.png" // đường dẫn ảnh avatar của bạn
              alt="Avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-xs font-medium mt-1">
              {user?.username as string}
            </span>
          </div>

          {openMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded shadow border z-50 transform transition-all duration-300 ease-in-out">
              <Link
                href={`/${role ?? "student"}/profile`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setOpenMenu(false)}
              >
                Hồ sơ cá nhân
              </Link>
              <Link
                href="/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setOpenMenu(false)}
              >
                Cài đặt
              </Link>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                onClick={handleLogout}
              >
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
