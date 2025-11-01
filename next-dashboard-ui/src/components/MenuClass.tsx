'use client';

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import LeaveClassDialog from "./LeaveClassDialog";
interface MenuClassProps {
  classDetail: {
    id: number | string;
    name: string;
    class_code: string | null;
    capacity: number;
    supervisor?: { username?: string } | null;
    students: { id: string; username?: string }[];
    grade?: { level?: string } | null;
  };
  role: "teacher" | "student";
}

export default function MenuClass({ classDetail, role }: MenuClassProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  // Icon mapping for each menu item
  const menuIcons = {
    newsfeed: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    schedule: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    members: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    groups: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    homework: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    lectures: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    documents: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    scoretable: "M3 3v18h18M7 17V13M11 17V7M15 17V10M19 17V5",
  };


  const class_code = classDetail.class_code;

  const links = [
    { href: `/class/${class_code}/newsfeed`, label: "Bảng tin", icon: menuIcons.newsfeed },
    { href: `/class/${class_code}/schedule`, label: "Lịch học", icon: menuIcons.schedule },
    { href: `/class/${class_code}/member`, label: "Thành viên", icon: menuIcons.members },
    // { href: `/class/${class_code}/groups`, label: "Nhóm học tập", icon: menuIcons.groups },
    { href: `/class/${class_code}/homework/list`, label: "Bài tập", icon: menuIcons.homework },
    { href: `/class/${class_code}/scoretable`, label: "Bảng điểm", icon: menuIcons.scoretable },
    { href: `/class/${class_code}/video`, label: "Bài giảng", icon: menuIcons.lectures },
    { href: `/class/${class_code}/documents`, label: "Tài liệu", icon: menuIcons.documents },

  ];

  return (
    <div className="flex flex-col h-full">
      {/* Thông tin lớp học */}
      <div className="mb-6">
        <h2 className="text-lg md:text-md font-bold">{classDetail.name}</h2>
        <p className="text-sm md:text-base text-gray-500">
          Mã lớp: {classDetail.class_code}
        </p>
        <p className="text-xs md:text-base text-gray-500">Giáo viên</p>

        <div className="flex items-center mt-2">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-300">

          </div>
          <p className="ml-2 text-sm md:text-base">
            {classDetail.supervisor?.username || "Chưa phân công"}
          </p>
        </div>
      </div>

      {/* Danh mục */}
      <div className="flex flex-col space-y-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 ${pathname === link.href
              ? "text-blue-700 font-bold"
              : "text-gray-700 hover:text-blue-700"
              }`}
          >
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-5 h-5 md:w-6 md:h-6 ${pathname === link.href ? "text-blue-700" : "text-gray-500"
                  }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={link.icon}
                />
              </svg>
            </span>
            <span className="text-sm md:text-base">{link.label}</span>
          </Link>
        ))}


      </div>
      <div className="text-xs text-gray-400 italic mt-5">
        {role === "student" ? (
          <button 
            onClick={() => setShowLeaveDialog(true)}
            className="flex items-center text-xs text-gray-400 italic mt-5 hover:text-gray-600 hover:text-red-500 transition-colors"
          >
            <span className="ml-1 mr-2">
              <Image
                src="/exit.png"
                alt="Rời khỏi lớp học"
                width={24}
                height={24}
              />
            </span>
            Rời khỏi lớp học
          </button>
        ) : (
          <Link 
            href={`/class/${class_code}/edit`}
            className="flex items-center text-xs text-gray-400 italic mt-5 hover:text-gray-600 transition-colors"
          >
            <span className="ml-1 mr-2">
              <Image
                src="/setting.png"
                alt="Cài đặt lớp"
                width={24}
                height={24}
              />
            </span>
            Cài đặt lớp
          </Link>
        )}
      </div>

      {/* Leave Class Dialog */}
      {role === "student" && (
        <LeaveClassDialog
          isOpen={showLeaveDialog}
          onClose={() => setShowLeaveDialog(false)}
          classData={{
            id: Number(classDetail.id),
            name: classDetail.name,
            class_code: classDetail.class_code
          }}
          onSuccess={() => {
            router.push('/class'); // Redirect to class list after leaving
          }}
        />
      )}
    </div>
  );
}