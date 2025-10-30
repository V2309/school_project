// components/HomeworkCard.tsx
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale"; // Nếu muốn hiển thị ngày tháng tiếng Việt
import Image from "next/image";
interface HomeworkCardProps {
  homework: {
    id: number;
    title: string;
    description: string | null; // Thêm null vào kiểu dữ liệu
    type?: string | null; // Thêm type để phân biệt loại bài tập
    points?: number | null; // Thêm null nếu cần
    createdAt: Date;
    class: {
      name: string;
      class_code: string | null; // Thêm null nếu class_code có thể null
    } | null; // Thêm null nếu class có thể null
    subject?: {
      name: string;
    } | null;
    attachments?: {
      type: string; // Loại file (ví dụ: "pdf", "image", ...)
      url: string; // URL của file
    }[] | null;
    submissions?: {
      grade: number | null;
      studentId?: string; // Thêm studentId để đếm số học sinh đã làm
    }[]; // Thêm submissions để lấy điểm cao nhất
    totalStudents?: number; // Tổng số học sinh trong lớp
    completedStudents?: number; // Số học sinh đã làm bài
  };
  role?: string; // Thêm role để phân biệt teacher/student
}

export function HomeworkCard({ homework, role }: HomeworkCardProps) {
  // Xử lý giá trị null
  const classInfo = homework.class || { name: "Không xác định", class_code: "" };
  const subjectName = homework.subject?.name || "Không";
  const description = homework.description || "Không có mô tả";
  
  // Xác định loại bài tập
  const homeworkType = homework.type === "extracted" ? "Trắc nghiệm tách câu" : "Trắc nghiệm";
  
  // Tính số lượng học sinh đã làm (cho teacher)
  const completedCount = homework.completedStudents || 0;
  const totalStudents = homework.totalStudents || 0;
  const submissionStats = `${completedCount}/${totalStudents} đã làm`;
  
  // Tính điểm cao nhất từ submissions
  const getHighestGrade = () => {
    if (!homework.submissions || homework.submissions.length === 0) {
      return null;
    }
    const validGrades = homework.submissions
      .map(sub => sub.grade)
      .filter(grade => grade !== null) as number[];
    
    if (validGrades.length === 0) return null;
    return Math.max(...validGrades);
  };

  const highestGrade = getHighestGrade();
  const maxPoints = homework.points || 10; // Điểm tối đa, mặc định 10

// Kiểm tra loại file
  const attachmentType = homework.attachments?.[0]?.type || "Not found "; // Lấy loại file từ attachment đầu tiên

  const attachmentImage =
    attachmentType === "application/pdf"
      ? "/pdf_red.png" // Nếu là PDF, hiển thị ảnh PDF
      : "/doc_blue.png"; // Nếu không phải PDF, hiển thị ảnh mặc định
  return (
    <div 
       className="block bg-white rounded-lg shadow-lg p-4 mb-4 hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-500"
     
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="img">
            <Image src={attachmentImage} alt="" width={40} height={40} className="object-cover" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">{homework.title}</h3>
            <p className="text-gray-600 mt-1 line-clamp-2">{description}</p>
            
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span className="mr-4">
                <span className="font-medium">Loại:</span> {homeworkType}
              </span>
              <span>
                <span className="font-medium">
                  {role === "teacher" ? "Học sinh:" : "Môn:"}
                </span> {role === "teacher" ? submissionStats : subjectName}
              </span>
            </div>
          </div>
        </div>

        {/* Label điểm bên phải - chỉ hiển thị cho student */}
        {role === "student" && highestGrade !== null && (
          <div className="flex-shrink-0 ml-4">
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {highestGrade}/{maxPoints} điểm
            </div>
          </div>
        )}
        
        {/* Hiển thị "Chưa làm" nếu chưa có submission - chỉ cho student */}
        {role === "student" && highestGrade === null && (
          <div className="flex-shrink-0 ml-4">
            <div className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
              Chưa làm
            </div>
          </div>
        )}

        {/* ... phần còn lại giữ nguyên ... */}
      </div>
    </div>
  );
}