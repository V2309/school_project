"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { Download, FileText, Trash2, Eye } from "lucide-react";
import {getCurrentUser} from "@/hooks/auth";
import { deleteFile } from "@/lib/actions/file.action";
import Table from "@/components/Table";
import TableSearch from "./TableSearch";
import FileViewersModal from "./FileViewersModal";
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
  _count?: {
    views: number;
  };
  views?: Array<{
    user: {
      id: string;
      username: string;
    };
    viewedAt: string;
  }>;
  viewedByCurrentUser?: boolean;
  firstViewedAt?: string | null; // Thêm field thời gian xem đầu tiên
}

interface FileListProps {
  refreshTrigger?: number; // Để trigger refresh từ component cha
  role?: string | null; // Role của user hiện tại
}


const FileList = ({ refreshTrigger, role }: FileListProps) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [showViewersModal, setShowViewersModal] = useState(false);
  const params = useParams();
  const classCode = params?.id as string;

  // Định nghĩa columns cho table
  const columns = [
    { header: "Tên tài liệu", accessor: "name" },
    { header: "Người tải lên", accessor: "uploader", className: "hidden lg:table-cell" },
    { header: "Ngày tải lên", accessor: "date", className: "hidden lg:table-cell" },
    ...(role === "teacher" 
      ? [{ header: "Lượt xem", accessor: "views", className: "hidden md:table-cell" }]
      : [{ header: "Trạng thái", accessor: "status", className: "hidden md:table-cell" }]
    ),
    { header: "Hành động", accessor: "action" },
  ];

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

  const formatViewTime = (dateString: string) => {
    const viewDate = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - viewDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Vừa xem";
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} ngày trước`;
      } else {
        return viewDate.toLocaleDateString('vi-VN', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else if (type.includes('word') || type.includes('document')) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  // Hàm render từng dòng của bảng
  const renderRow = (file: FileData) => {
    // Tạo link chi tiết tài liệu dựa trên role
    let detailLink = "#";
    if (role === "teacher") {
      detailLink = `/teacher/class/${file.class?.class_code || classCode}/documents/${file.id}`;
    } else if (role === "student") {
      detailLink = `/student/class/${file.class?.class_code || classCode}/documents/${file.id}`;
    }

    return (
      <tr key={file.id} className="border-b border-gray-200 hover:bg-slate-50">
        {/* Tên tài liệu */}
        <td className="p-4">
          <Link href={detailLink} className="flex items-center gap-3 group">
            <div className="flex-shrink-0">
              {getFileIcon(file.type)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {file.name}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
              </p>
            </div>
          </Link>
        </td>
        
      
        
        {/* Người tải lên */}
        <td className="hidden lg:table-cell">
          <span className="text-sm text-slate-600">{file.teacher.username}</span>
        </td>
        
        {/* Ngày tải lên */}
        <td className="hidden lg:table-cell">
          <time dateTime={file.uploadedAt} className="text-sm text-slate-500">
            {formatDate(file.uploadedAt)}
          </time>
        </td>
        
        {/* Lượt xem hoặc Trạng thái */}
        {role === "teacher" ? (
          <td className="hidden md:table-cell">
            <button
              onClick={(e) => {
                e.preventDefault();
                setSelectedFile(file);
                setShowViewersModal(true);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              {file._count?.views || 0} lượt xem
            </button>
          </td>
        ) : (
          <td className="hidden md:table-cell">
            {file.viewedByCurrentUser ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Đã xem
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Chưa xem
              </span>
            )}
          </td>
        )}
        
        {/* Actions */}
        <td className="">
          <div className="flex items-center gap-2">
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
              title="Tải xuống"
            >
              <Download className="w-4 h-4" />
            </a>
            
            <Link 
              href={detailLink}
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="Xem chi tiết"
            >
              <Eye className="w-4 h-4" />
            </Link>
            
            {role === "teacher" && (
              <button
                onClick={async () => {
                  const confirmed = confirm("Bạn có chắc chắn muốn xóa tài liệu này?");
                  if (confirmed) {
                    try {
                      const result = await deleteFile(file.id);
                      if (result.success) {
                        toast.success("Xóa tài liệu thành công");
                        setFiles(prev => prev.filter(f => f.id !== file.id));
                      } else {
                        toast.error(result.error || "Lỗi khi xóa tài liệu");
                      }
                    } catch (error) {
                      console.error("Error deleting file:", error);
                      toast.error("Lỗi khi xóa tài liệu");
                    }
                  }
                }}
                className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                title="Xóa tài liệu"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 h-full">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 h-full">
      {/* Top */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">
          Danh sách tài liệu ({files.length})
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
        </div>
      </div>

      {/* List */}
      <div className="flex-1">
        {files.length > 0 ? (
          <Table columns={columns} renderRow={renderRow} data={files} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
            <FileText className="w-16 h-16 mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-700">
              Chưa có tài liệu nào
            </h3>
            <p className="mt-2 text-slate-500">
              {role === 'teacher' 
                ? "Hãy bắt đầu bằng cách tải lên tài liệu đầu tiên." 
                : "Nội dung sẽ sớm được cập nhật."
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal hiển thị danh sách người xem */}
      {selectedFile && (
        <FileViewersModal
          docId={selectedFile.id}
          fileName={selectedFile.name}
          isOpen={showViewersModal}
          onClose={() => {
            setShowViewersModal(false);
            setSelectedFile(null);
          }}
        />
      )}
    </div>
  );
};

export default FileList;
