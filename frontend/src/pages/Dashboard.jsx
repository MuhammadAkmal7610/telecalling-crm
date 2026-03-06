import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ComprehensiveDashboard from '../components/ComprehensiveDashboard';
import WorkspaceGuard from '../components/WorkspaceGuard';

const Dashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased overflow-hidden">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div className="flex flex-1 flex-col h-full min-w-0">
                <Header setIsSidebarOpen={setSidebarOpen} />
                <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-gray-50/50">
                    <WorkspaceGuard>
                        <ComprehensiveDashboard />
                    </WorkspaceGuard>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
