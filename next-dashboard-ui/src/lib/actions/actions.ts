"use server";
import prisma from "@/lib/prisma";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/hooks/auth";


import {
  HomeworkSchema,
  homeworkSchema,


} from "../formValidationSchema";

type CurrentState = { success: boolean; error: boolean };

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
  // Validation với homeworkSchema
  const totalPoints = Math.round(extractedQuestions.reduce((sum, q) => sum + q.point, 0) * 100) / 100;
  const validationData = {
    title,
    startTime,
    endTime: deadline,
    duration,
    maxAttempts: attempts,
    points: totalPoints,
    numQuestions: extractedQuestions.length,
    classCode: class_code,
  };

  const validationResult = homeworkSchema.safeParse(validationData);
  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors.map(err => err.message).join(', ');
    throw new Error(`Validation failed: ${errorMessages}`);
  }

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
        point: Math.round(q.point * 100) / 100, // Làm tròn điểm khi lưu
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




// Remove student from class
export const removeStudentFromClass = async (
  currentState: CurrentState,
  formData: FormData
) => {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "teacher") {
      return { success: false, error: true };
    }

    const studentId = formData.get("id") as string;
    const classCode = formData.get("classCode") as string;

    if (!studentId || !classCode) {
      return { success: false, error: true };
    }

    // Kiểm tra teacher có quyền truy cập lớp học không
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id as string },
    });

    if (!teacher) {
      return { success: false, error: true };
    }

    const classRoom = await prisma.class.findFirst({
      where: {
        class_code: classCode,
        supervisorId: teacher.id,
        deleted: false,
      },
    });

    if (!classRoom) {
      return { success: false, error: true };
    }

    // Remove student from class (disconnect the relation)
    await prisma.student.update({
      where: { id: studentId },
      data: {
        classes: {
          disconnect: { class_code: classCode },
        },
      },
    });

    revalidatePath(`/teacher/class/${classCode}/member`);
    return { success: true, error: false };
  } catch (err) {
    console.error("Error removing student from class:", err);
    return { success: false, error: true };
  }
};