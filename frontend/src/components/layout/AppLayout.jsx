import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../common/Sidebar';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';
import { MedicalDisclaimer } from '../common/MedicalDisclaimer';

export const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <MedicalDisclaimer compact />
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};
