import {
  Eye,
  Info,
  Folder,
  Pencil,
  Printer,
  Download,
  Trash2,
  MonitorPlay,
  Clock,
  AlertCircle
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTransition, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteHomework } from "@/lib/actions"; // Đảm bảo đã export đúng tên hàm
import { getCurrentUser } from "@/lib/hooks/auth"; // Đảm bảo đã export đúng hàm này
import ExportHomeworkModal from "@/components/ExportHomeworkModal";

interface Homework {
  id: number;
  title: string;
  description?: string | null;
  startTime?: string | Date | null;
  endTime?: string | Date | null;
  duration?: number | null;
  maxAttempts?: number | null;
  points?: number | null;
  createdAt?: string | Date | null;
  subject?: { name: string } | null;
  classCode?: string;
  class?: { class_code: string };
}

// has role teacher
export function HomeWorkInfo({ homework, role }: { homework: Homework, role: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [submissionCount, setSubmissionCount] = useState(0);
  const [latestSubmissionId, setLatestSubmissionId] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);

  // Cập nhật thời gian hiện tại mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Lấy số lần đã làm bài và submission ID mới nhất (chỉ cho student)
  useEffect(() => {
    if (role === "student") {
      const fetchSubmissionData = async () => {
        try {
          const response = await fetch(`/api/homework/submissions/count?homeworkId=${homework.id}`);
          const data = await response.json();
          if (data.success) {
            setSubmissionCount(data.count);
            setLatestSubmissionId(data.latestSubmissionId);
          }
        } catch (error) {
          console.error("Error fetching submission data:", error);
        }
      };
      fetchSubmissionData();
    }
  }, [homework.id, role]);

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài tập này?")) return;
    const formData = new FormData();
    formData.append("id", homework.id.toString());
    startTransition(async () => {
      const res = await deleteHomework({ success: false, error: false }, formData);
      if (res.success) {
    toast.success("Xóa bài tập thành công!", { autoClose: 1200 });
        // setTimeout(() => {
        //   router.refresh();
        // }, 1200);
      } else {
        toast.error("Xóa thất bại!");
      }
    });
  };

  const handlePractice = () => {
    // Giả sử homework có trường classCode hoặc class.class_code
    const classCode = (homework as any).classCode || (homework as any).class?.class_code;
    if (classCode) {
      router.push(`/${role}/class/${classCode}/homework/${homework.id}/test`);
    } else {
      toast.error("Không tìm thấy mã lớp!");
    }
  };

  const handleViewDetail = () => {
    // Giả sử homework có trường classCode hoặc class.class_code
    const classCode = (homework as any).classCode || (homework as any).class?.class_code;
    if (classCode) {
      router.push(`/student/class/${classCode}/homework/${homework.id}/detail?utid=${latestSubmissionId}`);
    } else {
      toast.error("Không tìm thấy mã lớp!");
    }
  };

  // Kiểm tra trạng thái bài tập cho student
  const getHomeworkStatus = () => {
    if (role !== "student") return null;

    const startTime = homework.startTime ? new Date(homework.startTime) : null;
    const endTime = homework.endTime ? new Date(homework.endTime) : null;
    const maxAttempts = homework.maxAttempts || 1;

    // Kiểm tra thời gian bắt đầu
    if (startTime && currentTime < startTime) {
      const timeDiff = startTime.getTime() - currentTime.getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      return {
        type: "notStarted",
        message: `Bài tập chưa bắt đầu còn ${hours > 0 ? `${hours} giờ ` : ""}${minutes} phút nữa mới bắt đầu`,
        canTake: false
      };
    }

    // Kiểm tra hạn nộp
    if (endTime && currentTime > endTime) {
      return {
        type: "expired",
        message: "Đã hết hạn nộp bài",
        canTake: false
      };
    }

    // Kiểm tra số lần làm bài
    if (submissionCount >= maxAttempts) {
      return {
        type: "maxAttempts",
        message: `Đã hết lượt làm bài (${submissionCount}/${maxAttempts})`,
        canTake: false
      };
    }

    return {
      type: "available",
      message: "Có thể làm bài",
      canTake: true
    };
  };

  const homeworkStatus = getHomeworkStatus();
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-2">{homework.title}</h2>
      {homework.description && (
        <div className="mb-2 text-gray-700">{homework.description}</div>
      )}

      {/* Hiển thị trạng thái bài tập cho student */}
      {role === "student" && homeworkStatus && (
        <div className={`p-3 rounded-lg border ${
          homeworkStatus.type === "available" 
            ? "bg-green-50 border-green-200 text-green-800" 
            : "bg-yellow-50 border-yellow-200 text-yellow-800"
        }`}>
          <div className="flex items-center gap-2">
            {homeworkStatus.type === "available" ? (
              <Clock size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span className="font-medium">{homeworkStatus.message}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem label="Môn học" value={homework.subject?.name || "Không"} />
        <InfoItem label="Tổng điểm" value={homework.points?.toString() || "Không"} />
        <InfoItem label="Thời gian bắt đầu" value={formatDateTime(homework.startTime)} />
        <InfoItem label="Hạn chót nộp bài" value={formatDateTime(homework.endTime)} />
        <InfoItem label="Thời lượng" value={homework.duration ? `${homework.duration} phút` : "Không"} />
        <InfoItem label="Số lần làm bài tối đa" value={homework.maxAttempts?.toString() || "Không"} />
        <InfoItem label="Ngày tạo" value={formatDateTime(homework.createdAt)} />
        {role === "student" && (
          <InfoItem label="Số lần đã làm" value={`${submissionCount}/${homework.maxAttempts || 1}`} />
        )}
      </div>

      {/* Thanh chức năng */}
      <div className="mt-6 border-t pt-4">
        <ul className="space-y-2">
          {role === "teacher" ? (
            <>
              <MenuItem icon={<MonitorPlay size={18} />} onClick={handlePractice} label="Làm thử" />
              <MenuItem icon={<Info size={18} />} label="Chi tiết" active />
              <MenuItem icon={<Folder size={18} />} label="Di chuyển" />
              <MenuItem icon={<Pencil size={18} />} label="Chỉnh sửa" />
              <MenuItem icon={<Printer size={18} />} label="Xuất dữ liệu" onClick={() => setShowExport(true)} />
              <MenuItem icon={<Download size={18} />} label="Tải về" />
              <MenuItem icon={<Trash2 size={18} />} label="Xóa" danger onClick={handleDelete} />
            </>
          ) : role === "student" ? (
            <>
              <MenuItem 
                icon={<Eye size={18} />} 
                onClick={homeworkStatus?.canTake ? handlePractice : undefined} 
                label="Làm bài" 
                disabled={!homeworkStatus?.canTake}
              />
              {submissionCount > 0 && (
                <MenuItem 
                  icon={<Info size={18} />} 
                  onClick={handleViewDetail} 
                  label="Chi tiết" 
                  active
                />
              )}
            </>
          ) : null}
        </ul>
      </div>
      <ExportHomeworkModal homeworkId={homework.id} open={showExport} onClose={() => setShowExport(false)} />
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  active,
  danger,
  onClick,
  disabled
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <li
      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer
        ${active ? "bg-blue-50 text-blue-600 font-semibold" : ""}
        ${danger ? "text-red-600 hover:bg-red-50" : "hover:bg-gray-100"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
      onClick={disabled ? undefined : onClick}
    >
      {icon}
      <span>{label}</span>
    </li>
  );
}

function formatDateTime(date: string | Date | null | undefined) {
  if (!date) return "Không";
  const d = typeof date === "string" ? new Date(date) : date;
  if (!d || isNaN(d.getTime())) return "Không";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}