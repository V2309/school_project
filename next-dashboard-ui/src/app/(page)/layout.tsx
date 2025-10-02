'use client';
import Navigation from "@/components/Navigation";
import { usePathname } from "next/navigation";
import StreamVideoProvider from "@/providers/StreamClientProvider";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAddPage = pathname?.includes("/homework/add");
  const isFindPage = pathname?.includes("/sign-in") || pathname?.includes("/sign-up");
  const isTestPage = pathname?.includes("/homework/") && pathname?.endsWith("/test");
  const isResultPage = pathname?.includes("/homework/") && pathname?.endsWith("/detail");
  const isEditClassPage = pathname?.includes("/class/") && pathname?.endsWith("/edit");
  const isMeetingPage = pathname?.includes("/meeting/"); // Meeting và room pages
  
  // Nếu là meeting page thì không render layout này, để nó dùng layout riêng
  if (isMeetingPage) {
    return <>{children}</ >;  
  } 

  return (  
    <div className="h-screen w-screen flex flex-col overflow-x-hidden">
      {/* Cấp 1: Navigation trên cùng */}
      {!isAddPage && !isTestPage && !isFindPage && !isResultPage && (
        <div className="w-full flex-shrink-0 border-2 border-gray-200">
          <Navigation />
        </div>
      )}
      {/* Cấp 2: Nội dung chính */}
      <div className={
        isAddPage || isTestPage || isFindPage || isResultPage || isEditClassPage
          ? "flex-grow flex flex-col bg-gray-100"
          : "flex-grow  flex flex-col bg-gray-100 overflow-y-auto"
      }>
       
          {children}
    
      </div>
    </div>
  );
}