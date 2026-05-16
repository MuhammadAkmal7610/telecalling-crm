import React from 'react';
import TaskBoard from '../components/TaskBoard';
import WorkspaceGuard from '../components/WorkspaceGuard';

const AllTasks = () => {
    return (
        <WorkspaceGuard>
            <main className="flex-1 overflow-y-auto bg-white p-6">
                <TaskBoard />
            </main>
        </WorkspaceGuard>
    );
};

export default AllTasks;

