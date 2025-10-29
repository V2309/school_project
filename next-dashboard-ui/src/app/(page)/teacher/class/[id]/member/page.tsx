
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/setting";
import { getCurrentUser } from "@/hooks/auth";
import { Prisma } from "@prisma/client";
import { Student, Class } from "@prisma/client";
import MemberList from "@/components/MemberList";

type StudentList = Student & {
    classes: Class[];
};
const MemberListPage = async ({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | undefined };
}) => {
  const user = await getCurrentUser();
 const { page, ...queryParams } = searchParams;

    const p = page ? parseInt(page) : 1;

    const query: Prisma.StudentWhereInput = {
        classes: {
            some: {
                class_code: params.id as string, // Lọc theo ID của lớp học
            },
        },
    };
    // URL condition
    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined) {
                switch (key) {
                    case "search":
                        query.username = {
                            contains: value,
                            mode: "insensitive",
                        };
                        break;
                }
            }
        }
    }
    // dung lượng lớp học 
    const quantity = await prisma.class.findUnique({
        where: { class_code: params.id },
        select: { capacity: true },
    });
    // // Lấy danh sách học sinh trong lớp học theo ID
    // // và các điều kiện tìm kiếm từ URL
    const [data, count] = await prisma.$transaction([
        prisma.student.findMany({
            where: query,
            include: {
                classes: true,
            },
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (Number(p) - 1),
        }),
        prisma.student.count({
            where: query,
        }),
    ]);
    console.log("so luong hoc sinh: ", count);

  return (
    <MemberList
      data={data}
      count={count}
      capacity={quantity?.capacity}
      userRole={user?.role as string || "student"}
      page={p}
      classId={params.id}
    />
  );
};

export default MemberListPage;