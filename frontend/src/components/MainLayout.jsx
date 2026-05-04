import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import CallLoggerWidget from './CallLoggerWidget';
import NotificationPermission from './NotificationPermission';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Desktop is always visible as a rail, Mobile is a drawer */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Widgets */}
      <CallLoggerWidget />
      <NotificationPermission />
    </div>
  );
};


export default MainLayout;
