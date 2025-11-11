// app/(dashboard)/layout.tsx
import React from "react";
import { Sidebar } from "@/components/admin/sidebar";
import { Header } from "@/components/admin/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      
      {/* Sidebar (bên trái) */}
      <Sidebar />
      
      {/* Nội dung chính (bên phải) */}
      <div className="flex flex-col">
        
        {/* Header (ở trên) */}
        <Header />

        {/* Main Content (nội dung trang) */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children} 
        </main>
        
      </div>
    </div>
  );
}