import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import LeadDetailModal from '../components/LeadDetailModal';
import LeadFormModal from '../components/LeadFormModal';
import WorkspaceGuard from '../components/WorkspaceGuard';
import { useApi } from '../hooks/useApi';
import { useWorkspace } from '../context/WorkspaceContext';
import { useEffect, useState } from 'react';

import {
    PlusIcon,
    MagnifyingGlassIcon,
    EllipsisHorizontalIcon,
    Bars3CenterLeftIcon,
    FunnelIcon,
    UserCircleIcon,
    PhoneIcon,
    CalendarIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';


export default function Pipeline() {
    const { apiFetch } = useApi();
    const { currentWorkspace } = useWorkspace();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [columns, setColumns] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [totalLeads, setTotalLeads] = useState(0);

    useEffect(() => {
        fetchPipelineData();
    }, [currentWorkspace]);

    const fetchPipelineData = async () => {
        setLoading(true);
        try {
            const [stagesRes, leadsRes] = await Promise.all([
                apiFetch('/lead-stages'),
                apiFetch('/leads?limit=1000')
            ]);

            const stagesData = await stagesRes.json();
            const leadsData = await leadsRes.json();

            const stages = Array.isArray(stagesData.data) ? stagesData.data : (Array.isArray(stagesData) ? stagesData : []);
            const leads = Array.isArray(leadsData.data?.data) ? leadsData.data.data : (Array.isArray(leadsData.data) ? leadsData.data : []);

            setTotalLeads(leads.length);

            const cols = {};
            stages.forEach(stage => {
                cols[stage.id] = {
                    id: stage.id,
                    title: stage.name,
                    color: stage.color || getStageColor(stage.name),
                    badgeColor: getStageBadgeColor(stage.name),
                    items: leads.filter(l => l.stage_id === stage.id).map(l => ({
                        id: l.id,
                        name: l.name,
                        phone: l.phone || 'N/A',
                        assigneeInitials: l.assignee?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'UN',
                        assigneeName: l.assignee?.name || 'Unassigned',
                        time: getTimeAgo(l.updated_at),
                        original: l
                    }))
                };
            });

            setColumns(cols);
        } catch (error) {
            console.error('Error fetching pipeline data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStageColor = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('fresh')) return 'border-blue-500';
        if (lower.includes('attempt')) return 'border-yellow-500';
        if (lower.includes('connected')) return 'border-slate-400';
        if (lower.includes('interested')) return 'border-teal-500';
        if (lower.includes('won')) return 'border-green-500';
        if (lower.includes('lost')) return 'border-red-500';
        return 'border-gray-300';
    };

    const getStageBadgeColor = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('fresh')) return 'bg-blue-50 text-blue-700';
        if (lower.includes('attempt')) return 'bg-yellow-50 text-yellow-700';
        if (lower.includes('connected')) return 'bg-slate-50 text-slate-700';
        if (lower.includes('interested')) return 'bg-teal-50 text-teal-700';
        if (lower.includes('won')) return 'bg-green-50 text-green-700';
        if (lower.includes('lost')) return 'bg-red-50 text-red-700';
        return 'bg-gray-50 text-gray-700';
    };

    const getTimeAgo = (date) => {
        if (!date) return 'N/A';
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m";
        return Math.floor(seconds) + "s";
    };

    const handleLeadClick = (item) => {
        setSelectedLead({
            ...item.original,
            assignee: item.assigneeName,
            time: item.time + " ago"
        });
        setIsDetailModalOpen(true);
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <LeadDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                lead={selectedLead}
            />
            <LeadFormModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchPipelineData}
            />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 relative">
                    <WorkspaceGuard>
                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sticky left-0">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
                                <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-xs font-bold text-gray-500 shadow-sm">
                                    {totalLeads} Leads
                                </span>
                                <button onClick={fetchPipelineData} className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-white transition-all shadow-sm">
                                    <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="relative group">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#08A698] transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#08A698] focus:ring-1 focus:ring-[#08A698] w-64 transition-all shadow-sm"
                                    />
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:border-[#08A698] hover:text-[#08A698] transition-colors shadow-sm">
                                    <FunnelIcon className="w-4 h-4" /> Filter
                                </button>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#08A698] hover:bg-[#078F82] text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all"
                                >
                                    <PlusIcon className="w-5 h-5" /> Add Lead
                                </button>
                            </div>
                        </div>

                        {/* Board */}
                        <div className="flex gap-4 h-[calc(100%-80px)] min-w-max pb-4 items-start">
                            {loading ? (
                                <div className="flex gap-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-72 h-[600px] bg-gray-50/50 rounded-xl border border-gray-200 border-dashed animate-pulse"></div>
                                    ))}
                                </div>
                            ) : Object.keys(columns).length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-gray-300 py-20 min-w-[800px]">
                                    <Bars3CenterLeftIcon className="w-12 h-12 text-gray-200 mb-4" />
                                    <p className="text-gray-400 font-medium italic">No pipeline stages found</p>
                                    <p className="text-xs text-gray-300 mt-1">Configure stages in settings to see them here.</p>
                                </div>
                            ) : (
                                Object.values(columns).map((column) => (
                                    <div key={column.id} className="w-72 flex-shrink-0 flex flex-col h-full bg-gray-50/50 rounded-xl border border-gray-200/80 max-h-full">
                                        {/* Column Header */}
                                        <div className={`p-3 border-t-4 rounded-t-xl bg-white border-b border-gray-200/50 flex items-center justify-between ${column.color.startsWith('border') ? column.color : ''}`} style={!column.color.startsWith('border') ? { borderTopColor: column.color } : {}}>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-sm text-gray-800">{column.title}</h3>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm ${column.badgeColor}`}>{column.items.length}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 focus:outline-none transition-colors">
                                                    <PlusIcon className="w-4 h-4" />
                                                </button>
                                                <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 focus:outline-none transition-colors">
                                                    <EllipsisHorizontalIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Column Items */}
                                        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                                            {column.items.length === 0 ? (
                                                <div className="py-12 text-center text-[10px] text-gray-400 italic">No leads in this stage</div>
                                            ) : (
                                                column.items.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => handleLeadClick(item)}
                                                        className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition-all group relative border-l-4 border-l-transparent hover:border-l-primary active:scale-[0.98] animate-in fade-in slide-in-from-bottom-2 duration-300"
                                                    >
                                                        <div className="flex justify-between items-start mb-2.5">
                                                            <h3 className="font-bold text-sm text-gray-800 group-hover:text-primary transition-colors line-clamp-1 pr-6" title={item.name}>{item.name}</h3>
                                                            <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 text-[#08A698] text-[10px] font-bold flex items-center justify-center shadow-sm shrink-0">
                                                                {item.assigneeInitials}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-1.5 rounded-lg border border-gray-100/50">
                                                                <PhoneIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                                <span className="font-medium tracking-tight whitespace-nowrap">{item.phone}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-1.5 text-[10px] text-gray-400 font-semibold pt-1">
                                                                <div className="flex items-center gap-1">
                                                                    <CalendarIcon className="w-3 h-3" />
                                                                    {item.time} ago
                                                                </div>
                                                                <div className="px-1.5 bg-gray-100 rounded text-gray-500">ID: {item.id.substring(0, 4)}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}

                            {!loading && Object.keys(columns).length > 0 && (
                                <button className="w-72 flex-shrink-0 h-14 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-400 font-bold text-sm hover:bg-white hover:border-primary hover:text-primary transition-all focus:outline-none shadow-sm group">
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                                        <PlusIcon className="w-5 h-5" />
                                    </div>
                                    Add Stage
                                </button>
                            )}
                        </div>
                    </WorkspaceGuard>
                </main>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
}
