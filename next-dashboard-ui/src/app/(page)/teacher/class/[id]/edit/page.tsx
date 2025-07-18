import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { redirect } from "next/navigation";
import { updateClassWithDetails } from "@/lib/actions";
import GradeSelection from "@/components/GradeSelection";

// --- Helper Components (Để mã gọn gàng hơn) ---

// Component cho các công tắc chuyển đổi (toggle switch)
const ToggleSwitch = ({
  label,
  description,
  name,
  defaultChecked,
}: {
  label: string;
  description?: string;
  name: string;
  defaultChecked: boolean;
}) => (
  <div className="flex items-center justify-between py-4 border-b last:border-b-0">
    <div className="flex flex-col">
      <label htmlFor={name} className="font-semibold text-gray-800 cursor-pointer">
        {label}
      </label>
      {description && (
        <p className="text-sm text-gray-500 max-w-md">{description}</p>
      )}
    </div>
    <label htmlFor={name} className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        id={name}
        name={name}
        className="sr-only peer"
        defaultChecked={defaultChecked}
      />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  </div>
);

// Component cho các mục trong hộp trạng thái
const StatusStep = ({ text, linkText }: { text: string; linkText: string }) => (
  <li className="flex justify-between items-center mb-3">
    <div>
      <p className="font-medium text-gray-800">{text}</p>
      <p className="text-sm text-gray-500">
        Bắt buộc - <span className="text-blue-500">{linkText}</span>
      </p>
    </div>
    <svg
      className="w-6 h-6 text-green-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 13l4 4L19 7"
      ></path>
    </svg>
  </li>
);

// --- Page Component ---


export default async function EditClassPage({ params }: { params: { id: string } }) {
  const classEdit = await prisma.class.findUnique({
    where: { class_code: params.id },
    include: {
      grade: true,
    },
  });
  const grades = await prisma.grade.findMany({ orderBy: { level: "asc" } });

  if (!classEdit) {
    return (
      <div className="p-8 text-center text-red-500">
        Không tìm thấy lớp học.
      </div>
    );
  }

  // Server Action để cập nhật lớp học
  async function updateClass(formData: FormData) {
    "use server";
    const result = await updateClassWithDetails(formData, params.id);
    
    if (result.success) {
      revalidatePath(`/teacher/class/${params.id}/edit`);
      redirect(`/teacher/class/${params.id}/newsfeed`);
    } else {
      console.log("Error updating class:", result.error);
    }
  }

  // Server Action để xoá lớp học
  async function deleteClass() {
    "use server";
    // await prisma.class.delete({ where: { class_code: params.id } });
    console.log(`Lớp học ${params.id} đã được yêu cầu xoá.`);
    redirect("/teacher/dashboard");
  }

return (
  <div className="bg-gray-50 min-h-screen">
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột chính (bên trái) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm">
          <form action={updateClass}>
            {/* Tên lớp học */}
            <div className="mb-6">
              <label htmlFor="name" className="block text-gray-800 font-bold mb-2">
                Tên lớp học
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={classEdit.name}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Ví dụ: Lớp 10A1 - Toán"
              />
            </div>

            {/* Ảnh bìa */}
            <div className="mb-6">
              <label className="block text-gray-800 font-bold mb-2">Ảnh bìa</label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 h-48 flex items-center justify-center text-center hover:border-blue-400 transition-colors">
                {classEdit.img ? (
                  <Image
                    src={classEdit.img}
                    alt="Ảnh bìa lớp học"
                    fill
                    className="object-cover rounded-md"
                  />
                ) : (
                  <div className="text-gray-500">
                    <svg className="mx-auto h-12 w-12 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-sm">Chọn ảnh bìa cho lớp học</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                  <span className="text-white font-semibold">Thay đổi ảnh</span>
                </div>
              </div>
              <input 
                type="file" 
                name="coverImage" 
                className="hidden" 
                id="coverImage" 
                accept="image/*"
              />
              <label 
                htmlFor="coverImage" 
                className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
              >
                📷 Chọn ảnh mới
              </label>
            </div>

            {/* Các tùy chọn cài đặt */}
            <ToggleSwitch
              label="Mã bảo vệ"
              name="protectionCode"
              defaultChecked={classEdit.isProtected || false}
            />
            <ToggleSwitch
              label="Khóa lớp học"
              name="lockClass"
              defaultChecked={classEdit.isLocked || false}
            />
            <ToggleSwitch
              label="Phê duyệt học sinh"
              name="approveStudents"
              description="Phê duyệt học sinh tránh tình trạng người lạ vào lớp học mà không có sự cho phép của bạn"
              defaultChecked={classEdit.requiresApproval || false}
            />
            <ToggleSwitch
              label="Chặn học sinh tự rời lớp học"
              name="blockLeave"
              description="Tính năng này giúp giáo viên quản lý số lượng thành viên trong lớp tốt hơn tránh tình trạng học sinh tự ý thoát khỏi lớp"
              defaultChecked={classEdit.blockLeave || false}
            />
            <ToggleSwitch
              label="Cho phép học sinh xem bảng điểm"
              name="allowGradesView"
              defaultChecked={classEdit.allowGradesView || false}
            />

            {/* Khối lớp */}
            <GradeSelection 
              grades={grades} 
              currentGradeId={classEdit.gradeId || 0} 
              currentGradeLevel={classEdit.grade?.level || "Chưa cập nhật"}
            />

            {/* Nút submit bên trong form */}
            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                💾 Lưu lại
              </button>
            </div>
          </form>
        </div>

        {/* Cột phụ (bên phải) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="space-y-3">
            {/* Form xóa riêng biệt */}
            <form action={deleteClass}>
              <button
                type="submit"
                className="w-full border-2 border-red-200 text-red-500 bg-white font-bold py-3 px-4 rounded-lg hover:bg-red-50 hover:border-red-500 transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                    clipRule="evenodd"
                  />
                </svg>
                Xóa lớp học
              </button>
            </form>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">💡 Hướng dẫn sử dụng</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Chọn "➕ Khác" để tạo khối mới</li>
              <li>• Nhập tên khối và bấm "Lưu lại"</li>
              <li>• Khối mới sẽ được tự động tạo</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-lg mb-4">Các bước đã thực hiện</h3>
            <ul>
              <StatusStep text="Đặt tên lớp học" linkText="Thêm ngay" />
              <StatusStep text="Thêm ảnh bìa lớp học" linkText="Thêm ngay" />
              <StatusStep text="Chọn môn học" linkText="Thêm ngay" />
              <StatusStep text="Chọn khối lớp" linkText="Thêm ngay" />
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}