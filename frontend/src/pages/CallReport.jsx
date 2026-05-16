import React from 'react';
import CallReportDashboard from '../components/CallReportDashboard';
import WorkspaceGuard from '../components/WorkspaceGuard';

export default function CallReport() {
    return (
        <WorkspaceGuard>
            <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-gray-50/50">
                <CallReportDashboard />
            </main>
        </WorkspaceGuard>
    );
}

