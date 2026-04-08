import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ComprehensiveDashboard from '../components/ComprehensiveDashboard';
import WorkspaceGuard from '../components/WorkspaceGuard';

const Dashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#1e293b] font-sans selection:bg-teal-500 selection:text-white relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-teal-200/40 via-blue-200/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
            <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-gradient-to-tr from-teal-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} className="z-20 relative" />
            <div className="flex flex-1 flex-col h-full min-w-0 z-10 relative bg-white/40 backdrop-blur-3xl border-l border-white/50 shadow-[-10px_0_30px_rgb(0,0,0,0.02)]">
                <Header setIsSidebarOpen={setSidebarOpen} />
                <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-transparent custom-scrollbar">
                    <div className="mx-auto max-w-7xl">
                        <WorkspaceGuard>
                            <ComprehensiveDashboard />
                        </WorkspaceGuard>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
