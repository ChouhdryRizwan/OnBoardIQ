import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OnBoardIQ — Onboarding & Verification Engine',
  description: 'AI-powered employee onboarding and learning platform.',
  applicationName: 'OnBoardIQ',
  openGraph: {
    title: 'OnBoardIQ',
    description: 'AI-powered employee onboarding and learning platform.',
    siteName: 'OnBoardIQ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OnBoardIQ',
    description: 'AI-powered employee onboarding and learning platform.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-950">
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-950 text-slate-100`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
