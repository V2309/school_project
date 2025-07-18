// import BigCalendar
//  from "@/components/BigCalendar";

// export default function SchedulePage() {
//   return (
//     <div className="h-full w-full p-4">
//       <BigCalendar />
//     </div>
//   );
// }
// // This file is part of the Next.js dashboard UI for a student schedule page.

// /app/student/schedule/page.tsx
"use client"
import { Suspense } from 'react';
import Link from 'next/link';
import { Search, PlusCircle, Upload, Download, Trash2, Eye, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';

//=========== TYPE DEFINITIONS ===========//
type Question = {
    id: number;
    content: string;
    subject: string;
    topic: string;
    subtopic: string;
    difficulty: 'Dễ' | 'Trung bình' | 'Khó';
    createdDate: string;
    status: 'active' | 'draft' | 'archived';
    options: string[];
    correctAnswer: string;
    explanation: string;
};

type SearchParams = {
    search?: string;
    subject?: string;
    topic?: string;
    difficulty?: string;
    createdDate?: string;
    page?: string;
};

//=========== DUMMY DATA & CONFIG ===========//
// Thay bằng fetch từ DB hoặc API thực tế
const allQuestions: Question[] = [
    { id: 1, content: 'Nội dung câu hỏi ví dụ 1 rất dài để kiểm tra việc hiển thị và ngắt dòng trong bảng câu hỏi?', subject: 'Toán học', topic: 'Đại số', subtopic: 'Phương trình', difficulty: 'Dễ', createdDate: '2023-01-15', status: 'active', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A', explanation: 'Giải thích chi tiết cho câu 1.' },
    { id: 2, content: 'Câu hỏi trắc nghiệm có nhiều lựa chọn đúng?', subject: 'Vật lý', topic: 'Cơ học', subtopic: 'Chuyển động', difficulty: 'Trung bình', createdDate: '2023-02-20', status: 'draft', options: ['A', 'B', 'C', 'D'], correctAnswer: 'B, C', explanation: 'Giải thích chi tiết cho câu 2.' },
    { id: 3, content: 'Đây là một câu hỏi đúng/sai.', subject: 'Lịch sử', topic: 'Việt Nam', subtopic: 'Thời kỳ kháng chiến', difficulty: 'Khó', createdDate: '2023-03-10', status: 'archived', options: ['Đúng', 'Sai'], correctAnswer: 'Đúng', explanation: 'Giải thích chi tiết cho câu 3.' },
    { id: 4, content: 'Câu hỏi về chủ đề Hóa học vô cơ?', subject: 'Hóa học', topic: 'Vô cơ', subtopic: 'Axit-Bazơ', difficulty: 'Trung bình', createdDate: '2023-04-05', status: 'active', options: ['X', 'Y', 'Z', 'W'], correctAnswer: 'X', explanation: 'Giải thích chi tiết cho câu 4.' },
    // Thêm dữ liệu để test phân trang
    ...Array.from({ length: 20 }, (_, i) => ({
        id: i + 5,
        content: `Câu hỏi tự động số ${i + 5} với nội dung khá dài để kiểm tra hiển thị.`,
        subject: ['Toán học', 'Vật lý', 'Hóa học'][i % 3],
        topic: ['Đại số', 'Cơ học', 'Vô cơ'][i % 3],
        subtopic: 'subtopic',
        difficulty: (['Dễ', 'Trung bình', 'Khó'] as const)[i % 3],
        createdDate: `2024-05-${String(i + 1).padStart(2, '0')}`,
        status: (['active', 'draft', 'archived'] as const)[i % 3],
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        explanation: 'Giải thích mặc định.',
    }))
];

const subjects = ['Toán học', 'Vật lý', 'Hóa học', 'Lịch sử', 'Địa lý'];
const topics = ['Đại số', 'Cơ học', 'Vô cơ', 'Việt Nam', 'Thế giới'];
const difficulties: Question['difficulty'][] = ['Dễ', 'Trung bình', 'Khó'];

// Config màu sắc cho các Badge ( huy hiệu )
const difficultyClasses: Record<Question['difficulty'], string> = {
    'Dễ': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'Trung bình': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'Khó': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const statusClasses: Record<Question['status'], string> = {
    'active': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'draft': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'archived': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
};


//=========== MAIN PAGE COMPONENT ===========//
export default async function SchedulePage({ searchParams }: { searchParams: SearchParams }) {
    // Lấy filter từ query params và chuẩn hóa
    const searchTerm = searchParams.search || '';
    const selectedSubject = searchParams.subject || '';
    const selectedTopic = searchParams.topic || '';
    const selectedDifficulty = searchParams.difficulty || '';
    const selectedDate = searchParams.createdDate || '';
    const page = parseInt(searchParams.page || '1', 10);
    const pageSize = 10;

    // Filter dữ liệu phía server
    const filteredQuestions = allQuestions.filter(q =>
        q.content.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedSubject ? q.subject === selectedSubject : true) &&
        (selectedTopic ? q.topic === selectedTopic : true) &&
        (selectedDifficulty ? q.difficulty === selectedDifficulty : true) &&
        (selectedDate ? q.createdDate === selectedDate : true)
    );

    // Phân trang
    const totalItems = filteredQuestions.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginatedQuestions = filteredQuestions.slice((page - 1) * pageSize, page * pageSize);

    // Helper tạo URL cho phân trang và bộ lọc
    const createQueryString = (params: Record<string, string | number>) => {
        const newSearchParams = new URLSearchParams(searchParams as any);
        for (const [key, value] of Object.entries(params)) {
            newSearchParams.set(key, String(value));
        }
        return `?${newSearchParams.toString()}`;
    };

    return (
        <Suspense fallback={<div className="text-center p-10">Đang tải dữ liệu...</div>}>
            <div className="bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-800 dark:text-gray-200">
                <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* ==================== SIDEBAR BỘ LỌC ==================== */}
                        <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0">
                            <div className="p-5 border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700 shadow-sm sticky top-8">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Bộ lọc & Danh mục</h3>
                                <form method="get" className="space-y-5">
                                    {/* Các input cho filter */}
                                    <div>
                                        <label htmlFor="search" className="text-sm font-medium mb-2 block">Từ khóa</label>
                                        <div className="relative">
                                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                             <input type="text" id="search" name="search" placeholder="Tìm kiếm câu hỏi..." defaultValue={searchTerm} className="w-full pl-9 p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                                        </div>
                                    </div>
                                     <div>
                                        <label htmlFor="subject" className="text-sm font-medium mb-2 block">Môn học</label>
                                        <select id="subject" name="subject" defaultValue={selectedSubject} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                            <option value="">Tất cả</option>
                                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="topic" className="text-sm font-medium mb-2 block">Chủ đề</label>
                                        <select id="topic" name="topic" defaultValue={selectedTopic} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                            <option value="">Tất cả</option>
                                            {topics.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="difficulty" className="text-sm font-medium mb-2 block">Mức độ</label>
                                        <select id="difficulty" name="difficulty" defaultValue={selectedDifficulty} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                            <option value="">Tất cả</option>
                                            {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="createdDate" className="text-sm font-medium mb-2 block">Ngày tạo</label>
                                        <input type="date" id="createdDate" name="createdDate" defaultValue={selectedDate} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                    </div>
                                    
                                    {/* Nút Lọc và Xóa lọc */}
                                    <div className="flex flex-col space-y-2 pt-2">
                                        <button type="submit" className="w-full flex items-center justify-center gap-2 p-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                            <Search className="h-4 w-4" /> Lọc
                                        </button>
                                        <Link href="/student/schedule" className="w-full flex items-center justify-center p-2 rounded-md bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors text-center">
                                            Xóa bộ lọc
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </aside>

                        {/* ==================== MAIN CONTENT ==================== */}
                        <main className="flex-1">
                            {/* Header */}
                            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Ngân hàng câu hỏi</h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tìm thấy {totalItems} câu hỏi</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button className="btn-secondary"><Upload className="mr-2 h-4 w-4" /> Nhập</button>
                                    <button className="btn-secondary"><Download className="mr-2 h-4 w-4" /> Xuất</button>
                                    <button className="btn-primary"><PlusCircle className="mr-2 h-4 w-4" /> Thêm câu hỏi</button>
                                </div>
                            </header>
                            
                            {/* Bảng dữ liệu */}
                            <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-xl shadow-sm overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-400 uppercase">
                                        <tr>
                                            <th scope="col" className="p-4"><input type="checkbox" className="table-checkbox" /></th>
                                            <th scope="col" className="px-4 py-3">STT</th>
                                            <th scope="col" className="px-6 py-3">Nội dung câu hỏi</th>
                                            <th scope="col" className="px-6 py-3">Môn học</th>
                                            <th scope="col" className="px-6 py-3">Mức độ</th>
                                            <th scope="col" className="px-6 py-3">Ngày tạo</th>
                                            <th scope="col" className="px-6 py-3">Trạng thái</th>
                                            <th scope="col" className="px-6 py-3 text-right">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedQuestions.length > 0 ? paginatedQuestions.map((q, index) => (
                                            <tr key={q.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="p-4"><input type="checkbox" className="table-checkbox" aria-label={`Select question ${q.id}`} /></td>
                                                <td className="px-4 py-4 font-medium">{ (page - 1) * pageSize + index + 1 }</td>
                                                <td className="px-6 py-4 max-w-sm truncate" title={q.content}>{q.content}</td>
                                                <td className="px-6 py-4">{q.subject}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`badge ${difficultyClasses[q.difficulty]}`}>{q.difficulty}</span>
                                                </td>
                                                <td className="px-6 py-4">{q.createdDate}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`badge ${statusClasses[q.status]} capitalize`}>{q.status}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end space-x-1">
                                                        <button className="btn-icon" title="Xem chi tiết"><Eye className="h-4 w-4" /></button>
                                                        <button className="btn-icon" title="Sửa"><Pencil className="h-4 w-4" /></button>
                                                        <button className="btn-icon-danger" title="Xóa"><Trash2 className="h-4 w-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={8} className="text-center py-10 text-gray-500 dark:text-gray-400">Không tìm thấy câu hỏi nào.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Phân trang */}
                            <div className="flex flex-col sm:flex-row items-center justify-between mt-6">
                                <span className="text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-0">
                                    Hiển thị {paginatedQuestions.length} trên tổng số {totalItems} mục
                                </span>
                                <div className="flex items-center space-x-2">
                                    <Link href={createQueryString({ page: page - 1 })} className={`btn-pagination ${page <= 1 ? 'disabled' : ''}`}>
                                        <ChevronLeft className="h-4 w-4" />
                                        <span>Trước</span>
                                    </Link>
                                     <span className="text-sm font-medium px-2">Trang {page} / {totalPages || 1}</span>
                                    <Link href={createQueryString({ page: page + 1 })} className={`btn-pagination ${page >= totalPages ? 'disabled' : ''}`}>
                                        <span>Sau</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
            
            {/* CSS Helper Classes (có thể đưa vào global.css) */}
            <style jsx global>{`
                .btn-primary {
                    @apply inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors;
                }
                .btn-secondary {
                    @apply inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors;
                }
                .btn-icon {
                    @apply p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors;
                }
                 .btn-icon-danger {
                    @apply p-2 rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors;
                }
                .btn-pagination {
                    @apply inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors;
                }
                .btn-pagination.disabled {
                    @apply pointer-events-none opacity-50;
                }
                .badge {
                    @apply px-2.5 py-0.5 text-xs font-semibold rounded-full;
                }
                .table-checkbox {
                    @apply w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600;
                }
            `}</style>
        </Suspense>
    );
}