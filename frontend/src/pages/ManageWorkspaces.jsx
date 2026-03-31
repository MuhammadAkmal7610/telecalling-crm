import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import WorkspaceModal from '../components/WorkspaceModal';
import ConfirmModal from '../components/ConfirmModal';
import { supabase } from '../lib/supabaseClient';
import { usePermission } from '../hooks/usePermission';
import {
    ArrowRightOnRectangleIcon,
    PlusIcon,
    CheckCircleIcon,
    UserIcon,
    BuildingOfficeIcon,
    ArrowPathIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const ManageWorkspaces = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [workspaceToDelete, setWorkspaceToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

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
                const result = await response.json();
                setWorkspaces(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching workspaces:', error);
            toast.error('Failed to load workspaces');
        } finally {
            setLoading(false);
        }
    };

    const handleWorkspaceCreated = (newWorkspace) => {
        setWorkspaces([...workspaces, newWorkspace]);
        toast.success('Workspace created successfully!');
    };

    const handleDeleteClick = (e, workspace) => {
        e.stopPropagation();
        if (workspace.is_default) {
            return toast.error('Default workspace cannot be deleted');
        }
        setWorkspaceToDelete(workspace);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!workspaceToDelete) return;
        setDeleting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${API_URL}/workspaces/${workspaceToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            if (response.ok) {
                setWorkspaces(workspaces.filter(w => w.id !== workspaceToDelete.id));
                toast.success('Workspace deleted successfully');
                setDeleteModalOpen(false);
            } else {
                const err = await response.json();
                toast.error(err.message || 'Failed to delete workspace');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setDeleting(false);
        }
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

                <main className="flex-1 overflow-y-auto p-6 lg:p-10">
                    <div className="max-w-5xl mx-auto space-y-10">

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className='flex items-center gap-4'>
                                <div className="p-3 bg-white border border-gray-100 shadow-sm rounded-2xl">
                                    <BuildingOfficeIcon className="w-10 h-10 text-teal-600" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                                        Workspaces
                                        <button
                                            onClick={fetchWorkspaces}
                                            className={`p-2 text-gray-400 hover:text-[#08A698] hover:bg-[#08A698]/5 rounded-full transition-all ${loading ? 'animate-spin text-[#08A698]' : ''}`}
                                        >
                                            <ArrowPathIcon className="w-5 h-5" />
                                        </button>
                                    </h1>
                                    <p className="text-gray-500 font-medium mt-1">Manage your team's environments and access levels.</p>
                                </div>
                            </div>

                            <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 text-sm font-black hover:bg-red-50 transition-all border border-red-100 px-6 py-3 rounded-2xl shadow-sm bg-white">
                                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>

                        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all">
                            <div className="px-10 py-8 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    ALL WORKSPACES <span className="text-teal-600 bg-teal-50 px-3 py-0.5 rounded-full text-xs">{workspaces.length}</span>
                                </h2>
                            </div>

                            <div className="p-4 sm:p-10 space-y-6">
                                {loading && workspaces.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <ArrowPathIcon className="w-12 h-12 text-[#08A698] animate-spin mb-4" />
                                        <p className="text-gray-400 font-bold">Synchronizing workspaces...</p>
                                    </div>
                                ) : workspaces.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {workspaces.map((workspace) => (
                                            <div key={workspace.id} className="group relative flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl hover:border-teal-200 hover:shadow-2xl hover:shadow-teal-100/30 transition-all duration-300 cursor-pointer overflow-hidden">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-black text-2xl shadow-lg ring-4 ring-teal-50">
                                                        {workspace.name.substring(0, 1).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-900 font-extrabold text-xl group-hover:text-teal-600 transition-colors">
                                                            {workspace.name}
                                                        </span>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {workspace.is_default && <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-wider border border-blue-100">Primary</span>}
                                                            {workspace.description && <span className="text-sm text-gray-400 font-medium line-clamp-1">{workspace.description}</span>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl text-gray-500 text-[10px] font-black tracking-widest uppercase border border-gray-100">
                                                        <UserIcon className="w-4 h-4" />
                                                        MEMBER
                                                    </div>

                                                    {can('manage_workspaces') && !workspace.is_default && (
                                                        <button
                                                            onClick={(e) => handleDeleteClick(e, workspace)}
                                                            className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                                                            title="Delete Workspace"
                                                        >
                                                            <TrashIcon className="w-6 h-6" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <BuildingOfficeIcon className="w-10 h-10 text-gray-300" />
                                        </div>
                                        <h3 className="text-gray-900 font-black text-xl">No Workspaces Found</h3>
                                        <p className="text-gray-400 font-medium mt-2">Get started by creating your first workspace.</p>
                                    </div>
                                )}
                            </div>

                            {/* Create button — admin only */}
                            {can('manage_workspaces') && (
                                <div className="px-10 py-8 border-t border-gray-100 bg-gray-50/30 flex justify-center">
                                    <button
                                        onClick={() => setModalOpen(true)}
                                        className="flex items-center gap-3 text-lg font-black text-white bg-[#08A698] hover:bg-teal-700 px-10 py-5 rounded-[2rem] transition-all shadow-xl shadow-teal-100 active:scale-95"
                                    >
                                        <PlusIcon className="w-6 h-6" strokeWidth={3} />
                                        Create Workspace
                                    </button>
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

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                loading={deleting}
                title="Delete Workspace?"
                message={`Are you sure you want to delete "${workspaceToDelete?.name}"? Note that only empty workspaces (with no leads, tasks, or campaigns) can be deleted. This action cannot be undone.`}
                confirmText="Delete Workspace"
                type="danger"
            />
        </div>
    );
};

export default ManageWorkspaces;
