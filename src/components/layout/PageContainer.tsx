import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface PageContainerProps {
  children: ReactNode;
  hideFooter?: boolean;
  hideNav?: boolean;
}

export function PageContainer({ children, hideFooter, hideNav }: PageContainerProps) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {!hideNav && <Navbar />}
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
