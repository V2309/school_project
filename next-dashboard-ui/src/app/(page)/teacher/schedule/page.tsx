import BigCalendar from "@/components/BigCalendar";
import { getTeacherSchedules } from "@/lib/actions/schedule.action";

export default async function SchedulePage() {
  // Lấy dữ liệu lịch học của giáo viên từ server
  const schedules = await getTeacherSchedules();
  
  return (
    <div className="w-full overflow-hidden">
      {/* Calendar Container */}
      <div>
        <BigCalendar schedules={schedules} role="teacher" />
      </div>
    </div>
  );
}