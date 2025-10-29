"use client";

import { useState, useMemo } from "react";
import moment from "moment";
import "moment/locale/vi"; // Import Tiếng Việt
import ScheduleForm from "@/components/forms/ScheduleForm";

// Cấu hình moment: Locale VI + tuần bắt đầu từ Thứ 2
moment.locale("vi");
moment.updateLocale("vi", { week: { dow: 1, doy: 4 } });

// --- 1. ĐỊNH NGHĨA TYPESCRIPT ---
type EventColor = "blue" | "green" | "yellow";

type ScheduleEvent = {
  id: number;
  title: string;
  description?: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  color: EventColor;
  classInfo?: {
    id: number;
    name: string;
    class_code: string | null;
  };
};

// Interface cho props component
interface BigCalendarProps {
  schedules?: Array<{
    id: number;
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    class: {
      id: number;
      name: string;
      class_code: string | null;
    } | null;
  }>;
  role?: string;
}

// 3. Tách hằng số colorClasses ra ngoài và định nghĩa type cho nó
const colorClasses: Record<EventColor, string> = {
  blue: "bg-blue-50 text-blue-700 border-l-4 border-blue-500",
  green: "bg-green-50 text-green-700 border-l-4 border-green-500",
  yellow: "bg-yellow-50 text-yellow-700 border-l-4 border-yellow-500",
};

// --- Helper Functions ---

// Lấy 7 ngày của tuần chứa anyDate
const buildSevenDayRangeFrom = (anyDate: Date) => {
  const start = moment(anyDate).startOf("week");
  return Array.from({ length: 7 }, (_, i) => start.clone().add(i, "day"));
};

// "Tuần 27/10 - 2/11, 2025"
const formatWeekRangeVi = (date: Date) => {
  const start = moment(date).startOf("week");
  const end = start.clone().add(6, "day");
  const startFormat = start.isSame(end, "month") ? "D" : "D/M";
  return `Tuần ${start.format(startFormat)} - ${end.format("D/M")}, ${end.format(
    "YYYY"
  )}`;
};

// --- Main Component ---
const AllDaySchedule = ({ schedules = [], role }: BigCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState<"week" | "month">("week");
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedDateForForm, setSelectedDateForForm] = useState<Date | undefined>();

  // Chuyển đổi dữ liệu schedules thành format phù hợp
  const allDayEvents = useMemo(() => {
    return schedules.map((schedule, index) => ({
      id: schedule.id,
      title: schedule.title,
      description: schedule.description,
      date: new Date(schedule.startTime),
      startTime: new Date(schedule.startTime),
      endTime: new Date(schedule.endTime),
      color: (["blue", "green", "yellow"][index % 3]) as EventColor,
      classInfo: schedule.class ? {
        id: schedule.class.id,
        name: schedule.class.name,
        class_code: schedule.class.class_code,
      } : undefined,
    }));
  }, [schedules]);

  // Tính toán 7 ngày trong tuần
  const weekDays = useMemo(
    () => buildSevenDayRangeFrom(currentDate),
    [currentDate]
  );

  // --- Handlers ---
  const handlePrevWeek = () =>
    setCurrentDate(moment(currentDate).subtract(1, "week").toDate());
  const handleNextWeek = () =>
    setCurrentDate(moment(currentDate).add(1, "week").toDate());

  const handleViewChange = (view: "week" | "month") => {
    setActiveView(view);
  };

  const handleAddEvent = (date: moment.Moment) => {
    setSelectedDateForForm(date.toDate());
    setShowScheduleForm(true);
  };

  const handleScheduleSuccess = () => {
    // Refresh trang để lấy dữ liệu mới
    window.location.reload();
  };

  return (
    <div className="bg-white  border border-gray-200 overflow-hidden">
      {/* 1. Header Điều Hướng (Giống ảnh mẫu) */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          {/* Nút Tuần / Tháng */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => handleViewChange("week")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md ${
                activeView === "week"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              } transition-all`}
            >
              Tuần
            </button>
            <button
              onClick={() => handleViewChange("month")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md ${
                activeView === "month"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              } transition-all`}
            >
              Tháng
            </button>
          </div>

          {/* Điều hướng tuần */}
          <div className="flex items-center gap-2">
            <button
              className="h-8 w-8 rounded-md hover:bg-gray-100 transition-colors"
              onClick={handlePrevWeek}
              aria-label="Tuần trước"
            >
              ‹
            </button>
            <div className="text-sm sm:text-base font-semibold text-gray-800">
              {formatWeekRangeVi(currentDate)}
            </div>
            <button
              className="h-8 w-8 rounded-md hover:bg-gray-100 transition-colors"
              onClick={handleNextWeek}
              aria-label="Tuần kế tiếp"
            >
              ›
            </button>
          </div>

          {/* Các nút hành động */}
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Sao chép lịch
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 transition-colors">
              Nhận xét
            </button>
          </div>
        </div>
      </div>

      {/* 2. Lưới Lịch 7 Cột */}
      <div className="grid grid-cols-7 border-l border-gray-200">
        {weekDays.map((day) => {
          const isToday = day.isSame(new Date(), "day");
          // Lọc các sự kiện cho ngày này
          const eventsForDay = allDayEvents.filter((event) =>
            moment(event.date).isSame(day, "day")
          );

          return (
            <DayColumn
              key={day.toISOString()}
              day={day}
              isToday={isToday}
              events={eventsForDay}
              onAdd={() => handleAddEvent(day)}
              role={role}
            />
          );
        })}
      </div>

      {/* Schedule Form Modal */}
      {showScheduleForm && role === "teacher" && (
        <ScheduleForm
          type="create"
          selectedDate={selectedDateForForm}
          setOpen={setShowScheduleForm}
          onSuccess={handleScheduleSuccess}
        />
      )}
    </div>
  );
};

// --- Component Cột Ngày ---
type DayColumnProps = {
  day: moment.Moment;
  isToday: boolean;
  events: ScheduleEvent[];
  onAdd: () => void;
  role?: string;
};

const DayColumn = ({ day, isToday, events, onAdd, role }: DayColumnProps) => {
  return (
    // Mỗi cột là 1 flex-col, có border-r và border-t
    <div className="flex flex-col border-r border-t border-gray-200 h-[calc(100vh-200px)] min-h-[600px] bg-white">
      {/* Header của Cột (Thứ, Ngày, Nút +) */}
      <div className={` border-b p-3 ${isToday ? "bg-blue-50" : ""}`}>
        <div className="flex justify-between items-center">
          <span
            className={`text-xs font-semibold ${
              isToday ? "text-gray-900" : "text-gray-500"
            }`}
          >
            {day.format("dddd")}
            {isToday && " - Hôm nay"}
          </span>
          {role === "teacher" && (
            <button
              onClick={onAdd}
              className="h-6 w-6 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-800
                         flex items-center justify-center text-lg font-medium transition-colors"
              aria-label="Thêm lịch học"
            >
              +
            </button>
          )}
        </div>
        <div
          className={`text-2xl font-bold mt-0.5 ${
            isToday ? "text-blue-600" : "text-gray-900"
          }`}
        >
          {day.format("DD/MM")}
        </div>
      </div>

      {/* Body của Cột (Danh sách sự kiện hoặc thông báo trống) */}
      <div className="flex-1 p-2 overflow-y-auto">
        {events.length === 0 ? (
          // Trạng thái trống
          <div className="text-center text-gray-500 text-sm mt-4">
            Không có lịch học
          </div>
        ) : (
          // Render danh sách sự kiện
          <div className="flex flex-col gap-2">
            {events.map((event) => (
              <EventItem key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Component Sự Kiện Nhỏ ---
const EventItem = ({ event }: { event: ScheduleEvent }) => {
  // Lấy chuỗi class từ hằng số bên ngoài
  const colorClass = colorClasses[event.color];

  return (
    <div
      className={`p-2 rounded-r-md cursor-pointer hover:opacity-80 ${colorClass} mb-1`}
    >
      <div className="text-sm font-semibold">{event.title}</div>
      {event.startTime && event.endTime && (
        <div className="text-xs opacity-75 mt-1">
          {moment(event.startTime).format("HH:mm")} - {moment(event.endTime).format("HH:mm")}
        </div>
      )}
      {event.classInfo && (
        <div className="text-xs opacity-75 mt-1">
          {event.classInfo.name} {event.classInfo.class_code && `(${event.classInfo.class_code})`}
        </div>
      )}
      {event.description && (
        <div className="text-xs opacity-75 mt-1 line-clamp-2">
          {event.description}
        </div>
      )}
    </div>
  );
};

export default AllDaySchedule;