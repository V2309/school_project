

"use client";
import FileUpload from "@/components/FileUpload";
import FileList from "@/components/FileList";
import { useState } from "react";


export default function Document() {


  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFileUploaded = () => {
    // Tăng trigger để refresh danh sách file
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="px-4 py-4 bg-white rounded-lg shadow-md flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Tài liệu lớp học</h1>
        <FileUpload onFileUploaded={handleFileUploaded} />
      </div>

      <div className="flex-1">
        <h2 className="text-xl font-bold mb-4">Danh sách tài liệu</h2>
        <FileList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}
