"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "moment/locale/vi";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useMemo, useState } from "react";
import WeekStrip from "@/components/WeekStrip";
import { calendarEvents } from "@/lib/data";

// Locale VI + tuần bắt đầu từ Thứ 2 (khớp strip & RBC)
moment.locale("vi");
moment.updateLocale("vi", { week: { dow: 1, doy: 4 } });
const localizer = momentLocalizer(moment);

// Lấy 7 ngày của tuần chứa anyDate (dùng startOf('week') theo cấu hình trên)
const buildSevenDayRangeFrom = (anyDate: Date) => {
  const start = moment(anyDate).startOf("week");
  return Array.from({ length: 7 }, (_, i) => start.clone().add(i, "day").toDate());
};

// "Tuần 29/9 - 5/10, 2025"
const formatWeekRangeVi = (date: Date) => {
  const start = moment(date).startOf("week");
  const end = start.clone().add(6, "day");
  return `Tuần ${start.format("D/M")} - ${end.format("D/M")}, ${end.format("YYYY")}`;
};

const BigCalendar = () => {
  const [view, setView] = useState<View>(Views.WEEK); // hiển thị 7 ngày
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>(() => buildSevenDayRangeFrom(new Date()));

  const syncByDate = (d: Date) => {
    setCurrentDate(d);
    setWeekDays(buildSevenDayRangeFrom(d));
  };

  // Auto nhảy sang ngày/tuần mới lúc 00:00 + đồng bộ khi tab quay lại
  useEffect(() => {
    let timer: number;

    const scheduleNextMidnightTick = () => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 2, 0); // 00:00:02 an toàn
      const wait = Math.max(1000, next.getTime() - now.getTime());
      timer = window.setTimeout(() => {
        syncByDate(new Date());
        scheduleNextMidnightTick();
      }, wait);
    };

    scheduleNextMidnightTick();

    const onVis = () => {
      if (document.visibilityState === "visible") syncByDate(new Date());
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const handlePrevWeek = () => syncByDate(moment(currentDate).subtract(1, "week").toDate());
  const handleNextWeek = () => syncByDate(moment(currentDate).add(1, "week").toDate());
  const handleToday = () => syncByDate(new Date());
  const handleOnChangeView = (selectedView: View) => setView(selectedView);

  const eventPropGetter = () => ({
    style: { borderRadius: "8px", opacity: 0.9, display: "block" },
  });

  const slotPropGetter = (date: Date) => {
    const now = new Date();
    const isToday = moment(date).isSame(now, "day");
    const isPast = moment(date).isBefore(now, "hour");
    if (isToday && isPast) return { style: { backgroundColor: "rgba(156,163,175,0.1)" } };
    if (isToday) return { style: { backgroundColor: "rgba(59,130,246,0.02)" } };
    return {};
  };

  const minTime = useMemo(() => new Date(2025, 1, 1, 7, 0, 0), []);
  const maxTime = useMemo(() => new Date(2025, 1, 1, 19, 0, 0), []);
  const scrollTo = useMemo(() => new Date(2025, 1, 1, 8, 0, 0), []);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header điều hướng tuần */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="h-8 w-8 rounded-md border border-gray-300 hover:bg-gray-50"
            onClick={handlePrevWeek}
            aria-label="Tuần trước"
            type="button"
          >
            ‹
          </button>
          <div className="text-sm sm:text-base font-semibold text-gray-800">
            {formatWeekRangeVi(currentDate)}
          </div>
          <button
            className="h-8 w-8 rounded-md border border-gray-300 hover:bg-gray-50"
            onClick={handleNextWeek}
            aria-label="Tuần kế tiếp"
            type="button"
          >
            ›
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 rounded-md border border-gray-300 text-sm hover:bg-gray-50"
            onClick={handleToday}
            type="button"
          >
            Hôm nay
          </button>
          <select
            className="px-2 py-1.5 rounded-md border border-gray-300 text-sm"
            value={view}
            onChange={(e) => handleOnChangeView(e.target.value as View)}
          >
            <option value={Views.WEEK}>Tuần (7 ngày)</option>
            <option value={Views.DAY}>Ngày</option>
          </select>
        </div>
      </div>

      {/* Day-of-week strip (không padding ngang để thẳng cột với calendar) */}
      <div className="">
        <WeekStrip
          days={weekDays}
          onAdd={(d) => {
            // mở modal tạo event nếu cần
            console.log("Add event for:", d);
          }}
        />
      </div>

      {/* Calendar */}
      <Calendar
        localizer={localizer}
        date={currentDate}
        toolbar={false}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        views={["week", "day"]}
        view={view}
        style={{ height: "calc(100vh - 220px)", minHeight: "600px" }}
        onView={handleOnChangeView}
        onNavigate={(date) => syncByDate(date)}
        onRangeChange={(range: any) => {
          if (Array.isArray(range) && range.length > 0) syncByDate(range[0]);
          else if (range?.start) syncByDate(range.start);
        }}
        selectable
        popup
        eventPropGetter={eventPropGetter}
        slotPropGetter={slotPropGetter}
        step={30}
        timeslots={2}
        min={minTime}
        max={maxTime}
        scrollToTime={scrollTo}
        formats={{
          timeGutterFormat: "HH:mm",
          eventTimeRangeFormat: ({ start, end }) =>
            `${moment(start).format("HH:mm")} - ${moment(end).format("HH:mm")}`,
          dayHeaderFormat: "dddd, DD/MM",
        }}
        messages={{
          today: "Hôm nay",
          previous: "‹",
          next: "›",
          month: "Tháng",
          week: "Tuần",
          day: "Ngày",
          work_week: "Tuần làm việc",
          agenda: "Lịch trình",
          noEventsInRange: "Không có sự kiện nào trong khoảng thời gian này.",
          showMore: (count) => `+${count} thêm`,
        }}
      />
    </div>
  );
};

export default BigCalendar;
