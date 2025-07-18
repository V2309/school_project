"use client";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
export const menuItems = [
  {
    label: "Tổng quan",
    href: "/student/overview",
    icon: (
      <Image src="/home.png" alt="Overview" width={20} height={20} />
    ),
  },
  {
    label: "Lớp học",
    href: "/student/class",
    icon: (
      <Image src="/class.png" alt="Classes" width={20} height={20} />
    ),
  },
  {
    label: "Lịch học",
    href: "/student/schedule",
    icon: (
    <Image src="/date.png" alt="Schedule" width={20} height={20} />
    ),
  },
  {
    label: "Kết quả",
    href: "/student/results",
    icon: (
      <Image src="/result.png" alt="Results" width={20} height={20} />
    ),
  },
  {
    label: "Thông báo",
    href: "/student/notifications",
    icon: (
      <Image src="/announcement.png" alt="Notifications" width={20} height={20} />
    ),
  },
];


export const MenuList = () => {
  const pathname = usePathname();

  return (
    <>
      {menuItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-gray-500 transition-colors group
              ${isActive ? "bg-gray-200 text-primary" : "hover:bg-gray-200 hover:text-blue-500"}
            `}
          >
            <span className={`text-primary group-hover:text-white ${isActive ? "text-white" : ""}`}>{item.icon}</span>
            <span className="hidden lg:inline font-semibold text-base tracking-wide font-sans">
              {item.label}
            </span>
          </Link>
        );
      })}
    </>
  );
};

export default MenuList;