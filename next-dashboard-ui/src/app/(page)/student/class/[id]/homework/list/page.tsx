import { HomeworkCard } from "@/components/HomeworkCard";
import { HomeWorkInfo } from "@/components/HomeWorkInfo";
import prisma from "@/lib/prisma";
import Link from "next/link";
import HomeworkListClient from "@/components/HomeworkListClient";
import { getCurrentUser } from "@/lib/hooks/auth";
export default async function HomeworkList({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const userId = user?.id as string;
  
  const homeworks = await prisma.homework.findMany({
    where: { class: { class_code: params.id } },
    include: {
      class: { select: { name: true, class_code: true } },
      subject: { select: { name: true } },
      attachments: true,
      submissions: {
        where: { studentId: userId }, // Chỉ lấy submissions của học sinh hiện tại
        select: { grade: true }, // Chỉ lấy trường grade
        orderBy: { grade: 'desc' } // Sắp xếp theo điểm cao nhất
      }
    },
    orderBy: { endTime: "asc" }
  });
  
  console.log("User:", user);
  const role = user?.role; 
  console.log("Role:", role);
  return (
    <div className="px-4 py-4 bg-white rounded-lg shadow-md flex flex-col h-full">
      <h1 className="text-2xl font-bold mb-6">Danh sách bài tập</h1>

      <HomeworkListClient homeworks={homeworks} role={role as string} />
    </div>
  );
}