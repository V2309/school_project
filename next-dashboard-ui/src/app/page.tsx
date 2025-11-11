

import Link from "next/link"
import Image from "next/image"
import { Metadata } from "next"
import dynamic from "next/dynamic"

// 2. TẢI LAZY COMPONENT (với 1 skeleton loading)
const LazyYouTube = dynamic(() => import('@/components/LazyYoutube'), { 
  ssr: false,
  loading: () => <div className="aspect-video w-full bg-muted animate-pulse" />
});
export const metadata: Metadata = {
  title: "DoCus - Nền tảng quản lý lớp học toàn diện",
  description: "DoCus giúp đơn giản hóa việc dạy và học trực tuyến. Quản lý lớp học, bài tập và giao tiếp ở cùng một nơi.",
}

// --- MODERN COMPONENT REDESIGNS ---

const FeatureIcon = ({ emoji }: { emoji: string }) => (
  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl mb-6 text-3xl animate-float">
    {emoji}
  </div>
)

const HowItWorksStep = ({ number, title, description }: { number: number; title: string; description: string }) => (
  <div className="relative group">
    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
    <div className="relative bg-card/80 backdrop-blur-sm p-8 rounded-2xl border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-secondary text-primary-foreground rounded-xl font-bold text-xl mb-6 shadow-lg">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3 text-balance">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
)

const TestimonialCard = ({
  quote,
  name,
  role,
  avatar,
}: { quote: string; name: string; role: string; avatar: string }) => (
  <div className="relative group">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
    <div className="relative glass-effect p-8 rounded-2xl shadow-xl border border-border/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <div className="absolute top-4 left-4 text-primary/20 text-6xl font-serif"></div>
      <p className="text-muted-foreground italic mb-8 pt-8 leading-relaxed text-balance">{quote}</p>
      <div className="flex items-center">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mr-4 flex-shrink-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-muted"></div>
        </div>
        <div>
          <p className="font-semibold text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  </div>
)

// --- MAIN PAGE ---

export default function Home() {
  const features = [
    {
      icon: "💻",
      title: "Lớp học trực tuyến tương tác",
      description: "Tổ chức các buổi học video chất lượng cao, tích hợp bảng trắng và chia sẻ màn hình.",
    },
    {
      icon: "📝",
      title: "Quản lý bài tập & điểm số",
      description: "Giao bài tập, chấm điểm và theo dõi tiến độ của học sinh một cách dễ dàng.",
    },
    {
      icon: "📚",
      title: "Kho tài liệu tập trung",
      description: "Tải lên và chia sẻ tài liệu học tập, bài giảng và video cho cả lớp.",
    },
    {
      icon: "📊",
      title: "Báo cáo & Phân tích",
      description: "Theo dõi sự tham gia và kết quả học tập của học sinh qua các báo cáo trực quan.",
    },
    {
      icon: "💬",
      title: "Kênh giao tiếp hiệu quả",
      description: "Giao tiếp với học sinh và phụ huynh qua các thông báo và tin nhắn riêng tư.",
    },
    {
      icon: "🗓️",
      title: "Lịch học thông minh",
      description: "Tự động sắp xếp lịch học, nhắc nhở về các kỳ thi và sự kiện quan trọng.",
    },
  ]

  return (
    <div className="bg-background text-foreground font-sans">
      <header className="sticky top-0 glass-effect z-50 border-b border-border/50">
        <nav className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 text-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <svg
                className="w-6 h-6 text-primary-foreground"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gradient">DoCus</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Tính năng
            </Link>
            <Link href="#solutions" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Giải pháp
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Bảng giá
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Hỗ trợ
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/sign-in"
              className="px-6 py-2.5 text-foreground font-medium rounded-xl hover:bg-muted transition-all duration-300"
            >
              Đăng nhập
            </Link>
            <Link
              href="/sign-up"
              className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
            >
              Đăng ký miễn phí
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative py-32 px-6 overflow-hidden">
          <div className="absolute inset-0 gradient-mesh opacity-5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(5,150,105,0.1),transparent_50%)]"></div>

          <div className="relative max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-medium text-sm mb-8">
              <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
              Nền tảng giáo dục cho lớp học trực tuyến
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold !leading-tight mb-8">
              <span className="text-foreground">Dạy và học hiệu quả</span>
              <br />
              <span className="text-gradient"> hơn với DoCus</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed text-balance">
              Nền tảng tất cả trong một giúp bạn quản lý lớp học, giao bài tập, theo dõi tiến độ và kết nối với học sinh
              một cách liền mạch.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Link
                href="/sign-up"
                className="inline-flex items-center px-8 py-4 
             bg-gradient-to-r from-primary to-primary-dark
             text-white rounded-xl font-semibold text-lg
             hover:shadow-xl hover:shadow-primary/25
             transition-all duration-300 transform hover:scale-105"
              >
                <span>Bắt đầu ngay</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="#demo-video"
                className="inline-flex items-center px-8 py-4 bg-card/80 backdrop-blur-sm text-foreground rounded-xl font-semibold text-lg border border-border hover:bg-card hover:shadow-lg transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Xem Demo
              </Link>
         
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground tracking-wider uppercase mb-8">
                Được tin dùng bởi các tổ chức giáo dục hàng đầu
              </p>
              <div className="flex justify-center items-center gap-x-12 flex-wrap opacity-60">
                <div className="px-6 py-3 bg-card/50 rounded-lg border border-border/50">
                  <span className="text-lg font-semibold text-muted-foreground">Trường ABC</span>
                </div>
                <div className="px-6 py-3 bg-card/50 rounded-lg border border-border/50">
                  <span className="text-lg font-semibold text-muted-foreground">Đại học XYZ</span>
                </div>
                <div className="px-6 py-3 bg-card/50 rounded-lg border border-border/50">
                  <span className="text-lg font-semibold text-muted-foreground">Trung tâm Edu</span>
                </div>
                <div className="px-6 py-3 bg-card/50 rounded-lg border border-border/50">
                  <span className="text-lg font-semibold text-muted-foreground">Tổ chức DEF</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-medium text-sm mb-6">
                Tính năng nổi bật
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                Mọi công cụ bạn cần cho lớp học số
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                DoCus được thiết kế với các tính năng mạnh mẽ để hỗ trợ giáo viên và truyền cảm hứng cho học sinh.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={feature.title} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-card/80 backdrop-blur-sm p-8 rounded-2xl border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                    <FeatureIcon emoji={feature.icon} />
                    <h3 className="text-xl font-semibold text-foreground mb-4 text-balance">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Demo/Product Tour Section (NEW) */}
        {/* Video Feature Showcase (NEW) */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-300"></div>
              <div className="relative aspect-video w-full rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
                <LazyYouTube videoId="4sXMsteYA5k" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full text-secondary font-medium text-sm">
                Trải nghiệm tương tác
              </div>
              <h3 className="text-4xl font-bold text-foreground text-balance">Học tập hấp dẫn với video trực quan</h3>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Mang lại các bài giảng sống động và thu hút sự chú ý của học sinh với khả năng tích hợp video mượt mà.
                Chia sẻ nội dung đa phương tiện, thực hiện các buổi hỏi đáp trực tiếp và làm cho việc học trở nên tương
                tác hơn bao giờ hết.
              </p>
              <Link
                href="#"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
              >
                Khám phá lớp học ảo
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Visual Feature Showcase (Existing) */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto space-y-24">
            {/* Feature 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary font-semibold text-sm rounded-full mb-4">
                  Bảng điều khiển trung tâm
                </span>
                <h3 className="text-3xl font-bold text-copy-base mb-4">Tất cả trong một bảng điều khiển duy nhất</h3>
                <p className="text-copy-light text-lg">
                  Quản lý nhiều lớp học, theo dõi bài tập sắp đến hạn và xem các thông báo quan trọng ngay từ màn hình
                  chính. Tiết kiệm thời gian và không bao giờ bỏ lỡ thông tin.
                </p>
              </div>
              <div className="bg-gray-200 rounded-lg h-80 flex items-center justify-center">
                <Image
                  src="/nen1.png"
                  alt="Ảnh chụp màn hình ứng dụng"
                  className="object-fit h-full w-full"
                  width={500}
                  height={300}
                  priority
                />
              </div>
            </div>
            {/* Feature 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-gray-200 rounded-lg h-80 flex items-center justify-center md:order-last">
                <Image
                  src="/nen2.png"
                  alt="Ảnh chụp màn hình ứng dụng"
                  className="object-fit h-full w-full"
                  width={500}
                  height={300}
                  priority
                />
              </div>
              <div>
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-semibold text-sm rounded-full mb-4">
                  Phân tích học tập trực quan
                </span>
                <h3 className="text-3xl font-bold text-copy-base mb-4">Hiểu sâu hơn về tiến độ của học sinh</h3>
                <p className="text-copy-light text-lg">
                  Sử dụng các biểu đồ và dữ liệu trực quan để dễ dàng xác định điểm mạnh, điểm yếu và các cơ hội để cải
                  thiện cho từng học sinh.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions / Use Cases Section (NEW) */}
        <section id="solutions" className="py-24 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-medium text-sm mb-6">
                Giải pháp toàn diện
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">DoCus dành cho ai?</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Cho dù bạn là giáo viên, quản trị viên hay phụ huynh, DoCus đều có giải pháp giúp trải nghiệm giáo dục
                tốt hơn.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-card/80 backdrop-blur-sm p-8 rounded-2xl border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center text-4xl mb-6 mx-auto">
                    🧑‍🏫
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4">Giáo viên</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Tổ chức lớp học, quản lý bài tập và giao tiếp hiệu quả với học sinh.
                  </p>
                  <Link
                    href="#"
                    className="inline-flex items-center text-primary hover:text-secondary font-semibold transition-colors"
                  >
                    Tìm hiểu thêm
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-card/80 backdrop-blur-sm p-8 rounded-2xl border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center text-4xl mb-6 mx-auto">
                    🎓
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4">Quản trị viên</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Giám sát hoạt động của trường, quản lý tài khoản và tích hợp hệ thống dễ dàng.
                  </p>
                  <Link
                    href="#"
                    className="inline-flex items-center text-primary hover:text-secondary font-semibold transition-colors"
                  >
                    Tìm hiểu thêm
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-card/80 backdrop-blur-sm p-8 rounded-2xl border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center text-4xl mb-6 mx-auto">
                    👨‍👩‍👧‍👦
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4">Phụ huynh & Học sinh</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Theo dõi tiến độ học tập, truy cập tài liệu và tương tác với giáo viên.
                  </p>
                  <Link
                    href="#"
                    className="inline-flex items-center text-primary hover:text-secondary font-semibold transition-colors"
                  >
                    Tìm hiểu thêm
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-medium text-sm mb-6">
                Quy trình đơn giản
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                Bắt đầu chỉ với 3 bước đơn giản
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Gia nhập DoCus và thiết lập lớp học của bạn chưa bao giờ dễ dàng hơn.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <HowItWorksStep
                number={1}
                title="Tạo Lớp Học"
                description="Thiết lập lớp học ảo của bạn trong vài phút và gửi mã mời cho học sinh tham gia."
              />
              <HowItWorksStep
                number={2}
                title="Tổ Chức Bài Giảng"
                description="Tải lên tài liệu, giao bài tập và lên lịch các buổi học trực tuyến một cách khoa học."
              />
              <HowItWorksStep
                number={3}
                title="Theo Dõi & Tương Tác"
                description="Chấm điểm, gửi phản hồi và theo dõi sự tiến bộ của học sinh theo thời gian thực."
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-medium text-sm mb-6">
                Phản hồi từ người dùng
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                Giáo viên và học sinh nói gì về DoCus?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Chúng tôi tự hào khi được đồng hành và hỗ trợ công việc giảng dạy mỗi ngày.
              </p>
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
              <TestimonialCard
                quote="DoCus đã thay đổi hoàn toàn cách tôi quản lý lớp học. Mọi thứ đều tập trung ở một nơi, giúp tôi tiết kiệm rất nhiều thời gian và công sức."
                name="Cô Mai Anh"
                role="Giáo viên Văn, Trường THPT Chuyên Lam Sơn"
                avatar="/path/to/avatar1.jpg"
              />
              <TestimonialCard
                quote="Giao diện rất thân thiện và dễ sử dụng. Học sinh của tôi cũng rất thích thú với việc nộp bài và nhận phản hồi trực tiếp trên nền tảng."
                name="Thầy Hoàng Nam"
                role="Giáo viên Tin học, Trung tâm Olympia"
                avatar="/path/to/avatar2.jpg"
              />
              <TestimonialCard
                quote="Tính năng phân tích học tập thực sự hữu ích. Tôi có thể nắm bắt được tình hình học tập của cả lớp và của từng em một cách nhanh chóng."
                name="Cô Thuỳ Linh"
                role="Tổ trưởng chuyên môn, Trường Quốc tế Việt Úc"
                avatar="/path/to/avatar3.jpg"
              />
            </div>
          </div>
        </section>

        {/* Mini Pricing/Plans Section (NEW) */}
        <section id="pricing" className="py-24 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-medium text-sm mb-6">
              Gói dịch vụ
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Chọn gói phù hợp với bạn
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-16 leading-relaxed">
              DoCus cung cấp các gói linh hoạt để đáp ứng nhu cầu của mọi quy mô lớp học và tổ chức.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-card/80 backdrop-blur-sm p-8 rounded-2xl border border-border/50 hover:shadow-xl transition-all duration-300">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Miễn phí</h3>
                  <p className="text-muted-foreground mb-6">Tuyệt vời cho giáo viên cá nhân và lớp học nhỏ.</p>
                  <div className="mb-8">
                    <span className="text-5xl font-extrabold text-primary">0đ</span>
                    <span className="text-lg text-muted-foreground ml-2">/ tháng</span>
                  </div>
                  <ul className="text-left space-y-4 mb-8">
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </div>
                      <span className="text-foreground">Quản lý 1 lớp học</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </div>
                      <span className="text-foreground">Tích hợp video cơ bản</span>
                    </li>
                  </ul>
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
                  >
                    Bắt đầu miễn phí
                  </Link>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-card/80 backdrop-blur-sm p-8 rounded-2xl border-2 border-primary/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Phổ biến nhất
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2 mt-4">Cao cấp</h3>
                  <p className="text-muted-foreground mb-6">
                    Dành cho các tổ chức và giáo viên muốn sử dụng đầy đủ tính năng.
                  </p>
                  <div className="mb-8">
                    <span className="text-5xl font-extrabold text-primary">Liên hệ</span>
                  </div>
                  <ul className="text-left space-y-4 mb-8">
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </div>
                      <span className="text-foreground">Mọi tính năng của gói Miễn phí</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </div>
                      <span className="text-foreground">Phân tích nâng cao</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </div>
                      <span className="text-foreground">Hỗ trợ ưu tiên</span>
                    </li>
                  </ul>
                  <Link
                    href="/contact-sales"
                    className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
                  >
                    Liên hệ bán hàng
                  </Link>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mt-8">Bạn có thể hủy bỏ bất cứ lúc nào.</p>
          </div>
        </section>

        <section className="relative py-24 px-6 overflow-hidden">
          <div className="absolute inset-0 gradient-mesh"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)]"></div>

          <div className="relative max-w-5xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-extrabold text-primary-foreground mb-8 text-balance">
              Sẵn sàng để chuyển đổi lớp học của bạn?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-12 leading-relaxed max-w-3xl mx-auto">
              Tham gia cùng hàng ngàn giáo viên đang giảng dạy hiệu quả hơn với DoCus. Đăng ký tài khoản miễn phí ngay
              hôm nay.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center px-10 py-4 bg-white text-primary rounded-xl font-bold text-lg hover:bg-gray-50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <span>Dùng thử miễn phí ngay</span>
              <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-20 px-6 bg-muted/50 border-t border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">Sản phẩm</h4>
            <ul className="space-y-4">
              <li>
                <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                  Tính năng
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">
                  Bảng giá
                </Link>
              </li>
              <li>
                <Link href="#solutions" className="text-muted-foreground hover:text-primary transition-colors">
                  Giải pháp
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Bảo mật
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">Tài nguyên</h4>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Trung tâm hỗ trợ
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Webinars
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Hướng dẫn
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">Công ty</h4>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Điều khoản
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Chính sách
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">Kết nối</h4>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Facebook
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  YouTube
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-border text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} DoCus. Đã đăng ký bản quyền.</p>
        </div>
      </footer>
    </div>
  )
}
