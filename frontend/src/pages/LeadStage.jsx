import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import WorkspaceGuard from '../components/WorkspaceGuard';
import ConfirmModal from '../components/ConfirmModal';
import { supabase } from '../lib/supabaseClient';
import {
    FunnelIcon,
    PencilIcon,
    TrashIcon,
    PlusIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const GripIcon = () => (
    <svg className="w-4 h-4 text-gray-400 cursor-grab" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v.01M12 12v.01M12 18v.01M12 6v.01M12 12v.01M12 18v.01" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 6v.01M9 12v.01M9 18v.01M15 6v.01M15 12v.01M15 18v.01" />
    </svg>
);

const StageItem = ({ name, isDefault, colorClass = "bg-gray-200/50 border-gray-300", showActions = false }) => (
    <div className={`group flex items-center justify-between p-3 rounded-lg border ${colorClass} mb-2 select-none hover:shadow-sm transition-all`}>
        <div className="flex items-center gap-3">
            <GripIcon />
            <span className="text-sm font-medium text-gray-700">{name}</span>
            {isDefault && (
                <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Default
                </span>
            )}
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1 hover:bg-black/5 rounded">
                <PencilIcon className="w-3.5 h-3.5 text-gray-500" />
            </button>
            {showActions && !isDefault && (
                <button
                    onClick={() => handleDeleteStage(id)}
                    className="p-1 hover:bg-black/5 rounded"
                >
                    <TrashIcon className="w-3.5 h-3.5 text-gray-500" />
                </button>
            )}
        </div>
    </div>
);

const ArrowHeader = ({ title, type }) => {
    let bgClass = "bg-[#F3F4F6]"; // Gray
    let textClass = "text-gray-600";

    if (type === 'active') {
        bgClass = "bg-[#E6FFFA]"; // Light Teal
        textClass = "text-[#08A698]";
    } else if (type === 'closed') {
        bgClass = "bg-[#DCFCE7]"; // Green-100
        textClass = "text-green-700";
    }

    return (
        <div className={`relative h-11 w-full ${bgClass} flex items-center justify-center mb-6`}>
            {type !== 'initial' && (
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-white" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}></div>
            )}
            <h3 className={`font-bold ${textClass} text-sm uppercase tracking-wide`}>{title}</h3>
            <div className="absolute -right-4 top-0 bottom-0 w-4 z-10" style={{ backgroundColor: 'inherit', clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}></div>
        </div>
    )
}

export default function LeadStage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stages, setStages] = useState([]);
    const [lostReasons, setLostReasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState(null); // 'stage' or 'reason'

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const headers = { 'Authorization': `Bearer ${session.access_token}` };

            const [stagesRes, reasonsRes] = await Promise.all([
                fetch(`${API_URL}/lead-stages`, { headers }),
                fetch(`${API_URL}/lead-stages/lost-reasons`, { headers })
            ]);

            const stagesData = await stagesRes.json();
            const reasonsData = await reasonsRes.json();

            setStages(Array.isArray(stagesData.data) ? stagesData.data : (Array.isArray(stagesData) ? stagesData : []));
            setLostReasons(Array.isArray(reasonsData.data) ? reasonsData.data : (Array.isArray(reasonsData) ? reasonsData : []));
        } catch (error) {
            console.error("Error fetching lead stages:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStage = (id) => {
        setItemToDelete(id);
        setDeleteType('stage');
        setIsConfirmOpen(true);
    };

    const handleDeleteReason = (id) => {
        setItemToDelete(id);
        setDeleteType('reason');
        setIsConfirmOpen(true);
    };

    const confirmDelete = async () => {
        setIsConfirmOpen(false);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const endpoint = deleteType === 'stage' ? `lead-stages/${itemToDelete}` : `lead-stages/lost-reasons/${itemToDelete}`;
            const res = await fetch(`${API_URL}/${endpoint}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (res.ok) {
                fetchData();
            }
        } catch (error) {
            console.error("Failed to delete", error);
        } finally {
            setItemToDelete(null);
            setDeleteType(null);
        }
    };

    const initialStages = stages.filter(s => s.type === 'initial');
    const activeStages = stages.filter(s => s.type === 'active');
    const wonStages = stages.filter(s => s.type === 'won');
    const lostStages = stages.filter(s => s.type === 'lost');

    return (
        <div className="flex h-screen bg-white text-[#202124] font-sans antialiased">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <WorkspaceGuard>
                        <div className="max-w-7xl mx-auto">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-3">
                                    <FunnelIcon className="w-6 h-6 text-gray-500" />
                                    <h1 className="text-xl font-bold text-gray-900">Lead stages</h1>
                                </div>
                                <button onClick={fetchData} className="p-2 text-gray-400 hover:text-primary transition-colors">
                                    <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 mb-8 ml-9">
                                <p className="text-sm text-gray-500">Configure Your Sales Pipeline</p>
                                <a href="#" className="text-xs text-[#6B21A8] hover:underline font-medium" style={{ color: '#5b21b6' }}>How to use</a>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-[400px] bg-gray-50 rounded-xl border border-gray-200"></div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Column 1: Initial Stage */}
                                    <div className="flex flex-col">
                                        <ArrowHeader title="Initial stage" type="initial" />
                                        <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/30 min-h-[200px]">
                                            {initialStages.map(stage => (
                                                <StageItem key={stage.id} name={stage.name} isDefault={stage.is_default} />
                                            ))}
                                            {initialStages.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No initial stages</p>}
                                        </div>
                                    </div>

                                    {/* Column 2: Active Stage */}
                                    <div className="flex flex-col">
                                        <ArrowHeader title="Active stage" type="active" />
                                        <div className="space-y-4">
                                            <button className="w-full py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-600 hover:border-[#08A698] hover:text-[#08A698] transition-colors flex items-center justify-center gap-2 shadow-sm">
                                                <PlusIcon className="w-4 h-4" /> Add
                                            </button>
                                            <div className="p-4 border border-[#08A698]/20 rounded-xl bg-[#08A698]/5">
                                                {activeStages.map(stage => (
                                                    <StageItem
                                                        key={stage.id}
                                                        name={stage.name}
                                                        colorClass={stage.color || 'bg-white text-gray-800 border-gray-200'}
                                                        showActions={true}
                                                    />
                                                ))}
                                                {activeStages.length === 0 && <p className="text-xs text-secondary text-center py-4">No active stages</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 3: Closed Stage */}
                                    <div className="flex flex-col">
                                        <ArrowHeader title="Closed stage" type="closed" />
                                        <div className="space-y-6">
                                            {/* Won Section */}
                                            <div className="border border-green-200 bg-green-50/50 rounded-xl overflow-hidden">
                                                <div className="px-4 py-2 bg-green-100/80 border-b border-green-200">
                                                    <h4 className="text-sm font-bold text-green-800">Won</h4>
                                                </div>
                                                <div className="p-3">
                                                    {wonStages.map(stage => (
                                                        <StageItem key={stage.id} name={stage.name} colorClass="bg-green-200/50 border-green-300" />
                                                    ))}
                                                    {wonStages.length === 0 && <StageItem name="Won" colorClass="bg-green-200/50 border-green-300" />}
                                                </div>
                                            </div>

                                            {/* Lost Section */}
                                            <div className="border border-rose-200 bg-rose-50/50 rounded-xl overflow-hidden">
                                                <div className="px-4 py-2 bg-rose-100/80 border-b border-rose-200">
                                                    <h4 className="text-sm font-bold text-rose-800">Lost</h4>
                                                </div>
                                                <div className="p-3 pb-0">
                                                    {lostStages.map(stage => (
                                                        <StageItem key={stage.id} name={stage.name} colorClass="bg-rose-200/50 border-rose-300" />
                                                    ))}
                                                    {lostStages.length === 0 && <StageItem name="Lost" colorClass="bg-rose-200/50 border-rose-300" />}
                                                </div>

                                                {/* Reasons */}
                                                <div className="px-4 py-4 mt-2">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-xs font-medium text-gray-500">Reason for Lost leads <span className="text-gray-400">({lostReasons.length})</span></span>
                                                        <button className="text-xs font-bold text-[#6B21A8] hover:underline flex items-center gap-1" style={{ color: '#5b21b6' }}>
                                                            <PlusIcon className="w-3 h-3" /> Add
                                                        </button>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {lostReasons.map((r, idx) => (
                                                            <div key={r.id || idx} className="group flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-white px-2 -mx-2 rounded transition-colors">
                                                                <div className="flex items-center gap-3">
                                                                    <GripIcon />
                                                                    <span className="text-sm text-gray-600">{r.reason || r.name}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                                                                    <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"><PencilIcon className="w-3 h-3" /></button>
                                                                    <button
                                                                        onClick={() => handleDeleteReason(r.id)}
                                                                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500"
                                                                    >
                                                                        <TrashIcon className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {lostReasons.length === 0 && <p className="text-center py-4 text-xs text-gray-400 italic">No lost reasons defined</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </WorkspaceGuard>
                </main>
            </div>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title={deleteType === 'stage' ? "Delete Stage" : "Delete Reason"}
                message={`Are you sure you want to delete this ${deleteType}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
}
