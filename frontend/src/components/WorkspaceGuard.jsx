import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { BuildingOfficeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

/**
 * WorkspaceGuard
 * 
 * Wraps content that requires an active workspace.
 * If no workspace is selected, shows a centered CTA to select one.
 */
const WorkspaceGuard = ({ children }) => {
    const { currentWorkspace, loading } = useWorkspace();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-teal-100 border-t-[#08A698] rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium">Loading workspace...</p>
            </div>
        );
    }

    if (!currentWorkspace) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] p-8 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-teal-50 rounded-3xl flex items-center justify-center mb-8 shadow-sm ring-1 ring-teal-100/50 group hover:scale-110 transition-transform duration-300">
                    <BuildingOfficeIcon className="w-12 h-12 text-[#08A698] group-hover:rotate-12 transition-transform" />
                </div>

                <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Workspace Required</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-10 text-lg leading-relaxed">
                    To access this page, you need to select an active workspace. This helps us scope your data correctly.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        to="/manage-workspaces"
                        className="inline-flex items-center justify-center px-8 py-4 bg-[#08A698] text-white font-bold rounded-2xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 active:scale-95 text-lg"
                    >
                        Select Workspace
                    </Link>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-600 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all text-lg"
                    >
                        <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default WorkspaceGuard;
