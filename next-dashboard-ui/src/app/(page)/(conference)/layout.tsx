import { ReactNode } from 'react';
import { Inter } from "next/font/google";
import StreamVideoProvider from '@/providers/StreamClientProvider';
const inter = Inter({ subsets: ["latin"] });
const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <main>
      <StreamVideoProvider>{children}</StreamVideoProvider>
    </main>
  );
};


export default RootLayout;
