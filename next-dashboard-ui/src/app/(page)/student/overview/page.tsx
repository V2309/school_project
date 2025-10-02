import Link from 'next/link';
import Image from 'next/image';
import Table from '@/components/Table';
import Navigation from '@/components/Navigation';
import MenuItem from '@/components/MenuItem';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/hooks/auth';

export default async function Home() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'student') {
    return <div>Không có quyền truy cập</div>;
  }

  // Lấy thông tin student
  const student = await prisma.student.findUnique({
    where: { userId: user.id as string },
    include: {
      classes: {
        include: {
          supervisor: true,
          homeworks: {
            include: {
              attachments: true,
              submissions: {
                where: { studentId: user.id as string },
                orderBy: { submittedAt: 'desc' },
                take: 1, // Lấy submission mới nhất
              },
            },
          },
        },
      },
    },
  });

  if (!student) {
    return <div>Không tìm thấy thông tin học sinh</div>;
  }

  // Hàm helper để lấy ảnh tương ứng với loại file
  function getAttachmentImage(fileType: string): string {
    if (fileType.includes('pdf')) {
      return "/pdf_red.png";
    }
    return "/doc_blue.png"; // Ảnh mặc định cho các loại file khác
  }

  // Tính toán thành tích học tập cho từng lớp
  const academicPerformance = student.classes.map((classInfo: any) => {
    const totalHomeworks = classInfo.homeworks.length;
    const completedHomeworks = classInfo.homeworks.filter((hw: any) =>
      hw.submissions.length > 0
    ).length;

    // Tính điểm trung bình từ các bài tập đã nộp
    const submissions = classInfo.homeworks.flatMap((hw: any) => hw.submissions);
    const gradedSubmissions = submissions.filter((sub: any) => sub.grade !== null);
    const averageGrade = gradedSubmissions.length > 0
      ? (gradedSubmissions.reduce((sum: number, sub: any) => sum + (sub.grade || 0), 0) / gradedSubmissions.length).toFixed(1)
      : 'Chưa có điểm';

    return {
      className: classInfo.name,
      teacherName: classInfo.supervisor?.username || 'Chưa có giáo viên',
      averageGrade,
      totalHomeworks,
      completedHomeworks,
      completionRate: totalHomeworks > 0 ? Math.round((completedHomeworks / totalHomeworks) * 100) : 0,
    };
  });

  // Lấy bài tập chưa nộp
  const pendingHomeworks = student.classes.flatMap((classInfo: any) =>
    classInfo.homeworks
      .filter((hw: any) => {
        const hasSubmission = hw.submissions.length > 0;
        const isExpired = hw.endTime && new Date() > new Date(hw.endTime);
        return !hasSubmission && !isExpired;
      })
      .map((hw: any) => {
        // Kiểm tra loại file attachment
        const attachmentType = hw.attachments?.[0]?.type || "";
        const attachmentImage = getAttachmentImage(attachmentType);

        return {
          id: hw.id,
          title: hw.title,
          className: classInfo.name,
          endTime: hw.endTime,
          classCode: classInfo.class_code,
          attachmentImage,
          attachmentType,
        };
      })
  );

  return (
    <div className="h-full bg-gray-100 p-4 md:p-6 lg:p-8 w-full">
      {/* Pending Homeworks Section */}
      <div className="rounded-lg p-4 md:p-6 mb-6 bg-white shadow-sm">
        <h2 className="font-semibold text-lg md:text-xl mb-4 flex items-center gap-2">
          Bài tập chưa nộp <span className="text-base text-gray-500">• {pendingHomeworks.length}</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full hidden md:table">
            <thead>
              <tr className="text-gray-500 text-sm">
                <th className="text-left px-4 py-3 font-medium">Tên bài tập</th>
                <th className="text-left px-4 py-3 font-medium">Lớp</th>
                <th className="text-left px-4 py-3 font-medium">Hạn chót</th>
              </tr>
            </thead>
            <tbody>
              {pendingHomeworks.length > 0 ? (
                pendingHomeworks.map((homework) => (
                  <tr key={homework.id} className="border-t hover:bg-blue-100 transition-colors duration-200 cursor-pointer">
                    <td className="flex items-center gap-3 px-4 py-4">
                      <Image src={homework.attachmentImage} alt="Homework" width={32} height={32} />
                      <div>
                        <div className="font-medium text-sm md:text-base">{homework.title}</div>
                        <div className="text-xs text-gray-500">Chưa làm</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">{homework.className}</td>
                    <td className="px-4 py-4 text-sm">
                      {homework.endTime
                        ? new Date(homework.endTime).toLocaleDateString('vi-VN')
                        : 'Không có'} lúc {homework.endTime ? new Date(homework.endTime).toLocaleTimeString('vi-VN') : 'Không có'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t">
                  <td colSpan={3} className="px-4 py-4 text-center text-gray-500">
                    Không có bài tập nào chưa nộp
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile View */}
          <div className="md:hidden">
            {pendingHomeworks.length > 0 ? (
              pendingHomeworks.map((homework) => (
                <div key={homework.id} className="bg-white rounded-lg shadow-sm p-4 mb-3 border border-gray-200 hover:bg-blue-50 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <Image src={homework.attachmentImage} alt="Homework" width={32} height={32} />
                    <div>
                      <div className="font-semibold">{homework.title}</div>
                      <div className="text-sm text-gray-500">Lớp: {homework.className}</div>
                      <div className="text-sm text-red-500 mt-1">
                        Hạn chót: {homework.endTime
                          ? new Date(homework.endTime).toLocaleDateString('vi-VN')
                          : 'Không có'} lúc {homework.endTime ? new Date(homework.endTime).toLocaleTimeString('vi-VN') : 'Không có'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-6">
                Không có bài tập nào chưa nộp
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Academic Performance Section */}
      <div className="rounded-lg p-4 md:p-6 mb-6 bg-white shadow-sm">
        <h2 className="font-semibold text-lg md:text-xl mb-4 flex items-center gap-2">
          Thành tích học tập
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full hidden md:table">
            <thead>
              <tr className="text-gray-500 text-sm">
                <th className="text-left px-4 py-3 font-medium">Tên lớp</th>
                <th className="text-left px-4 py-3 font-medium">Tên giáo viên</th>
                <th className="text-left px-4 py-3 font-medium">Điểm trung bình</th>
                <th className="text-left px-4 py-3 font-medium">Tỷ lệ hoàn thành</th>
              </tr>
            </thead>
            <tbody>
              {academicPerformance.length > 0 ? (
                academicPerformance.map((performance, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium">{performance.className}</div>
                        <div className="text-xs text-gray-500">
                          {performance.completedHomeworks}/{performance.totalHomeworks} bài tập
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{performance.teacherName}</td>
                    <td className="px-4 py-4">
                      <span className={`font-medium ${
                        performance.averageGrade === 'Chưa có điểm'
                          ? 'text-gray-500'
                          : parseFloat(performance.averageGrade) >= 8
                            ? 'text-green-600'
                            : parseFloat(performance.averageGrade) >= 6.5
                              ? 'text-yellow-600'
                              : 'text-red-600'
                      }`}>
                        {performance.averageGrade}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              performance.completionRate >= 80
                                ? 'bg-green-500'
                                : performance.completionRate >= 60
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${performance.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{performance.completionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t">
                  <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                    Chưa có dữ liệu thành tích học tập
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {academicPerformance.length > 0 ? (
              academicPerformance.map((performance, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <div className="font-semibold text-lg">{performance.className}</div>
                  <div className="text-sm text-gray-500 mt-1">Giáo viên: {performance.teacherName}</div>
                  <div className="mt-2">
                    <span className={`font-bold text-lg ${
                      performance.averageGrade === 'Chưa có điểm'
                        ? 'text-gray-500'
                        : parseFloat(performance.averageGrade) >= 8
                          ? 'text-green-600'
                          : parseFloat(performance.averageGrade) >= 6.5
                            ? 'text-yellow-600'
                            : 'text-red-600'
                    }`}>
                      Điểm trung bình: {performance.averageGrade}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="text-sm text-gray-500">Tỷ lệ hoàn thành: {performance.completionRate}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          performance.completionRate >= 80
                            ? 'bg-green-500'
                            : performance.completionRate >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${performance.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-6">
                Chưa có dữ liệu thành tích học tập
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}