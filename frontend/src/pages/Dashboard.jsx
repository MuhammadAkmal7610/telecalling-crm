import React from 'react';
import ComprehensiveDashboard from '../components/ComprehensiveDashboard';
import WorkspaceGuard from '../components/WorkspaceGuard';

const Dashboard = () => {

    return (
        <div className="relative">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-teal-200/40 via-blue-200/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
            <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-gradient-to-tr from-teal-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

            <div className="mx-auto w-full">
                <WorkspaceGuard>
                    <ComprehensiveDashboard />
                </WorkspaceGuard>
            </div>
        </div>
    );
};

export default Dashboard;
