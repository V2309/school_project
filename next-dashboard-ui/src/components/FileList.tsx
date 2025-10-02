"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Download, FileText, Trash2 } from "lucide-react";
import {getCurrentUser} from "@/hooks/auth";
import Table from "@/components/Table";
import TableSearch from "./TableSearch";
interface FileData {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  teacher: {
    username: string;
  };
  class?: {
    name: string;
    class_code: string;
  };
}

interface FileListProps {
  refreshTrigger?: number; // Để trigger refresh từ component cha
}


const FileList = ({ refreshTrigger }: FileListProps) => {

  const columns = ['Tên tài liệu' , 'Ngày tải lên']
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const classCode = params?.id as string;

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/files?classCode=${classCode}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Lỗi khi tải danh sách tài liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [classCode, refreshTrigger]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else if (type.includes('word') || type.includes('document')) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Chưa có tài liệu nào được tải lên</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <a
          key={file.id}
          href={`/teacher/class/${classCode}/documents/${file.id}`}
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-3 flex-1">
            {getFileIcon(file.type)}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </h3>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Tải lên bởi: {file.teacher.username}</p>
   
                <p>Ngày tải: {formatDate(file.uploadedAt)}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            >
              <Download className="w-4 h-4 mr-1" />
              Tải xuống
            </a>
          </div>
        </a>
      ))}
    </div>
  );
};

export default FileList;
