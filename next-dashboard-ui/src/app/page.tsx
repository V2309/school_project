import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { Fragment } from 'react'; // Sử dụng Fragment để không thêm thẻ thừa vào DOM

// --- CÁC COMPONENT TÁI SỬ DỤNG ---

// Component Icon cho phần tính năng
const FeatureIcon = ({ emoji }: { emoji: string }) => <div className="text-4xl mb-4">{emoji}</div>;

// Component cho các bước trong phần "How it Works"
const HowItWorksStep = ({ number, title, description }: { number: number; title: string; description: string }) => (
  <div>
    <div className="flex items-center justify-center w-12 h-12 bg-primary-light text-primary-dark rounded-full font-bold text-xl mb-4">
      {number}
    </div>
    <h3 className="text-xl font-semibold text-copy-base mb-2">{title}</h3>
    <p className="text-copy-light">{description}</p>
  </div>
);

// Component cho thẻ Testimonial
const TestimonialCard = ({ quote, name, role, avatar }: { quote: string; name: string; role: string; avatar: string }) => (
    <div className="bg-surface p-8 rounded-xl shadow-md border border-gray-100">
        <p className="text-copy-light italic mb-6">"{quote}"</p>
        <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gray-300 mr-4 flex-shrink-0">
                {/* Replace with an actual img tag */}
                {/* <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" /> */}
            </div>
            <div>
                <p className="font-bold text-copy-base">{name}</p>
                <p className="text-sm text-copy-light">{role}</p>
            </div>
        </div>
    </div>
);


// --- TRANG CHỦ ---

export default function Home() {
  const features = [
    { icon: "💻", title: "Lớp học trực tuyến tương tác", description: "Tổ chức các buổi học video chất lượng cao, tích hợp bảng trắng và chia sẻ màn hình." },
    { icon: "📝", title: "Quản lý bài tập & điểm số", description: "Giao bài tập, chấm điểm và theo dõi tiến độ của học sinh một cách dễ dàng." },
    { icon: "📚", title: "Kho tài liệu tập trung", description: "Tải lên và chia sẻ tài liệu học tập, bài giảng và video cho cả lớp." },
    { icon: "📊", title: "Báo cáo & Phân tích", description: "Theo dõi sự tham gia và kết quả học tập của học sinh qua các báo cáo trực quan." },
    { icon: "💬", title: "Kênh giao tiếp hiệu quả", description: "Giao tiếp với học sinh và phụ huynh qua các thông báo và tin nhắn riêng tư." },
    { icon: "🗓️", title: "Lịch học thông minh", description: "Tự động sắp xếp lịch học, nhắc nhở về các kỳ thi và sự kiện quan trọng." }
  ];

  return (
    <div className="bg-background text-copy-base font-sans">
      <Head>
        <title>DoCus - Nền tảng quản lý lớp học toàn diện</title>
        <meta name="description" content="DoCus giúp đơn giản hóa việc dạy và học trực tuyến. Quản lý lớp học, bài tập và giao tiếp ở cùng một nơi." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation */}
      <header className="sticky top-0 bg-surface/80 backdrop-blur-md z-50 border-b border-gray-200">
        <nav className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="text-xl font-bold text-copy-base">DoCus</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-copy-light hover:text-primary transition-colors">Tính năng</Link>
            <Link href="#solutions" className="text-copy-light hover:text-primary transition-colors">Giải pháp</Link>
            <Link href="#pricing" className="text-copy-light hover:text-primary transition-colors">Bảng giá</Link>
            <Link href="#" className="text-copy-light hover:text-primary transition-colors">Hỗ trợ</Link>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/sign-in" className="px-4 py-2 text-copy-base font-medium rounded-md hover:bg-gray-100 transition-colors">Đăng nhập</Link>
            <Link href="/sign-up" className="px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors shadow-sm">Đăng ký miễn phí</Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-24 sm:py-32 px-6 max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-copy-base leading-tight mb-6">Dạy và học hiệu quả hơn với <span className="text-primary">DoCus</span></h1>
          <p className="text-lg text-copy-light max-w-3xl mx-auto mb-10">Nền tảng tất cả trong một giúp bạn quản lý lớp học, giao bài tập, theo dõi tiến độ và kết nối với học sinh một cách liền mạch.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/sign-up" className="inline-block px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-transform hover:scale-105 shadow-lg">Bắt đầu ngay</Link>
            <Link href="#demo-video" className="inline-block px-8 py-4 bg-surface text-copy-base rounded-lg font-semibold hover:bg-gray-100 border border-gray-300 transition-colors">Xem Demo</Link>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-12 px-6">
            <div className="max-w-5xl mx-auto text-center">
                <p className="text-sm font-semibold text-copy-light tracking-wider uppercase">Được tin dùng bởi các tổ chức giáo dục hàng đầu</p>
                <div className="mt-8 flex justify-center items-center gap-x-8 sm:gap-x-12 flex-wrap">
                    {/* Replace with actual logos - Consider using Next/Image for optimization */}
                    <span className="text-2xl font-medium text-gray-400">Trường ABC</span>
                    <span className="text-2xl font-medium text-gray-400">Đại học XYZ</span>
                    <span className="text-2xl font-medium text-gray-400">Trung tâm Edu</span>
                    <span className="text-2xl font-medium text-gray-400">Tổ chức DEF</span>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-6 bg-surface border-y border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-copy-base mb-4">Mọi công cụ bạn cần cho lớp học số</h2>
              <p className="text-copy-light max-w-2xl mx-auto">DoCus được thiết kế với các tính năng mạnh mẽ để hỗ trợ giáo viên và truyền cảm hứng cho học sinh.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="bg-background p-8 rounded-xl border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <FeatureIcon emoji={feature.icon} />
                  <h3 className="text-xl font-semibold text-copy-base mb-2">{feature.title}</h3>
                  <p className="text-copy-light">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Demo/Product Tour Section (NEW) */}
       {/* Video Feature Showcase (NEW) */}
<section className="py-20 px-6">
  <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
    <div className="w-full">
      <div className="aspect-video w-full rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/4sXMsteYA5k"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
    </div>
    <div>
      <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary font-semibold text-sm rounded-full mb-4">Trải nghiệm tương tác</span>
      <h3 className="text-3xl font-bold text-copy-base mb-4">Học tập hấp dẫn với video trực quan</h3>
      <p className="text-copy-light text-lg mb-6">Mang lại các bài giảng sống động và thu hút sự chú ý của học sinh với khả năng tích hợp video mượt mà. Chia sẻ nội dung đa phương tiện, thực hiện các buổi hỏi đáp trực tiếp và làm cho việc học trở nên tương tác hơn bao giờ hết.</p>
      <Link href="#" className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">Khám phá lớp học ảo</Link>
    </div>
  </div>
</section>

        {/* Visual Feature Showcase (Existing) */}
        <section className="py-20 px-6">
            <div className="max-w-7xl mx-auto space-y-24">
                {/* Feature 1 */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary font-semibold text-sm rounded-full mb-4">Bảng điều khiển trung tâm</span>
                        <h3 className="text-3xl font-bold text-copy-base mb-4">Tất cả trong một bảng điều khiển duy nhất</h3>
                        <p className="text-copy-light text-lg">Quản lý nhiều lớp học, theo dõi bài tập sắp đến hạn và xem các thông báo quan trọng ngay từ màn hình chính. Tiết kiệm thời gian và không bao giờ bỏ lỡ thông tin.</p>
                    </div>
                    <div className="bg-gray-200 rounded-lg h-80 flex items-center justify-center">
                        <Image src="/nen1.png" alt="Ảnh chụp màn hình ứng dụng" className="object-fit h-full w-full" width={500} height={300} />
                    </div>
                </div>
                {/* Feature 2 */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                     <div className="bg-gray-200 rounded-lg h-80 flex items-center justify-center md:order-last">
                           <Image src="/nen2.png" alt="Ảnh chụp màn hình ứng dụng" className="object-fit h-full w-full" width={500} height={300} />
                     </div>
                    <div>
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-semibold text-sm rounded-full mb-4">Phân tích học tập trực quan</span>
                        <h3 className="text-3xl font-bold text-copy-base mb-4">Hiểu sâu hơn về tiến độ của học sinh</h3>
                        <p className="text-copy-light text-lg">Sử dụng các biểu đồ và dữ liệu trực quan để dễ dàng xác định điểm mạnh, điểm yếu và các cơ hội để cải thiện cho từng học sinh.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Solutions / Use Cases Section (NEW) */}
        <section id="solutions" className="py-20 px-6 bg-surface border-y border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-copy-base mb-4">DoCus dành cho ai?</h2>
              <p className="text-copy-light max-w-2xl mx-auto">Cho dù bạn là giáo viên, quản trị viên hay phụ huynh, DoCus đều có giải pháp giúp trải nghiệm giáo dục tốt hơn.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background p-8 rounded-xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">🧑‍🏫</div>
                <h3 className="text-xl font-semibold text-copy-base mb-2">Giáo viên</h3>
                <p className="text-copy-light">Tổ chức lớp học, quản lý bài tập và giao tiếp hiệu quả với học sinh.</p>
                <Link href="#" className="mt-4 inline-block text-primary hover:underline font-medium">Tìm hiểu thêm →</Link>
              </div>
              <div className="bg-background p-8 rounded-xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">🎓</div>
                <h3 className="text-xl font-semibold text-copy-base mb-2">Quản trị viên</h3>
                <p className="text-copy-light">Giám sát hoạt động của trường, quản lý tài khoản và tích hợp hệ thống dễ dàng.</p>
                <Link href="#" className="mt-4 inline-block text-primary hover:underline font-medium">Tìm hiểu thêm →</Link>
              </div>
              <div className="bg-background p-8 rounded-xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
                <h3 className="text-xl font-semibold text-copy-base mb-2">Phụ huynh & Học sinh</h3>
                <p className="text-copy-light">Theo dõi tiến độ học tập, truy cập tài liệu và tương tác với giáo viên.</p>
                <Link href="#" className="mt-4 inline-block text-primary hover:underline font-medium">Tìm hiểu thêm →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-6 bg-background"> {/* Changed to bg-background for contrast */}
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-copy-base mb-4">Bắt đầu chỉ với 3 bước đơn giản</h2>
                    <p className="text-copy-light max-w-2xl mx-auto">Gia nhập DoCus và thiết lập lớp học của bạn chưa bao giờ dễ dàng hơn.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-x-8 gap-y-12 text-center">
                    <HowItWorksStep number={1} title="Tạo Lớp Học" description="Thiết lập lớp học ảo của bạn trong vài phút và gửi mã mời cho học sinh tham gia."/>
                    <HowItWorksStep number={2} title="Tổ Chức Bài Giảng" description="Tải lên tài liệu, giao bài tập và lên lịch các buổi học trực tuyến một cách khoa học."/>
                    <HowItWorksStep number={3} title="Theo Dõi & Tương Tác" description="Chấm điểm, gửi phản hồi và theo dõi sự tiến bộ của học sinh theo thời gian thực."/>
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-6 bg-surface border-y border-gray-200"> {/* Changed to bg-surface and added border for visual separation */}
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-copy-base mb-4">Giáo viên và học sinh nói gì về DoCus?</h2>
                    <p className="text-copy-light max-w-2xl mx-auto">Chúng tôi tự hào khi được đồng hành và hỗ trợ công việc giảng dạy mỗi ngày.</p>
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
        <section id="pricing" className="py-20 px-6 bg-background">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-copy-base mb-4">Chọn gói phù hợp với bạn</h2>
            <p className="text-copy-light max-w-2xl mx-auto mb-12">DoCus cung cấp các gói linh hoạt để đáp ứng nhu cầu của mọi quy mô lớp học và tổ chức.</p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-surface p-8 rounded-xl border border-gray-200 shadow-md">
                <h3 className="text-2xl font-bold text-copy-base mb-2">Miễn phí</h3>
                <p className="text-copy-light mb-4">Tuyệt vời cho giáo viên cá nhân và lớp học nhỏ.</p>
                <p className="text-4xl font-extrabold text-primary mb-6">0đ <span className="text-lg font-normal text-copy-light">/ tháng</span></p>
                <ul className="text-left text-copy-base space-y-2 mb-8">
                  <li className="flex items-center"><svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>Quản lý 1 lớp học</li>
                  <li className="flex items-center"><svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>Tích hợp video cơ bản</li>
                </ul>
                <Link href="/sign-up" className="inline-block w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">
                  Bắt đầu miễn phí
                </Link>
              </div>
              <div className="bg-surface p-8 rounded-xl border border-primary shadow-xl">
                <h3 className="text-2xl font-bold text-copy-base mb-2">Cao cấp</h3>
                <p className="text-copy-light mb-4">Dành cho các tổ chức và giáo viên muốn sử dụng đầy đủ tính năng.</p>
                <p className="text-4xl font-extrabold text-primary mb-6">Liên hệ</p>
                <ul className="text-left text-copy-base space-y-2 mb-8">
                  <li className="flex items-center"><svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>Mọi tính năng của gói Miễn phí</li>
                  <li className="flex items-center"><svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>Phân tích nâng cao</li>
                  <li className="flex items-center"><svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>Hỗ trợ ưu tiên</li>
                </ul>
                <Link href="/contact-sales" className="inline-block w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">
                  Liên hệ bán hàng
                </Link>
              </div>
            </div>
            <p className="text-copy-light text-sm mt-8">Bạn có thể hủy bỏ bất cứ lúc nào.</p>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-primary py-20 px-6">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl font-extrabold text-white mb-6">Sẵn sàng để chuyển đổi lớp học của bạn?</h2>
                <p className="text-lg text-white/70 mb-10">Tham gia cùng hàng ngàn giáo viên đang giảng dạy hiệu quả hơn với DoCus. Đăng ký tài khoản miễn phí ngay hôm nay.</p>
                <Link href="/sign-up" className="inline-block px-10 py-4 bg-white text-primary rounded-lg font-bold text-lg hover:bg-gray-200 transition-colors shadow-2xl">
                    Dùng thử miễn phí ngay
                </Link>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-16 px-6 bg-surface border-t border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-copy-base mb-4">Sản phẩm</h4>
            <ul className="space-y-3">
              <li><Link href="#features" className="text-copy-light hover:text-primary transition-colors">Tính năng</Link></li>
              <li><Link href="#pricing" className="text-copy-light hover:text-primary transition-colors">Bảng giá</Link></li>
              <li><Link href="#solutions" className="text-copy-light hover:text-primary transition-colors">Giải pháp</Link></li>
              <li><Link href="#" className="text-copy-light hover:text-primary transition-colors">Bảo mật</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-copy-base mb-4">Tài nguyên</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-copy-light hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-copy-light hover:text-primary transition-colors">Trung tâm hỗ trợ</Link></li>
              <li><Link href="#" className="text-copy-light hover:text-primary transition-colors">Webinars</Link></li>
              <li><Link href="#" className="text-copy-light hover:text-primary transition-colors">Hướng dẫn</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-copy-base mb-4">Công ty</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-copy-light hover:text-primary transition-colors">Về chúng tôi</Link></li>
              <li><Link href="#" className="text-copy-light hover:text-primary transition-colors">Tuyển dụng</Link></li>
              <li><Link href="#" className="text-copy-light hover:text-primary transition-colors">Điều khoản</Link></li>
              <li><Link href="#" className="text-copy-light hover:text-primary transition-colors">Chính sách</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-copy-base mb-4">Kết nối</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-copy-light hover:text-primary transition-colors">Facebook</Link></li>
              <li><Link href="#" className="text-copy-light hover:text-primary transition-colors">LinkedIn</Link></li>
              <li><Link href="#" className="text-copy-light hover:text-primary transition-colors">YouTube</Link></li>
              <li><Link href="#" className="text-copy-light hover:text-primary transition-colors">Liên hệ</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-200 text-center text-copy-light">
          <p>© {new Date().getFullYear()} DoCus. Đã đăng ký bản quyền.</p>
        </div>
      </footer>
    </div>
  );
}