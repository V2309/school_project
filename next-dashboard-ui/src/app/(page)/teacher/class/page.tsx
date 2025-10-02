import prisma from "@/lib/prisma";
import { Prisma, Teacher, Class } from "@prisma/client";
import { ITEM_PER_PAGE } from "@/lib/setting";
import { getCurrentUser } from "@/hooks/auth";
import ClassListPageCommon from "@/components/ClassListPageCommon";
import FormContainer from "@/components/FormContainer";
import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";

type ClassList = Class & {
  supervisor: Teacher;
};

const ClassListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  // Lấy user hiện tại
  const user = await getCurrentUser();
  console.log("Current user:", user);
  if (!user || user.role !== "teacher") {
    return <div>Bạn không có quyền truy cập.</div>;
  }

  // Lấy teacher theo user.id
  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id as string },
  });
  if (!teacher) {
    return <div>Không tìm thấy thông tin giáo viên.</div>;
  }

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.ClassWhereInput = {
    supervisorId: teacher.id,
    deleted: false, // Chỉ hiển thị các lớp chưa bị xóa
  };
  
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.name = {
              contains: value,
              mode: "insensitive",
            };
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.class.findMany({
      where: query,
      include: {
        supervisor: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.class.count({
      where: query,
    }),
  ]);

  // Truyền thêm các phần tử đặc thù cho role teacher (nút tạo lớp, sort) qua props
  const extraHeader = (
    <>
      <Link
        href="/teacher/class/trashcan"
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Lớp đã xóa
      </Link>

      <FormContainer table="class" type="create" />
   
    </>
  );

  return (
    <ClassListPageCommon
      data={data}
      count={count}
      page={p}
      role={user?.role as "teacher" | "student"}
      extraHeader={extraHeader}
    />
  );
};

export default ClassListPage;