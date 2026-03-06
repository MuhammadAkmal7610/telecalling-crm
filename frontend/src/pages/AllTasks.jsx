import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import TaskBoard from '../components/TaskBoard';
import WorkspaceGuard from '../components/WorkspaceGuard';

const AllTasks = () => {
    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto bg-white p-6">
                    <WorkspaceGuard>
                        <TaskBoard />
                    </WorkspaceGuard>
                </main>
            </div>
        </div>
    );
};

export default AllTasks;
