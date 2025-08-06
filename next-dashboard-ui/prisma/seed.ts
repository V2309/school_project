import { Day, PrismaClient, UserRole } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // ADMIN
  await prisma.admin.create({
    data: {
      id: "admin1",
      username: "admin1",
    },
  });
  await prisma.admin.create({
    data: {
      id: "admin2",
      username: "admin2",
    },
  });

  // GRADE
  for (let i = 1; i <= 6; i++) {
    await prisma.grade.create({
      data: {
        level: `Grade ${i}`,
      },
    });
  }

  // CLASS
  for (let i = 1; i <= 6; i++) {
    await prisma.class.create({
      data: {
        name: `${i}A`,
        gradeId: i,
        capacity: Math.floor(Math.random() * (20 - 15 + 1)) + 15,
      },
    });
  }

  // SUBJECT
  const subjectData = [
    { name: "Mathematics" },
    { name: "Science" },
    { name: "English" },
    { name: "History" },
    { name: "Geography" },
    { name: "Physics" },
    { name: "Chemistry" },
    { name: "Biology" },
    { name: "Computer Science" },
    { name: "Art" },
  ];

  for (const subject of subjectData) {
    await prisma.subject.create({ data: subject });
  }

  // Create Teachers and Users

   


  const teachers = [];
  for (let i = 1; i <= 15; i++) {
    const user = await prisma.user.create({
      data: {
        username: `teacher${i}`,
        class_name: `${(i % 6) + 1}A`,
        schoolname: "Example School",
        birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
        address: `Address ${i}`,
        email: `teacher${i}@example.com`,
        phone: `123456789${i}`,
        role: UserRole.teacher,
        password: "password123",
      },
    });

    const teacher = await prisma.teacher.create({
      data: {
        id: user.id,
        username: `teacher${i}`,
        class_name: `${(i % 6) + 1}A`,
        schoolname: "Example School",
        birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
        address: `Address ${i}`,
        email: `teacher${i}@example.com`,
        phone: `123456789${i}`,
        password: "password123",
        userId: user.id,
      },
    });
    teachers.push(teacher);
  }

  // LESSON - Use actual teacher IDs
  for (let i = 1; i <= 30; i++) {
    await prisma.lesson.create({
      data: {
        name: `Lesson ${i}`,
        day: Day[
          Object.keys(Day)[
            Math.floor(Math.random() * Object.keys(Day).length)
          ] as keyof typeof Day
        ],
        startTime: new Date(new Date().setHours(8, 0, 0, 0)),
        endTime: new Date(new Date().setHours(9, 30, 0, 0)),
        subjectId: (i % 10) + 1,
        classId: (i % 6) + 1,
        teacherId: teachers[(i % 15)].id, // Use the actual teacher ID
      },
    });
  }
  

  // Create Students and Users
  const students = [];
  for (let i = 1; i <= 50; i++) {
    const user = await prisma.user.create({
      data: {
        username: `student${i}`,
        class_name: `${(i % 6) + 1}A`,
        schoolname: "Example School",
        birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 10)),
        address: `Address ${i}`,
        email: `student${i}@example.com`,
        phone: `987654321${i}`,
        role: UserRole.student,
        password: "password123",
      },
    });

    const student = await prisma.student.create({
      data: {
        id: user.id,
        username: `student${i}`,
        class_name: `${(i % 6) + 1}A`,
        schoolname: "Example School",
        birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 10)),
        address: `Address ${i}`,
        email: `student${i}@example.com`,
        phone: `987654321${i}`,
        password: "password123",
        userId: user.id,
        classId: (i % 6) + 1,
      },
    });
    students.push(student);
  }

  // EXAM
  for (let i = 1; i <= 10; i++) {
    await prisma.exam.create({
      data: {
        title: `Exam ${i}`,
        startTime: new Date(new Date().setHours(10, 0, 0, 0)),
        endTime: new Date(new Date().setHours(12, 0, 0, 0)),
        lessonId: (i % 30) + 1,
      },
    });
  }

  // ASSIGNMENT
  for (let i = 1; i <= 10; i++) {
    await prisma.assignment.create({
      data: {
        title: `Assignment ${i}`,
        startDate: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        lessonId: (i % 30) + 1,
      },
    });
  }

  // RESULT - Use actual student IDs
  for (let i = 0; i < 10; i++) {
    await prisma.result.create({
      data: {
        score: Math.floor(Math.random() * 100),
        studentId: students[i].id,
        ...(i < 5 ? { examId: i + 1 } : { assignmentId: i - 4 }),
      },
    });
  }

  // ATTENDANCE - Use actual student IDs
  for (let i = 0; i < 10; i++) {
    await prisma.attendance.create({
      data: {
        date: new Date(),
        present: true,
        studentId: students[i].id,
        lessonId: (i % 30) + 1,
      },
    });
  }

  // EVENT
  for (let i = 1; i <= 5; i++) {
    await prisma.event.create({
      data: {
        title: `Event ${i}`,
        description: `Description for Event ${i}`,
        startTime: new Date(new Date().setHours(14, 0, 0, 0)),
        endTime: new Date(new Date().setHours(16, 0, 0, 0)),
        classId: (i % 6) + 1,
      },
    });
  }

  // ANNOUNCEMENT
  for (let i = 1; i <= 5; i++) {
    await prisma.announcement.create({
      data: {
        title: `Announcement ${i}`,
        description: `Description for Announcement ${i}`,
        date: new Date(),
        classId: (i % 6) + 1,
      },
    });
  }

  // Assign class supervisors - Use actual teacher IDs
  for (let i = 1; i <= 6; i++) {
    await prisma.class.update({
      where: { id: i },
      data: {
        supervisorId: teachers[(i % 15)].id,
      },
    });
  }

  console.log("Seeding completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

