import Link from "next/link";
import Image from "next/image";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import FormContainer from "@/components/FormContainer";

import { Menu, MenuItem } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import { FiMoreVertical, FiEdit, FiLogIn, FiTrash } from "react-icons/fi";
import { ReactNode } from "react";

interface ClassItem {
  id: string | number;
  name: string;
  capacity?: number;
  class_code?: string;
  img?: string;
  supervisor?: { username?: string } | null;
}

interface ClassListPageCommonProps {
  data: any[];
  count: number;
  page: number;
  role: "teacher" | "student";
  extraHeader?: ReactNode;
}

export default function ClassListPageCommon({
  data,
  count,
  page,
  role,
  extraHeader,
}: ClassListPageCommonProps) {
  return (
    <div className="min-h-screen w-full flex justify-center items-start px-4 sm:px-6 lg:px-8 py-8 bg-slate-50">
      <div className="w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {role === "teacher" ? "Danh sách lớp học" : "Danh sách lớp học của tôi"}
          </h2>
          <div className="flex w-full md:w-auto items-center gap-3 md:gap-4">
            <div className="flex-1 md:flex-none md:w-80">
              <TableSearch />
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {extraHeader}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.length ? (
            data.map((item) => (
              <div key={item.id} className="group relative">
                <div className="relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300">
                  <Link href={`/${role}/class/${item.class_code || item.id}/newsfeed`}>
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={item.img || "/school.jpg"}
                        alt={item.name || "Class cover"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <span className="absolute bottom-3 left-3 text-white text-sm font-medium px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                        {role === "teacher" ? `Số lượng: ${item.capacity ?? "-"}` : `Sức chứa: ${item.capacity ?? "-"}`}
                      </span>
                    </div>
                  </Link>

                  <div className="absolute right-2 top-2 z-10">
                    <Menu
                      menuButton={
                        <button
                          aria-label="More actions"
                          className="p-2 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white"
                        >
                          <FiMoreVertical />
                        </button>
                      }
                      transition
                    >
                      <MenuItem>
                        <Link href={`/${role}/class/${item.class_code || item.id}/newsfeed`} className="flex items-center gap-2 text-sm">
                          <FiLogIn /> Vào lớp
                        </Link>
                      </MenuItem>
                      <MenuItem>
                        <Link href={`/${role}/class/${item.class_code || item.id}/edit`} className="flex items-center gap-2 text-sm">
                          <FiEdit /> Chỉnh sửa
                        </Link>
                      </MenuItem>
                      <MenuItem>
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <FiTrash />
                          {/* {<FormContainer table="class" type="delete" id={item.id as any} />} */}
                          <span>Xóa</span>
                        </div>
                      </MenuItem>
                    </Menu>
                  </div>

                  <div className="p-4">
                    <Link href={`/${role}/class/${item.class_code || item.id}/newsfeed`}>
                      <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                        {item.name}
                      </h3>
                    </Link>
                    <div className="mt-2 space-y-1 text-sm text-slate-600">
                      {role === "teacher" && (
                        <div>
                          Giáo viên: <span className="font-medium">{item.supervisor?.username || "Chưa phân công"}</span>
                        </div>
                      )}
                      <div>
                        Mã lớp: <span className="font-mono">{item.class_code || "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-slate-500">Chưa có lớp nào</div>
          )}
        </div>

        <div className="">
          <Pagination count={count} page={page} />
        </div>
      </div>
    </div>
  );
}
