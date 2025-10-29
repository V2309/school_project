"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/hooks/auth";
import prisma from "@/lib/prisma";
import { ScheduleSchema } from "@/lib/formValidationSchema";

type CurrentState = { success: boolean; error: boolean; message?: string };

// Tạo lịch học mới (Event)
export const createSchedule = async (
  currentState: CurrentState,
  data: ScheduleSchema
): Promise<CurrentState> => {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "teacher") {
      return { success: false, error: true, message: "Unauthorized" };
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id as string },
    });
    if (!teacher) {
      return { success: false, error: true, message: "Teacher not found" };
    }

    // Kiểm tra xem lớp có thuộc về giáo viên này không
    const classExists = await prisma.class.findFirst({
      where: {
        id: data.classId,
        supervisorId: teacher.id,
        deleted: false,
      },
    });

    if (!classExists) {
      return { success: false, error: true, message: "Class not found or access denied" };
    }

    // Kết hợp ngày và thời gian để tạo DateTime
    const startDateTime = new Date(`${data.date}T${data.startTime}:00.000Z`);
    const endDateTime = new Date(`${data.date}T${data.endTime}:00.000Z`);

    // Validate thời gian
    if (endDateTime <= startDateTime) {
      return { success: false, error: true, message: "Thời gian kết thúc phải sau thời gian bắt đầu" };
    }

    // Tạo event
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description || "",
        startTime: startDateTime,
        endTime: endDateTime,
        classId: data.classId,
      },
    });

    revalidatePath("/teacher/schedule");
    return { success: true, error: false, message: "Tạo lịch học thành công!" };
  } catch (err) {
    console.error("Create schedule error:", err);
    return { success: false, error: true, message: "Có lỗi xảy ra khi tạo lịch học" };
  }
};

// Cập nhật lịch học
export const updateSchedule = async (
  currentState: CurrentState,
  data: ScheduleSchema & { id: number }
): Promise<CurrentState> => {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "teacher") {
      return { success: false, error: true, message: "Unauthorized" };
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id as string },
    });
    if (!teacher) {
      return { success: false, error: true, message: "Teacher not found" };
    }

    // Kiểm tra xem event có tồn tại và thuộc về lớp của giáo viên không
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: data.id,
        class: {
          supervisorId: teacher.id,
          deleted: false,
        },
      },
    });

    if (!existingEvent) {
      return { success: false, error: true, message: "Event not found or access denied" };
    }

    // Kết hợp ngày và thời gian để tạo DateTime
    const startDateTime = new Date(`${data.date}T${data.startTime}:00.000Z`);
    const endDateTime = new Date(`${data.date}T${data.endTime}:00.000Z`);

    // Validate thời gian
    if (endDateTime <= startDateTime) {
      return { success: false, error: true, message: "Thời gian kết thúc phải sau thời gian bắt đầu" };
    }

    // Cập nhật event
    await prisma.event.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description || "",
        startTime: startDateTime,
        endTime: endDateTime,
        classId: data.classId,
      },
    });

    revalidatePath("/teacher/schedule");
    return { success: true, error: false, message: "Cập nhật lịch học thành công!" };
  } catch (err) {
    console.error("Update schedule error:", err);
    return { success: false, error: true, message: "Có lỗi xảy ra khi cập nhật lịch học" };
  }
};

// Xóa lịch học
export const deleteSchedule = async (
  currentState: CurrentState,
  data: { id: number }
): Promise<CurrentState> => {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "teacher") {
      return { success: false, error: true, message: "Unauthorized" };
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id as string },
    });
    if (!teacher) {
      return { success: false, error: true, message: "Teacher not found" };
    }

    // Kiểm tra xem event có tồn tại và thuộc về lớp của giáo viên không
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: data.id,
        class: {
          supervisorId: teacher.id,
          deleted: false,
        },
      },
    });

    if (!existingEvent) {
      return { success: false, error: true, message: "Event not found or access denied" };
    }

    // Xóa event
    await prisma.event.delete({
      where: { id: data.id },
    });

    revalidatePath("/teacher/schedule");
    return { success: true, error: false, message: "Xóa lịch học thành công!" };
  } catch (err) {
    console.error("Delete schedule error:", err);
    return { success: false, error: true, message: "Có lỗi xảy ra khi xóa lịch học" };
  }
};

// Lấy danh sách lịch học của giáo viên
export async function getTeacherSchedules() {
  try {
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

    const events = await prisma.event.findMany({
      where: {
        class: {
          supervisorId: teacher.id,
          deleted: false,
        },
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            class_code: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      class: event.class,
    }));
  } catch (error) {
    console.error("Get teacher schedules error:", error);
    return [];
  }
}

// Lấy danh sách lịch học của học sinh (từ các lớp mà học sinh đã tham gia)
export async function getStudentSchedules() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "student") {
      return [];
    }

    const student = await prisma.student.findUnique({
      where: { userId: user.id as string },
      include: {
        classes: {
          where: {
            deleted: false,
          },
          select: {
            id: true,
          },
        },
      },
    });
    if (!student) {
      return [];
    }

    // Lấy tất cả classId mà học sinh tham gia
    const classIds = student.classes.map(cls => cls.id);

    if (classIds.length === 0) {
      return [];
    }

    const events = await prisma.event.findMany({
      where: {
        classId: {
          in: classIds,
        },
        class: {
          deleted: false,
        },
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            class_code: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      class: event.class,
    }));
  } catch (error) {
    console.error("Get student schedules error:", error);
    return [];
  }
}