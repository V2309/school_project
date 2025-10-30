"use client";

import { useState, useMemo, useRef } from "react"; // 1. Import useRef
import { useRouter } from "next/navigation";
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
  classId?: number; // ID lớp học hiện tại (nếu đang ở trang lớp cụ thể)
  teacherClasses?: any[]; // ** NHẬN PROP NÀY TỪ SERVER COMPONENT **
}

// 3. Tách hằng số colorClasses ra ngoài và định nghĩa type cho nó
const colorClasses: Record<EventColor, string> = {
  blue: "bg-blue-50 text-blue-700 border-l-4 border-blue-500",
  green: "bg-green-50 text-green-700 border-l-4 border-green-500",
  yellow: "bg-yellow-50 text-yellow-700 border-l-4 border-yellow-500",
};

// --- Helper Functions ---
const buildSevenDayRangeFrom = (anyDate: Date) => {
  const start = moment(anyDate).startOf("week");
  return Array.from({ length: 7 }, (_, i) => start.clone().add(i, "day"));
};

const formatWeekRangeVi = (date: Date) => {
  const start = moment(date).startOf("week");
  const end = start.clone().add(6, "day");
  const startFormat = start.isSame(end, "month") ? "D" : "D/M";
  return `Tuần ${start.format(startFormat)} - ${end.format("D/M")}, ${end.format(
    "YYYY"
  )}`;
};

// --- Main Component ---
const AllDaySchedule = ({ schedules = [], role, classId, teacherClasses = [] }: BigCalendarProps) => {
  const router = useRouter();
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
    // TỐI ƯU: Dùng router.refresh() để lấy lại dữ liệu mới (từ Server)
    router.refresh(); 
  };

  return (
    <div className="bg-white  border border-gray-200 overflow-hidden">
      {/* 1. Header Điều Hướng */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
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
          classId={classId} 
          setOpen={setShowScheduleForm}
          onSuccess={handleScheduleSuccess}
          // TỐI ƯU: Truyền danh sách lớp đã tải sẵn xuống form
          teacherClasses={teacherClasses} 
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
    <div className="flex flex-col border-r border-t border-gray-200 h-[calc(100vh-200px)] min-h-[600px] bg-white">
      {/* Header của Cột */}
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

      {/* Body của Cột */}
      <div className="flex-1 p-2 overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-center text-gray-500 text-sm mt-4">
            Không có lịch học
          </div>
        ) : (
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

// --- Component Sự Kiện Nhỏ (ĐÃ SỬA LỖI TOOLTIP) ---
const EventItem = ({ event }: { event: ScheduleEvent }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, side: 'right' as 'right' | 'left' });
  const hideTooltipTimer = useRef<NodeJS.Timeout | null>(null); // Ref cho timer
  const colorClass = colorClasses[event.color];

  const handleEventMouseEnter = (e: React.MouseEvent) => {
    // Xóa timer ẩn tooltip (nếu có)
    if (hideTooltipTimer.current) {
      clearTimeout(hideTooltipTimer.current);
    }
    
    // Tính toán vị trí
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceOnRight = window.innerWidth - rect.right;
    const preferRight = spaceOnRight > 320; // 320px là chiều rộng ước tính của tooltip
    
    setTooltipPosition({
      x: preferRight ? rect.right + 8 : rect.left - 328, // 320 (width) + 8 (gap)
      y: rect.top,
      side: preferRight ? 'right' : 'left'
    });

    // Hiển thị tooltip
    setShowTooltip(true);
  };

  const handleEventMouseLeave = () => {
    // Đặt timer để ẩn tooltip, cho phép người dùng di chuột vào tooltip
    hideTooltipTimer.current = setTimeout(() => {
      setShowTooltip(false);
    }, 100); // 100ms delay
  };

  const handleTooltipMouseEnter = () => {
    // Nếu chuột vào tooltip, hủy timer ẩn
    if (hideTooltipTimer.current) {
      clearTimeout(hideTooltipTimer.current);
    }
  };
  
  const handleTooltipMouseLeave = () => {
    // Nếu chuột rời tooltip, ẩn ngay
    setShowTooltip(false);
  };

  return (
    <div className="relative">
      {/* Event Item */}
      <div
        className={`p-2 rounded-r-md cursor-pointer hover:opacity-80 transition-all duration-200 hover:shadow-lg ${colorClass} mb-1`}
        onMouseEnter={handleEventMouseEnter}
        onMouseLeave={handleEventMouseLeave}
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

      {/* Tooltip */}
      {showTooltip && (
        <div 
          // SỬA LỖI: Xóa `pointer-events-none`
          className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl p-4 min-w-[280px] max-w-[400px]"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`
          }}
          // SỬA LỖI: Thêm 2 event handlers
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          {/* Mũi tên (Arrow) */}
          {tooltipPosition.side === 'right' ? (
            <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white"></div>
          ) : (
            <div className="absolute -right-2 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-white"></div>
          )}
          
          <div className="space-y-3">
            {/* Title */}
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-gray-900 text-base leading-tight pr-2">
                {event.title}
              </h3>
              <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${event.color === 'blue' ? 'bg-blue-500' : event.color === 'green' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            </div>

            {/* Time */}
            {event.startTime && event.endTime && (
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">
                  {moment(event.startTime).format("HH:mm")} - {moment(event.endTime).format("HH:mm")}
                </span>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">
                {moment(event.date).format("dddd, DD/MM/YYYY")}
              </span>
            </div>

            {/* Class Info */}
            {event.classInfo && (
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-sm">
                  {event.classInfo.name}
                  {event.classInfo.class_code && (
                    <span className="text-gray-500 ml-1">({event.classInfo.class_code})</span>
                  )}
                </span>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-start gap-2 text-gray-600">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Mô tả:</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllDaySchedule;