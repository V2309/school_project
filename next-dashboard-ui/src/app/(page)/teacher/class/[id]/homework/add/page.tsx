


"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";
export default function SelectHomeworkTypePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const classId = params.id;

  return (
    
    <div className=" w-full mx-auto h-full ">
      <div className="flex flex-col items-center h-full "> 
        <div className="w-full bg-white p-4 rounded-lg flex  items-center ">
        <Breadcrumb
          items={[
            { label: "Bài tập", href: `/teacher/class/${params.id}/homework/list` },
          //  { label: "Tạo bài tập", href: `/teacher/class/${params.id}/homework/add` },
            { label: "Chọn dạng đề", active: true }
          ]}
        />
      </div>
     
      <div className=" bg-white mt-4 h-full p-4">
      <h2 className="text-2xl font-bold mb-8 text-center mt-4 ">Trắc nghiệm & điền khuyết</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        {/* Giữ nguyên định dạng */}
        <div
          className="border-2 border-blue-500  bg-white rounded-lg p-8 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
          onClick={() => router.push(`/teacher/class/${classId}/homework/add/original`)}
        >
          <Image src="/note.gif" alt="Giữ nguyên định dạng" width={90} height={90} />
          <h3 className="font-bold text-lg mt-4 mb-2">Giữ nguyên định dạng</h3>
          <p className="text-center text-gray-500 mb-4">Đề bài được giữ nguyên và hiển thị khi làm bài</p>
          <button className="bg-blue-500 text-white px-6 py-2 rounded font-bold">Chọn</button>
        </div>
        {/* Tách câu tự động */}
        <div
          className="border-2 border-blue-500 bg-white rounded-lg p-8 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
          onClick={() => router.push(`/teacher/class/${classId}/homework/add/auto`)}
        >
          <Image src="/note2.gif" alt="Tách câu tự động" width={90} height={80} />
          <h3 className="font-bold text-lg mt-4 mb-2">Tách câu tự động</h3>
          <p className="text-center text-gray-500 mb-4">Nhận diện đề trắc nghiệm, tiếng anh từ file Word, PDF</p>
          <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded mb-2">Mới</span>
          <button className="bg-blue-500 text-white px-6 py-2 rounded font-bold">Tải File (word, pdf)</button>
          <button className="bg-gray-100 text-blue-600 px-6 py-2 rounded font-bold mt-2">Soạn thảo thông minh</button>
        </div>
      </div>
      </div>
    </div>
    </div>
  );
}