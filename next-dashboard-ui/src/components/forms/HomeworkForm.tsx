"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { homeworkSchema } from "@/lib/formValidationSchema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createHomework } from "@/lib/actions";

interface HomeworkFormProps {
  classId: number;
  classCode: string;
  subjects: { id: number; name: string }[];
}

export function HomeworkForm({ classId, classCode, subjects }: HomeworkFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(homeworkSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      dueDate: new Date().toISOString().slice(0, 16),
      points: 100,
      subjectId: "",
      classCode, // Đảm bảo truyền classCode vào defaultValues
    },
  });
  console.log("HomeworkForm rendered with classCode:", classCode);
  console.log("HomeworkForm rendered with classId:", classId);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError("");
    try {
      const result = await createHomework(
        { success: false, error: false },
        {
          ...data,
          classCode,
          subjectId: data.subjectId ? String(data.subjectId) : undefined,
        }
      );
      if (!result.success) throw new Error("Có lỗi xảy ra khi tạo bài tập");
      router.push(`/teacher/class/${classCode}/homework/list`);
      router.refresh();
    } catch (err) {
      setError("Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề bài tập *</label>
        <input {...register("title")} type="text" className="w-full px-3 py-2 border rounded-md" />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
        <textarea {...register("description")} rows={4} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
        <textarea {...register("content")} rows={5} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hạn nộp *</label>
          <input {...register("dueDate")} type="datetime-local" className="w-full px-3 py-2 border rounded-md" />
          {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Điểm tối đa</label>
          <input {...register("points", { valueAsNumber: true })} type="number" className="w-full px-3 py-2 border rounded-md" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Môn học</label>
        <select {...register("subjectId")} className="w-full px-3 py-2 border rounded-md">
          <option value="">-- Chọn môn học --</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>{subject.name}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={() => router.push(`/teacher/class/${classCode}/homework/list`)}
          className="px-4 py-2 border rounded-md"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Đang tạo..." : "Tạo bài tập"}
        </button>
      </div>
    </form>
  );
}