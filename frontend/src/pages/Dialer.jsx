import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import TeleDialer from '../components/TeleDialer';
import WorkspaceGuard from '../components/WorkspaceGuard';

export default function Dialer() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />
                <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-gray-50/50">
                    <WorkspaceGuard>
                        <TeleDialer />
                    </WorkspaceGuard>
                </main>
            </div>
        </div>
    );
}
