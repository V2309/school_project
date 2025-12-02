// app/api/user/classes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/hooks/auth";
import prisma from "@/lib/prisma";



export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let classes: Array<{ class_code: string | null }> = [];

    if (user.role === "student") {
      const student = await prisma.student.findUnique({
        where: { userId: user.id as string },
        include: {
          classes: {
            where: { deleted: false },
            select: { class_code: true },
          },
        },
      });
      if (student) {
        classes = student.classes;
      }
    } else if (user.role === "teacher") {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: user.id as string },
        include: {
          classes: {
            where: { deleted: false },
            select: { class_code: true },
          },
        },
      });
      if (teacher) {
        classes = teacher.classes;
      }
    }

    return NextResponse.json(classes);
  } catch (error) {
    console.error("[API] Error fetching user classes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}




