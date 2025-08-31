"use server";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/hooks/auth";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose"; // Uncomment if you need to verify JWT

import { z } from "zod";
import { UploadResponse } from "imagekit/dist/libs/interfaces";
import { imagekit } from "./utils";
// import . env

import {
  ClassSchema,
  ExamSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  HomeworkSchema,
} from "./formValidationSchema";

import { clerkClient } from "@clerk/nextjs/server";

type CurrentState = { success: boolean; error: boolean };

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// Hàm tạo mã lớp học ngẫu nhiên

function generateClassId(length = 5) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const imgs= [
  "/school.jpg",
  "/school1.jpg",
  "/school2.jpg",
  "/school3.jpg",
  "/school4.jpg",
  "/school5.jpg",
  "/school6.jpg",
]
// hàm tảo ảnh lớp ngẫu nhiên
function generateRandomCoverImage() {
  const index = Math.floor(Math.random() * imgs.length);
  return imgs[index];
}

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "teacher") {
      return { success: false, error: true };
    }
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id as string },
    });
    if (!teacher) {
      return { success: false, error: true };
    }
    const classId = generateClassId();
    await prisma.class.create({
      data: {
        ...data,
        class_code: classId,
        supervisorId: teacher.id,
        img: generateRandomCoverImage(),
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// Server Action để cập nhật lớp học với đầy đủ thông tin
export const updateClassWithDetails = async (formData: FormData, classCode: string) => {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "teacher") {
      return { success: false, error: "Unauthorized" };
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id as string },
    });
    if (!teacher) {
      return { success: false, error: "Teacher not found" };
    }

    // Lấy dữ liệu từ form
    const name = formData.get("name")?.toString()?.trim();
    const protectionCode = formData.get("protectionCode") === "on";
    const lockClass = formData.get("lockClass") === "on";
    const approveStudents = formData.get("approveStudents") === "on";
    const blockLeave = formData.get("blockLeave") === "on";
    const allowGradesView = formData.get("allowGradesView") === "on";
    const gradeId = formData.get("gradeId")?.toString();
    const newGradeLevel = formData.get("newGradeLevel")?.toString()?.trim();
    const newImageUrl = formData.get("imageUrl")?.toString()?.trim(); // URL từ ImageUpload component

    // Debug: Log dữ liệu nhận được
    console.log("Form data received:", {
      name,
      protectionCode,
      lockClass,
      approveStudents,
      blockLeave,
      allowGradesView,
      gradeId,
      newGradeLevel,
      newImageUrl,
      classCode
    });

    // Kiểm tra xem lớp có tồn tại và thuộc về teacher này không
    const existingClass = await prisma.class.findUnique({
      where: { class_code: classCode, supervisorId: teacher.id },
    });
    if (!existingClass) {
      return { success: false, error: "Class not found or unauthorized" };
    }

    // Xử lý grade: nếu có newGradeLevel thì tạo grade mới
    let finalGradeId = gradeId ? parseInt(gradeId) : existingClass.gradeId;
    
    if (newGradeLevel && newGradeLevel !== "") {
      // Kiểm tra xem grade đã tồn tại chưa
      const existingGrade = await prisma.grade.findUnique({
        where: { level: newGradeLevel },
      });
      
      if (existingGrade) {
        finalGradeId = existingGrade.id;
      } else {
        // Tạo grade mới
        const newGrade = await prisma.grade.create({
          data: { level: newGradeLevel },
        });
        finalGradeId = newGrade.id;
      }
    }

    // Xử lý ảnh: sử dụng URL từ ImageUpload component
    const finalImageUrl = newImageUrl || existingClass.img;

    // Cập nhật vào database
    const updateData = {
      name: name && name.length > 0 ? name : existingClass.name,
      gradeId: finalGradeId,
      img: finalImageUrl,
      isProtected: protectionCode,
      isLocked: lockClass,
      requiresApproval: approveStudents,
      blockLeave: blockLeave,
      allowGradesView: allowGradesView,
    };

    console.log("Updating class with data:", updateData);

    await prisma.class.update({
      where: { class_code: classCode },
      data: updateData,
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// Server Action để tạo grade mới
export const createGrade = async (gradeLevel: string) => {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "teacher") {
      return { success: false, error: "Unauthorized" };
    }

    if (!gradeLevel || gradeLevel.trim() === "") {
      return { success: false, error: "Grade level is required" };
    }

    // Kiểm tra xem grade đã tồn tại chưa
    const existingGrade = await prisma.grade.findUnique({
      where: { level: gradeLevel.trim() },
    });
    if (existingGrade) {
      return { success: false, error: "Grade already exists" };
    }

    // Tạo grade mới
    const newGrade = await prisma.grade.create({
      data: { level: gradeLevel.trim() },
    });

    return { success: true, error: false, data: newGrade };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};


const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY ||
    "71ae05550c898138fc632e4e6c0fba3f14cc10104e5697f19eb6fde9467b8d0cd19ab1faaa659f982a4c479d7f3d8827f815043d5064bec6b0c1d6e45842b77a"
);

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: email }, { phone: email }],
    },
  });

  if (!user) {
    return { error: "Tài khoản không tồn tại." };
  }

  const isMatch = await compare(password, user.password);
  if (!isMatch) {
    return { error: "Mật khẩu không đúng." };
  }

  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(JWT_SECRET);
  console.log("LoginAction - Token created:", token);

  cookies().set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
    secure: process.env.NODE_ENV === "production",
  });
  console.log("LoginAction - Cookie set:", cookies().get("session"));
  console.log(process.env.NODE_ENV);
  if (user.role === "teacher") {
    console.log("LoginAction - Redirecting to /teacher/class");
    //window.dispatchEvent(new Event("user-logged-in"));
    redirect("/teacher/class");
  } else if (user.role === "student") {
    console.log("LoginAction - Redirecting to /student/overview");

    redirect("/student/overview");
  }

  return { success: true, role: user.role };
}

export async function logoutAction() {
  cookies().delete("session");
  console.log("LogoutAction - Cookie session deleted");

  redirect("/");
}

// tham gia lớp học và kiểm tra xem học sinh đã tham gia lớp học hay chưa
export const joinClassAction = async (classCode: string) => {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Lấy thông tin student và các lớp đã tham gia
    const student = await prisma.student.findUnique({
      where: { userId: user.id as string },
      include: { classes: true },
    });
    if (!student) {
      return { success: false, error: "Không tìm thấy thông tin học sinh." };
    }

    // Tìm lớp theo mã
    const classToJoin = await prisma.class.findUnique({
      where: { class_code: classCode },
    });
    if (!classToJoin) {
      return { success: false, error: "Lớp không tồn tại" };
    }

    // Kiểm tra xem học sinh đã tham gia lớp này chưa
    const alreadyJoined = student.classes.some(cls => cls.id === classToJoin.id);
    if (alreadyJoined) {
      return { success: false, error: "Bạn đã tham gia lớp học này rồi nhé" };
    }

    // Thêm học sinh vào lớp
    await prisma.student.update({
      where: { userId: user.id as string },
      data: {
        classes: {
          connect: { id: classToJoin.id },
        },
      },
    });

    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Đã xảy ra lỗi khi tham gia lớp" };
  }
};
// hiện thị tất cả  danh sách lớp hiện tại đã tham gia của học sinh
export async function getStudentClasses() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    return [];
  }

  const student = await prisma.student.findUnique({
    where: { userId: user.id as string },
    include: {
      classes: true, // Lấy tất cả các lớp học sinh tham gia
    },
  });

  if (!student) {
    return [];
  }

  return student.classes; // Trả về tất cả các lớp
}


export async function createHomeworkWithQuestions({
  title,
  class_code,
  fileUrl,
  fileName,
  fileType,
  points,
  questions,
  duration,
  startTime,
  deadline,
  attempts,
  type = "original", // Thêm type để phân biệt
}: {
  title: string;
  class_code: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  points: number;
  questions: Array<{ questionNumber: number; answer: string; point?: number }>;
  duration: number;
  startTime: string; // ISO string
  deadline: string; // ISO string
  attempts: number;
  type?: string; // "original" hoặc "extracted"
}) {
  // 1. Xác thực người dùng
  const user = await getCurrentUser();
  if (!user || user.role !== "teacher") {
    throw new Error("Unauthorized");
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id as string },
  });
  if (!teacher) {
    throw new Error("Teacher not found");
  }

  // 2. Kiểm tra lớp học
  const classRecord = await prisma.class.findUnique({
    where: { class_code: class_code, supervisorId: teacher.id },
  });
  if (!classRecord) {
    throw new Error("Class not found or unauthorized");
  }

  // 3. Tạo transaction
  return await prisma.$transaction(async (prisma) => {
    // Tạo bài tập
    const homework = await prisma.homework.create({
      data: {
        title,
        description: `Bài tập có ${questions.length} câu hỏi`,
        type, // Lưu loại bài tập
        originalFileUrl: fileUrl, // Lưu URL file gốc
        originalFileName: fileName, // Lưu tên file gốc
        originalFileType: fileType, // Lưu loại file gốc
        startTime: new Date(startTime),
        endTime: new Date(deadline),
        duration,
        maxAttempts: attempts,
        points,
        classCode: classRecord.class_code,
        teacherId: teacher.id,
        attachments: {
          create: {
            name: fileName,
            url: fileUrl,
            type: fileType,
            size: 0, // Cập nhật size thực tế khi upload
          },
        },
      },
      include: { attachments: true },
    });

    // Tạo các câu hỏi
    await prisma.question.createMany({
      data: questions.map((q) => ({
        questionNumber: q.questionNumber,
        content: `Câu ${q.questionNumber}`,
        answer: q.answer,
        point: q.point ?? undefined,
        homeworkId: homework.id,
        questionType: type === "original" ? "manual" : "multiple_choice", // Phân loại câu hỏi
      })),
    });

    return homework;
  });
}

// Thêm function mới cho homework dạng tách câu tự động
export async function createHomeworkFromExtractedQuestions({
  title,
  class_code,
  originalFileUrl,
  originalFileName,
  originalFileType,
  extractedQuestions,
  duration,
  startTime,
  deadline,
  attempts,
}: {
  title: string;
  class_code: string;
  originalFileUrl?: string;
  originalFileName?: string;
  originalFileType?: string;
  extractedQuestions: Array<{
    question_number: number;
    question_text: string;
    options: string[];
    correct_answer_char: string;
    correct_answer_index: number;
    point: number;
  }>;
  duration: number;
  startTime: string;
  deadline: string;
  attempts: number;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "teacher") {
    throw new Error("Unauthorized");
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id as string },
  });
  if (!teacher) {
    throw new Error("Teacher not found");
  }

  const classRecord = await prisma.class.findUnique({
    where: { class_code: class_code, supervisorId: teacher.id },
  });
  if (!classRecord) {
    throw new Error("Class not found or unauthorized");
  }

  const totalPoints = extractedQuestions.reduce((sum, q) => sum + q.point, 0);

  return await prisma.$transaction(async (prisma) => {
    // Tạo bài tập
    const homework = await prisma.homework.create({
      data: {
        title,
        description: `Bài tập trắc nghiệm tự động có ${extractedQuestions.length} câu hỏi`,
        type: "extracted",
        originalFileUrl,
        originalFileName,
        originalFileType,
        startTime: new Date(startTime),
        endTime: new Date(deadline),
        duration,
        maxAttempts: attempts,
        points: totalPoints,
        classCode: classRecord.class_code,
        teacherId: teacher.id,
      },
      include: { attachments: true },
    });

    // Tạo các câu hỏi từ dữ liệu đã tách
    await prisma.question.createMany({
      data: extractedQuestions.map((q) => ({
        questionNumber: q.question_number,
        content: q.question_text,
        questionType: "multiple_choice",
        options: q.options, // Lưu dưới dạng JSON
        answer: q.correct_answer_char,
        point: q.point,
        homeworkId: homework.id,
      })),
    });

    return homework;
  });
}
// xóa bài tập

export const deleteHomework = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.homework.delete({
      where: {
        id: parseInt(id),
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};



// add post cho lớp học cụ thể
export const addPostToClass = async (
  prevState: { success: boolean; error: boolean },
  formData: FormData
) => {
  const user = await getCurrentUser();

  if (!user) return { success: false, error: true };

  const desc = formData.get("desc") as string;
  const file = formData.get("file") as File;
  const classCode = formData.get("classCode") as string;

  // Kiểm tra classCode
  if (!classCode) {
    return { success: false, error: true };
  }

  // Xác thực người dùng có quyền post vào lớp này không
  if (user.role === "teacher") {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id as string },
    });
    if (!teacher) {
      return { success: false, error: true };
    }
    
    const classExists = await prisma.class.findFirst({
      where: { 
        class_code: classCode,
        supervisorId: teacher.id 
      },
    });
    
    if (!classExists) {
      return { success: false, error: true };
    }
  } else if (user.role === "student") {
    const student = await prisma.student.findUnique({
      where: { userId: user.id as string },
      include: { classes: true },
    });
    
    if (!student) {
      return { success: false, error: true };
    }
    
    const isInClass = student.classes.some(cls => cls.class_code === classCode);
    if (!isInClass) {
      return { success: false, error: true };
    }
  }

  let img = "";
  let imgHeight = 0;
  let video = "";

  if (file && file.size > 0) {
    const uploadFile = async (file: File): Promise<UploadResponse> => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      return new Promise((resolve, reject) => {
        imagekit.upload(
          {
            file: buffer,
            fileName: file.name,
            folder: "/posts",
          },
          function (error, result) {
            if (error) reject(error);
            else resolve(result as UploadResponse);
          }
        );
      });
    };

    try {
      const result: UploadResponse = await uploadFile(file);
      if (result.fileType === "image") {
        img = result.filePath;
        imgHeight = result.height || 0;
      } else {
        video = result.filePath;
      }
    } catch (error) {
      console.log("Upload error:", error);
    }
  }

  try {
    await prisma.post.create({
      data: {
        desc,
        userId: user.id as string,
        classCode,
        img,
        imgHeight,
        video,
        isSensitive: false,
      },
    });
    
    revalidatePath(`/teacher/class/${classCode}/newsfeed`);
    revalidatePath(`/student/class/${classCode}/newsfeed`);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};