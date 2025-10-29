"use client";

import React, { useEffect, useState } from "react";
import { X, Eye, User, Clock } from "lucide-react";
import { toast } from "react-toastify";

interface ViewerData {
  id: string;
  username: string;
  role: string;
  viewedAt: string;
}

interface ViewersStats {
  totalViews: number;
  studentViews: number;
  totalStudents: number;
}

interface FileViewersModalProps {
  docId: string;
  fileName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function FileViewersModal({
  docId,
  fileName,
  isOpen,
  onClose,
}: FileViewersModalProps) {
  const [viewers, setViewers] = useState<ViewerData[]>([]);
  const [stats, setStats] = useState<ViewersStats>({
    totalViews: 0,
    studentViews: 0,
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchViewers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/files/${docId}/view`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch viewers');
      }

      const data = await response.json();
      setViewers(data.viewers || []);
      setStats(data.stats || { totalViews: 0, studentViews: 0, totalStudents: 0 });
    } catch (error) {
      console.error('Error fetching viewers:', error);
      toast.error(error instanceof Error ? error.message : 'Lỗi khi tải danh sách người xem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchViewers();
    }
  }, [isOpen, docId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student':
        return 'bg-blue-100 text-blue-800';
      case 'teacher':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'student':
        return 'Học sinh';
      case 'teacher':
        return 'Giáo viên';
      default:
        return role;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Danh sách người xem
            </h2>
            <p className="text-sm text-gray-600 mt-1 truncate">
              {fileName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{stats.studentViews}</div>
              <div className="text-xs text-gray-600">Học sinh đã xem</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-gray-800">{stats.totalStudents}</div>
              <div className="text-xs text-gray-600">Tổng học sinh</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {stats.totalStudents > 0 
                  ? Math.round((stats.studentViews / stats.totalStudents) * 100)
                  : 0}%
              </div>
              <div className="text-xs text-gray-600">Tỷ lệ xem</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : viewers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Chưa có ai xem tài liệu này</p>
            </div>
          ) : (
            <div className="space-y-3">
              {viewers.map((viewer) => (
                <div
                  key={viewer.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {viewer.username}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getRoleColor(viewer.role)}`}>
                          {getRoleText(viewer.role)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(viewer.viewedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}