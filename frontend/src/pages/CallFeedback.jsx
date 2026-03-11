import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
    PlusCircleIcon,
    EllipsisVerticalIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../hooks/useApi';
import toast from 'react-hot-toast';


const DragHandle = () => (
    <svg className="w-5 h-5 text-gray-300 cursor-move hover:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 2a1 1 0 11-2 0 1 1 0 012 0zm0 5a1 1 0 11-2 0 1 1 0 012 0zM7 12a1 1 0 11-2 0 1 1 0 012 0zm0 5a1 1 0 11-2 0 1 1 0 012 0zm6-15a1 1 0 11-2 0 1 1 0 012 0zm0 5a1 1 0 11-2 0 1 1 0 012 0zM13 12a1 1 0 11-2 0 1 1 0 012 0zm0 5a1 1 0 11-2 0 1 1 0 012 0z" />
    </svg>
);

const StatusItem = ({ status, onDelete }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 rounded-lg group transition-colors">
        <div className="flex items-center gap-4">
            <DragHandle />
            <span className="text-sm font-medium text-gray-700">{status.label}</span>
            {status.isDefault && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#08A698]/10 text-[#08A698]">
                    default
                </span>
            )}
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={() => onDelete(status.id)}
                className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
            >
                <TrashIcon className="w-5 h-5" />
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
        </div>
    </div>
);

export default function CallFeedback() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { apiFetch } = useApi();
    const [statuses, setStatuses] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newLabel, setNewLabel] = useState('');

    const fetchStatuses = async () => {
        try {
            const res = await apiFetch('/calls/feedback-statuses');
            const data = await res.json();
            if (res.ok) setStatuses(data);
        } catch (err) {
            console.error('Failed to fetch statuses', err);
        }
    };

    useEffect(() => {
        fetchStatuses();
    }, []);

    const handleAddStatus = async () => {
        if (!newLabel.trim()) return;
        try {
            const res = await apiFetch('/calls/feedback-statuses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ label: newLabel, position: statuses.length })
            });
            if (res.ok) {
                toast.success('Status added!');
                setNewLabel('');
                setIsAdding(false);
                fetchStatuses();
            }
        } catch (err) {
            toast.error('Failed to add status');
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await apiFetch(`/calls/feedback-statuses/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Status deleted');
                fetchStatuses();
            }
        } catch (err) {
            toast.error('Failed to delete status');
        }
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="max-w-4xl mx-auto space-y-6">

                        {/* Title Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Call Feedback</h1>
                            <p className="text-gray-500 text-sm">
                                Manage the outcomes available for your agents after each call.
                            </p>
                        </div>

                        {/* Settings Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">Available status ({statuses.length})</h2>
                                <button
                                    onClick={() => setIsAdding(!isAdding)}
                                    className="text-[#08A698] hover:text-[#068f82] transition-colors"
                                >
                                    <PlusCircleIcon className="w-8 h-8" strokeWidth={1.5} />
                                </button>
                            </div>

                            {isAdding && (
                                <div className="mb-4 flex gap-2">
                                    <input
                                        type="text"
                                        value={newLabel}
                                        onChange={(e) => setNewLabel(e.target.value)}
                                        placeholder="Enter status label (e.g. INTERESTED)"
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#08A698]"
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddStatus()}
                                    />
                                    <button
                                        onClick={handleAddStatus}
                                        className="bg-[#08A698] text-white px-4 py-2 rounded-lg font-medium"
                                    >
                                        Add
                                    </button>
                                </div>
                            )}

                            <div className="space-y-3">
                                {statuses.length > 0 ? (
                                    statuses.map(s => (
                                        <StatusItem key={s.id} status={s} onDelete={handleDelete} />
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 text-sm">No custom statuses yet.</p>
                                        <p className="text-xs text-gray-400 mt-1">Add one to get started.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
