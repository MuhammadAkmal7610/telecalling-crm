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
    HandThumbUpIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export default function FacebookLeads() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState(1);
    const [activeTab, setActiveTab] = useState('Activity History');
    const [isReportColumnOpen, setIsReportColumnOpen] = useState(true);

    // Mock Data - Facebook Specific
    const leads = [
        { id: 1, name: 'Sarah Jenkins', phone: '923130000001', status: 'Fresh', rating: 1, time: '2m', ad: 'Summer Sale Promo' },
        { id: 2, name: 'Mike Ross', phone: '923400000002', status: 'Fresh', rating: 0, time: '8m', ad: 'Lead Gen Form B' },
        { id: 3, name: 'Jessica Pearson', phone: '923200000003', status: 'Re-Engaged', rating: 2, time: '15m', ad: 'Consultation Offer' },
        { id: 4, name: 'Harvey Specter', phone: '923300000004', status: 'Not Sure', rating: 1, time: '45m', ad: 'VIP Sourcing' },
        { id: 5, name: 'Louis Litt', phone: '923000000005', status: 'Fresh', rating: 0, time: '1h', ad: 'Summer Sale Promo' },
        { id: 6, name: 'Donna Paulsen', phone: '937000000006', status: 'Fresh', rating: 3, time: '2h', ad: 'Webinar Signup' },
        { id: 7, name: 'Rachel Zane', phone: '923000000007', status: 'Fresh', rating: 0, time: '3h', ad: 'Lead Gen Form B' },
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
                                <h2 className="font-bold text-gray-800 truncate" title="@facebook-leads-">@facebook-leads-</h2>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setIsReportColumnOpen(false)} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors">
                                        <ArrowLeftIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-3 text-xs text-gray-500 mb-3">
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium"><HandThumbUpIcon className="w-3 h-3" /> 2.4k Likes</span>
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-50"><UserIcon className="w-3 h-3 text-[#08A698]" /> 8.1K Leads</span>
                            </div>

                            <div className="flex items-center justify-between bg-gradient-to-br from-blue-50/50 to-white border border-blue-50 p-3 rounded-xl shadow-sm">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] text-blue-700 font-bold shadow-sm">
                                            F{i}
                                        </div>
                                    ))}
                                </div>
                                <div className="relative w-11 h-11 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="22" cy="22" r="17" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                                        <circle cx="22" cy="22" r="17" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-blue-500" strokeDasharray="100" strokeDashoffset="25" strokeLinecap="round" />
                                    </svg>
                                    <span className="absolute text-[10px] font-bold text-gray-700">75%</span>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-50">
                            <AccordionItem title="Ad Set Performance" isOpen={true}>
                                <div className="flex items-center justify-center py-4">
                                    <div className="w-24 h-24 rounded-full bg-[conic-gradient(at_center,_#3B82F6_0deg_220deg,_#E2E8F0_220deg_360deg)] relative shadow-md ring-4 ring-white">
                                        <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center">
                                            <span className="text-xs font-bold text-gray-400">Ads</span>
                                        </div>
                                    </div>
                                    <div className="ml-4 text-xs space-y-2">
                                        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></span> <span className="font-medium">Mobile (60%)</span></div>
                                        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-gray-300 shadow-sm"></span> <span className="text-gray-500">Desktop (40%)</span></div>
                                    </div>
                                </div>
                            </AccordionItem>
                            <AccordionItem title="Campaign Calling Report" />
                            <AccordionItem title="Leads Status Report" />
                            <AccordionItem title="Lead Lost Reasons Report" />
                        </div>
                    </div>

                    {/* MIDDLE COLUMN: Lead List */}
                    <div className={`w-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${isReportColumnOpen ? 'lg:w-[30%]' : 'lg:w-[35%]'}`}>
                        <div className="flex border-b border-gray-200 bg-white">
                            <button className="flex-1 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:bg-gray-50 transition-colors">ACTIVE</button>
                            <button className="flex-1 py-3 text-sm font-bold text-[#08A698] border-b-2 border-[#08A698] bg-teal-50/10">NEW (8100)</button>
                        </div>

                        <div className="p-3 border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
                            <div className="relative group">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#08A698] transition-colors" />
                                <input type="text" placeholder="Search facebook leads..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#08A698] focus:bg-white transition-all shadow-sm" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {leads.map((lead) => (
                                <div
                                    key={lead.id}
                                    onClick={() => setSelectedLeadId(lead.id)}
                                    className={`p-4 border-b border-gray-50 cursor-pointer transition-all duration-200 group ${selectedLeadId === lead.id ? 'bg-teal-50/50 border-l-4 border-l-[#08A698] shadow-inner' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
                                >
                                    <div className="flex justify-between items-start mb-1.5">
                                        <h3 className={`font-semibold text-sm truncate pr-2 ${selectedLeadId === lead.id ? 'text-[#08A698]' : 'text-gray-800'}`}>{lead.name}</h3>
                                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap bg-gray-100 px-1.5 py-0.5 rounded">{lead.time}</span>
                                    </div>
                                    <div className="text-xs text-blue-600 mb-1 font-medium">{lead.ad}</div>
                                    <div className="text-xs text-gray-500 mb-3 font-mono tracking-tight">{lead.phone}</div>
                                    <div className="flex items-center justify-between">
                                        <StatusBadge status={lead.status} />
                                        <div className="flex gap-0.5 opacity-50 group-hover:opacity-100 transition-opacity">
                                            {[...Array(5)].map((_, i) => (
                                                <StarIcon key={i} className={`w-3.5 h-3.5 ${i < lead.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
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
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                        {selectedLead.name}
                                        <div className="flex gap-1.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Tooltip text="Chat on WhatsApp">
                                                <button className="p-1.5 rounded-full bg-green-50 text-green-600 hover:bg-green-100 border border-green-100 transition-colors"><ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4" /></button>
                                            </Tooltip>
                                            <Tooltip text="Call Now">
                                                <button className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 transition-colors"><PhoneIcon className="w-4 h-4" /></button>
                                            </Tooltip>
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
                                        <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold ring-2 ring-white">AI</span>
                                        <span className="text-xs font-semibold text-gray-600">Aiman</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-5 gap-x-12 mb-6">
                                <div className="space-y-5">
                                    <InfoField label="Interest" value="Luxury Goods" icon={HashtagIcon} editable />
                                    <InfoField label="Source" value="Facebook Ads" icon={MegaphoneIcon} editable />
                                    <InfoField label="Campaign" value={selectedLead.ad} icon={MegaphoneIcon} editable />
                                </div>
                                <div className="space-y-5">
                                    <InfoField label="Phone" value={selectedLead.phone} icon={PhoneIcon} flag editable />
                                    <InfoField label="Lead ID" value={`FB-${selectedLead.id}9928`} icon={HashtagIcon} editable />
                                    <InfoField label="Location" value="Karachi, PK" icon={MapPinIcon} editable />
                                </div>
                            </div>
                            <div className="flex justify-center -mb-3">
                                <button className="text-xs font-medium text-gray-400 hover:text-[#08A698] flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 hover:border-teal-100 transition-all">
                                    Show more <ChevronDownIcon className="w-3 h-3" />
                                </button>
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
                            <div className="flex-1 flex justify-end items-center gap-2 py-2">
                                <button className="px-3 py-1.5 text-xs font-bold text-[#08A698] border border-[#08A698] rounded-md hover:bg-[#08A698] hover:text-white transition-all flex items-center gap-1">
                                    <PlusIconMini /> Action
                                </button>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50/50">
                            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                                <FilterPill label="All Actions" active />
                                <FilterPill label="Time" />
                                <FilterPill label="Team" />
                            </div>

                            <div className="relative pl-2 space-y-0">
                                <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-gray-200"></div>

                                <TimelineItem
                                    icon={<MegaphoneIcon className="w-3.5 h-3.5 text-blue-600" />}
                                    bg="bg-blue-100 border-blue-200"
                                    text={`Lead captured from Facebook Ad: ${selectedLead.ad}`}
                                    time="2m ago"
                                    isLast={false}
                                />
                                <TimelineItem
                                    icon={<ArrowPathIcon className="w-3.5 h-3.5 text-amber-600" />}
                                    bg="bg-amber-100 border-amber-200"
                                    text="System assigned to Aiman"
                                    time="2m ago"
                                    isLast={false}
                                />
                                <TimelineItem
                                    icon={<UserIcon className="w-3.5 h-3.5 text-purple-600" />}
                                    bg="bg-purple-100 border-purple-200"
                                    text="Auto-responder SMS sent"
                                    time="1m ago"
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

// ... Shared components would typically go here or be imported ... 
// Redefining simpler versions for standalone usage to avoid import hell in this snippet, 
// matching WebsiteLeads exactly

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
    const styles = {
        'Fresh': 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-100 shadow-sm',
        'Re-Engaged': 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-100 shadow-sm',
        'Not Sure': 'bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-100 shadow-sm',
    };
    const defaultStyle = 'bg-gray-50 text-gray-600 border-gray-200';
    return (
        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${styles[status] || defaultStyle} uppercase tracking-wider`}>
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

const FilterPill = ({ label, active }) => (
    <button className={`px-3.5 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all ${active ? 'bg-white border-gray-300 text-gray-800 shadow-sm ring-1 ring-gray-100' : 'bg-transparent border-transparent text-gray-500 hover:bg-white hover:border-gray-200'}`}>
        {active && <FunnelIcon className="w-3 h-3 inline mr-1.5 text-gray-400" />}
        {label} {active && <ChevronDownIcon className="w-3 h-3 inline ml-1.5 text-gray-400" />}
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

const Tooltip = ({ text, children }) => (
    <div className="group relative flex items-center">
        {children}
        <span className="absolute bottom-full mb-2 hidden group-hover:block w-auto p-2 min-w-max rounded-md shadow-md text-white bg-gray-900 text-[10px] font-bold z-50">
            {text}
        </span>
    </div>
);

const PlusIconMini = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
