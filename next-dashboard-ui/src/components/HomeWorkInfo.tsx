// homeworkinfo.tsx
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
  AlertCircle,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTransition, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteHomework } from "@/lib/actions/actions";
import ExportHomeworkModal from "@/components/ExportHomeworkModal";

/** ================= Types ================= */
type Role = "teacher" | "student";
type DateInput = string | Date | null | undefined;

interface Homework {
  id: number;
  title: string;
  description?: string | null;
  startTime?: DateInput;
  endTime?: DateInput;
  duration?: number | null;
  maxAttempts?: number | null;
  points?: number | null;
  createdAt?: DateInput;
  subject?: { name: string } | null;
  classCode?: string | null;
  class?: { class_code: string } | null;
}

/** =============== Component =============== */
export function HomeWorkInfo({
  homework,
  role,
  
}: {
  homework: Homework;
  role: Role | string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // thời gian hiện tại (đếm mỗi giây)
  const [currentTime, setCurrentTime] = useState(new Date());

  // thống kê submission (student)
  const [submissionCount, setSubmissionCount] = useState(0);
  const [bestSubmissionId, setBestSubmissionId] = useState<string | null>(null);
  const [bestGrade, setBestGrade] = useState<number | null>(null);

  // modal export & xoá
  const [showExport, setShowExport] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // lấy số lần làm và submission tốt nhất (student)
  useEffect(() => {
    if (role === "student") {
      const fetchSubmissionData = async () => {
        try {
          const response = await fetch(
            `/api/homework/submissions/count?homeworkId=${homework.id}`
          );
          const data = await response.json();
          if (data.success) {
            setSubmissionCount(data.count);
            setBestSubmissionId(data.bestSubmissionId ?? null);
            setBestGrade(data.bestGrade ?? null);
          }
        } catch (error) {
          console.error("Error fetching submission data:", error);
        }
      };
      fetchSubmissionData();
    }
  }, [homework.id, role]);

  const getClassCode = (): string | undefined => {
    return homework.classCode ?? homework.class?.class_code ?? undefined;
  };

  const handlePractice = () => {
    const classCode = getClassCode();
    if (classCode) {
      router.push(`/class/${classCode}/homework/${homework.id}/test`);
    } else {
      toast.error("Không tìm thấy mã lớp!");
    }
  };

  const handleViewDetail = () => {
    const classCode = getClassCode();
    if (!classCode) return toast.error("Không tìm thấy mã lớp!");
    if (bestSubmissionId) {
      router.push(
        `/class/${classCode}/homework/${homework.id}/detail?utid=${bestSubmissionId}`
      );
    } else {
      router.push(
        `/class/${classCode}/homework/${homework.id}/detail?homeworkId=${homework.id}&getBest=true`
      );
    }
  };

  // thay window.confirm bằng modal
  const handleDelete = () => setShowConfirm(true);

  const confirmDelete = async () => {
    const formData = new FormData();
    formData.append("id", homework.id.toString());
    startTransition(async () => {
      const res = await deleteHomework({ success: false, error: false }, formData);
      if (res.success) {
        toast.success("Xóa bài tập thành công!", { autoClose: 1200 });
        setShowConfirm(false);
        router.refresh(); // bật nếu cần reload
      } else {
        toast.error("Xóa thất bại!");
      }
    });
  };

  // trạng thái bài tập (student)
  const getHomeworkStatus = () => {
    if (role !== "student") return null;

    const startTime = homework.startTime ? new Date(homework.startTime) : null;
    const endTime = homework.endTime ? new Date(homework.endTime) : null;
    const maxAttempts = homework.maxAttempts || 1;

    if (startTime && currentTime < startTime) {
      const timeDiff = startTime.getTime() - currentTime.getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      return {
        type: "notStarted" as const,
        message: `Bài tập chưa bắt đầu còn ${
          hours > 0 ? `${hours} giờ ` : ""
        }${minutes} phút nữa mới bắt đầu`,
        canTake: false,
      };
    }

    if (endTime && currentTime > endTime) {
      return {
        type: "expired" as const,
        message: "Đã hết hạn nộp bài",
        canTake: false,
      };
    }

    if (submissionCount >= maxAttempts) {
      return {
        type: "maxAttempts" as const,
        message: `Đã hết lượt làm bài (${submissionCount}/${maxAttempts})`,
        canTake: false,
      };
    }

    return { type: "available" as const, message: "Có thể làm bài", canTake: true };
  };

  const homeworkStatus = getHomeworkStatus();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-2">{homework.title}</h2>

      {homework.description && (
        <div className="mb-2 text-gray-700">{homework.description}</div>
      )}

      {/* trạng thái (student) */}
      {role === "student" && homeworkStatus && (
        <div
          className={`p-3 rounded-lg border ${
            homeworkStatus.type === "available"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-yellow-50 border-yellow-200 text-yellow-800"
          }`}
        >
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
        <InfoItem label="Tổng điểm" value={homework.points ? (Math.round(homework.points * 100) / 100).toString() : "Không"} />
        <InfoItem label="Thời gian bắt đầu" value={formatDateTime(homework.startTime)} />
        <InfoItem label="Hạn chót nộp bài" value={formatDateTime(homework.endTime)} />
        <InfoItem
          label="Thời lượng"
          value={homework.duration ? `${homework.duration} phút` : "Không"}
        />
        <InfoItem
          label="Số lần làm bài tối đa"
          value={homework.maxAttempts?.toString() || "Không"}
        />
        <InfoItem label="Ngày tạo" value={formatDateTime(homework.createdAt)} />

        {role === "student" && (
          <>
            <InfoItem
              label="Số lần đã làm"
              value={`${submissionCount}/${homework.maxAttempts || 1}`}
            />
            {bestGrade !== null && (
              <InfoItem
                label="Điểm cao nhất"
                value={`${bestGrade}/${homework.points || 10} điểm`}
              />
            )}
          </>
        )}
      </div>

      {/* menu chức năng */}
      <div className="mt-6 border-t pt-4">
        <ul className="space-y-2">
          {role === "teacher" ? (
            <>
              <MenuItem icon={<MonitorPlay size={18} />} onClick={handlePractice} label="Làm thử" />
              <MenuItem icon={<Info size={18} />} label="Chi tiết" active />
             
              <MenuItem icon={<Pencil size={18} />} label="Chỉnh sửa" />
              <MenuItem
                icon={<Printer size={18} />}
                label="Xuất dữ liệu"
                onClick={() => setShowExport(true)}
              />
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
                <MenuItem icon={<Info size={18} />} onClick={handleViewDetail} label="Chi tiết" active />
              )}
            </>
          ) : null}
        </ul>
      </div>

      {/* modal xác nhận xoá */}
      <ConfirmModal
        open={showConfirm}
        title="Xác nhận xoá bài tập"
        message={`Bạn có chắc chắn muốn xoá "${homework.title}"? Hành động này không thể hoàn tác.`}
        confirmText={isPending ? "Đang xoá..." : "Xoá"}
        cancelText="Huỷ"
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        danger
        disabled={isPending}
      />

      {/* modal export */}
      <ExportHomeworkModal
        homeworkId={homework.id}
        open={showExport}
        onClose={() => setShowExport(false)}
      />

      {/* toast */}
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

/** =============== Subcomponents =============== */
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

function MenuItem({ icon, label, active, danger, onClick, disabled }: MenuItemProps) {
  return (
    <li
      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer
        ${active ? "bg-blue-50 text-blue-600 font-semibold" : ""}
        ${danger ? "text-red-600 hover:bg-red-50" : "hover:bg-gray-100"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={disabled ? undefined : onClick}
    >
      {icon}
      <span>{label}</span>
    </li>
  );
}

function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Huỷ",
  onClose,
  onConfirm,
  danger,
  disabled,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  if (!open) return null;

  // đóng bằng phím Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-lg bg-white p-5 shadow-lg"
      >
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
            disabled={disabled}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md text-white ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
            } disabled:opacity-60`}
            disabled={disabled}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/** =============== Utils =============== */
function formatDateTime(date: DateInput) {
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
