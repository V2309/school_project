"use server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/hooks/auth";
import {  ClassSchema} from "../formValidationSchema";

 type CurrentState = { success: boolean; error: boolean };
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

// Xóa mềm lớp học
export const softDeleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
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

    // Kiểm tra quyền sở hữu lớp học
    const classRecord = await prisma.class.findUnique({
      where: { 
        id: parseInt(id),
        supervisorId: teacher.id 
      },
    });
    if (!classRecord) {
      return { success: false, error: true };
    }

    await prisma.class.update({
      where: {
        id: parseInt(id),
      },
      data: {
        deleted: true,
        deletedAt: new Date(),
      },
    });
   
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// Khôi phục lớp học
export const restoreClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
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

    // Kiểm tra quyền sở hữu lớp học
    const classRecord = await prisma.class.findUnique({
      where: { 
        id: parseInt(id),
        supervisorId: teacher.id 
      },
    });
    if (!classRecord) {
      return { success: false, error: true };
    }

    await prisma.class.update({
      where: {
        id: parseInt(id),
      },
      data: {
        deleted: false,
        deletedAt: null,
      },
    });

  
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// Giữ lại hàm deleteClass cũ để tương thích
export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  // Chuyển hướng sang xóa mềm
  return await softDeleteClass(currentState, data);
};


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
// hiện thị tất cả  danh sách lớp hiện tại đã tham gia của học sinh (chỉ lớp chưa bị xóa)
export async function getStudentClasses() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    return [];
  }

  const student = await prisma.student.findUnique({
    where: { userId: user.id as string },
    include: {
      classes: {
        where: {
          deleted: false, // Chỉ lấy lớp chưa bị xóa
        },
      },
    },
  });

  if (!student) {
    return [];
  }

  return student.classes; // Trả về tất cả các lớp chưa bị xóa
}

// Lấy danh sách lớp của giáo viên (chỉ lớp chưa bị xóa)
export async function getTeacherClasses(includeDeleted: boolean = false) {
  const user = await getCurrentUser();
  if (!user || user.role !== "teacher") {
    return [];
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id as string },
    include: {
      classes: {
        where: includeDeleted ? {} : { deleted: false },
        include: {
          supervisor: {
            select: { username: true },
          },
          _count: {
            select: { students: true },
          },
        },
      },
    },
  });

  if (!teacher) {
    return [];
  }

  return teacher.classes;
}

// Lấy danh sách lớp đã bị xóa mềm
export async function getDeletedClasses() {
  const user = await getCurrentUser();
  if (!user || user.role !== "teacher") {
    return [];
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id as string },
  });
  if (!teacher) {
    return [];
  }

  const deletedClasses = await prisma.class.findMany({
    where: {
      supervisorId: teacher.id,
      deleted: true,
    },
    include: {
      supervisor: {
        select: { username: true },
      },
      _count: {
        select: { students: true },
      },
    },
  });

  return deletedClasses;
}