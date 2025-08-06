import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/hooks/auth';
import Table from '@/components/Table';
import dynamic from 'next/dynamic';

const StudentHomeworkChart = dynamic(() => import('@/components/StudentHomeworkChart'), { ssr: false });

export default async function StudentResultsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'student') {
    return <div className="p-8 text-center text-red-500">Không có quyền truy cập</div>;
  }

  // Lấy thông tin student và các lớp, bài tập đã nộp
  const student = await prisma.student.findUnique({
    where: { userId: user.id as string },
    include: {
      classes: {
        include: {
          homeworks: {
            include: {
              submissions: {
                where: { studentId: user.id as string },
                orderBy: { grade: 'desc' }, // Sắp xếp theo điểm cao nhất
                take: 1, // Lấy submission có điểm cao nhất
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
  });

  if (!student) {
    return <div className="p-8 text-center text-red-500">Không tìm thấy thông tin học sinh</div>;
  }

  // Chuẩn bị dữ liệu: mỗi lớp, chỉ lấy các bài tập đã nộp (điểm cao nhất)
  const classResults = student.classes.map((classInfo: any) => {
    // Lấy các bài tập đã nộp với điểm cao nhất
    const submittedHomeworks = classInfo.homeworks
      .filter((hw: any) => hw.submissions.length > 0)
      .map((hw: any) => ({
        title: hw.title,
        grade: hw.submissions[0]?.grade, // Điểm cao nhất vì đã sort desc
        submittedAt: hw.submissions[0]?.submittedAt,
      }));
    // Tính điểm trung bình từ các điểm cao nhất
    const graded = submittedHomeworks.filter((hw: any) => hw.grade !== null);
    const averageGrade = graded.length > 0
      ? (graded.reduce((sum: number, hw: any) => sum + (hw.grade || 0), 0) / graded.length).toFixed(2)
      : 'Chưa có điểm';
    return {
      className: classInfo.name,
      homeworks: submittedHomeworks,
      averageGrade,
      totalHomeworks: classInfo.homeworks.length,
    };
  });

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Kết quả làm bài tập theo lớp</h1>
      {classResults.map((cls, idx) => (
        <div key={idx} className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-2 text-blue-600">Lớp: {cls.className}</h2>
          <div className="mb-6">
            <span className="font-medium">Điểm trung bình (điểm cao nhất): </span>
            <span className="text-lg font-bold text-green-600">{cls.averageGrade}</span>
          </div>
          {/* Biểu đồ điểm các bài tập */}
          {cls.homeworks.length > 0 ? (
            <div className="mb-8">
              <StudentHomeworkChart homeworks={cls.homeworks} totalHomeworks={cls.totalHomeworks} />
            </div>
          ) : (
            <div className="mb-8 text-gray-500">Chưa có bài tập đã nộp</div>
          )}
          {/* Bảng điểm chi tiết */}
          <Table
            columns={[
              { header: 'Tên bài tập', accessor: 'title' },
              { header: 'Điểm cao nhất', accessor: 'grade' },
              { header: 'Ngày nộp', accessor: 'submittedAt' },
            ]}
            data={cls.homeworks}
            renderRow={(item: any) => (
              <tr key={item.title} className="border-t hover:bg-blue-50 transition-colors">
                <td className="px-4 py-2 font-medium">{item.title}</td>
                <td className="px-4 py-2">{item.grade !== null && item.grade !== undefined ? item.grade : <span className="text-gray-400">Chưa chấm</span>}</td>
                <td className="px-4 py-2">{item.submittedAt ? new Date(item.submittedAt).toLocaleString('vi-VN') : '-'}</td>
              </tr>
            )}
          />
        </div>
      ))}
    </div>
  );
}
