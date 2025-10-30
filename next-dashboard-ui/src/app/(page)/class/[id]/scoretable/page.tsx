// @/app/class/[id]/scores/page.tsx
// Code hoàn chỉnh (Tối ưu Data + Biểu đồ + Layout co giãn)

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/hooks/auth";
import { redirect } from "next/navigation";
import { BookOpen, Users } from "lucide-react";
import ScoreLineChart from "@/components/ScoreLineChart"; // Import component biểu đồ

// --- INTERFACES ---
interface StudentScore {
  id: string;
  username: string;
  schoolname: string | null;
  class_name: string | null;
  // Key của homeworkScores phải là string vì ID của homework là CUID (string)
  homeworkScores: { [homeworkId: string]: number | null }; 
  average: number;
}

export default async function ScoreTablePage({ params }: { params: { id: string } }) {
  // --- DATA FETCHING (ĐÃ TỐI ƯU) ---
  const user = await getCurrentUser();
  if (!user || user.role !== "teacher") redirect("/");

  const teacher = await prisma.teacher.findUnique({ where: { userId: user.id as string } });
  if (!teacher) redirect("/");
  
  // 1. CHẠY SONG SONG TẤT CẢ TRUY VẤN
  const [classInfo, homeworks, students, latestSubmissionsList] = await Promise.all([
    // Query 1: Lấy thông tin lớp
    prisma.class.findUnique({
      where: { class_code: params.id, supervisorId: teacher.id },
      select: { id: true, name: true }
    }),
    
    // Query 2: Lấy danh sách bài tập (sắp xếp theo ngày tạo để biểu đồ có thứ tự)
    prisma.homework.findMany({
      where: { classCode: params.id },
      select: { id: true, title: true, points: true },
      orderBy: { createdAt: 'asc' }
    }),

    // Query 3: Lấy danh sách học sinh
    prisma.student.findMany({
      where: { classes: { some: { class_code: params.id } } },
      select: { id: true, username: true, schoolname: true, class_name: true },
      orderBy: { username: 'asc' }
    }),

    // Query 4 (TỐI ƯU): Chỉ lấy bài nộp MỚI NHẤT
    prisma.homeworkSubmission.findMany({
      where: { homework: { classCode: params.id } },
      select: { studentId: true, homeworkId: true, grade: true, submittedAt: true },
      orderBy: { submittedAt: 'desc' },
      distinct: ['studentId', 'homeworkId'] 
    })
  ]);

  if (!classInfo) {
    return <div className="p-8 text-center text-red-500">Không tìm thấy lớp học hoặc bạn không có quyền truy cập.</div>;
  }
  
  // 2. TỐI ƯU JAVASCRIPT (Tạo Map để tra cứu nhanh)
  const latestSubmissionsMap = new Map<string, typeof latestSubmissionsList[0]>();
  latestSubmissionsList.forEach(submission => {
    // Key là sự kết hợp của studentId (string) và homeworkId (string)
    const key = `${submission.studentId}-${submission.homeworkId}`;
    latestSubmissionsMap.set(key, submission);
  });

  // 3. XỬ LÝ ĐIỂM HỌC SINH (Dùng Map mới)
  const studentScores: StudentScore[] = students.map(student => {
    const homeworkScores: { [homeworkId: string]: number | null } = {};
    let totalPoints = 0;
    let gradedHomeworks = 0;

    homeworks.forEach(homework => {
      const submission = latestSubmissionsMap.get(`${student.id}-${homework.id}`);
      
      if (submission && submission.grade !== null) {
        homeworkScores[homework.id] = submission.grade;
        totalPoints += submission.grade;
        gradedHomeworks++;
      } else {
        homeworkScores[homework.id] = null; // Gán null nếu không có điểm
      }
    });

    const average = gradedHomeworks > 0 ? totalPoints / gradedHomeworks : 0;

    return { id: student.id, username: student.username, schoolname: student.schoolname, class_name: student.class_name, homeworkScores, average };
  });
  
  // Sắp xếp học sinh theo điểm TB giảm dần
  studentScores.sort((a, b) => b.average - a.average);

  // 4. CHUẨN BỊ DỮ LIỆU CHO BIỂU ĐỒ
  const chartData = homeworks.map(homework => {
    let totalScore = 0;
    let scoreCount = 0;
    studentScores.forEach(student => {
        const score = student.homeworkScores[homework.id];
        if (score !== null) {
            totalScore += score;
            scoreCount++;
        }
    });
    const average = scoreCount > 0 ? (totalScore / scoreCount) : 0;
    
    return {
        // Rút gọn tên bài tập cho dễ nhìn trên biểu đồ
        name: homework.title.length > 20 ? homework.title.substring(0, 20) + "..." : homework.title,
        "Điểm TB": parseFloat(average.toFixed(1)) // Key này phải khớp với `dataKey` trong component chart
    };
  });

  // --- RENDER UI (Layout co giãn) ---
  return (
    <div className="bg-white min-h-screen flex flex-col"> 
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1">
        
        {/* Hộp Biểu Đồ */}
        <div className="bg-white  shadow-sm border border-gray-200 mb-6">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-xl font-bold text-slate-700">Biểu đồ Điểm trung bình Lớp</h2>
            <p className="mt-1 text-sm text-slate-500">Hiển thị điểm trung bình của cả lớp qua các bài tập (sắp xếp theo ngày tạo).</p>
          </div>
          <div className="p-5">
            {chartData.length > 0 ? (
              <ScoreLineChart data={chartData} />
            ) : (
              <p className="text-center text-slate-500 py-10">Chưa có đủ dữ liệu điểm để vẽ biểu đồ.</p>
            )}
          </div>
        </div>

        {/* Bảng điểm */}
        <div className="bg-white shadow-sm overflow-hidden border border-gray-200 flex flex-col flex-1 min-h-[600px]">
          <div className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-slate-700">Bảng điểm Chi tiết Lớp: {classInfo.name}</h2>
                <p className="mt-1 text-sm text-slate-500">(Mã lớp: {params.id})</p>
              </div>
              <div className="flex space-x-6 text-sm text-slate-500">
                  <div className="flex items-center space-x-2"><Users size={16} /><span>{students.length} học sinh</span></div>
                  <div className="flex items-center space-x-2"><BookOpen size={16} /><span>{homeworks.length} bài tập</span></div>
              </div>
          </div>
          
          {/* Container cho bảng có thể cuộn */}
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full text-sm relative">
              {/* Tiêu đề bảng cố định */}
              <thead className="bg-gray-50 sticky top-0 z-20">
                <tr>
                  <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left font-semibold text-slate-600 w-16 z-30">STT</th>
                  <th className="sticky left-16 bg-gray-50 px-4 py-3 text-left font-semibold text-slate-600 min-w-[200px] z-30">Họ và tên</th>
                  <th className="px-4 py-3 text-center font-semibold text-blue-600 bg-blue-50 min-w-[120px]">Trung Bình</th>
                  
                  {homeworks.map(homework => (
                    <th key={homework.id} className="px-3 py-3 text-center font-semibold text-slate-600 min-w-[100px]" title={homework.title}>
                      <div className="truncate">{homework.title}</div>
                      <div className="text-xs text-slate-400 font-normal">({homework.points || 'N/A'}đ)</div>
                    </th>
                  ))}
                
                </tr>
              </thead>
              <tbody>
                {studentScores.map((student, index) => {
                  const avg = student.average;
                  const scoreColor = avg >= 8 ? 'text-green-600' : avg >= 5 ? 'text-yellow-600' : 'text-red-600';
                  
                  return (
                    <tr key={student.id} className="border-t border-gray-200 hover:bg-gray-50">
                      {/* Các cột cố định */}
                      <td className="sticky left-0 bg-white hover:bg-gray-50 px-4 py-3 text-center text-slate-500 z-10">{index + 1}</td>
                      <td className="sticky left-16 bg-white hover:bg-gray-50 px-4 py-3 font-medium text-slate-800 z-10">{student.username}</td>
                      <td className="px-4 py-3 text-center font-bold bg-blue-50">
                        <span className={scoreColor}>{avg.toFixed(1)}</span>
                      </td>
                      {/* Các cột điểm cuộn ngang */}
                      {homeworks.map(homework => {
                        const score = student.homeworkScores[homework.id];
                        const cellColor = score === null ? 'text-slate-400' : score >= 8 ? 'text-green-600' : score >= 5 ? 'text-yellow-600' : 'text-red-600';
                        return (
                          <td key={homework.id} className="px-3 py-3 text-center">
                            <span className={`font-semibold ${cellColor}`}>{score !== null ? score : '-'}</span>
                          </td>
                        );
                      })}
                      
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}