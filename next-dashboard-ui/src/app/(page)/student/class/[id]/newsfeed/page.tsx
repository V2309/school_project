'use client';

import { useState } from 'react';
import {
  PaperClipIcon,
  PhotoIcon, // dùng PhotoIcon thay vì PhotographIcon trong phiên bản mới
  AcademicCapIcon, // ví dụ icon mới bạn đề cập
} from '@heroicons/react/24/outline';

export default function NewsfeedPage() {
  const [postContent, setPostContent] = useState('');
  const [posts, setPosts] = useState([
    {
      id: 1,
      content: 'Nơi trao đổi các vấn đề trong lớp học dành cho giáo viên học sinh',
      author: 'Hệ thống',
      timestamp: '2 giờ trước',
      isPinned: true
    }
  ]);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    const newPost = {
      id: posts.length + 1,
      content: postContent,
      author: 'Bạn',
      timestamp: 'Vừa xong',
      isPinned: false
    };

    setPosts([newPost, ...posts]);
    setPostContent('');
  };

  return (
    <div className="max-w-3xl mx-auto ">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 bg-white p-4 rounded-lg shadow">
        <AcademicCapIcon className="h-6 w-6 text-blue-600" />
        Bảng tin
      </h1>

      {/* Post creation form */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handlePostSubmit}>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
            rows={3}
            placeholder="Nhập nội dung thảo luận với lớp học..."
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />

          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                type="button"
                className="flex items-center text-gray-600 hover:text-blue-600"
              >
                <PhotoIcon className="h-5 w-5 mr-1" />
                <span>Thêm hình ảnh</span>
              </button>
              <button
                type="button"
                className="flex items-center text-gray-600 hover:text-blue-600"
              >
                <PaperClipIcon className="h-5 w-5 mr-1" />
                <span>Thêm tệp</span>
              </button>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={!postContent.trim()}
            >
              Đăng tin
            </button>
          </div>
        </form>
      </div>

      {/* Pinned post */}
      {posts.filter(post => post.isPinned).map(post => (
        <div key={post.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-start mb-2">
            <span className="font-semibold">{post.author}</span>
            <span className="text-sm text-gray-500">{post.timestamp}</span>
          </div>
          <p className="text-gray-800">{post.content}</p>
        </div>
      ))}

      {/* Posts list */}
      <div className="space-y-4">
        {posts.filter(post => !post.isPinned).map(post => (
          <div key={post.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold">{post.author}</span>
              <span className="text-sm text-gray-500">{post.timestamp}</span>
            </div>
            <p className="text-gray-800">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
