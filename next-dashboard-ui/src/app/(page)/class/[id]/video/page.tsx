// app/(page)/class/[id]/video/page.tsx - Support both Teacher and Student roles

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/hooks/auth";
import { Course, Video, Folder as PrismaFolder, Teacher, Student, Prisma } from "@prisma/client";
import VideoList from "@/components/VideoPageClient"; // Đổi tên component client cho phù hợp
import { ITEM_PER_PAGE } from "@/lib/setting";

// Giữ nguyên type này, nó vẫn rất hữu ích
export type CourseWithDetails = Course & {
    videos: Video[];
    folder: PrismaFolder | null;
    teacher: Teacher;
    _count: {
        videos: number;
    };
};

export type FolderWithCourseCount = PrismaFolder & {
    _count: {
        courses: number;
    }
}

// Server Component
export default async function VideoPage({
    params,
    searchParams,
}: {
    params: { id: string };
    searchParams: { [key: string]: string | undefined };
}) {
    // 1. Lấy và xác thực người dùng
    const user = await getCurrentUser();
    const role = user?.role;
    if (!user || (user.role !== "teacher" && user.role !== "student")) {
        return <div>Bạn không có quyền truy cập.</div>;
    }

    const classCode = params.id;
    let teacherId: string;

    // 2. Kiểm tra quyền truy cập lớp học theo role
    if (user.role === "teacher") {
        const teacher = await prisma.teacher.findUnique({
            where: { userId: user.id as string },
        });

        if (!teacher) {
            return <div>Không tìm thấy thông tin giáo viên.</div>;
        }

        teacherId = teacher.id;

        // Kiểm tra quyền truy cập lớp học (teacher phải là supervisor)
        const classRoom = await prisma.class.findFirst({
            where: {
                class_code: classCode,
                supervisorId: teacher.id,
                deleted: false,
            },
        });

        if (!classRoom) {
            return <div>Không tìm thấy lớp học hoặc bạn không có quyền truy cập.</div>;
        }
    } else {
        // Student role
        const student = await prisma.student.findUnique({
            where: { userId: user.id as string },
        });

        if (!student) {
            return <div>Không tìm thấy thông tin học sinh.</div>;
        }

        // Kiểm tra student có trong lớp học không
        const classRoom = await prisma.class.findFirst({
            where: {
                class_code: classCode,
                deleted: false,
                students: {
                    some: {
                        id: student.id
                    }
                }
            },
            include: {
                supervisor: true
            }
        });

        if (!classRoom) {
            return <div>Không tìm thấy lớp học hoặc bạn không có quyền truy cập.</div>;
        }

        teacherId = classRoom.supervisorId!;
    }

    // 3. Xây dựng câu truy vấn động dựa trên searchParams
    const { page, search, folderId } = searchParams;
    const p = page ? parseInt(page) : 1;

    const query: Prisma.CourseWhereInput = {
        classCode: classCode,
        createdBy: teacherId,
        isActive: true, // Bạn có thể bỏ điều kiện này nếu muốn hiển thị cả khóa học đã tắt
    };

    if (search) {
        query.title = {
            contains: search,
            mode: "insensitive",
        };
    }
    
    // Lọc theo folder
    if (folderId) {
        // Giả sử có 1 giá trị đặc biệt 'unassigned' cho các khóa không có folder
        if (folderId === 'unassigned') {
            query.folderId = null;
        } else {
            query.folderId = folderId;
        }
    }


    // 4. Lấy dữ liệu đã phân trang và tổng số lượng
    const [courses, count, folders, allCoursesCount] = await prisma.$transaction([
        // Lấy danh sách khóa học theo điều kiện
        prisma.course.findMany({
            where: query,
            include: {
                videos: { orderBy: { orderIndex: 'asc' } },
                folder: true,
                teacher: true,
                _count: { select: { videos: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (p - 1),
        }),
        // Đếm tổng số khóa học khớp điều kiện
        prisma.course.count({ where: query }),
        // Lấy tất cả folder của lớp để hiển thị sidebar
        prisma.folder.findMany({
            where: {
                classCode: classCode,
                createdBy: teacherId,
            },
            include: {
                _count: {
                    select: { courses: true }
                }
            },
            orderBy: {
                createdAt: 'asc',
            },
        }),
        // Đếm tổng số khóa học trong lớp (để hiển thị ở mục "Tất cả")
        prisma.course.count({
            where: {
                classCode: classCode,
                createdBy: teacherId,
                isActive: true
            }
        })
    ]);

    // 5. Render component client với dữ liệu đã lấy
    return (
        <VideoList
            data={courses}
            count={count}
            folders={folders}
            allCoursesCount={allCoursesCount}
            page={p}
            classCode={classCode}
            role={role as string}
        />
    );
}