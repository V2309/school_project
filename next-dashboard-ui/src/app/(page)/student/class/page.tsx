"use client";
import Table from "@/components/Table";
import Navigation from "@/components/Navigation";
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import InputField from "@/components/InputField";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import React, { useState, useRef, useEffect } from 'react';
import { joinClassAction , getStudentClasses } from "@/lib/actions";


interface ClassType {
  id: number;
  name: string;
  class_code: string | null;
  capacity: number;
  gradeId: number;
  img: string | null;
  // Thêm các trường khác nếu cần
}

export default function Class() {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [codeArr, setCodeArr] = useState(["", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Lấy danh sách lớp khi component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const studentClasses = await getStudentClasses();
        setClasses(studentClasses);
      } catch (err) {
        console.error("Failed to fetch classes:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClasses();
  }, []);

  const handleInputChange = (idx: number, value: string) => {
    if (!/^[A-Za-z0-9]*$/.test(value)) return;
    const newArr = [...codeArr];
    newArr[idx] = value.toUpperCase().slice(0, 1);
    setCodeArr(newArr);

    if (value && idx < 4) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codeArr[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = codeArr.join("");
    if (code.length !== 5) {
      setError("Mã lớp phải gồm đúng 5 ký tự.");
      return;
    }
    setError("");

    const result = await joinClassAction(code);
    if (result.success) {
      alert("Tham gia lớp thành công!");
      setShowForm(false);
      setCodeArr(["", "", "", "", ""]);
      // Cập nhật lại danh sách lớp sau khi tham gia thành công
      const updatedClasses = await getStudentClasses();
      setClasses(updatedClasses);
    } else {
      setError(result.error || "Có lỗi xảy ra.");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="h-full w-full flex justify-center items-start px-8 py-8 bg-gray-100 mb-[150px]">
      <div className="w-full max-w-6xl">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold mb-4">Danh sách lớp học của tôi</h2>
          <div className="flex items-center gap-4">
            <TableSearch />
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              + Tham gia lớp mới
            </button>
          </div>
        </div>

        {/* Form nhập mã lớp */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
              <button
                className="absolute top-2 right-3 text-xl text-gray-400 hover:text-gray-700"
                onClick={() => setShowForm(false)}
                aria-label="Đóng"
              >
                &times;
              </button>
              <h3 className="text-lg font-bold mb-4">Nhập mã lớp để tham gia</h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 items-center">
                <div className="flex gap-2 mb-2">
                  {[0, 1, 2, 3, 4].map((idx) => (
                    <input
                      key={idx}
                      ref={el => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="text"
                      maxLength={1}
                      value={codeArr[idx]}
                      onChange={e => handleInputChange(idx, e.target.value)}
                      onKeyDown={e => handleKeyDown(idx, e)}
                      className="w-12 h-12 border-2 rounded border-blue-500 text-center text-2xl font-bold tracking-widest uppercase focus:outline-primary"
                    />
                  ))}
                </div>
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <button
                  type="submit"
                  className="bg-primary text-white rounded px-4 py-2 mt-2 hover:bg-primary-dark"
                >
                  Tham gia lớp
                </button>
              </form>
              <div className="text-xs text-gray-500 mt-2">
                Mã lớp gồm 5 ký tự, được giáo viên lớp đó cung cấp.
              </div>
            </div>
          </div>
        )}

        {/* Hiển thị danh sách lớp thực tế */}
        {classes.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-600 mb-4">Bạn chưa tham gia lớp học nào.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Tham gia lớp ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {classes.map((classItem) => (
              <Link
                href={`/student/class/${classItem.class_code || classItem.id}/newsfeed`} // Sử dụng class_code nếu có, nếu không thì dùng id
                key={classItem.id}
                className="bg-white rounded-xl shadow p-4 flex flex-col hover:shadow-lg transition-shadow"
              >
                <div
                  className="w-full h-32 bg-cover bg-center rounded-lg mb-4"
                  style={{
                    backgroundImage: `url(${classItem.img || "/school.jpg"})` // Ảnh mẫu theo id lớp
                  }}
                />
                <div className="text-xl font-bold mb-2">{classItem.name}</div>
                <div className="text-gray-600 text-sm mb-1">Mã lớp: {classItem.class_code || 'N/A'}</div>
                <div className="text-gray-600 text-sm mb-1">Sức chứa: {classItem.capacity}</div>
                {/* Có thể thêm các thông tin khác nếu cần */}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// import prisma from "@/lib/prisma";
// import { Prisma, Student, Class } from "@prisma/client";
// import { ITEM_PER_PAGE } from "@/lib/setting";
// import { getCurrentUser } from "@/lib/hooks/auth";
// import ClassListPageCommon from "@/components/ClassListPageCommon";
// import Image from "next/image";
// import FormContainer from "@/components/FormContainer";
// import { Link } from "lucide-react";

// type ClassList = Class & {
//   students: Student[];
// };

// const StudentClassListPage = async ({
//   searchParams,
// }: {
//   searchParams: { [key: string]: string | undefined };
// }) => {
//   // Lấy user hiện tại
//   const user = await getCurrentUser();
//   if (!user || user.role !== "student") {
//     return <div>Bạn không có quyền truy cập.</div>;
//   }

//   // Lấy student theo user.id
//   const student = await prisma.student.findUnique({
//     where: { userId: user.id as string },
//   });
//   if (!student) {
//     return <div>Không tìm thấy thông tin học sinh.</div>;
//   }

//   const { page, ...queryParams } = searchParams;
//   const p = page ? parseInt(page) : 1;

//   // Query: lấy các lớp mà học sinh này đã tham gia
//   const query: Prisma.ClassWhereInput = {
//     students: {
//       some: { id: student.id },
//     },
//   };
//   if (queryParams) {
//     for (const [key, value] of Object.entries(queryParams)) {
//       if (value !== undefined) {
//         switch (key) {
//           case "search":
//             query.name = {
//               contains: value,
//               mode: "insensitive",
//             };
//             break;
//         }
//       }
//     }
//   }

//   const [data, count] = await prisma.$transaction([
//     prisma.class.findMany({
//       where: query,
//       include: {
//         students: true,
//       },
//       take: ITEM_PER_PAGE,
//       skip: ITEM_PER_PAGE * (p - 1),
//     }),
//     prisma.class.count({
//       where: query,
//     }),
//   ]);

//   // Nút tham gia lớp mới cho student
//   const extraHeader = (
//     <Link
//       className="btn bg-blue-500 text-white px-4 py-2 rounded"
//       // Bạn có thể mở modal nhập mã lớp ở đây nếu muốn
//       // onClick={}
//     >
//       + Tham gia lớp mới
//     </Link>
//   );

//   return (
//     <ClassListPageCommon
//       data={data}
//       count={count}
//       page={p}
//       role={user.role as "teacher" | "student"}
//       extraHeader={extraHeader}
//     />
//   );
// };

// export default StudentClassListPage;