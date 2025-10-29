"use client";
import FileUpload from "@/components/FileUpload";
import FileList from "@/components/FileList";
import { useState } from "react";

interface DocumentPageClientProps {
  userRole?: string;
}

export default function DocumentPageClient({ userRole }: DocumentPageClientProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFileUploaded = () => {
    // Tăng trigger để refresh danh sách file
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <div className="flex bg-white font-sans h-full flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Tài liệu lớp học</h1>
          
          {/* Chỉ hiển thị FileUpload nếu user là teacher */}
          {userRole === "teacher" && (
            <FileUpload onFileUploaded={handleFileUploaded} />
          )}
        </div>
        
        {/* File List */}
        <div className="flex-1">
          <FileList refreshTrigger={refreshTrigger} role={userRole || null} />
        </div>
      </div>
    </>
  );
}