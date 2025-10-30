import { ReactNode } from 'react';
import { Inter } from "next/font/google";
import StreamVideoProvider from '@/providers/StreamClientProvider';
import { UserProvider } from '@/providers/UserProvider';

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <main>
      <UserProvider>
        <StreamVideoProvider>
          {children}
        </StreamVideoProvider>
      </UserProvider>
    </main>
  );
};


export default RootLayout;
