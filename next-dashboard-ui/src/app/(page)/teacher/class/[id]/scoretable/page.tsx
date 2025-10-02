// @/app/class/[id]/scores/page.tsx
// Đã cập nhật để sử dụng nền trắng

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/hooks/auth";
import { redirect } from "next/navigation";
import { Award, BookOpen, Frown, Smile, BarChart3, Info, Users } from "lucide-react";

// --- INTERFACES (Không thay đổi) ---
interface StudentScore {
  id: string;
  username: string;
  schoolname: string | null;
  class_name: string | null;
  homeworkScores: { [homeworkId: number]: number | null };
  average: number;
}

// --- COMPONENT CON: StatsCard (Không thay đổi) ---
const StatsCard = ({ icon: Icon, title, value, percentage, color }: {
  icon: React.ElementType;
  title: string;
  value: number;
  percentage?: number;
  color: string;
}) => {
  const colorClasses = {
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', title: 'text-green-800' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600', title: 'text-yellow-800' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', title: 'text-red-800' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', title: 'text-blue-800' },
  }[color] || { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', title: 'text-gray-800' };

  return (
    <div className={`p-5 rounded-xl shadow-sm ${colorClasses.bg} border ${colorClasses.border}`}>
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${colorClasses.bg}`}>
          <Icon className={`${colorClasses.text}`} size={24} />
        </div>
        <h3 className={`font-semibold ${colorClasses.title}`}>{title}</h3>
      </div>
      <p className={`mt-3 text-4xl font-bold ${colorClasses.text}`}>{value}</p>
      {percentage !== undefined && (
        <p className={`text-sm ${colorClasses.text}`}>{percentage}% học sinh</p>
      )}
    </div>
  );
};


export default async function ScoreTablePage({ params }: { params: { id: string } }) {
  // --- DATA FETCHING & PROCESSING (Không thay đổi) ---
  const user = await getCurrentUser();
  if (!user || user.role !== "teacher") redirect("/");

  const teacher = await prisma.teacher.findUnique({ where: { userId: user.id as string } });
  if (!teacher) redirect("/");
  
  const classInfo = await prisma.class.findUnique({
    where: { class_code: params.id, supervisorId: teacher.id },
    select: { id: true, name: true }
  });

  if (!classInfo) {
    return <div className="p-8 text-center text-red-500">Không tìm thấy lớp học hoặc bạn không có quyền truy cập.</div>;
  }

  const homeworks = await prisma.homework.findMany({
    where: { classCode: params.id },
    select: { id: true, title: true, points: true },
    orderBy: { createdAt: 'asc' }
  });

  const students = await prisma.student.findMany({
    where: { classes: { some: { class_code: params.id } } },
    select: { id: true, username: true, schoolname: true, class_name: true },
    orderBy: { username: 'asc' }
  });

  const submissions = await prisma.homeworkSubmission.findMany({
    where: { homework: { classCode: params.id } },
    select: { studentId: true, homeworkId: true, grade: true, submittedAt: true },
    orderBy: { submittedAt: 'desc' }
  });

  const latestSubmissions = new Map<string, typeof submissions[0]>();
  submissions.forEach(submission => {
    const key = `${submission.studentId}-${submission.homeworkId}`;
    if (!latestSubmissions.has(key)) {
      latestSubmissions.set(key, submission);
    }
  });

  const studentScores: StudentScore[] = students.map(student => {
    const homeworkScores: { [homeworkId: number]: number | null } = {};
    let totalPoints = 0;
    let gradedHomeworks = 0;

    homeworks.forEach(homework => {
      const submission = latestSubmissions.get(`${student.id}-${homework.id}`);
      if (submission && submission.grade !== null) {
        homeworkScores[homework.id] = submission.grade;
        totalPoints += submission.grade;
        gradedHomeworks++;
      } else {
        homeworkScores[homework.id] = null;
      }
    });

    const average = gradedHomeworks > 0 ? totalPoints / gradedHomeworks : 0;

    return { id: student.id, username: student.username, schoolname: student.schoolname, class_name: student.class_name, homeworkScores, average };
  });
  
  studentScores.sort((a, b) => b.average - a.average);

  const homeworkAverages = homeworks.map(homework => {
    const scores = studentScores
      .map(student => student.homeworkScores[homework.id])
      .filter((score): score is number => score !== null);
    
    const average = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    
    return { homeworkId: homework.id, average };
  });

  const classAverage = studentScores.length > 0
    ? studentScores.reduce((sum, student) => sum + student.average, 0) / studentScores.length
    : 0;

  // --- RENDER UI (Giao diện nền trắng) ---
  return (
    // THAY ĐỔI: Chuyển từ bg-slate-50 sang bg-white
    <div className="p-4 sm:p-6 lg:p-8 bg-white min-h-screen"> 
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-slate-800">Bảng điểm lớp học</h1>
          <p className="mt-1 text-slate-600">Lớp: <span className="font-semibold">{classInfo.name}</span> (Mã lớp: {params.id})</p>
        </header>

        {/* Thống kê tổng quan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard icon={Award} title="Học sinh Giỏi (≥8.0)" value={studentScores.filter(s => s.average >= 8).length} percentage={studentScores.length > 0 ? Math.round((studentScores.filter(s => s.average >= 8).length / studentScores.length) * 100) : 0} color="green" />
          <StatsCard icon={Smile} title="Học sinh Khá (5.0-7.9)" value={studentScores.filter(s => s.average >= 5 && s.average < 8).length} percentage={studentScores.length > 0 ? Math.round((studentScores.filter(s => s.average >= 5 && s.average < 8).length / studentScores.length) * 100) : 0} color="yellow" />
          <StatsCard icon={Frown} title="Cần cố gắng (<5.0)" value={studentScores.filter(s => s.average < 5).length} percentage={studentScores.length > 0 ? Math.round((studentScores.filter(s => s.average < 5).length / studentScores.length) * 100) : 0} color="red" />
          <StatsCard icon={BarChart3} title="Điểm TB Lớp" value={parseFloat(classAverage.toFixed(1))} color="blue" />
        </div>

        {/* Bảng điểm */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="p-5 flex justify-between items-center border-b border-gray-200">
              <h2 className="text-xl font-bold text-slate-700">Chi tiết điểm</h2>
              <div className="flex space-x-6 text-sm text-slate-500">
                  <div className="flex items-center space-x-2"><Users size={16} /><span>{students.length} học sinh</span></div>
                  <div className="flex items-center space-x-2"><BookOpen size={16} /><span>{homeworks.length} bài tập</span></div>
              </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* THAY ĐỔI: Nền tiêu đề bảng từ bg-slate-50 sang bg-gray-50 để nổi bật trên nền trắng */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left font-semibold text-slate-600 w-16 z-10">STT</th>
                  <th className="sticky left-16 bg-gray-50 px-4 py-3 text-left font-semibold text-slate-600 min-w-[200px] z-10">Họ và tên</th>
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
                    // THAY ĐỔI: Hiệu ứng hover sang bg-gray-50
                    <tr key={student.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="sticky left-0 bg-white hover:bg-gray-50 px-4 py-3 text-center text-slate-500 z-10">{index + 1}</td>
                      <td className="sticky left-16 bg-white hover:bg-gray-50 px-4 py-3 font-medium text-slate-800 z-10">{student.username}</td>
                         <td className="px-4 py-3 text-center font-bold bg-blue-50">
                        <span className={scoreColor}>{avg.toFixed(1)}</span>
                      </td>
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
                {/* THAY ĐỔI: Nền hàng TB lớp sang bg-gray-100
                <tr className="border-t-2 border-gray-300 bg-gray-100 font-bold">
                  <td colSpan={4} className="px-4 py-3 text-center text-slate-700">Điểm trung bình lớp</td>
                  {homeworks.map(homework => {
                    const avgData = homeworkAverages.find(avg => avg.homeworkId === homework.id);
                    return (
                      <td key={homework.id} className="px-3 py-3 text-center text-slate-700">
                        {avgData ? avgData.average.toFixed(1) : '-'}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center text-blue-700 bg-blue-100">
                    {classAverage.toFixed(1)}
                  </td>
                </tr> */}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Ghi chú */}
        <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-200">
            <h4 className="font-semibold text-slate-800 mb-2 flex items-center"><Info size={16} className="mr-2 text-slate-500"/>Ghi chú</h4>
            <ul className="text-sm text-slate-600 space-y-2 pl-4">
                <li>• Dấu "<strong>-</strong>" có nghĩa là học sinh chưa làm bài hoặc bài làm chưa được chấm điểm.</li>
                <li>• Điểm trung bình của học sinh được tính dựa trên các bài đã có điểm.</li>
                <li>• Bảng điểm chỉ hiển thị điểm của lần nộp bài cuối cùng.</li>
                <li>• Phân loại điểm: <span className="font-semibold text-green-600">Giỏi ≥ 8.0</span> | <span className="font-semibold text-yellow-600">Khá 5.0-7.9</span> | <span className="font-semibold text-red-600">Cần cố gắng &lt; 5.0</span></li>
            </ul>
        </div>

      </div>
    </div>
  );
}