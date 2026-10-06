import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { cn } from '../../lib/utils';

export interface PageContainerProps {
  children: React.ReactNode;
  showFooter?: boolean;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, showFooter = true, className }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans antialiased">
      <Header />
      <main className={cn('flex-1', className)}>{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};
