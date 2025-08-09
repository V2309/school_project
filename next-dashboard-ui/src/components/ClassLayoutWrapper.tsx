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
  
  console.log("test pathname", pathname);

  // Kiểm tra nếu pathname chứa "/homework/add" thì không render layout
  if (pathname.includes("/homework/add") || pathname.includes("/homework/") && pathname.endsWith("/test") || pathname.includes("/homework/") && pathname.endsWith("/detail") || pathname.includes("/class/") && pathname.endsWith("/edit")) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Menu bên trái */}
      <div className="fixed left-0 h-full w-[25%] md:w-[20%] lg:w-[18%] bg-white shadow-md p-4 border-r border-gray-400">
        <MenuClass classDetail={classDetail} role={role as "teacher" | "student"}/>
      </div>

      {/* Nội dung bên phải */}
      <div className="ml-[25%] md:ml-[20%] lg:ml-[18%] flex-grow bg-white overflow-y-auto">
        {children}
      </div>
    </div>
  );
} 