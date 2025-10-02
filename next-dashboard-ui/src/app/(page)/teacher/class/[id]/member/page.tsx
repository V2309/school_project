// import TableSearch from "@/components/TableSearch";
// import Image from "next/image";
// import Pagination from "@/components/Pagination";
// import Table from "@/components/Table";
// import Link from "next/link";
// import FormModal from "@/components/FormModal";
// import { Prisma } from "@prisma/client";
// import prisma from "@/lib/prisma";
// import { ITEM_PER_PAGE } from "@/lib/setting";
// import { Student, Class } from "@prisma/client";
// import { getCurrentUser } from "@/lib/hooks/auth";

// type StudentList = Student & {
//   classes: Class[];
// };

// const columns = [
//   {
//     header: "Info",
//     accessor: "info",
//   },
//   {
//     header: "Student ID",
//     accessor: "username",
//     className: "hidden md:table-cell",
//   },
//   {
//     header: "Phone",
//     accessor: "phone",
//     className: "hidden lg:table-cell",
//   },
//   {
//     header: "Address",
//     accessor: "address",
//     className: "hidden lg:table-cell",
//   },
//   {
//     header: "Actions",
//     accessor: "action",
//   },
// ];


// const renderRow = (item: StudentList) => (
//   <tr
//     key={item.id}
//     className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
//   >
//     <td className="flex items-center gap-4 p-4">
//       <Image
//         src="/lg1.gif"
//         alt=""
//         width={40}
//         height={40}
//         className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
//       />
//       <div className="flex flex-col">
//         <h3 className="font-semibold">{item.username}</h3>
//         <p className="text-xs text-gray-500">
//           {item.classes.map((cls) => cls.name).join(", ")}
//         </p>
//       </div>
//     </td>
//     <td className="hidden md:table-cell">{item.id}</td>
//     <td className="hidden md:table-cell">{item.phone}</td>
//     <td className="hidden md:table-cell">{item.address}</td>
//     <td>
//       <div className="flex items-center gap-2">
//         <Link href={`/list/students/${item.id}`}>
//           <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
//             <Image src="/view.png" alt="" width={16} height={16} />
//           </button>
//         </Link>
//         <FormModal table="student" type="delete" id={item.id} />
//       </div>
//     </td>
//   </tr>
// );

// const MemberListPage = async ({
//   params,
//   searchParams,
// }: {
//   params: { id: string }; // ID của lớp học
//   searchParams: { [key: string]: string | undefined };
// }) => {
//   const { page, ...queryParams } = searchParams;

//   const p = page ? parseInt(page) : 1;

//   const query: Prisma.StudentWhereInput = {
//     classes: {
//       some: {
//         class_code: params.id as string, // Lọc theo ID của lớp học
//       },
//     },
//   };

//   // URL condition
//   if (queryParams) {
//     for (const [key, value] of Object.entries(queryParams)) {
//       if (value !== undefined) {
//         switch (key) {
//           case "search":
//             query.username = {
//               contains: value,
//               mode: "insensitive",
//             };
//             break;
//         }
//       }
//     }
//   }
// // dung lượng lớp học 
//   const quantity = await prisma.class.findUnique({
//     where: { class_code: params.id },
//     select: { capacity: true },
//   });
//   const [data, count] = await prisma.$transaction([
//     prisma.student.findMany({
//       where: query,
//       include: {
//         classes: true,
//       },
//       take: ITEM_PER_PAGE,
//       skip: ITEM_PER_PAGE * (Number(p) - 1),
//     }),
//     prisma.student.count({
//       where: query,
//     }),
//   ]);
//  console.log("so luong hoc sinh: ", count);
//   return (
//     <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
//       {/* Top */}
//       <div className="flex items-center justify-between">
//         <h1 className="hidden md:block text-lg font-semibold">
//           {/* dung lượng lớp */}
//           Thành viên lớp học ({count}/{quantity?.capacity})
//         </h1>
        
//         <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
//           <TableSearch />
//           <div className="flex items-center gap-4 self-end">
//             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
//               <Image src="/filter.png" alt="Filter Students" width={14} height={14} />
//             </button>
//             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
//               <Image src="/sort.png" alt="Sort Students" width={14} height={14} />
//             </button>
        
//           </div>
//         </div>
//       </div>
//       {/* List */}
     
//       <Table columns={columns} renderRow={renderRow} data={data} />

//       {/* Pagination */}
//       <div className="mt-4">
//         <Pagination page={p} count={count} />
//       </div>
//     </div>
//   );
// };

// export default MemberListPage;



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