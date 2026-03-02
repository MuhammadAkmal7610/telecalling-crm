import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import WorkspaceModal from '../components/WorkspaceModal';
import { supabase } from '../lib/supabaseClient';
import { usePermission } from '../hooks/usePermission';
import {
    ArrowRightOnRectangleIcon,
    PlusIcon,
    CheckCircleIcon,
    UserIcon,
    BuildingOfficeIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const ManageWorkspaces = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();
    const { can } = usePermission();

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const fetchWorkspaces = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await fetch(`${API_URL}/workspaces`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setWorkspaces(data);
            }
        } catch (error) {
            console.error('Error fetching workspaces:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWorkspaceCreated = (newWorkspace) => {
        setWorkspaces([...workspaces, newWorkspace]);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="max-w-5xl mx-auto space-y-8">

                        <div className="flex items-center justify-between">
                            <div className='flex items-center gap-3'>
                                <BuildingOfficeIcon className="w-8 h-8 text-gray-500" strokeWidth={1.5} />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                        Manage Workspaces
                                        <button
                                            onClick={fetchWorkspaces}
                                            className={`p-1.5 text-gray-400 hover:text-[#08A698] hover:bg-[#08A698]/5 rounded-full transition-colors ${loading ? 'animate-spin text-[#08A698]' : ''}`}
                                        >
                                            <ArrowPathIcon className="w-4 h-4" />
                                        </button>
                                    </h1>
                                    <p className="text-gray-500 text-sm mt-1">Switch between your active workspaces or create a new one.</p>
                                </div>
                            </div>

                            <button onClick={handleLogout} className="flex items-center gap-2 text-[#08A698] text-sm font-semibold hover:text-[#068f82] transition-colors bg-white border border-[#08A698]/20 px-4 py-2 rounded-lg hover:bg-[#08A698]/5 shadow-sm">
                                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                Logout
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 rounded-t-xl flex items-center justify-between">
                                <h2 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1">
                                    EXISTING WORKSPACES ({workspaces.length})
                                </h2>
                            </div>

                            <div className="p-6 space-y-4 rounded-b-xl">
                                {loading && workspaces.length === 0 ? (
                                    <div className="flex justify-center py-8">
                                        <ArrowPathIcon className="w-8 h-8 text-[#08A698] animate-spin" />
                                    </div>
                                ) : workspaces.length > 0 ? (
                                    workspaces.map((workspace) => (
                                        <div key={workspace.id} className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:border-[#08A698] hover:shadow-md transition-all duration-200 cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#08A698]/10 flex items-center justify-center text-[#08A698] font-bold text-lg">
                                                    {workspace.name.substring(0, 1).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[#08A698] font-semibold text-base group-hover:text-[#068f82] transition-colors">
                                                        {workspace.name}
                                                    </span>
                                                    {workspace.description && <span className="text-xs text-gray-400 line-clamp-1">{workspace.description}</span>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full text-gray-500 text-[10px] font-bold uppercase tracking-wide">
                                                <UserIcon className="w-3.5 h-3.5" />
                                                MEMBER
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-400">No workspaces found. Create your first one.</div>
                                )}
                            </div>

                            {/* Create button — admin only */}
                            {can('manage_workspaces') && (
                                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 rounded-b-xl flex justify-center">
                                    <button
                                        onClick={() => setModalOpen(true)}
                                        className="flex items-center gap-2 text-sm font-bold text-[#08A698] hover:bg-[#08A698]/10 px-6 py-2.5 rounded-lg transition-colors border border-transparent hover:border-[#08A698]/20"
                                    >
                                        <PlusIcon className="w-5 h-5" strokeWidth={2.5} />
                                        Create New Workspace
                                    </button>
                                </div>
                            )}
                            {!can('manage_workspaces') && (
                                <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/30 rounded-b-xl text-center">
                                    <p className="text-xs text-gray-400">Contact your admin to create workspaces.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </main>
            </div>

            <WorkspaceModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onCreated={handleWorkspaceCreated}
            />
        </div>
    );
};

export default ManageWorkspaces;
