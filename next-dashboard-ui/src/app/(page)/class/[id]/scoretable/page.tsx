import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/hooks/auth";
import { redirect } from "next/navigation";
import ScorePageClient from "@/components/ScorePageClient"; // 1. Import component client mới

// --- INTERFACES (Giữ nguyên) ---
export interface StudentScore {
  id: string;
  username: string;
  schoolname: string | null;
  class_name: string | null;
  homeworkScores: { [homeworkId: string]: number | null }; 
  average: number;
}

// Kiểu dữ liệu Homework
// (Bạn nên tạo file type riêng, nhưng để tạm ở đây)
export type HomeworkData = {
  id: number; // Sửa từ string thành number để match với Prisma
  title: string;
  points: number | null;
}

export default async function ScoreTablePage({ params }: { params: { id: string } }) {
  // --- DATA FETCHING (Giữ nguyên toàn bộ logic đã tối ưu của bạn) ---
  const user = await getCurrentUser();
  if (!user || user.role !== "teacher") redirect("/");

  const teacher = await prisma.teacher.findUnique({ where: { userId: user.id as string } });
  if (!teacher) redirect("/");
  
  const [classInfo, homeworks, students, latestSubmissionsList] = await Promise.all([
    prisma.class.findUnique({
      where: { class_code: params.id, supervisorId: teacher.id },
      select: { id: true, name: true }
    }),
    prisma.homework.findMany({
      where: { classCode: params.id },
      select: { id: true, title: true, points: true },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.student.findMany({
      where: { classes: { some: { class_code: params.id } } },
      select: { id: true, username: true, schoolname: true, class_name: true },
      orderBy: { username: 'asc' }
    }),
    prisma.homeworkSubmission.findMany({
      where: { homework: { classCode: params.id } },
      select: { studentId: true, homeworkId: true, grade: true, submittedAt: true },
      orderBy: { submittedAt: 'desc' },
      distinct: ['studentId', 'homeworkId'] 
    })
  ]);

  if (!classInfo) {
    return <div className="p-8 text-center text-red-500">Không tìm thấy lớp học...</div>;
  }
  
  const latestSubmissionsMap = new Map<string, typeof latestSubmissionsList[0]>();
  latestSubmissionsList.forEach(submission => {
    const key = `${submission.studentId}-${submission.homeworkId}`;
    latestSubmissionsMap.set(key, submission);
  });

  const studentScores: StudentScore[] = students.map(student => {
    const homeworkScores: { [homeworkId: string]: number | null } = {};
    let totalPoints = 0;
    let gradedHomeworks = 0;
    homeworks.forEach(homework => {
      const submission = latestSubmissionsMap.get(`${student.id}-${homework.id}`);
      if (submission && submission.grade !== null) {
        homeworkScores[homework.id.toString()] = submission.grade; // Convert id to string
        totalPoints += submission.grade;
        gradedHomeworks++;
      } else {
        homeworkScores[homework.id.toString()] = null; // Convert id to string
      }
    });
    const average = gradedHomeworks > 0 ? totalPoints / gradedHomeworks : 0;
    return { ...student, homeworkScores, average };
  });
  
  studentScores.sort((a, b) => b.average - a.average);

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
      name: homework.title.length > 20 ? homework.title.substring(0, 20) + "..." : homework.title,
      "Điểm TB": parseFloat(average.toFixed(1)) 
    };
  });

  // --- RENDER ---
  // 2. Render Client Component và truyền data xuống
  return (
    <ScorePageClient
      classInfo={classInfo}
      chartData={chartData}
      studentScores={studentScores}
      homeworks={homeworks}
      studentCount={students.length}
      homeworkCount={homeworks.length}
    />
  );
}

