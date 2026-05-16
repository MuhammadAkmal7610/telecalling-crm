import React from 'react';
import TeleDialer from '../components/TeleDialer';
import WorkspaceGuard from '../components/WorkspaceGuard';

export default function Dialer() {
    return (
        <WorkspaceGuard>
            <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-gray-50/50">
                <TeleDialer />
            </main>
        </WorkspaceGuard>
    );
}

