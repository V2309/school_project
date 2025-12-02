import Profile from '@/components/Profile';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export default async function StudentProfilePage() {
  const userSession = await getCurrentUser();
  if (!userSession) {
    return <div className="p-8 text-center text-red-500">Bạn chưa đăng nhập.</div>;
  }

  // Lấy dữ liệu user từ database
  const user = await prisma.user.findUnique({
    where: { id: userSession.id as string },
    include: {
      student: true,
      teacher: true,
    },
  });

  if (!user) {
    return <div className="p-8 text-center text-red-500">Không tìm thấy thông tin người dùng.</div>;
  }

  // Chuẩn hóa dữ liệu cho component Profile
  const birthday = user.birthday ? new Date(user.birthday) : null;
  const profileData = {
    username: user.username,
    phoneNumber: user.phone ?? '',
    isPhoneVerified: user.isPhoneVerified ?? false,
    email: user.email ?? '',
    isEmailVerified: user.isEmailVerified ?? false,
    password: '********',
    facebookLinked: false, // Nếu có trường thì lấy, không thì để false
    name: user.student?.username || user.teacher?.username || user.username,
    // Hiển thị ngày sinh theo định dạng Việt Nam
    dateOfBirth: birthday ? birthday.toLocaleDateString('vi-VN') : '',
    // Giá trị cho input date (ISO format)
    dateOfBirthValue: birthday ? birthday.toISOString().split('T')[0] : '',
    province: user.address || '',
    school: user.schoolname || '',
    role: user.role || 'student',
    avatar: user.img || undefined // Thêm avatar
  };

  return <Profile user={profileData} type={user.role} />;
}