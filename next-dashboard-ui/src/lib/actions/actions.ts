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
  studentViewPermission = "NO_VIEW",
  blockViewAfterSubmit = false,
  gradingMethod = "FIRST_ATTEMPT",
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
  studentViewPermission?: 'NO_VIEW' | 'SCORE_ONLY' | 'SCORE_AND_RESULT';
  blockViewAfterSubmit?: boolean;
  gradingMethod?: 'FIRST_ATTEMPT' | 'LATEST_ATTEMPT' | 'HIGHEST_ATTEMPT';
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
        studentViewPermission, // Thêm quyền xem điểm
        blockViewAfterSubmit, // Thêm chặn xem lại đề
        gradingMethod, // Thêm thiết lập bảng điểm
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
  studentViewPermission = "NO_VIEW",
  blockViewAfterSubmit = false,
  gradingMethod = "FIRST_ATTEMPT",
  isShuffleQuestions = false,
  isShuffleAnswers = false,
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
  studentViewPermission?: 'NO_VIEW' | 'SCORE_ONLY' | 'SCORE_AND_RESULT';
  blockViewAfterSubmit?: boolean;
  gradingMethod?: 'FIRST_ATTEMPT' | 'LATEST_ATTEMPT' | 'HIGHEST_ATTEMPT';
  isShuffleQuestions?: boolean;
  isShuffleAnswers?: boolean;
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
        studentViewPermission, // Thêm quyền xem điểm
        blockViewAfterSubmit, // Thêm chặn xem lại đề
        gradingMethod, // Thêm thiết lập bảng điểm
        isShuffleQuestions, // Lưu trạng thái đảo câu hỏi
        isShuffleAnswers, // Lưu trạng thái đảo đáp án
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
    // Kiểm tra xem bài tập có tồn tại không trước khi xóa
    const existingHomework = await prisma.homework.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!existingHomework) {
      return { success: false, error: true, message: "Bài tập không tồn tại hoặc đã được xóa" };
    }

    await prisma.homework.delete({
      where: {
        id: parseInt(id),
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: "Có lỗi xảy ra khi xóa bài tập" };
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

    revalidatePath(`/class/${classCode}/member`);
    return { success: true, error: false };
  } catch (err) {
    console.error("Error removing student from class:", err);
    return { success: false, error: true };
  }
};

// Get homework for editing
export async function getHomeworkById(homeworkId: number) {
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

  const homework = await prisma.homework.findUnique({
    where: { id: homeworkId },
    include: {
      questions: {
        orderBy: { questionNumber: 'asc' }
      },
      attachments: true,
      class: true
    }
  });

  if (!homework) {
    throw new Error("Homework not found");
  }

  // Check if teacher owns this homework
  if (homework.teacherId !== teacher.id) {
    throw new Error("Unauthorized to edit this homework");
  }

  return homework;
}

// Update homework with questions
export async function updateHomeworkWithQuestions(
  homeworkId: number,
  questions: Array<{
    id?: number;
    questionNumber: number;
    content?: string;
    answer: string;
    point?: number;
    options?: string[];
  }>
) {
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

  return await prisma.$transaction(async (prisma) => {
    // Verify homework ownership
    const homework = await prisma.homework.findUnique({
      where: { id: homeworkId },
      include: { questions: true }
    });

    if (!homework || homework.teacherId !== teacher.id) {
      throw new Error("Unauthorized to edit this homework");
    }

    // Delete existing questions
    await prisma.question.deleteMany({
      where: { homeworkId: homeworkId }
    });

    // Create new questions
    await prisma.question.createMany({
      data: questions.map((q) => ({
        questionNumber: q.questionNumber,
        content: q.content || `Câu ${q.questionNumber}`,
        answer: q.answer,
        point: q.point ?? undefined,
        options: q.options ?? undefined,
        homeworkId: homeworkId,
        questionType: homework.type === "original" ? "manual" : "multiple_choice",
      })),
    });

    // Update total points
    const totalPoints = questions.reduce((sum, q) => sum + (q.point || 0), 0);
    await prisma.homework.update({
      where: { id: homeworkId },
      data: { points: totalPoints }
    });

    return { success: true };
  });
}

// Update homework settings
export async function updateHomeworkSettings(
  homeworkId: number,
  data: {
    title: string;
    startTime: string;
    endTime: string;
    duration: number;
    maxAttempts: number;
    studentViewPermission: 'NO_VIEW' | 'SCORE_ONLY' | 'SCORE_AND_RESULT';
    blockViewAfterSubmit: boolean;
    gradingMethod: 'FIRST_ATTEMPT' | 'LATEST_ATTEMPT' | 'HIGHEST_ATTEMPT';
    isShuffleQuestions?: boolean;
    isShuffleAnswers?: boolean;
  }
) {
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

  // Verify homework ownership
  const homework = await prisma.homework.findUnique({
    where: { id: homeworkId },
  });

  if (!homework || homework.teacherId !== teacher.id) {
    throw new Error("Unauthorized to edit this homework");
  }

  await prisma.homework.update({
    where: { id: homeworkId },
    data: {
      title: data.title,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      duration: data.duration,
      maxAttempts: data.maxAttempts,
      studentViewPermission: data.studentViewPermission,
      blockViewAfterSubmit: data.blockViewAfterSubmit,
      gradingMethod: data.gradingMethod,
      isShuffleQuestions: data.isShuffleQuestions ?? homework.isShuffleQuestions,
      isShuffleAnswers: data.isShuffleAnswers ?? homework.isShuffleAnswers,
    }
  });

  revalidatePath(`/class/${homework.classCode}/homework`);
  return { success: true };
}