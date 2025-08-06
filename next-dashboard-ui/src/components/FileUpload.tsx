"use client";

import { uploadToS3, getS3Url } from "@/lib/s3";
import { Inbox, Loader2 } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";

const FileUpload = () => {
  const [uploading, setUploading] = React.useState(false);
  const [uploadedUrl, setUploadedUrl] = React.useState<string | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File quá lớn, tối đa 10MB");
        return;
      }

      try {
        setUploading(true);
        const result = await uploadToS3(file);

        const fileUrl = getS3Url(result.file_key); // 🔧 Tạo URL đầy đủ từ file_key
        setUploadedUrl(fileUrl); // 🔄 Lưu để hiển thị nếu muốn
        toast.success("Tải lên thành công!");
        console.log("Uploaded File URL:", fileUrl);

        // 👉 Nếu muốn gửi URL đến backend hoặc lưu DB, gọi API tại đây
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Lỗi khi tải lên");
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <>
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">Đang tải lên...</p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Kéo thả hoặc chọn file tài liệu (PDF, Word)</p>
          </>
        )}
      </div>

      {uploadedUrl && (
        <div className="mt-4 text-sm text-green-600 break-all">
          <p>File đã tải lên:</p>
          <a
            href={uploadedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600"
          >
            {uploadedUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
