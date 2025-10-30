// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";

// import "@stream-io/video-react-sdk/dist/css/styles.css";
// import "react-datepicker/dist/react-datepicker.css";
// import { ToastContainer } from "react-toastify";
// const inter = Inter({ subsets: ["latin"] });
// import "react-toastify/dist/ReactToastify.css";

// export const metadata: Metadata = {
//   title: "AP School - Tạo và quản lý bài tập",
//   description: "Next.js School Management System",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>{children} <ToastContainer position="bottom-right" theme="dark" /></body>
//     </html>
//   );
// }
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer } from "react-toastify";

const inter = Inter({ subsets: ["latin"] });
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "AP School - Tạo và quản lý bài tập",
  description: "Next.js School Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
 
          {children}
      
        <ToastContainer 
          position="bottom-right" 
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}
