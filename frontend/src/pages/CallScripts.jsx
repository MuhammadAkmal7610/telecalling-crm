import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import WorkspaceGuard from '../components/WorkspaceGuard';
import ConfirmModal from '../components/ConfirmModal';
import { useApi } from '../hooks/useApi';
import { useWorkspace } from '../context/WorkspaceContext';
import { PlusIcon, DocumentTextIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function CallScripts() {
    const { apiFetch } = useApi();
    const { currentWorkspace } = useWorkspace();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [scripts, setScripts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [currentScript, setCurrentScript] = useState(null);
    const [formData, setFormData] = useState({ title: '', category: '', content: '' });
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        if (currentWorkspace?.id) {
            fetchScripts();
        }
    }, [currentWorkspace?.id]);

    const fetchScripts = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/scripts');
            if (res.ok) {
                const result = await res.json();
                const dataArray = result.data || result;
                setScripts(Array.isArray(dataArray) ? dataArray : []);
            } else if (res.status === 401) {
                console.error('Unauthorized access to scripts');
            }
        } catch (error) {
            console.error('Error fetching scripts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, script = null) => {
        setModalMode(mode);
        setCurrentScript(script);
        setFormData(script ? { title: script.title, category: script.category, content: script.content } : { title: '', category: '', content: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentScript(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const path = modalMode === 'edit' ? `/scripts/${currentScript.id}` : '/scripts';
            const method = modalMode === 'edit' ? 'PATCH' : 'POST';

            const res = await apiFetch(path, {
                method,
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(modalMode === 'edit' ? 'Script updated' : 'Script created');
                fetchScripts();
                handleCloseModal();
            } else {
                const errData = await res.json();
                toast.error(errData.message || 'Failed to save script');
            }
        } catch (error) {
            console.error('Failed to save script:', error);
            toast.error('Failed to save script');
        }
    };

    const handleDelete = async (id) => {
        setItemToDelete(id);
        setIsConfirmOpen(true);
    };

    const confirmDelete = async () => {
        const id = itemToDelete;
        setIsConfirmOpen(false);
        try {
            const res = await apiFetch(`/scripts/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success('Script deleted');
                fetchScripts();
            } else {
                toast.error('Failed to delete script');
            }
        } catch (error) {
            console.error("Failed to delete script", error);
            toast.error('Failed to delete script');
        } finally {
            setItemToDelete(null);
        }
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
                    <WorkspaceGuard>
                        <div className="max-w-6xl mx-auto">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Call Scripts</h1>
                                    <p className="text-gray-500 mt-1">Manage standard scripts for your agents to use during telecalling.</p>
                                </div>
                                <button
                                    onClick={() => handleOpenModal('create')}
                                    className="flex items-center gap-2 bg-[#08A698] text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition shadow-sm"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    Create New Script
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {loading ? (
                                    <div className="col-span-full text-center py-12 text-gray-500">Loading scripts...</div>
                                ) : scripts.length === 0 ? (
                                    <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                        <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <h3 className="text-gray-900 font-medium mb-1">No Scripts Found</h3>
                                        <p className="text-gray-500 text-sm">Create your first call script to get started.</p>
                                    </div>
                                ) : scripts.map((script) => (
                                    <div key={script.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col relative group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="bg-teal-50 text-[#08A698] p-2 rounded-lg">
                                                <DocumentTextIcon className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                                                {script.category}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{script.title}</h3>
                                        <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1 indent-1 italic border-l-2 border-gray-200 pl-3">
                                            "{script.content}"
                                        </p>
                                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                                            <span className="text-xs text-gray-400">Edited: {new Date(script.updated_at || script.created_at).toLocaleDateString()}</span>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenModal('edit', script)} className="p-1.5 text-gray-400 hover:text-blue-500 rounded bg-gray-50 hover:bg-blue-50 transition">
                                                    <PencilIcon className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(script.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded bg-gray-50 hover:bg-red-50 transition">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </WorkspaceGuard>
                </main>
            </div>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Script"
                message="Are you sure you want to delete this call script? Agents will no longer be able to use it."
                confirmText="Delete"
                cancelText="Cancel"
            />

            {/* Script Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {modalMode === 'create' ? 'Create New Script' : 'Edit Script'}
                                </h3>
                                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1">
                                <form id="script-form" onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Script Title <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="title"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#08A698]/20 focus:border-[#08A698] outline-none transition-all placeholder-gray-400"
                                            placeholder="e.g. Standard Objections"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#08A698]/20 focus:border-[#08A698] outline-none transition-all bg-white"
                                        >
                                            <option value="" disabled>Select a category</option>
                                            <option value="intro">Introduction</option>
                                            <option value="followup">Follow up</option>
                                            <option value="objection">Handling Objection</option>
                                            <option value="closing">Closing</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content <span className="text-red-500">*</span></label>
                                        <textarea
                                            rows="6"
                                            required
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#08A698]/20 focus:border-[#08A698] outline-none transition-all resize-none placeholder-gray-400 leading-relaxed"
                                            placeholder="Type your script here. You can use placeholders like [Lead Name] or [Agent Name]..."
                                        ></textarea>
                                    </div>
                                </form>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors border border-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="script-form"
                                    className="px-5 py-2.5 bg-[#08A698] hover:bg-teal-700 text-white font-medium rounded-lg shadow-sm transition-all flex items-center gap-2"
                                >
                                    {modalMode === 'create' ? <PlusIcon className="w-5 h-5" /> : <PencilIcon className="w-4 h-4" />}
                                    {modalMode === 'create' ? 'Create Script' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
