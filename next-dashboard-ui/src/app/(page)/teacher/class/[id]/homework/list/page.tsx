import { HomeworkCard } from "@/components/HomeworkCard";
import { HomeWorkInfo } from "@/components/HomeWorkInfo";
import prisma from "@/lib/prisma";
import Link from "next/link";
import HomeworkListClient from "@/components/HomeworkListClient";
import { getCurrentUser } from "@/lib/hooks/auth";
export default async function HomeworkList({ params }: { params: { id: string } }) {
  const homeworks = await prisma.homework.findMany({
    where: { class: { class_code: params.id } },
    include: {
      class: { select: { name: true, class_code: true } },
      subject: { select: { name: true } },
      attachments: true,
    },
    orderBy: { endTime: "asc" }
  });
  const user = await getCurrentUser();
  const role = user?.role; // Assuming getCurrentUser returns the user object with a role property



  return (
    <div className="px-4 py-4 bg-white rounded-lg shadow-md flex flex-col h-full">
      <h1 className="text-2xl font-bold mb-6">Danh sách bài tập</h1>
      <Link
        href={`/teacher/class/${params.id}/homework/add`}
        className="text-blue-500 hover:text-blue-600 mb-4  font-bold "
      >
        + Thêm bài tập
      </Link>
      <HomeworkListClient homeworks={homeworks} role={role as string} />
    </div>
  );
}