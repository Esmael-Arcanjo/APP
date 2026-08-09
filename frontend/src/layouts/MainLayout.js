import React from 'react';
import Header from '../components/Header';

const MainLayout = ({ children, fullWidth = false }) => {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-0">
      <Header />
      <main className={fullWidth ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
