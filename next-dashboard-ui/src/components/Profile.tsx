"use client"
import Head from "next/head"
import Link from "next/link"
import type React from "react"
import {
  User,
  Phone,
  Mail,
  Lock,
  Facebook,
  FileText,
  Calendar,
  MapPin,
  School,
  Copy,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react"

const ProfileInfoRow = ({
  label,
  value,
  actionLabel = "Chỉnh sửa",
  onActionClick,
  showVerified = false,
  isVerified = false,
  highlightVerified = false,
  copyable = false,
  icon: Icon,
}: {
  label: string
  value: string
  actionLabel?: string
  onActionClick?: () => void
  showVerified?: boolean
  isVerified?: boolean
  highlightVerified?: boolean
  copyable?: boolean
  icon: React.ElementType
}) => (
  <div className="group relative">
    <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-secondary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
    <div className="relative flex justify-between items-center py-6 px-4 rounded-xl border border-transparent group-hover:border-border/50 transition-all duration-300">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gradient-to-br from-accent/10 to-secondary/10 rounded-lg flex items-center justify-center group-hover:from-accent/20 group-hover:to-secondary/20 transition-all duration-300">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        <span className="font-semibold text-foreground text-lg">{label}</span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <span className="text-foreground font-medium">{value}</span>
          {copyable && (
            <button
              onClick={() => navigator.clipboard.writeText(value)}
              className="p-2 rounded-lg bg-muted hover:bg-accent text-muted-foreground hover:text-white transition-all duration-300 group/copy"
              title="Sao chép"
            >
              <Copy className="w-4 h-4 group-hover/copy:scale-110 transition-transform" />
            </button>
          )}
        </div>
        {showVerified && (
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              isVerified
                ? highlightVerified
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "text-green-600"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {isVerified ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            <span>{isVerified ? "Đã xác minh" : "Chưa xác minh"}</span>
          </div>
        )}
        {onActionClick && (
          <button
            onClick={onActionClick}
            className="px-4 py-2 bg-accent text-white hover:bg-accent/90 rounded-lg font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-accent/25"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  </div>
)

interface ProfileProps {
  user: any
  onEdit?: (field: string) => void
  type?: "student" | "teacher"
}

const Profile: React.FC<ProfileProps> = ({ user, onEdit, type }) => {
  const handleEditClick = (field: string) => {
    if (onEdit) onEdit(field)
  }

  return (
    <div className="bg-background text-foreground font-sans min-h-screen">
      <Head>
        <title>Hồ sơ của tôi - ClassFlow</title>
        <meta name="description" content="Quản lý thông tin tài khoản và thông tin cá nhân của bạn trên ClassFlow." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 profile-gradient opacity-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.1),transparent_50%)]"></div>

        <main className="relative py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="profile-glass rounded-2xl shadow-xl border border-border/50 mb-8 overflow-hidden">
              <div className="relative p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">Hồ sơ của tôi</h1>
                    <p className="text-muted-foreground text-lg">Quản lý thông tin cá nhân và cài đặt tài khoản</p>
                  </div>
                  <Link
                    href="#"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/25 transition-all duration-300 transform hover:scale-105"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Quản lý tài khoản an toàn</span>
                  </Link>
                </div>

                <div className="flex justify-center mb-8">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent to-secondary rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-all duration-300"></div>
                    <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center text-6xl font-bold text-accent border-4 border-white shadow-2xl group-hover:shadow-accent/25 transition-all duration-300">
                      <span>{user.name ? user.name[0] : "A"}</span>
                    </div>
                    <button className="absolute bottom-2 right-2 w-10 h-10 bg-accent text-accent-foreground rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-glass rounded-2xl shadow-xl border border-border/50 mb-8 overflow-hidden profile-card-hover">
              <div className="p-8">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-secondary rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Thông tin tài khoản</h2>
                    <p className="text-muted-foreground">Quản lý thông tin đăng nhập và bảo mật</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <ProfileInfoRow
                    label="Tên đăng nhập"
                    value={user.username || ""}
                    actionLabel="Sao chép"
                    onActionClick={() => handleEditClick("Tên đăng nhập")}
                    copyable={true}
                    icon={User}
                  />
                  <ProfileInfoRow
                    label="Số điện thoại"
                    value={user.phoneNumber || ""}
                    onActionClick={() => handleEditClick("Số điện thoại")}
                    showVerified={true}
                    isVerified={user.isPhoneVerified}
                    highlightVerified={true}
                    icon={Phone}
                  />
                  <ProfileInfoRow
                    label="Email"
                    value={user.email || ""}
                    onActionClick={() => handleEditClick("Email")}
                    showVerified={true}
                    isVerified={user.isEmailVerified}
                    highlightVerified={true}
                    icon={Mail}
                  />
                  <ProfileInfoRow
                    label="Mật khẩu"
                    value={user.password || "********"}
                    onActionClick={() => handleEditClick("Mật khẩu")}
                    icon={Lock}
                  />
                  <ProfileInfoRow
                    label="Liên kết Facebook"
                    value={user.facebookLinked ? "Đã liên kết" : "Chưa liên kết"}
                    actionLabel={user.facebookLinked ? "Hủy liên kết" : "Liên kết"}
                    onActionClick={() => handleEditClick("Facebook")}
                    icon={Facebook}
                  />
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-accent/5 to-secondary/5 rounded-xl border border-accent/20">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-accent mb-1">Mẹo bảo mật</p>
                      <p className="text-muted-foreground leading-relaxed">
                        Nếu bạn là một người ít khi bình luận, hãy cập nhật mật khẩu, số điện thoại, email để thuận tiện
                        cho việc đăng nhập và lấy lại mật khẩu.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-glass rounded-2xl shadow-xl border border-border/50 overflow-hidden profile-card-hover">
              <div className="p-8">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Thông tin cá nhân</h2>
                    <p className="text-muted-foreground">
                      Cập nhật thông tin để không bị nhầm lẫn khi tham gia lớp học
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <ProfileInfoRow
                    label="Tên"
                    value={user.name || ""}
                    onActionClick={() => handleEditClick("Tên")}
                    icon={FileText}
                  />
                  <ProfileInfoRow
                    label="Ngày sinh"
                    value={user.dateOfBirth || ""}
                    onActionClick={() => handleEditClick("Ngày sinh")}
                    icon={Calendar}
                  />
                  <ProfileInfoRow
                    label="Tỉnh"
                    value={user.province || ""}
                    onActionClick={() => handleEditClick("Tỉnh")}
                    icon={MapPin}
                  />
                  <ProfileInfoRow
                    label="Trường"
                    value={user.school || ""}
                    onActionClick={() => handleEditClick("Trường")}
                    icon={School}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Profile
