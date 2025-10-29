import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedVideoData() {
  try {
    console.log('🌱 Seeding video data...');

    // Tìm một teacher và class có sẵn
    const teacher = await prisma.teacher.findFirst();
    const classRoom = await prisma.class.findFirst({
      where: {
        supervisorId: teacher?.id,
      },
    });

    if (!teacher || !classRoom) {
      console.log('❌ No teacher or class found. Please seed basic data first.');
      return;
    }

    console.log(`📚 Found teacher: ${teacher.username}, class: ${classRoom.name}`);

    // Tạo folders
    const folder1 = await prisma.folder.create({
      data: {
        name: 'Toán học cơ bản',
        description: 'Các khóa học về toán học cơ bản cho học sinh',
        color: '#3B82F6',
        createdBy: teacher.id,
        classCode: classRoom.class_code,
      },
    });

    const folder2 = await prisma.folder.create({
      data: {
        name: 'Khoa học tự nhiên',
        description: 'Các bài giảng về vật lý, hóa học, sinh học',
        color: '#10B981',
        createdBy: teacher.id,
        classCode: classRoom.class_code,
      },
    });

    console.log('📁 Created folders:', folder1.name, folder2.name);

    // Tạo courses trong folder 1
    const course1 = await prisma.course.create({
      data: {
        title: 'Đại số lớp 9',
        description: 'Khóa học đại số cơ bản dành cho học sinh lớp 9',
        thumbnailUrl: 'https://images.pexels.com/photos/6238024/pexels-photo-6238024.jpeg?auto=compress&cs=tinysrgb&w=400',
        folderId: folder1.id,
        createdBy: teacher.id,
        classCode: classRoom.class_code,
      },
    });

    const course2 = await prisma.course.create({
      data: {
        title: 'Hình học không gian',
        description: 'Bài giảng về hình học không gian và các phép biến đổi',
        thumbnailUrl: 'https://images.pexels.com/photos/8197528/pexels-photo-8197528.jpeg?auto=compress&cs=tinysrgb&w=400',
        folderId: folder1.id,
        createdBy: teacher.id,
        classCode: classRoom.class_code,
      },
    });

    // Tạo courses trong folder 2
    const course3 = await prisma.course.create({
      data: {
        title: 'Vật lý cơ bản',
        description: 'Các định luật vật lý cơ bản và ứng dụng',
        thumbnailUrl: 'https://images.pexels.com/photos/2280547/pexels-photo-2280547.jpeg?auto=compress&cs=tinysrgb&w=400',
        folderId: folder2.id,
        createdBy: teacher.id,
        classCode: classRoom.class_code,
      },
    });

    // Tạo course không có folder
    const course4 = await prisma.course.create({
      data: {
        title: 'Kỹ năng học tập',
        description: 'Hướng dẫn các phương pháp học tập hiệu quả',
        thumbnailUrl: 'https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=400',
        folderId: null,
        createdBy: teacher.id,
        classCode: classRoom.class_code,
      },
    });

    console.log('🎓 Created courses:', course1.title, course2.title, course3.title, course4.title);

    // Tạo chapters cho từng course
    const chapters = [
      // Chapters cho course 1 (Đại số)
      { title: 'Chương 1: Căn bậc hai', description: 'Các bài học về căn bậc hai', courseId: course1.id, orderIndex: 0 },
      { title: 'Chương 2: Phương trình bậc hai', description: 'Giải phương trình bậc hai', courseId: course1.id, orderIndex: 1 },
      
      // Chapters cho course 2 (Hình học)
      { title: 'Chương 1: Khái niệm cơ bản', description: 'Các khái niệm cơ bản về hình học không gian', courseId: course2.id, orderIndex: 0 },
      
      // Chapters cho course 3 (Vật lý)
      { title: 'Chương 1: Cơ học', description: 'Các định luật cơ học Newton', courseId: course3.id, orderIndex: 0 },
      
      // Chapters cho course 4 (Kỹ năng)
      { title: 'Chương 1: Phương pháp học tập', description: 'Các phương pháp học tập hiệu quả', courseId: course4.id, orderIndex: 0 },
    ];

    const createdChapters = [];
    for (const chapterData of chapters) {
      const chapter = await prisma.chapter.create({
        data: {
          ...chapterData,
          createdBy: teacher.id,
        },
      });
      createdChapters.push(chapter);
    }

    console.log(`📚 Created ${createdChapters.length} chapters`);

    // Tạo videos cho từng chapter
    const videos = [
      // Videos cho course 1 (Đại số)
      {
        title: 'Bài 1: Căn bậc hai',
        description: 'Giới thiệu về căn bậc hai và các tính chất cơ bản',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        type: 'youtube',
        duration: '15:30',
        orderIndex: 1,
        courseId: course1.id,
        createdBy: teacher.id,
      },
      {
        title: 'Bài 2: Phương trình bậc hai',
        description: 'Cách giải phương trình bậc hai và các dạng bài tập',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        type: 'youtube',
        duration: '22:15',
        orderIndex: 2,
        courseId: course1.id,
        createdBy: teacher.id,
      },
      // Videos cho course 2 (Hình học)
      {
        title: 'Hình học không gian - Khái niệm cơ bản',
        description: 'Các khái niệm cơ bản về hình học không gian',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        type: 'youtube',
        duration: '18:45',
        orderIndex: 1,
        courseId: course2.id,
        createdBy: teacher.id,
      },
      // Videos cho course 3 (Vật lý)
      {
        title: 'Định luật Newton',
        description: 'Ba định luật Newton và ứng dụng trong thực tế',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        type: 'youtube',
        duration: '25:10',
        orderIndex: 1,
        courseId: course3.id,
        createdBy: teacher.id,
      },
      {
        title: 'Năng lượng và công',
        description: 'Khái niệm về năng lượng, công và định lý động năng',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        type: 'youtube',
        duration: '20:30',
        orderIndex: 2,
        courseId: course3.id,
        createdBy: teacher.id,
      },
      // Videos cho course 4 (Kỹ năng)
      {
        title: 'Cách ghi chú hiệu quả',
        description: 'Phương pháp ghi chú Cornell và mind mapping',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        type: 'youtube',
        duration: '12:20',
        orderIndex: 1,
        courseId: course4.id,
        createdBy: teacher.id,
      },
    ];

    // Tạo tất cả videos
    for (const videoData of videos) {
      await prisma.video.create({
        data: videoData,
      });
    }

    console.log(`🎥 Created ${videos.length} videos`);
    console.log('✅ Video data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding video data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy seed nếu file được gọi trực tiếp
if (require.main === module) {
  seedVideoData()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedVideoData };