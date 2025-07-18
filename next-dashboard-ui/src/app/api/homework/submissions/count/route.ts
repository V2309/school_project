import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/hooks/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const homeworkId = searchParams.get("homeworkId");

    if (!homeworkId) {
      return NextResponse.json({ success: false, error: "Homework ID is required" }, { status: 400 });
    }

    const count = await prisma.homeworkSubmission.count({
      where: {
        homeworkId: parseInt(homeworkId),
        studentId: user.id as string,
      },
    });

    // Lấy submission mới nhất
    const latestSubmission = await prisma.homeworkSubmission.findFirst({
      where: {
        homeworkId: parseInt(homeworkId),
        studentId: user.id as string,
      },
      orderBy: {
        submittedAt: 'desc',
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      count,
      latestSubmissionId: latestSubmission?.id || null
    });
  } catch (error) {
    console.error("Error counting submissions:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
} 