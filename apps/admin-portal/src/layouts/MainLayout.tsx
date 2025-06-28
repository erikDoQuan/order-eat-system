import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import Navbar from '../components/Navbar';

export default function MainLayout() {
  useEffect(() => {
    console.log('MainLayout mounted');
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}