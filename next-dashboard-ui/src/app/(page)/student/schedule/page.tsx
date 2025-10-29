import BigCalendar from "@/components/BigCalendar";
import { getStudentSchedules } from "@/lib/actions/schedule.action";
import { getCurrentUser } from "@/hooks/auth";

export default async function SchedulePage() {
  // Lấy dữ liệu lịch học của học sinh từ các lớp đã tham gia
  const schedules = await getStudentSchedules();
  const user = await getCurrentUser();
  return (
    <div className="w-full overflow-hidden">
      {/* Calendar Container */}
      <div>
        <BigCalendar schedules={schedules} role={(user?.role as string) || "student"} />
      </div>
    </div>
  );
}