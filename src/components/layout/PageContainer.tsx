import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface PageContainerProps {
  children: ReactNode;
  hideFooter?: boolean;
  hideNav?: boolean;
}

export function PageContainer({ children, hideFooter, hideNav }: PageContainerProps) {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {!hideNav && <Navbar />}
      {/* Opacity only — transforms here would break fixed/sticky children */}
      <motion.main
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex-1"
      >
        {children}
      </motion.main>
      {!hideFooter && <Footer />}
    </div>
  );
}
