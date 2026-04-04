import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import WorkspaceGuard from '../components/WorkspaceGuard';
import { useApi } from '../hooks/useApi';
import { useWorkspace } from '../context/WorkspaceContext';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    PhoneIcon,
    ChatBubbleLeftIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    ClockIcon,
    EllipsisVerticalIcon,
    StarIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    UserIcon,
    MapPinIcon,
    MegaphoneIcon,
    HashtagIcon,
    ArrowLeftIcon,
    PencilSquareIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function WebsiteLeads() {
    const { apiFetch } = useApi();
    const { currentWorkspace } = useWorkspace();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState(null);
    const [leads, setLeads] = useState([]);
    const [activeTab, setActiveTab] = useState('Activity History');
    const [isReportColumnOpen, setIsReportColumnOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        fetchWebsiteLeads();
    }, [currentWorkspace]);

    useEffect(() => {
        if (selectedLeadId) {
            fetchLeadActivities(selectedLeadId);
        }
    }, [selectedLeadId]);

    const fetchWebsiteLeads = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/leads?source=Website&limit=100');
            const result = await res.json();
            const data = result.data?.data || result.data || [];
            setLeads(data);
            if (data.length > 0 && !selectedLeadId) setSelectedLeadId(data[0].id);
        } catch (error) {
            console.error('Error fetching website leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLeadActivities = async (leadId) => {
        try {
            const res = await apiFetch(`/activities?leadId=${leadId}`);
            const result = await res.json();
            let activitiesData = result.data || result || [];
            // Ensure activitiesData is an array
            if (!Array.isArray(activitiesData)) {
                activitiesData = [];
            }
            setActivities(activitiesData);
        } catch (error) {
            console.error('Error fetching lead activities:', error);
        }
    };

    const selectedLead = leads.find(l => l.id === selectedLeadId) || (leads.length > 0 ? leads[0] : null);

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

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-hidden flex flex-col lg:flex-row relative">
                    <WorkspaceGuard>

                        {!isReportColumnOpen && (
                            <button
                                onClick={() => setIsReportColumnOpen(true)}
                                className="absolute left-0 top-4 z-20 bg-white border border-l-0 border-gray-200 p-1.5 rounded-r-lg shadow-md text-gray-500 hover:text-[#08A698] hover:pl-2 transition-all"
                                title="Expand Reports"
                            >
                                <ChevronDownIcon className="w-4 h-4 transform -rotate-90" />
                            </button>
                        )}

                        {/* LEFT COLUMN: Reports & Filters */}
                        <div
                            className={`bg-white border-r border-gray-200 overflow-y-auto hidden lg:block custom-scrollbar transition-all duration-300 ease-in-out ${isReportColumnOpen ? 'w-full lg:w-1/5 opacity-100' : 'w-0 opacity-0 border-none'}`}
                        >
                            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 p-4 border-b border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="font-bold text-gray-800 truncate" title="Website Leads">Website Leads</h2>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => {
                                                const url = window.location.origin + "/f/OrganizationName"; // organization name should be dynamic
                                                navigator.clipboard.writeText(url);
                                                toast.success("Public form link copied!");
                                            }}
                                            className="p-1 px-2 text-[9px] font-black bg-teal-50 text-[#08A698] rounded border border-teal-100 hover:bg-[#08A698] hover:text-white transition-all shadow-sm"
                                            title="Copy Public Form Link"
                                        >
                                            FORM LINK
                                        </button>
                                        <button onClick={() => setIsReportColumnOpen(false)} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors">
                                            <ArrowLeftIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-3 text-xs text-gray-500 mb-3">
                                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-medium"><ChatBubbleLeftIcon className="w-3 h-3 text-[#08A698]" /> {leads.length} Leads</span>
                                </div>

                                <div className="flex items-center justify-between bg-gradient-to-br from-teal-50/30 to-white border border-teal-50 p-3 rounded-xl shadow-sm">
                                    <div className="flex -space-x-2">
                                        <div className="w-7 h-7 rounded-full bg-teal-50 border-2 border-white flex items-center justify-center text-[10px] text-teal-700 font-bold shadow-sm">MA</div>
                                    </div>
                                    <div className="relative w-11 h-11 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="22" cy="22" r="17" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                                            <circle cx="22" cy="22" r="17" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-[#08A698]" strokeDasharray="100" strokeDashoffset="30" strokeLinecap="round" />
                                        </svg>
                                        <span className="absolute text-[10px] font-bold text-gray-700">70%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-50">
                                <AccordionItem title="Campaign Assignees Report" isOpen={true}>
                                    <div className="py-4 text-center text-gray-400 text-[10px] italic">Report under processing...</div>
                                </AccordionItem>
                                <AccordionItem title="Campaign Calling Report" />
                                <AccordionItem title="Leads Status Report" />
                            </div>
                        </div>

                        {/* MIDDLE COLUMN: Lead List */}
                        <div className={`w-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${isReportColumnOpen ? 'lg:w-[30%]' : 'lg:w-[35%]'}`}>
                            <div className="flex border-b border-gray-200 bg-white">
                                <button className="flex-1 py-3 text-sm font-bold text-[#08A698] border-b-2 border-[#08A698] bg-teal-50/10">WEBSITE ({leads.length})</button>
                            </div>

                            <div className="p-3 border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
                                <div className="relative group">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#08A698] transition-colors" />
                                    <input type="text" placeholder="Search leads..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#08A698] focus:bg-white transition-all shadow-sm" />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {leads.length === 0 && !loading && (
                                    <div className="py-20 text-center text-gray-400 italic text-sm">No website leads found</div>
                                )}
                                {leads.map((lead) => (
                                    <div
                                        key={lead.id}
                                        onClick={() => setSelectedLeadId(lead.id)}
                                        className={`p-4 border-b border-gray-50 cursor-pointer transition-all duration-200 group ${selectedLeadId === lead.id ? 'bg-teal-50/50 border-l-4 border-l-[#08A698] shadow-inner' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1.5">
                                            <h3 className={`font-semibold text-sm truncate pr-2 ${selectedLeadId === lead.id ? 'text-[#08A698]' : 'text-gray-800'}`}>{lead.name}</h3>
                                            <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap bg-gray-100 px-1.5 py-0.5 rounded">{getTimeAgo(lead.created_at)}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mb-3 font-mono tracking-tight">{lead.phone}</div>
                                        <div className="flex items-center justify-between">
                                            <StatusBadge status={lead.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Lead Details */}
                        <div className="flex-1 bg-[#F8F9FA] flex flex-col overflow-hidden relative">
                            {selectedLead ? (
                                <>
                                    <div className="bg-white/80 backdrop-blur-md p-6 border-b border-gray-200 shadow-sm z-20 sticky top-0">
                                        <div className="flex justify-between items-start mb-5">
                                            <div>
                                                <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                                    {selectedLead.name}
                                                    <div className="flex gap-1.5 ml-2">
                                                        <button className="p-1.5 rounded-full bg-green-50 text-green-600 hover:bg-green-100 border border-green-100 transition-colors"><ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4" /></button>
                                                        <button className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 transition-colors"><PhoneIcon className="w-4 h-4" /></button>
                                                    </div>
                                                </h1>
                                                <div className="flex items-center gap-3">
                                                    <StatusBadge status={selectedLead.status} />
                                                    <div className="h-4 w-px bg-gray-300"></div>
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <StarIcon key={i} className="w-4 h-4 text-gray-300 hover:text-amber-400 cursor-pointer transition-colors" />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center justify-end gap-2 mb-1 p-1 pr-2 bg-white border border-gray-200 rounded-full shadow-sm">
                                                    <span className="w-6 h-6 rounded-full bg-teal-50 text-[#08A698] flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                                                        {selectedLead.assignee?.name?.substring(0, 2).toUpperCase() || 'UN'}
                                                    </span>
                                                    <span className="text-xs font-semibold text-gray-600">{selectedLead.assignee?.name || 'Unassigned'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-5 gap-x-12 mb-6">
                                            <div className="space-y-5">
                                                <InfoField label="Email" value={selectedLead.email || 'N/A'} icon={HashtagIcon} editable />
                                                <InfoField label="Alternate Phone" value={selectedLead.alt_phone || 'N/A'} icon={PhoneIcon} flag editable />
                                                <InfoField label="Source" value={selectedLead.source} icon={MegaphoneIcon} editable />
                                            </div>
                                            <div className="space-y-5">
                                                <InfoField label="Phone" value={selectedLead.phone} icon={PhoneIcon} flag editable />
                                                <InfoField label="Created At" value={new Date(selectedLead.created_at).toLocaleString()} icon={ClockIcon} />
                                                <InfoField label="Stage" value={selectedLead.stage?.name || 'None'} icon={HashtagIcon} editable />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-5 gap-3 mt-6 pt-5 border-t border-gray-100">
                                            <ActionButton icon={PhoneIcon} label="CALL" />
                                            <ActionButton icon={ClockIcon} label="CALL LATER" />
                                            <ActionButton icon={ChatBubbleLeftIcon} label="WHATSAPP" />
                                            <ActionButton icon={ChatBubbleOvalLeftEllipsisIcon} label="SMS" />
                                            <ActionButton icon={EllipsisVerticalIcon} label="ADD NOTE" />
                                        </div>
                                    </div>

                                    <div className="bg-white flex border-b border-gray-200 px-6 sticky top-[300px] z-10 shadow-sm">
                                        <TabButton label="Activity History" active={activeTab === 'Activity History'} onClick={() => setActiveTab('Activity History')} />
                                        <TabButton label="Task" active={activeTab === 'Task'} onClick={() => setActiveTab('Task')} />
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50/50">
                                        <div className="relative pl-2 space-y-0">
                                            <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-gray-200"></div>
                                            {activities.length === 0 ? (
                                                <div className="py-8 text-center text-gray-400 italic text-xs">No activity recorded for this lead</div>
                                            ) : (
                                                activities.map((act, idx) => (
                                                    <TimelineItem
                                                        key={act.id}
                                                        icon={<ArrowPathIcon className="w-3.5 h-3.5 text-teal-600" />}
                                                        bg="bg-teal-100 border-teal-200"
                                                        text={act.type + ": " + JSON.stringify(act.details)}
                                                        time={getTimeAgo(act.created_at)}
                                                        isLast={idx === activities.length - 1}
                                                    />
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-400 italic">Select a lead to view details</div>
                            )}
                        </div>
                    </WorkspaceGuard>
                </main>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </div>
    );
}

const AccordionItem = ({ title, isOpen = false, children }) => {
    const [open, setOpen] = useState(isOpen);
    return (
        <div className="border-b border-gray-50 last:border-0">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-[#08A698] transition-colors">
                {title}
                {open ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />}
            </button>
            {open && <div className="px-3 pb-3 animate-in slide-in-from-top-1 duration-200">{children}</div>}
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const s = status?.toLowerCase() || '';
    let style = 'bg-gray-50 text-gray-600 border-gray-200';
    if (s.includes('fresh')) style = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-100 shadow-sm';
    else if (s.includes('won')) style = 'bg-teal-50 text-teal-700 border-teal-200 ring-1 ring-teal-100 shadow-sm';
    else if (s.includes('lost')) style = 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-100 shadow-sm';

    return (
        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${style} uppercase tracking-wider`}>
            {status}
        </span>
    );
};

const InfoField = ({ label, value, icon: Icon, isPlaceholder, flag, editable }) => (
    <div className={`group ${editable ? 'cursor-pointer' : ''} relative`}>
        <div className="flex items-center gap-1.5 mb-1.5">
            <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#08A698] transition-colors" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-[#08A698] transition-colors">{label}</span>
        </div>
        <div className={`text-sm font-medium ${isPlaceholder ? 'text-gray-400 italic' : 'text-gray-900'} pl-5 flex items-center gap-2 border-b border-transparent group-hover:border-gray-200 pb-0.5 transition-all`}>
            {flag && <span className="text-base leading-none">🇵🇰</span>}
            {value}
            {editable && <PencilSquareIcon className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />}
        </div>
    </div>
);

const ActionButton = ({ icon: Icon, label }) => (
    <button className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 group transition-all duration-300">
        <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 group-hover:border-[#08A698] group-hover:text-white group-hover:bg-[#08A698] transition-all bg-white shadow-sm">
            <Icon className="w-4 h-4" />
        </div>
        <span className="text-[9px] font-bold text-gray-400 group-hover:text-[#08A698] uppercase tracking-wider transition-colors">{label}</span>
    </button>
);

const TabButton = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${active ? 'border-[#08A698] text-[#08A698]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
    >
        {label}
    </button>
);

const TimelineItem = ({ icon, text, time, bg = "bg-gray-100", isLast }) => (
    <div className="flex gap-4 items-start relative mb-6">
        <div className={`z-10 w-9 h-9 rounded-full ${bg} flex items-center justify-center border-2 border-white shadow-sm shrink-0`}>
            {icon}
        </div>
        <div className="flex-1 bg-white border border-gray-100 p-3.5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs text-gray-700 leading-relaxed font-medium">{text}</p>
            <div className="mt-2 flex items-center justify-end">
                <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-1.5 py-0.5 rounded">{time} ago</span>
            </div>
        </div>
    </div>
);
