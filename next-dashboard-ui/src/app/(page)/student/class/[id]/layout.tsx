// import prisma from "@/lib/prisma";
// import MenuClass from "@/components/MenuClass";

// export default async function ClassLayout({
//   children,
//   params,
// }: Readonly<{
//   children: React.ReactNode;
//   params: { id: string };
// }>) {
//   const classDetail = await prisma.class.findUnique({
//     where: { class_code: params.id },
//     include: {
//       supervisor: true,
//       students: true,
//       grade: true,
//     },
//   });

//   if (!classDetail) {
//     return <div>Không tìm thấy lớp học.</div>;
//   }

//   return (
//     <div className="h-screen  w-screen flex overflow-hidden">
//       {/* Menu bên trái */}
//       <div className="fixed left-0 h-full w-[25%] md:w-[20%] lg:w-[18%] bg-white shadow-md p-4">
//         <MenuClass classDetail={classDetail}  role="student"/>
//       </div>
//       {/* Nội dung bên phải */}
//       <div className="ml-[25%] md:ml-[20%] lg:ml-[18%] flex-grow bg-gray-100 overflow-hidden ">
//         {children}
//       </div>
//     </div>
//   );
// }

import prisma from "@/lib/prisma";
import ClassLayoutWrapper from "@/components/ClassLayoutWrapper";
import { getCurrentUser } from "@/hooks/auth";

export default async function ClassLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { id: string; }; // Thêm route nếu cần thiết
}>) {
  const classDetail = await prisma.class.findUnique({
    where: { class_code: params.id },
    include: {
      supervisor: true,
      students: true,
      grade: true,
      
    },
  });
  const user = await getCurrentUser();
  if (!classDetail) {
    return <div>Không tìm thấy lớp học.</div>;
  }

  return (
    <ClassLayoutWrapper classDetail={classDetail} role={user?.role as string}>
      {children}
    </ClassLayoutWrapper>
  );
}

