import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  useEffect(() => {
    console.log('MainLayout mounted');
  }, []);
  return (
    <div className="flex min-h-screen flex-col bg-gray-50" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main className="flex-1 p-6" style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
