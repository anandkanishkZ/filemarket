import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import BackToTop from '../ui/BackToTop';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default MainLayout;