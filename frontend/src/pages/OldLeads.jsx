import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
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
    ArrowPathIcon,
    ArchiveBoxIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export default function OldLeads() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState(1);
    const [activeTab, setActiveTab] = useState('Activity History');
    const [isReportColumnOpen, setIsReportColumnOpen] = useState(true);

    // Mock Data - Old Leads (Older dates)
    const leads = [
        { id: 1, name: 'John Doe', phone: '923130009999', status: 'Archive', rating: 0, time: '2d ago' },
        { id: 2, name: 'Jane Smith', phone: '923400008888', status: 'Cold', rating: 0, time: '3d ago' },
        { id: 3, name: 'Robert Johnson', phone: '923200007777', status: 'Cold', rating: 1, time: '5d ago' },
        { id: 4, name: 'Emily Davis', phone: '923300006666', status: 'Archive', rating: 0, time: '1w ago' },
        { id: 5, name: 'Michael Brown', phone: '923000005555', status: 'Trash', rating: 0, time: '2w ago' },
        { id: 6, name: 'David Wilson', phone: '937000004444', status: 'Cold', rating: 0, time: '1mo ago' },
        { id: 7, name: 'Sarah Miller', phone: '923000003333', status: 'Archive', rating: 0, time: '2mo ago' },
    ];

    const selectedLead = leads.find(l => l.id === selectedLeadId) || leads[0];

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-hidden flex flex-col lg:flex-row relative">

                    {!isReportColumnOpen && (
                        <button
                            onClick={() => setIsReportColumnOpen(true)}
                            className="absolute left-0 top-4 z-20 bg-white border border-l-0 border-gray-200 p-1.5 rounded-r-lg shadow-md text-gray-500 hover:text-[#08A698] hover:pl-2 transition-all"
                            title="Expand Reports"
                        >
                            <ChevronDownIcon className="w-4 h-4 transform -rotate-90" />
                        </button>
                    )}

                    {/* LEFT COLUMN: Reports */}
                    <div
                        className={`bg-white border-r border-gray-200 overflow-y-auto hidden lg:block custom-scrollbar transition-all duration-300 ease-in-out ${isReportColumnOpen ? 'w-full lg:w-1/5 opacity-100' : 'w-0 opacity-0 border-none'}`}
                    >
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 p-4 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="font-bold text-gray-800 truncate" title="@old-leads-">@old-leads-</h2>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setIsReportColumnOpen(false)} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors">
                                        <ArrowLeftIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-3 text-xs text-gray-500 mb-3">
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"><ArchiveBoxIcon className="w-3 h-3" /> Archived</span>
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-50"><UserIcon className="w-3 h-3 text-gray-400" /> 45.2K Total</span>
                            </div>

                            {/* Gray-scale Progress for Old Leads */}
                            <div className="flex items-center justify-between bg-gray-50 border border-gray-100 p-3 rounded-xl shadow-sm">
                                <div className="flex -space-x-2 grayscale opacity-70">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] text-gray-700 font-bold shadow-sm">
                                            O{i}
                                        </div>
                                    ))}
                                </div>
                                <div className="relative w-11 h-11 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="22" cy="22" r="17" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200" />
                                        <circle cx="22" cy="22" r="17" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-400" strokeDasharray="100" strokeDashoffset="80" strokeLinecap="round" />
                                    </svg>
                                    <span className="absolute text-[10px] font-bold text-gray-500">20%</span>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-50">
                            <AccordionItem title="Archive Reason Report" isOpen={true}>
                                <div className="flex items-center justify-center py-4">
                                    {/* Gray Pie Chart */}
                                    <div className="w-24 h-24 rounded-full bg-[conic-gradient(at_center,_#94a3b8_0deg_120deg,_#cbd5e1_120deg_240deg,_#e2e8f0_240deg_360deg)] relative shadow-md ring-4 ring-white">
                                        <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center">
                                            <span className="text-xs font-bold text-gray-400">Old</span>
                                        </div>
                                    </div>
                                    <div className="ml-4 text-xs space-y-2">
                                        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-sm"></span> <span className="font-medium text-gray-600">Cold</span></div>
                                        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-300 shadow-sm"></span> <span className="text-gray-500">Trash</span></div>
                                    </div>
                                </div>
                            </AccordionItem>
                            <AccordionItem title="Old Campaigns Report" />
                            <AccordionItem title="Interaction History" />
                        </div>
                    </div>

                    {/* MIDDLE COLUMN: Lead List */}
                    <div className={`w-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${isReportColumnOpen ? 'lg:w-[30%]' : 'lg:w-[35%]'}`}>
                        <div className="flex border-b border-gray-200 bg-white">
                            <button className="flex-1 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:bg-gray-50 transition-colors">ALL OLD</button>
                            <button className="flex-1 py-3 text-sm font-bold text-gray-600 border-b-2 border-gray-400 bg-gray-50/50">ARCHIVED</button>
                        </div>

                        <div className="p-3 border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
                            <div className="relative group">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
                                <input type="text" placeholder="Search old leads..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 focus:bg-white transition-all shadow-sm" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {leads.map((lead) => (
                                <div
                                    key={lead.id}
                                    onClick={() => setSelectedLeadId(lead.id)}
                                    className={`p-4 border-b border-gray-50 cursor-pointer transition-all duration-200 group ${selectedLeadId === lead.id ? 'bg-gray-50 border-l-4 border-l-gray-400 shadow-inner' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
                                >
                                    <div className="flex justify-between items-start mb-1.5">
                                        <h3 className={`font-semibold text-sm truncate pr-2 ${selectedLeadId === lead.id ? 'text-gray-800' : 'text-gray-600'}`}>{lead.name}</h3>
                                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap bg-gray-100 px-1.5 py-0.5 rounded">{lead.time}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 mb-3 font-mono tracking-tight">{lead.phone}</div>
                                    <div className="flex items-center justify-between">
                                        <StatusBadge status={lead.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Lead Details */}
                    <div className="flex-1 bg-[#F8F9FA] flex flex-col overflow-hidden relative">
                        <div className="bg-white/80 backdrop-blur-md p-6 border-b border-gray-200 shadow-sm z-20 sticky top-0">
                            <div className="flex justify-between items-start mb-5">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-700 mb-2 flex items-center gap-3">
                                        {selectedLead.name}
                                        <div className="flex gap-1.5 ml-2 opacity-50 grayscale group-hover:grayscale-0 transition-all">
                                            {/* Muted actions for old leads */}
                                            <button className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200 transition-colors"><ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4" /></button>
                                            <button className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200 transition-colors"><PhoneIcon className="w-4 h-4" /></button>
                                        </div>
                                    </h1>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={selectedLead.status} />
                                        <span className="text-xs text-gray-400 italic">Last engaged: {selectedLead.time}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-5 gap-x-12 mb-6 opacity-80">
                                <div className="space-y-5">
                                    <InfoField label="Last Interest" value="Unknown" icon={HashtagIcon} />
                                    <InfoField label="Source" value="Legacy Import" icon={ArchiveBoxIcon} />
                                </div>
                                <div className="space-y-5">
                                    <InfoField label="Phone" value={selectedLead.phone} icon={PhoneIcon} flag />
                                    <InfoField label="Old ID" value={`OLD-${selectedLead.id}00`} icon={HashtagIcon} />
                                </div>
                            </div>

                            <div className="grid grid-cols-5 gap-3 mt-6 pt-5 border-t border-gray-100 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all">
                                <ActionButton icon={ArrowPathIcon} label="REACTIVATE" />
                                <ActionButton icon={ClockIcon} label="HISTORY" />
                                <ActionButton icon={EllipsisVerticalIcon} label="NOTE" />
                            </div>
                        </div>

                        <div className="bg-white flex border-b border-gray-200 px-6 sticky top-[300px] z-10 shadow-sm">
                            <TabButton label="Historical Data" active={activeTab === 'Activity History'} onClick={() => setActiveTab('Activity History')} />
                        </div>

                        {/* Timeline */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50/50">
                            <div className="text-center text-xs text-gray-400 mb-4 divider">End of active history</div>

                            <div className="relative pl-2 space-y-0 opacity-75">
                                <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-gray-200 border-l border-dashed border-gray-300"></div>

                                <TimelineItem
                                    icon={<ArchiveBoxIcon className="w-3.5 h-3.5 text-gray-500" />}
                                    bg="bg-gray-100 border-gray-200"
                                    text="Lead moved to archive automatically"
                                    time="2w ago"
                                    isLast={false}
                                />
                                <TimelineItem
                                    icon={<PhoneIcon className="w-3.5 h-3.5 text-gray-400" />}
                                    bg="bg-gray-50 border-gray-200"
                                    text="Call attempted - No Answer"
                                    time="1mo ago"
                                    isLast={true}
                                />
                            </div>
                        </div>

                    </div>
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

// Re-using same logic for ease of copy-paste, but with slight color tweaks for "Old/Cold" feel
const AccordionItem = ({ title, isOpen = false, children }) => {
    const [open, setOpen] = useState(isOpen);
    return (
        <div className="border-b border-gray-50 last:border-0">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                {title}
                {open ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />}
            </button>
            {open && <div className="px-3 pb-3 animate-in slide-in-from-top-1 duration-200">{children}</div>}
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        'Archive': 'bg-gray-100 text-gray-600 border-gray-200 ring-1 ring-gray-100 shadow-sm',
        'Cold': 'bg-slate-100 text-slate-600 border-slate-200 ring-1 ring-slate-100 shadow-sm',
        'Trash': 'bg-red-50 text-red-700 border-red-100 ring-1 ring-red-100 shadow-sm',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${styles[status] || 'bg-gray-50'} uppercase tracking-wider`}>
            {status}
        </span>
    );
};

const InfoField = ({ label, value, icon: Icon, isPlaceholder, flag, editable }) => (
    <div className={`group ${editable ? 'cursor-pointer' : ''} relative`}>
        <div className="flex items-center gap-1.5 mb-1.5">
            <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-600 transition-colors">{label}</span>
        </div>
        <div className={`text-sm font-medium text-gray-700 pl-5 flex items-center gap-2 border-b border-transparent pb-0.5 group-hover:border-gray-200 transition-colors`}>
            {flag && <span className="text-base leading-none">🇵🇰</span>}
            {value}
        </div>
    </div>
);

const ActionButton = ({ icon: Icon, label }) => (
    <button className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 group transition-all duration-300">
        <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 group-hover:border-gray-400 group-hover:text-gray-700 transition-all bg-white shadow-sm">
            <Icon className="w-4 h-4" />
        </div>
        <span className="text-[9px] font-bold text-gray-400 group-hover:text-gray-600 uppercase tracking-wider transition-colors">{label}</span>
    </button>
);

const TabButton = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${active ? 'border-gray-400 text-gray-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
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
                <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-1.5 py-0.5 rounded">{time}</span>
            </div>
        </div>
    </div>
);
