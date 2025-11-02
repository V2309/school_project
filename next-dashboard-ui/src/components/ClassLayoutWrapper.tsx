"use client";

import { usePathname } from "next/navigation";
import MenuClass from "@/components/MenuClass";

interface ClassLayoutWrapperProps {
  children: React.ReactNode;
  classDetail: any;
  role: string;
}

export default function ClassLayoutWrapper({ children, classDetail, role }: ClassLayoutWrapperProps) {
  const pathname = usePathname();
  
  // (Logic ẩn layout của bạn giữ nguyên)
  if (pathname.includes("/homework/add") || pathname.includes("/homework/") && pathname.endsWith("/test") || pathname.includes("/homework/") && pathname.endsWith("/detail") || pathname.includes("/class/") && pathname.endsWith("/edit")) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Menu bên trái */}
      {/* TỐI ƯU: ĐÃ XÓA p-4 khỏi class này */}
      <div className="fixed left-0 h-full w-[25%] md:w-[20%] lg:w-[18%] bg-white shadow-md border-r border-gray-400 z-40">
        <MenuClass classDetail={classDetail} role={role as "teacher" | "student"}/>
      </div>

      {/* Nội dung bên phải */}
      <div className="ml-[25%] md:ml-[20%] lg:ml-[18%] flex-grow bg-white overflow-y-auto">
        {children}
      </div>
    </div>
  );
}