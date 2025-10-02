"use client";

import React from "react";
import moment from "moment";
import "moment/locale/vi";
import { Plus } from "lucide-react";

type Props = {
  days: Date[];
  onAdd?: (day: Date) => void;
};

// Locale VI + tuần bắt đầu từ Thứ 2 (dow=1), chuẩn ISO (doy=4)
moment.locale("vi");
moment.updateLocale("vi", { week: { dow: 1, doy: 4 } });

const WeekStrip: React.FC<Props> = ({ days, onAdd }) => {
  return (
    // 7 cột, không gap, có vạch chia cột + viền dưới ↔ khớp lưới calendar
    <div className="w-full grid grid-cols-7 gap-0 divide-x divide-gray-200 border-b border-gray-200">
      {days.map((d) => {
        const isToday = moment(d).isSame(new Date(), "day");
        return (
          <div
            key={d.toISOString()}
            className={`h-16 px-4 py-2 flex items-start justify-between ${
              isToday ? "bg-blue-50" : "bg-white"
            }`}
            title={moment(d).format("DD/MM/YYYY")}
          >
            <div className="flex flex-col leading-tight">
              <span className={`text-xs ${isToday ? "text-blue-600 font-semibold" : "text-gray-500"}`}>
                {moment(d).format("dddd")}
              </span>
              <span className={`text-xl font-semibold ${isToday ? "text-blue-700" : "text-gray-900"}`}>
                {moment(d).format("DD/MM")}
              </span>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full p-1.5 hover:bg-gray-100"
              onClick={() => onAdd?.(d)}
              aria-label={`Thêm sự kiện ngày ${moment(d).format("DD/MM")}`}
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default WeekStrip;
