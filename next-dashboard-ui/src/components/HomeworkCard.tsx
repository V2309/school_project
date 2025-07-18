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
  };
}

export function HomeworkCard({ homework }: HomeworkCardProps) {
  // Xử lý giá trị null
  const classInfo = homework.class || { name: "Không xác định", class_code: "" };
  const subjectName = homework.subject?.name || "Không";
  const description = homework.description || "Không có mô tả";
// Kiểm tra loại file
  const attachmentType = homework.attachments?.[0]?.type || "Not found "; // Lấy loại file từ attachment đầu tiên
  console.log("Attachments:", homework.attachments);
  console.log("Attachment Type:", attachmentType); // In ra loại file để kiểm tra
  const attachmentImage =
    attachmentType === "application/pdf"
      ? "/pdf_red.png" // Nếu là PDF, hiển thị ảnh PDF
      : "/doc_blue.png"; // Nếu không phải PDF, hiển thị ảnh mặc định
  return (
    <div 
       className="block bg-white rounded-lg shadow-lg p-4 mb-4 hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-500"
     
    >
      <div className="flex items-center space-x-4">
       <div className="img">
       <Image src={attachmentImage} alt="" width={40} height={40} className="object-cover" />
       </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{homework.title}</h3>
          <p className="text-gray-600 mt-1 line-clamp-2">{description}</p>
          
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <span className="mr-4">
              <span className="font-medium">Lớp:</span> {classInfo.name}
            </span>
            <span>
              <span className="font-medium">Môn:</span> {subjectName}
            </span>
          </div>
        </div>

        {/* ... phần còn lại giữ nguyên ... */}
      </div>
    </div>
  );
}