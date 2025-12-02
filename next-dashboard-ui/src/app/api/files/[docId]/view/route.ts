// app/api/files/[docId]/view/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "@/hooks/auth";

// Khởi tạo 1 instance (nếu bạn chưa có file prisma.ts)
const prisma = new PrismaClient();
// Nếu bạn đã có file lib/prisma.ts, hãy import từ đó:
// import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { docId: string } }
) {
  try {
    const user = await getCurrentUser();

    // 1. Chỉ giáo viên mới có quyền xem thống kê
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fileId = params.docId;

    // 2. Lấy classCode từ file
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      select: { classCode: true },
    });

    if (!file || !file.classCode) {
      return NextResponse.json(
        { error: "File not found or not in a class" },
        { status: 404 }
      );
    }

    const classCode = file.classCode;

    // 3. Lấy danh sách ID học sinh HIỆN TẠI trong lớp
    const classInfo = await prisma.class.findUnique({
      where: { class_code: classCode },
      select: {
        students: {
          select: { id: true },
        },
      },
    });

    if (!classInfo) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const currentStudentIds = classInfo.students.map((s) => s.id);

    // 4. Tính toán số liệu thống kê (Dựa trên học sinh HIỆN TẠI)
    const [studentViewsCount, totalViewsCount] = await prisma.$transaction([
      // Đếm lượt xem chỉ từ học sinh HIỆN TẠI
      prisma.fileView.count({
        where: {
          fileId: fileId, // <-- ĐÃ SỬA: từ documentId thành fileId
          user: {
            student: {
              id: { in: currentStudentIds },
            },
          },
        },
      }),
      // Đếm TẤT CẢ lượt xem (bao gồm cả giáo viên)
      prisma.fileView.count({
        where: {
          fileId: fileId, // <-- ĐÃ SỬA: từ documentId thành fileId
        },
      }),
    ]);

    const stats = {
      totalViews: totalViewsCount,
      studentViews: studentViewsCount, // Chỉ đếm HS hiện tại
      totalStudents: currentStudentIds.length, // Chỉ đếm HS hiện tại
    };

    // 5. Lấy TẤT CẢ người xem (kể cả người đã bị xóa)
    const allViews = await prisma.fileView.findMany({
      where: {
        fileId: fileId, // <-- ĐÃ SỬA: từ documentId thành fileId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            student: {
              // Lấy studentId để so sánh
              select: { id: true },
            },
          },
        },
      },
      orderBy: {
        viewedAt: "desc", // Mới nhất lên đầu
      },
    });

    // 6. Xử lý danh sách, thêm cờ 'isStillInClass'
    const viewers = allViews.map((view) => {
      const isStudent = view.user.role === "student";
      const studentId = view.user.student?.id;

      // Học sinh còn trong lớp = là học sinh VÀ studentId nằm trong danh sách hiện tại
      const isStillInClass =
        view.user.role === "teacher" ||
        (isStudent && studentId && currentStudentIds.includes(studentId));

      return {
        id: view.userId,
        username: view.user.username,
        role: view.user.role,
        viewedAt: view.viewedAt,
        isStillInClass: isStillInClass,
      };
    });

    // 7. Trả về kết quả
    return NextResponse.json({
      success: true,
      stats,
      viewers,
    });
    
  } catch (error) {
    console.error("Error fetching file viewers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}