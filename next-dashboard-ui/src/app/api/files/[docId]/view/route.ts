import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/hooks/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { docId: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { docId } = params;

    // Kiểm tra file có tồn tại không
    const file = await prisma.file.findUnique({
      where: { id: docId },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Kiểm tra xem user đã xem file này chưa
    const existingView = await prisma.fileView.findUnique({
      where: {
        fileId_userId: {
          fileId: docId,
          userId: user.id as string,
        },
      },
    });

    // Chỉ tạo record mới nếu chưa xem bao giờ
    if (!existingView) {
      await prisma.fileView.create({
        data: {
          fileId: docId,
          userId: user.id as string,
          viewedAt: new Date(),
        },
      });
    }
    // Nếu đã có record thì không làm gì cả (giữ nguyên thời gian xem đầu tiên)

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error recording file view:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { docId: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { docId } = params;

    // Kiểm tra file có tồn tại và thuộc về teacher này không
    const file = await prisma.file.findUnique({
      where: { id: docId },
      include: {
        class: {
          select: {
            supervisorId: true,
            students: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Lấy thông tin teacher
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id as string },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Kiểm tra quyền truy cập
    if (file.class?.supervisorId !== teacher.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Lấy danh sách người đã xem
    const viewers = await prisma.fileView.findMany({
      where: { fileId: docId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: {
        viewedAt: "desc",
      },
    });

    // Tính toán thống kê
    const totalStudents = file.class?.students.length || 0;
    const studentViews = viewers.filter(v => v.user.role === "student").length;

    const stats = {
      totalViews: viewers.length,
      studentViews,
      totalStudents,
    };

    const viewersData = viewers.map(view => ({
      id: view.user.id,
      username: view.user.username,
      role: view.user.role,
      viewedAt: view.viewedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      viewers: viewersData,
      stats,
    });
  } catch (error) {
    console.error("Error fetching viewers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}