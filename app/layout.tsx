import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { Inter } from 'next/font/google';
import './globals.css';

import { Header } from '@/components/header';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CoderPad Next.js Template',
  description: 'A template for Next.js projects on CoderPad',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <Header />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
