import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileAppBottomBar } from './MobileAppBottomBar';

interface PageContainerProps {
  children: ReactNode;
  hideFooter?: boolean;
  hideNav?: boolean;
  hideMobileNav?: boolean;
}

export function PageContainer({
  children,
  hideFooter,
  hideNav,
  hideMobileNav,
}: PageContainerProps) {
  const { pathname } = useLocation();

  // If inside reader page, mobile bottom nav is usually hidden for immersion
  const isReader = pathname.includes('/read');
  const showMobileNav = !hideMobileNav && !isReader;

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black text-ink-900 dark:text-white transition-colors">
      {!hideNav && <Navbar />}

      {/* Opacity only — transforms here would break fixed/sticky children */}
      <motion.main
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`flex-1 ${showMobileNav ? 'pb-24 lg:pb-0' : ''}`}
      >
        {children}
      </motion.main>

      {!hideFooter && <Footer />}

      {/* Signature App-like floating bottom bar on mobile */}
      {showMobileNav && <MobileAppBottomBar />}
    </div>
  );
}
