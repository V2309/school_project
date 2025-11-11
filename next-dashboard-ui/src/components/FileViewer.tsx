// components/FileViewer.tsx
"use client";

import PDFViewer from "@/components/PDFViewer";
import DocxViewer from "@/components/DocxViewer";

interface FileViewerProps {
  fileUrl: string | null;
  fileName?: string;
  className?: string;
}

export default function FileViewer({ fileUrl, fileName, className = "" }: FileViewerProps) {
  if (!fileUrl) {
    return (
      <div className={`border rounded p-4 min-h-[600px] h-[80vh] flex items-center justify-center ${className}`}>
        <p className="text-gray-500">Chưa có file được chọn</p>
      </div>
    );
  }

  const isPDF = fileUrl.toLowerCase().includes('.pdf');
  const isWord = fileUrl.toLowerCase().includes('.doc');

  return (
    <div className={`border rounded p-4 min-h-[600px] h-[80vh] overflow-hidden ${className}`}>
      {fileName && (
        <div className="mb-2 p-2 bg-gray-50 rounded text-sm">
          <strong>File:</strong> {fileName}
        </div>
      )}
      
      <div className="h-full">
        {isPDF ? (
          <PDFViewer fileUrl={fileUrl} />
        ) : isWord ? (
          <DocxViewer fileUrl={fileUrl} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Không hỗ trợ xem trước định dạng file này</p>
          </div>
        )}
      </div>
    </div>
  );
}