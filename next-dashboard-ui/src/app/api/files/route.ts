import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "@/lib/hooks/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, url, type, size, classCode } = body;

    if (!name || !url || !type || !size) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Tạo record file trong database
    const file = await prisma.file.create({
      data: {
        name,
        url,
        type,
        size,
        uploadedBy: user.id as string,
        classCode: classCode || null,
      },
      include: {
        teacher: {
          select: {
            username: true,
          },
        },
        class: {
          select: {
            name: true,
            class_code: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      file,
      message: "File saved successfully",
    });
  } catch (error) {
    console.error("Error saving file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classCode = searchParams.get("classCode");
    const search = searchParams.get("search");

    let whereClause: any = {};
    
    if (user.role === "teacher") {
      whereClause.uploadedBy = user.id;
    }
    
    if (classCode) {
      whereClause.classCode = classCode;
    }

    // Thêm điều kiện search
    if (search) {
      whereClause.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const files = await prisma.file.findMany({
      where: whereClause,
      include: {
        teacher: {
          select: {
            username: true,
          },
        },
        class: {
          select: {
            name: true,
            class_code: true,
          },
        },
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      files,
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
