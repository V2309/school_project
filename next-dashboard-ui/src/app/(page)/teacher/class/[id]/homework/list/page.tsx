import { HomeworkCard } from "@/components/HomeworkCard";
import { HomeWorkInfo } from "@/components/HomeWorkInfo";
import prisma from "@/lib/prisma";
import Link from "next/link";
import HomeworkListClient from "@/components/HomeworkListClient";
import { getCurrentUser } from "@/lib/hooks/auth";
import  TableSearch  from "@/components/TableSearch";
export default async function HomeworkList({ params }: { params: { id: string } }) {
  const homeworks = await prisma.homework.findMany({
    where: { class: { class_code: params.id } },
    include: {
      class: { select: { name: true, class_code: true } },
      subject: { select: { name: true } },
      attachments: true,
      submissions: { // Thêm submissions để tránh lỗi, nhưng teacher không cần xem điểm
        select: { grade: true },
        take: 0 // Không lấy submission nào cho teacher
      }
    },
    orderBy: { endTime: "asc" }
  });
  const user = await getCurrentUser();
  const role = user?.role; // Assuming getCurrentUser returns the user object with a role property



  return (
    <div className="px-4 pt-4 bg-white rounded-lg shadow-md flex flex-col h-full">
      <h1 className="text-2xl font-bold">Danh sách bài tập</h1>
   
      <HomeworkListClient homeworks={homeworks} role={role as string}  class_code={params.id}/>
    </div>
  );
}