'use client';
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import Link from "next/link";
import FormModal from "@/components/FormModal";
interface MemberListProps {
  data: StudentList[];
  count: number;
  capacity?: number;
  userRole: string;
  page: number;
  classId: string;
}
type StudentList = {
  id: string;
  username: string;
  schoolname: string;
  class_name: string;
  classes: { name: string }[];
};

const MemberList = ({
  data,
  count,
  capacity,
  userRole,
  page,
  classId,
}: MemberListProps) => {
  const columns = [
    {
      header: "Họ và tên ",
      accessor: "username",
    },
    {
      header: "Trường",
      accessor: "school",
      className: "hidden md:table-cell",
    },
    {
      header: "Lớp",
      accessor: "class",
      className: "hidden lg:table-cell",
    },
    ...(userRole === "teacher"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []), // Nếu role là "student", không thêm cột Actions
  ];

  const renderRow = (item: StudentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src="/lg1.gif"
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.username}</h3>
          {/* <p className="text-xs text-gray-500">
            {item.classes.map((cls) => cls.name).join(", ")}
          </p> */}
        </div>
      </td>
      <td className="hidden md:table-cell">{item.schoolname}</td>
      <td className="hidden md:table-cell">{item.class_name}</td>
      <td>
        <div className="flex items-center gap-2">
          {userRole === "teacher" && (
            <>
              <Link href={`/list/students/${item.id}`}>
                <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
                  <Image src="/view.png" alt="Xem chi tiết học sinh" width={16} height={16} />
                </button>
              </Link>
              <FormModal 
                table="studentFromClass" 
                type="delete" 
                id={item.id} 
                relatedData={{ classCode: classId }} 
              />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 h-full">
      {/* Top */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Thành viên lớp học ({count}/{capacity})
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="Filter Students" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="Sort Students" width={14} height={14} />
            </button>
          </div>
        </div>
      </div>
      {/* List */}
      <div className="flex-1">
          <Table columns={columns} renderRow={renderRow} data={data} />
      </div>
      {/* Pagination */}
      <div className="mt-4">
        <Pagination page={page} count={count} />
      </div>
    </div>
  );
};

export default MemberList;