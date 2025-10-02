import Profile from '@/components/Profile';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/hooks/auth';

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
  const profileData = {
    username: user.username,
    phoneNumber: user.phone ?? '',
    isPhoneVerified: false, // Nếu có trường xác thực thì lấy, không thì để false
    email: user.email ?? '',
    isEmailVerified: false, // Nếu có trường xác thực thì lấy, không thì để false
    password: '********',
    facebookLinked: false, // Nếu có trường thì lấy, không thì để false
    name: user.student?.username || user.teacher?.username || user.username,
    dateOfBirth: user.birthday ? user.birthday.toLocaleDateString('vi-VN') : '',
    province: user.address || '',
    school: user.schoolname || '',
  };

  return <Profile user={profileData} type={user.role} />;
}