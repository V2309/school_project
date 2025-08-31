'use client';

import { usePathname } from "next/navigation";
import MenuItem from "@/components/MenuItem";

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Kiểm tra nếu path là /student/class/[id]
  const isClassPage = pathname?.startsWith("/student/class/");
  const isProfilePage = pathname?.startsWith("/student/profile");

  if (isClassPage) {
    return <>{children}</>; // Không render layout của student
  }

  if (isProfilePage) {
    return <>{children}</>; // Không render layout của student
  }

  return (
    <div className="h-screen w-screen flex overflow-x-hidden">
      {/* Menu bên trái */}
      <div className="fixed left-0 h-full w-[25%] md:w-[20%] lg:w-[18%] bg-white shadow-md p-4">
        <MenuItem />
      </div>
      {/* Nội dung bên phải  overflow-y-auto*/}
      <div className="ml-[25%] md:ml-[20%] lg:ml-[18%] flex-grow bg-gray-100 ">
        {children}
      </div>
    </div>
  );
}