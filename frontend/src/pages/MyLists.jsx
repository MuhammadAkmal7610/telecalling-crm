import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useApi } from '../hooks/useApi';
import { toast } from 'react-hot-toast';
import {
    MagnifyingGlassIcon,
    PlusIcon,
    EllipsisHorizontalIcon,
    UserGroupIcon,
    CalendarIcon,
    ArrowRightIcon,
    TrashIcon,
    PencilSquareIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export default function MyLists() {
    const { apiFetch } = useApi();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [newListDesc, setNewListDesc] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchLists();
    }, []);

    const fetchLists = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/lists');
            if (res.ok) {
                const result = await res.json();
                // The backend TransformInterceptor wraps response in { success, data, ... }
                setLists(result.data || []);
            }
        } catch (error) {
            console.error('Fetch lists failed', error);
            toast.error('Failed to load lists');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateList = async (e) => {
        e.preventDefault();
        if (!newListName.trim()) {
            toast.error('Please enter a list name');
            return;
        }

        setCreating(true);
        try {
            const res = await apiFetch('/lists', {
                method: 'POST',
                body: JSON.stringify({
                    name: newListName,
                    description: newListDesc,
                    color: 'bg-teal-50 text-teal-600 border-teal-100'
                })
            });

            if (res.ok) {
                toast.success('List created successfully');
                setIsCreateModalOpen(false);
                setNewListName('');
                setNewListDesc('');
                fetchLists();
            } else {
                const error = await res.json();
                toast.error(error.message || 'Failed to create list');
            }
        } catch (error) {
            toast.error('Failed to create list');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteList = async (id) => {
        if (!window.confirm('Are you sure you want to delete this list?')) return;

        try {
            const res = await apiFetch(`/lists/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('List deleted successfully');
                setLists(lists.filter(l => l.id !== id));
            } else {
                toast.error('Failed to delete list');
            }
        } catch (error) {
            toast.error('Failed to delete list');
        }
    };

    const filteredLists = lists.filter(l => 
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        l.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased overflow-hidden">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col h-full min-w-0">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
                    <div className="mx-auto max-w-7xl space-y-8">

                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Lists</h1>
                                <p className="text-sm text-gray-500 mt-1">Organize and manage your custom lead collections.</p>
                            </div>
                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#08A698] hover:bg-[#068f82] text-white rounded-xl shadow-md hover:shadow-lg transition-all text-sm font-semibold"
                            >
                                <PlusIcon className="w-5 h-5" /> Create New List
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative max-w-md">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search your lists..."
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#08A698] focus:ring-1 focus:ring-[#08A698] transition-all shadow-sm placeholder-gray-400"
                            />
                        </div>

                        {/* Lists Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 h-48 animate-pulse shadow-sm" />
                                ))
                            ) : filteredLists.length > 0 ? (
                                filteredLists.map((list) => (
                                    <div key={list.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300 group cursor-pointer relative overflow-hidden flex flex-col">
                                        <div className={`absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10`}>
                                            <button className="p-1.5 text-gray-400 hover:text-[#08A698] bg-white rounded-lg shadow-sm border border-gray-100 hover:border-[#08A698] transition-colors">
                                                <PencilSquareIcon className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id); }}
                                                className="p-1.5 text-gray-400 hover:text-red-600 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-red-200 transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${list.color || 'bg-teal-50 text-teal-600'}`}>
                                                <UserGroupIcon className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-[#08A698] transition-colors truncate">{list.name}</h3>
                                                <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-1">
                                                    <CalendarIcon className="w-3.5 h-3.5" /> {new Date(list.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-500 mb-6 line-clamp-2 h-10 leading-relaxed">
                                            {list.description || 'No description provided.'}
                                        </p>

                                        <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-bold text-gray-900 tracking-tight">{list.count?.toLocaleString() || 0}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-1.5 py-0.5 rounded">Leads</span>
                                            </div>
                                            <button className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-400 group-hover:bg-[#08A698] group-hover:text-white transition-colors">
                                                <ArrowRightIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <QueueListIcon className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">No lists found</h3>
                                    <p className="text-gray-500 mt-1">Create your first custom collection to get started.</p>
                                </div>
                            )}

                            {/* Create New Placeholder Card */}
                            {!loading && (
                                <button 
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="bg-gray-50/30 rounded-xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center text-center hover:border-[#08A698] hover:bg-teal-50/10 transition-colors group h-full"
                                >
                                    <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-4 group-hover:border-[#08A698] transition-all shadow-sm group-hover:scale-110 duration-200">
                                        <PlusIcon className="w-7 h-7 text-gray-400 group-hover:text-[#08A698]" />
                                    </div>
                                    <h3 className="font-bold text-gray-600 group-hover:text-[#08A698] text-lg">Create New List</h3>
                                    <p className="text-sm text-gray-400 mt-1">Start a new collection</p>
                                </button>
                            )}

                        </div>

                    </div>
                </main>
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 pt-8 pb-4 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">New List</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <XMarkIcon className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateList} className="p-8 pt-0 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">List Name</label>
                                <input
                                    autoFocus
                                    required
                                    type="text"
                                    value={newListName}
                                    onChange={(e) => setNewListName(e.target.value)}
                                    placeholder="e.g., Hot Leads Q1"
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-[#08A698] focus:ring-4 focus:ring-[#08A698]/5 transition-all font-medium text-gray-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1 text-right">Description</label>
                                <textarea
                                    rows="3"
                                    value={newListDesc}
                                    onChange={(e) => setNewListDesc(e.target.value)}
                                    placeholder="What is this collection for?"
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-[#08A698] focus:ring-4 focus:ring-[#08A698]/5 transition-all font-medium text-gray-900 resize-none"
                                />
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 px-6 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-[1.5] px-6 py-4 bg-[#08A698] hover:bg-[#068f82] text-white font-bold rounded-2xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {creating ? 'Creating...' : <><PlusIcon className="w-5 h-5" /> Create List</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function QueueListIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
        </svg>
    )
}
