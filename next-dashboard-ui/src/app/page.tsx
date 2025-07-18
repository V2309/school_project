import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>DocuS Clone - The perfect Next.js template for documentation</title>
        <meta name="description" content="Beautifully designed, customizable Next.js template for documentation websites" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xl font-bold text-dark">DocuS</span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <Link href="#" className="text-dark hover:text-primary transition-colors">Features</Link>
          <Link href="#" className="text-dark hover:text-primary transition-colors">Templates</Link>
          <Link href="#" className="text-dark hover:text-primary transition-colors">Pricing</Link>
          <Link href="#" className="text-dark hover:text-primary transition-colors">Docs</Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/sign-in" className="px-4 py-2 text-dark hover:text-primary transition-colors">Đăng nhập</Link>
          <Link href="/sign-up" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">Đăng ký </Link>  
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-dark mb-6">
          The perfect Next.js template for <span className="text-primary">documentation</span>
        </h1>
        <p className="text-xl text-dark-light max-w-3xl mx-auto mb-10">
          Beautifully designed, customizable Next.js template for your documentation website. 
          Get started in minutes and focus on your content, not the setup.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="#" className="px-8 py-4 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors font-medium">
            Get Started - Free
          </Link>
          <Link href="#" className="px-8 py-4 border border-dark-light text-dark rounded-md hover:border-primary hover:text-primary transition-colors font-medium">
            View Demo
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-dark mb-4">Everything you need for your docs</h2>
          <p className="text-dark-light max-w-2xl mx-auto">
            DocuS comes with all the features you need to create a beautiful, functional documentation website.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Markdown Support",
              description: "Write your content in Markdown and let DocuS handle the rest. Supports MDX for interactive components.",
              icon: "📝"
            },
            {
              title: "Dark Mode",
              description: "Built-in dark mode support that automatically respects user preferences.",
              icon: "🌙"
            },
            {
              title: "Search",
              description: "Fast, full-text search that works out of the box with no configuration needed.",
              icon: "🔍"
            },
            {
              title: "Responsive Design",
              description: "Looks great on all devices, from mobile to desktop.",
              icon: "📱"
            },
            {
              title: "Customizable",
              description: "Easily customize colors, fonts, and layouts to match your brand.",
              icon: "🎨"
            },
            {
              title: "SEO Optimized",
              description: "Automatic SEO optimization with Next.js and built-in metadata handling.",
              icon: "📈"
            }
          ].map((feature, index) => (
            <div key={index} className="p-6 border border-blue-500 rounded-xl hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-dark mb-2">{feature.title}</h3>
              <p className="text-dark-light">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

    {/* Footer */}
<footer className="py-6 px-6 bg-white border-t border-gray-100">
  <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
    <div>
      <h4 className="text-lg font-semibold text-dark mb-4">Product</h4>
      <ul className="space-y-2">
        <li><Link href="#" className="text-dark-light hover:text-primary transition-colors">Features</Link></li>
        <li><Link href="#" className="text-dark-light hover:text-primary transition-colors">Pricing</Link></li>
        <li><Link href="#" className="text-dark-light hover:text-primary transition-colors">Templates</Link></li>
        <li><Link href="#" className="text-dark-light hover:text-primary transition-colors">Updates</Link></li>
      </ul>
    </div>
    <div>
      <h4 className="text-lg font-semibold text-dark mb-4">Resources</h4>
      <ul className="space-y-2">
        <li><Link href="#" className="text-dark-light hover:text-primary transition-colors">Documentation</Link></li>
        <li><Link href="#" className="text-dark-light hover:text-primary transition-colors">Guides</Link></li>
        <li><Link href="#" className="text-dark-light hover:text-primary transition-colors">Blog</Link></li>
        <li><Link href="#" className="text-dark-light hover:text-primary transition-colors">Support</Link></li>
      </ul>
    </div>
    <div>
      <h4 className="text-lg font-semibold text-dark mb-4">Company</h4>
      <ul className="space-y-2">
        <li><Link href="#" className="text-dark-light hover:text-primary transition-colors">About</Link></li>
        <li><Link href="#" className="text-dark-light hover:text-primary transition-colors">Careers</Link></li>
        <li><Link href="#" className="text-dark-light hover:text-primary transition-colors">Privacy</Link></li>
        <li><Link href="#" className="text-dark-light hover:text-primary transition-colors">Terms</Link></li>
      </ul>
    </div>
    <div>
      <h4 className="text-lg font-semibold text-dark mb-4">Connect</h4>
      <ul className="space-y-2">
        <li><Link href="#" className="text-dark-light hover:text-primary transition-colors">Twitter</Link></li>
        <li><Link href="#" className="text-dark-light hover:text-primary transition-colors">GitHub</Link></li>
        <li><Link href="#" className="text-dark-light hover:text-primary transition-colors">Discord</Link></li>
        <li><Link href="#" className="text-dark-light hover:text-primary transition-colors">Contact</Link></li>
      </ul>
    </div>
  </div>
  <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-gray-200 text-center text-dark-lighter">
    <p>© {new Date().getFullYear()} DocuS Clone. All rights reserved.</p>
  </div>
</footer>
    </div>
  );
}