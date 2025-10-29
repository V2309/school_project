"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Search, Clock, Calendar, Users } from "lucide-react";
import moment from "moment";
import { getTeacherClasses } from "@/lib/actions/class.action";
import { createSchedule, updateSchedule } from "@/lib/actions/schedule.action";
import { scheduleSchema, ScheduleSchema } from "@/lib/formValidationSchema";

type FormData = ScheduleSchema;

interface ScheduleFormProps {
  type: "create" | "update";
  data?: {
    id: number;
    title: string;
    description?: string;
    classId: number;
    date: string;
    startTime: string;
    endTime: string;
  };
  selectedDate?: Date; // Ngày được chọn từ calendar
  setOpen: Dispatch<SetStateAction<boolean>>;
  onSuccess?: () => void;
}

const ScheduleForm = ({ type, data, selectedDate, setOpen, onSuccess }: ScheduleFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Chọn lớp, 2: Nhập thông tin
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      title: data?.title || "",
      description: data?.description || "",
      classId: data?.classId || 0,
      date: selectedDate ? moment(selectedDate).format("YYYY-MM-DD") : data?.date || "",
      startTime: data?.startTime || "07:00",
      endTime: data?.endTime || "08:30",
    },
  });

  // Load teacher classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        const teacherClasses = await getTeacherClasses();
        const formattedClasses = teacherClasses.map((cls: any) => ({
          id: cls.id.toString(),
          name: cls.name,
          img: cls.img, 
          class_code: cls.class_code || "",
          studentCount: cls._count?.students || 0,
          color: cls.img || "#3B82F6", 
        // Dùng img field làm color hoặc default
        }));
        setClasses(formattedClasses);
      } catch (error) {
        console.error("Error fetching classes:", error);
        toast.error("Không thể tải danh sách lớp học");
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  // Filter classes based on search term
  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.class_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClassSelect = (classItem: any) => {
    setSelectedClass(classItem);
    setValue("classId", parseInt(classItem.id));
  };

  const handleNextStep = () => {
    if (!selectedClass) {
      toast.error("Vui lòng chọn lớp học");
      return;
    }
    setCurrentStep(2);
  };

  const handleBackStep = () => {
    setCurrentStep(1);
  };

  const onSubmit = handleSubmit(async (formData) => {
    setIsLoading(true);
    try {
      let result;
      
      if (type === "create") {
        result = await createSchedule({ success: false, error: false }, formData);
      } else if (type === "update" && data?.id) {
        result = await updateSchedule(
          { success: false, error: false },
          { ...formData, id: data.id }
        );
      }

      if (result?.success) {
        toast.success(result.message || (type === "create" ? "Tạo lịch học thành công!" : "Cập nhật lịch học thành công!"));
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(result?.message || "Có lỗi xảy ra, vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  });

  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        variants={formVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white rounded-lg shadow-xl max-w-lg  w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            {currentStep === 2 && (
              <button
                onClick={handleBackStep}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {type === "create" ? "Tạo lịch học" : "Chỉnh sửa lịch học"}
              {currentStep === 1 ? " - Chọn lớp" : " - Thông tin buổi học"}
            </h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="px-6 py-3 border-b bg-gray-50">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium
                ${currentStep >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                1
              </div>
              <span className="text-sm font-medium">Chọn lớp</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium
                ${currentStep >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                2
              </div>
              <span className="text-sm font-medium">Thông tin</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm lớp học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm
                           focus:border-blue-500 focus:ring-blue-500 transition duration-200"
                />
              </div>

        

              {/* Class list */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {loadingClasses ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredClasses.length > 0 ? (
                  filteredClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    onClick={() => handleClassSelect(classItem)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md
                      ${selectedClass?.id === classItem.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Class avatar */}
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: classItem.color }}
                      >
                        <img src={classItem.img} alt={classItem.name} className="w-12 h-12 rounded-lg object-cover" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{classItem.name}</h3>
                        <p className="text-sm text-gray-500">Mã lớp: {classItem.class_code}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{classItem.studentCount} học sinh</span>
                        </div>
                      </div>

                      {/* Selection indicator */}
                      {selectedClass?.id === classItem.id && (
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p>Không tìm thấy lớp học nào</p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg 
                           hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!selectedClass}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg 
                           hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  Tiếp theo
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Selected class info */}
              {selectedClass && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: selectedClass.color }}
                    >
                      {selectedClass.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">{selectedClass.name}</p>
                      <p className="text-sm text-blue-600">Mã lớp: {selectedClass.class_code}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule title */}
              <div className="space-y-1">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Tên buổi học *
                </label>
                <input
                  type="text"
                  id="title"
                  {...register("title")}
                  className="block w-full rounded-lg border border-gray-300 shadow-sm p-3 text-sm
                           focus:border-blue-500 focus:ring-blue-500 transition duration-200
                           hover:border-gray-400"
                  placeholder="Ví dụ: Môn Toán - Chương 1"
                />
                {errors.title && (
                  <p className="text-xs text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Mô tả
                </label>
                <textarea
                  id="description"
                  {...register("description")}
                  rows={2}
                  className="block w-full rounded-lg border border-gray-300 shadow-sm p-3 text-sm
                           focus:border-blue-500 focus:ring-blue-500 transition duration-200
                           hover:border-gray-400 resize-none"
                  placeholder="Mô tả nội dung buổi học..."
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 gap-4">
                {/* Date */}
                <div className="space-y-1">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Ngày học *
                  </label>
                  <input
                    type="date"
                    id="date"
                    {...register("date")}
                    className="block w-full rounded-lg border border-gray-300 shadow-sm p-3 text-sm
                             focus:border-blue-500 focus:ring-blue-500 transition duration-200
                             hover:border-gray-400"
                  />
                  {errors.date && (
                    <p className="text-xs text-red-500">{errors.date.message}</p>
                  )}
                </div>

                {/* Time range */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Bắt đầu *
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      {...register("startTime")}
                      className="block w-full rounded-lg border border-gray-300 shadow-sm p-3 text-sm
                               focus:border-blue-500 focus:ring-blue-500 transition duration-200
                               hover:border-gray-400"
                    />
                    {errors.startTime && (
                      <p className="text-xs text-red-500">{errors.startTime.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                      Kết thúc *
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      {...register("endTime")}
                      className="block w-full rounded-lg border border-gray-300 shadow-sm p-3 text-sm
                               focus:border-blue-500 focus:ring-blue-500 transition duration-200
                               hover:border-gray-400"
                    />
                    {errors.endTime && (
                      <p className="text-xs text-red-500">{errors.endTime.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Hidden fields */}
              <input type="hidden" {...register("classId")} />

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t">
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg 
                           hover:bg-gray-200 transition-colors"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg 
                           hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading 
                    ? (type === "create" ? "Đang tạo..." : "Đang cập nhật...") 
                    : (type === "create" ? "Tạo lịch học" : "Cập nhật")
                  }
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ScheduleForm;