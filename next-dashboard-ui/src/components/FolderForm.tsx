"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { folderSchema } from "@/lib/formValidationSchema";
import { z } from "zod";
import { updateFolder } from "@/lib/actions/file.action";

type FormData = z.infer<typeof folderSchema>;

interface FolderFormProps {
  type: "create" | "update";
  data?: {
    id: string;
    name: string;
    classCode: string;
  };
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
}

const FolderForm = ({ type, data, setOpen, onSuccess }: FolderFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(folderSchema),
    defaultValues: {
      name: data?.name || "",
      classCode: data?.classCode || "",
    },
  });

  const onSubmit = async (formData: FormData) => {
    try {
      if (type === "update" && data?.id) {
        const result = await updateFolder({
          id: data.id,
          ...formData,
        });

        if (result.success) {
          toast.success(result.message || "Cập nhật thư mục thành công!");
          setOpen(false);
          onSuccess?.();
        } else {
          toast.error(result.message || "Có lỗi xảy ra!");
        }
      }
    } catch (error) {
    
      toast.error("Có lỗi xảy ra khi cập nhật thư mục!");
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Tạo thư mục mới" : "Chỉnh sửa thư mục"}
      </h1>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Tên thư mục</label>
        <input
          type="text"
          {...register("name")}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          placeholder="Nhập tên thư mục..."
        />
        {errors.name && (
          <p className="text-xs text-red-400">{errors.name.message}</p>
        )}
      </div>

      {/* Hidden field for classCode */}
      <input type="hidden" {...register("classCode")} />

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-400 text-white p-2 rounded-md disabled:bg-blue-200"
        >
          {isSubmitting ? "Đang xử lý..." : (type === "create" ? "Tạo" : "Cập nhật")}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="bg-gray-400 text-white p-2 rounded-md"
        >
          Hủy
        </button>
      </div>
    </form>
  );
};

export default FolderForm;