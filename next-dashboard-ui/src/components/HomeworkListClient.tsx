"use client";
import { useState } from "react";
import { HomeworkCard } from "@/components/HomeworkCard";
import { HomeWorkInfo } from "@/components/HomeWorkInfo";

export default function HomeworkListClient({ homeworks, role }: { homeworks: any[], role: string }) {
  const [selected, setSelected] = useState<any | null>(homeworks[0] || null);
  console.log("Rolessss:", role);
 return (
    <div className="flex flex-1 overflow-hidden"> {/* Sử dụng flex để chia bố cục */}
      {/* Danh sách bài tập */}
      <div className="flex-1 md:w-2/3 overflow-y-auto p-4 border-r-[3px]"> {/* Chiều cao đầy đủ và cuộn dọc */}
        {homeworks.map(hw => (
          <div
            key={hw.id}
            className={`cursor-pointer ${selected?.id === hw.id ? "ring-2 ring-blue-500" : ""}`}
            onClick={() => setSelected(hw)}
          >
            <HomeworkCard homework={hw} role={role} />
          </div>
        ))}
      </div>
      {/* Chi tiết bài tập */}
      <div className="w-1/3 overflow-y-auto p-4 bg-gray-50 flex-shrink-0"> {/* Cố định chiều rộng và cuộn dọc */}
        {selected ? (
          <HomeWorkInfo homework={selected} role={role} />
        ) : (
          <div className="text-gray-500">Chọn một bài tập để xem chi tiết</div>
        )}
      </div>
    </div>
  );
}