"use client";
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';

// Component cho một dòng thông tin trong Profile
const ProfileInfoRow = ({ label, value, actionLabel = "Chỉnh sửa", onActionClick, showVerified = false, isVerified = false, highlightVerified = false, copyable = false }: {
  label: string;
  value: string;
  actionLabel?: string;
  onActionClick?: () => void;
  showVerified?: boolean;
  isVerified?: boolean;
  highlightVerified?: boolean;
  copyable?: boolean;
}) => (
  <div className="flex justify-between items-center py-4 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center space-x-3 text-copy-light">
      {/* Icon placeholder - replace with actual icons if needed */}
      {label === "Tên đăng nhập" && <span className="text-xl">👤</span>}
      {label === "Số điện thoại" && <span className="text-xl">📱</span>}
      {label === "Email" && <span className="text-xl">📧</span>}
      {label === "Mật khẩu" && <span className="text-xl">🔑</span>}
      {label === "Liên kết Facebook" && <span className="text-xl">🔗</span>}
      {label === "Tên" && <span className="text-xl">📝</span>}
      {label === "Ngày sinh" && <span className="text-xl">🎂</span>}
      {label === "Tỉnh" && <span className="text-xl">📍</span>}
      {label === "Trường" && <span className="text-xl">🏫</span>}
      <span className="font-medium text-copy-base">{label}</span>
    </div>
    <div className="flex items-center space-x-4">
      <span className="text-copy-base">
        {value}
        {copyable && (
          <button
            onClick={() => navigator.clipboard.writeText(value)}
            className="ml-2 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
            title="Sao chép"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path></svg>
          </button>
        )}
      </span>
      {showVerified && (
        <span className={`text-sm px-2 py-1 rounded-full ${isVerified ? (highlightVerified ? 'bg-green-100 text-green-700' : 'text-green-600') : 'bg-red-100 text-red-700'}`}>
          {isVerified ? "Đã xác minh" : "Chưa xác minh"}
        </span>
      )}
      {onActionClick && (
        <button
          onClick={onActionClick}
          className="text-primary hover:underline font-medium text-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  </div>
);

interface ProfileProps {
  user: any; // student hoặc teacher
  onEdit?: (field: string) => void;
  type?: 'student' | 'teacher';
}

const Profile: React.FC<ProfileProps> = ({ user, onEdit, type }) => {
  // Hàm xử lý khi click "Chỉnh sửa"
  const handleEditClick = (field: string) => {
    if (onEdit) onEdit(field);
  };

  return (
    <div className="bg-gray-100 text-copy-base font-sans min-h-screen flex flex-col">
      <Head>
        <title>Hồ sơ của tôi - ClassFlow</title>
        <meta name="description" content="Quản lý thông tin tài khoản và thông tin cá nhân của bạn trên ClassFlow." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
          {/* Top Bar for Profile */}
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-copy-base">Hồ sơ của tôi</h1>
            <Link href="#" className="inline-flex items-center text-primary hover:underline font-medium">
              <span className="text-lg mr-2">🔒</span> Quản lý tài khoản an toàn
            </Link>
          </div>
          {/* Profile Content */}
          <div className="p-6">
            {/* Avatar Placeholder */}
            <div className="flex justify-center mb-8">
              <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-5xl font-bold overflow-hidden border border-gray-300">
                <span>{user.name ? user.name[0] : 'A'}</span>
              </div>
            </div>
            {/* Thông tin tài khoản */}
            <h2 className="text-xl font-semibold text-copy-base mb-4 pb-2 border-b border-gray-200">Thông tin tài khoản</h2>
            <div className="space-y-2">
              <ProfileInfoRow
                label="Tên đăng nhập"
                value={user.username || ''}
                actionLabel="Sao chép"
                onActionClick={() => handleEditClick('Tên đăng nhập')}
                copyable={true}
              />
              <ProfileInfoRow
                label="Số điện thoại"
                value={user.phoneNumber || ''}
                onActionClick={() => handleEditClick('Số điện thoại')}
                showVerified={true}
                isVerified={user.isPhoneVerified}
                highlightVerified={true}
              />
              <ProfileInfoRow
                label="Email"
                value={user.email || ''}
                onActionClick={() => handleEditClick('Email')}
                showVerified={true}
                isVerified={user.isEmailVerified}
                highlightVerified={true}
              />
              <ProfileInfoRow
                label="Mật khẩu"
                value={user.password || '********'}
                onActionClick={() => handleEditClick('Mật khẩu')}
              />
              <ProfileInfoRow
                label="Liên kết Facebook"
                value={user.facebookLinked ? "Đã liên kết" : "Chưa liên kết"}
                actionLabel={user.facebookLinked ? "Hủy liên kết" : "Liên kết"}
                onActionClick={() => handleEditClick('Facebook')}
              />
            </div>
            <p className="text-sm text-copy-light mt-6 mb-8 p-4 bg-blue-50 rounded-md border border-blue-200">
              <span className="font-semibold text-blue-700">(*) Mẹo:</span> Nếu bạn là một người ít khi bình luận, hãy cập nhật mật khẩu, số điện thoại, email để thuận tiện cho việc đăng nhập và lấy lại mật khẩu.
            </p>
            {/* Thông tin cá nhân */}
            <h2 className="text-xl font-semibold text-copy-base mb-4 pb-2 border-b border-gray-200">Thông tin cá nhân</h2>
            <p className="text-sm text-copy-light mb-4">
              Cung cấp đúng thông tin cá nhân của bạn để không bị nhầm lẫn khi tham gia lớp học hoặc bài kiểm tra.
            </p>
            <div className="space-y-2">
              <ProfileInfoRow
                label="Tên"
                value={user.name || ''}
                onActionClick={() => handleEditClick('Tên')}
              />
              <ProfileInfoRow
                label="Ngày sinh"
                value={user.dateOfBirth || ''}
                onActionClick={() => handleEditClick('Ngày sinh')}
              />
              <ProfileInfoRow
                label="Tỉnh"
                value={user.province || ''}
                onActionClick={() => handleEditClick('Tỉnh')}
              />
              <ProfileInfoRow
                label="Trường"
                value={user.school || ''}
                onActionClick={() => handleEditClick('Trường')}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile; 