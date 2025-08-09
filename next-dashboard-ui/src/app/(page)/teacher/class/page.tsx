import prisma from "@/lib/prisma";
import { Prisma, Teacher, Class } from "@prisma/client";
import { ITEM_PER_PAGE } from "@/lib/setting";
import { getCurrentUser } from "@/lib/hooks/auth";
import ClassListPageCommon from "@/components/ClassListPageCommon";
import FormContainer from "@/components/FormContainer";
import Image from "next/image";
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
      <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
        <Image src="/sort.png" alt="" width={14} height={14} />
      </button>
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