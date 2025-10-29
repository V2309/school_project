import { z } from "zod";

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()), //teacher ids
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity name is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade name is required!" }),
  supervisorId: z.coerce.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  subjects: z.array(z.string()).optional(), // subject ids
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const scheduleSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Tên buổi học là bắt buộc!" }),
  description: z.string().optional(),
  classId: z.coerce.number().min(1, { message: "Vui lòng chọn lớp học!" }),
  date: z.string().min(1, { message: "Vui lòng chọn ngày học!" }),
  startTime: z.string().min(1, { message: "Vui lòng chọn thời gian bắt đầu!" }),
  endTime: z.string().min(1, { message: "Vui lòng chọn thời gian kết thúc!" }),
});

export type ScheduleSchema = z.infer<typeof scheduleSchema>;

export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  parentId: z.string().min(1, { message: "Parent Id is required!" }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});

export type ExamSchema = z.infer<typeof examSchema>;


export const homeworkSchema = z.object({
  title: z.string().min(1, "Tên bài tập là bắt buộc"),
  description: z.string().optional(),
  content: z.string().optional(),
  startTime: z.string().min(1, "Thời gian bắt đầu là bắt buộc"),
  endTime: z.string().min(1, "Hạn chót nộp bài là bắt buộc"),
  duration: z.number()
    .min(1, "Thời lượng làm bài phải ít nhất 1 phút")
    .max(600, "Thời lượng làm bài không được vượt quá 600 phút"),
  maxAttempts: z.number()
    .min(1, "Số lần làm bài phải ít nhất 1 lần")
    .max(10, "Số lần làm bài không được vượt quá 10 lần")
    .optional().or(z.literal('')),
  points: z.number()
    .min(1, "Tổng điểm phải ít nhất 1 điểm")
    .max(1000, "Tổng điểm không được vượt quá 1000 điểm")
    .optional(),
  numQuestions: z.number()
    .min(1, "Số lượng câu hỏi phải ít nhất 1 câu")
    .optional(),
  subjectId: z.string().optional(),
  classCode: z.string().min(1, "Yêu cầu chọn lớp học"),
}).refine((data) => {
  const startDate = new Date(data.startTime);
  const endDate = new Date(data.endTime);
  const now = new Date();
  
  // Kiểm tra thời gian bắt đầu phải lớn hơn thời gian hiện tại
  if (startDate <= now) {
    return false;
  }
  
  // Kiểm tra thời gian bắt đầu phải nhỏ hơn thời gian kết thúc
  if (startDate >= endDate) {
    return false;
  }
  
  return true;
}, {
  message: "Thời gian bắt đầu phải sau thời điểm hiện tại và trước thời gian kết thúc",
  path: ["startTime"],
}).refine((data) => {
  const startDate = new Date(data.startTime);
  const endDate = new Date(data.endTime);
  
  // Kiểm tra thời gian kết thúc phải lớn hơn thời gian bắt đầu
  if (endDate <= startDate) {
    return false;
  }
  
  return true;
}, {
  message: "Hạn chót nộp bài phải sau thời gian bắt đầu",
  path: ["endTime"],
});

export type HomeworkSchema = z.infer<typeof homeworkSchema>;

// validation schema cho form đăng ký


export const signupSchema = z.object({
  username: z.string().min(3, { message: "Tên người dùng phải có ít nhất 3 ký tự!" }).max(50, { message: "Tên người dùng không được quá 50 ký tự!" }),
  class_name: z.string().min(1, { message: "Lớp học là bắt buộc!" }),
  school: z.string().min(1, { message: "Tên trường là bắt buộc!" }),
  birthday: z.string().min(1, { message: "Ngày sinh là bắt buộc!" }),
  province: z.string().min(1, { message: "Tỉnh/Thành phố là bắt buộc!" }),
  info: z.string().min(1, { message: "Email hoặc số điện thoại là bắt buộc!" })
    .refine((val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[0-9]{10,11}$/;
      return emailRegex.test(val) || phoneRegex.test(val);
    }, { message: "Vui lòng nhập email hợp lệ hoặc số điện thoại (10-11 chữ số)!" }),
  role: z.enum(["student", "teacher"], { message: "Vui lòng chọn vai trò!" }),
  password: z.string().min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự!" }),
  "confirm-password": z.string().min(1, { message: "Vui lòng xác nhận mật khẩu!" }),
  terms: z.boolean().refine((v) => v === true, { message: "Bạn phải đồng ý với điều khoản dịch vụ!" }),
}).refine((data) => data.password === data["confirm-password"], {
  message: "Mật khẩu xác nhận không khớp!",
  path: ["confirm-password"],
});

export type SignupSchema = z.infer<typeof signupSchema>;

// Course Schema  
export const courseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "Tiêu đề khóa học là bắt buộc!" }),
  description: z.string().optional().default(""),
  thumbnailUrl: z.string().optional().default(""), // Tự động tạo từ video YouTube
  folderId: z.string().optional().nullable(),
  classCode: z.string().min(1, { message: "Mã lớp học là bắt buộc!" }),
  chapters: z.string().optional().default("[]"),
  // Fields cho folder mới (tùy chọn)
  newFolderName: z.string().optional().default(""),
  newFolderDescription: z.string().optional().default(""),
  newFolderColor: z.string().optional().default("#3B82F6"),
});

export type CourseSchema = z.infer<typeof courseSchema>;

// Folder Schema
export const folderSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Tên thư mục không được để trống"),
  description: z.string().nullable().optional(),
  color: z.string().optional(),
  classCode: z.string().min(1),
});

export type FolderSchema = z.infer<typeof folderSchema>;