import Link from "next/link";

interface ClassDetailProps {
  classDetail: {
    id: number | string; // Sử dụng number hoặc string tùy theo cách bạn lưu trữ ID
    name: string;
    class_code: string | null;
    capacity: number;
    supervisor?: { username?: string } | null;
    students: { id:  string ; username?: string }[];
    grade?: { level?: string } | null;
  };
  role: "teacher" | "student";
}

export default function ClassDetail({ classDetail, role }: ClassDetailProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Chi tiết lớp: {classDetail.name}</h1>
      {classDetail.class_code && (
        <Link
          href={`/${role}/class/${classDetail.class_code}/homework/list`}
          className="text-blue-500 hover:underline mb-4 block"
        >
          Xem danh sách bài tập
        </Link>
      )}
      <div>Mã lớp: {classDetail.class_code || "Chưa có mã lớp"}</div>
      <div>Giáo viên chủ nhiệm: {classDetail.supervisor?.username || "Chưa phân công"}</div>
      <div>Sĩ số: {classDetail.capacity}</div>
      <div>Khối: {classDetail.grade?.level || "Chưa cập nhật"}</div>
      <Link href={`/${role}/class/${classDetail.class_code}/member`} className="text-blue-500 hover:underline mb-4 block">Danh sách học sinh:</Link>
      {/* <ul>
        {classDetail.students.length > 0 ? (
          classDetail.students.map((student) => (
            <li key={student.id}>{student.username || "Chưa đặt tên"}</li>
          ))
        ) : (
          <li>Chưa có học sinh</li>
        )}
      </ul> */}
    </div>
  );
}