// import prisma from "@/lib/prisma";
// import Link from "next/link";
// // tên folder [id]
// interface Props {
//   params: { id  : string }; // 
// }

// const ClassPage = async ({ params }: Props) => {
//   // Nếu bạn dùng class_code làm mã lớp trên URL:
//   const classDetail = await prisma.class.findUnique({
//     where: { class_code: params.id },
//     include: {
//       supervisor: true,
//       students: true,
//       grade: true,
//       // Thêm các quan hệ khác nếu cần
//     },
//   });

//   if (!classDetail) {
//     return <div>Không tìm thấy lớp học.</div>;
//   }

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-4">Chi tiết lớp: {classDetail.name}</h1>
//       <Link href={`/teacher/class/${classDetail.class_code}/homework/list`} className="text-blue-500 hover:underline mb-4">
//         Xem danh sách bài tập
//       </Link>
//       <div>Mã lớp: {classDetail.class_code}</div>
//       <div>Giáo viên chủ nhiệm: {classDetail.supervisor?.username}</div>
//       <div>Sĩ số: {classDetail.capacity}</div>
//       <div>Khối: {classDetail.grade?.level}</div>
//       <div>Danh sách học sinh:</div>
//       <ul>
//         {classDetail.students.map((student) => (
//           <li key={student.id}>{student.username}</li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default ClassPage;


import prisma from "@/lib/prisma";
import ClassDetail from "@/components/ClassDetail";

interface Props {
  params: { id: string };
}

const ClassPage = async ({ params }: Props) => {
  const classDetail = await prisma.class.findUnique({
    where: { class_code: params.id },
    include: {
      supervisor: true,
      students: true,
      grade: true,
    },
  });

  if (!classDetail) {
    return <div>Không tìm thấy lớp học.</div>;
  }

  return <ClassDetail classDetail={classDetail} role="teacher" />;
};

export default ClassPage;