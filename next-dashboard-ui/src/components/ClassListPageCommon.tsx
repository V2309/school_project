import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import FormContainer from "@/components/FormContainer";

import { Menu, MenuItem } from "@szhsin/react-menu"; // Menu con
import "@szhsin/react-menu/dist/index.css"; // CSS cho menu
import { FiMoreVertical, FiEdit, FiLogIn, FiTrash } from "react-icons/fi";

interface ClassListPageCommonProps {
  data: any[];
  count: number;
  page: number;
  role: "teacher" | "student";
  extraHeader?: React.ReactNode;
}

export default function ClassListPageCommon({
  data,
  count,
  page,
  role,
  extraHeader,
}: ClassListPageCommonProps) {
  return (
    <div className="h-full w-full flex justify-center items-start px-8 py-8 bg-gray-100 mb-[150px]">
      <div className="w-full max-w-6xl">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold mb-4">
            {role === "teacher" ? "Danh sách lớp học" : "Danh sách lớp học của tôi"}
          </h2>
          <div className="flex items-center gap-4">
            <TableSearch />
            {extraHeader}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {data.map((item) => (
            <div key={item.id} className="relative">
              <div className="bg-white rounded-xl shadow p-4 flex flex-col relative">
                {/* Hình nền lớp học */}
                <a
                  href={`/${role}/class/${item.class_code || item.id}/newsfeed`}
                  className="w-full h-32 bg-cover bg-center rounded-lg mb-4"
                  style={{
                    backgroundImage: `url(${item.img || "/school.jpg"})`,
                  }}
                />

                {/* Nút dấu 3 chấm */}
                <div className="absolute top-2 right-2 z-10">
                  <Menu
                    menuButton={
                      <button className="p-1 rounded-full hover:bg-gray-200">
                        <FiMoreVertical />
                      </button>
                    }
                    transition
                  >
                    <MenuItem style={{ padding: "0.75rem 0.75rem", minHeight: "unset" }}>
                      <a
                        href={`/${role}/class/${item.class_code || item.id}/newsfeed`}
                        className="flex items-center gap-2 text-sm"
                      >
                        <FiLogIn />
                        Vào lớp
                      </a>
                    </MenuItem>
                    <MenuItem style={{ padding: "0.75rem 0.75rem", minHeight: "unset" }}>
                      <a
                        href={`/${role}/class/${item.class_code || item.id}/edit`}
                        className="flex items-center gap-2 text-sm w-full"
                      >
                        <FiEdit />  Chỉnh sửa
                      </a>
                    </MenuItem>
                    <MenuItem style={{ padding: "0.75rem 0.75rem", minHeight: "unset" }}>
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <FormContainer table="class" type="delete" id={item.id} />
                        <span className="">Xóa</span>
                      </div>
                    </MenuItem>
                  </Menu>
                </div>

                {/* Nội dung lớp học */}
                <div className="text-xl font-bold mb-2">{item.name}</div>
                <div className="text-gray-600 text-sm mb-1">
                  {role === "teacher"
                    ? `Số lượng: ${item.capacity}`
                    : `Sức chứa: ${item.capacity}`}
                </div>
                {role === "teacher" && (
                  <div className="text-gray-600 text-sm mb-1">
                    Giáo viên: {item.supervisor?.username || "Chưa phân công"}
                  </div>
                )}
                <div className="text-gray-600 text-sm">
                  Mã lớp: {item.class_code || ""}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Pagination count={count} page={page} />
      </div>
    </div>
  );
}
