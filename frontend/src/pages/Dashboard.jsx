// import React, { useState, useEffect } from 'react';
// import Sidebar from '../components/Sidebar';
// import Header from '../components/Header';
// import { supabase } from '../lib/supabaseClient';
// import {
//     ArrowPathIcon,
//     CalendarIcon,
//     Cog6ToothIcon,
//     MagnifyingGlassIcon,
//     ChevronDownIcon,
//     ChevronRightIcon,
//     ClockIcon,
//     BarsArrowDownIcon,
//     TableCellsIcon,
//     ChartBarIcon,
//     MegaphoneIcon
// } from '@heroicons/react/24/outline';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// // --- STYLES & HELPERS ---
// const StatusPill = ({ count, colorClasses, label }) => {
//     if (count === 0 && !label) return <span className="text-gray-300 font-normal">-</span>;
//     return (
//         <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border border-transparent ${colorClasses}`}>
//             {label ? label : count}
//         </span>
//     );
// };

// const DashboardCard = ({ icon: Icon, title, onAdd, children, className = "" }) => (
//     <div className={`bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col transition-all duration-300 hover:shadow-md hover:border-teal-100 ${className}`}>
//         <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100/80">
//             <div className="flex items-center gap-3">
//                 <div className="p-2 bg-gradient-to-br from-teal-50 to-white rounded-lg border border-teal-50 text-[#08A698] shadow-sm">
//                     <Icon className="w-5 h-5" />
//                 </div>
//                 <h3 className="text-sm font-bold text-gray-800 leading-none">{title}</h3>
//             </div>
//         </div>
//         <div className="flex-1 flex flex-col min-h-0 p-5 space-y-4 overflow-hidden relative">
//             {children}
//         </div>
//     </div>
// );

// const Dashboard = () => {
//     const [sidebarOpen, setSidebarOpen] = useState(false);
//     const [stats, setStats] = useState({
//         totalLeads: 0,
//         wonLeads: 0,
//         totalCalls: 0,
//         conversionRate: 0,
//         statusBreakdown: {}
//     });
//     const [performance, setPerformance] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         fetchDashboardData();
//     }, []);

//     const fetchDashboardData = async () => {
//         setLoading(true);
//         try {
//             const { data: { session } } = await supabase.auth.getSession();
//             if (!session) return;

//             const headers = { 'Authorization': `Bearer ${session.access_token}` };

//             const [statsRes, perfRes] = await Promise.all([
//                 fetch(`${API_URL}/reports/dashboard`, { headers }),
//                 fetch(`${API_URL}/reports/performance`, { headers })
//             ]);

//             const statsResult = await statsRes.json();
//             const perfResult = await perfRes.json();

//             // Safe state updates with defaults
//             if (statsRes.ok) {
//                 setStats(statsResult.data || statsResult || {
//                     totalLeads: 0,
//                     wonLeads: 0,
//                     totalCalls: 0,
//                     conversionRate: 0,
//                     statusBreakdown: {}
//                 });
//             }

//             if (perfRes.ok) {
//                 const perfData = perfResult.data || perfResult;
//                 setPerformance(Array.isArray(perfData) ? perfData : []);
//             }
//         } catch (error) {
//             console.error('Error fetching dashboard data:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const statusColors = {
//         'Fresh': 'bg-emerald-50 text-emerald-700',
//         'Won': 'bg-teal-50 text-teal-700',
//         'Lost': 'bg-rose-50 text-rose-700',
//         'First Contact Attempted': 'bg-amber-50 text-amber-700',
//         'Interested': 'bg-blue-50 text-blue-700',
//     };

//     return (
//         <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased overflow-hidden">
//             <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
//             <div className="flex flex-1 flex-col h-full min-w-0">
//                 <Header setIsSidebarOpen={setSidebarOpen} />
//                 <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-gray-50/50">
//                     <div className="max-w-[1600px] mx-auto space-y-8">
//                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                             <div className="flex items-center gap-3">
//                                 <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
//                                 <button onClick={fetchDashboardData} className="text-[#08A698] bg-teal-50 p-1.5 rounded-lg border border-teal-100/50">
//                                     <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Summary Stats */}
//                         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                             {[
//                                 { label: 'Total Leads', value: stats.totalLeads, color: 'text-gray-900' },
//                                 { label: 'Won Leads', value: stats.wonLeads, color: 'text-teal-600' },
//                                 { label: 'Total Calls', value: stats.totalCalls, color: 'text-blue-600' },
//                                 { label: 'Conv. Rate', value: `${stats.conversionRate?.toFixed(1)}%`, color: 'text-purple-600' },
//                             ].map((s, i) => (
//                                 <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//                                     <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{s.label}</p>
//                                     <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
//                                 </div>
//                             ))}
//                         </div>

//                         <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-8">
//                             {/* Status Breakdown Chart */}
//                             <DashboardCard icon={BarsArrowDownIcon} title="Leads by Status">
//                                 <div className="flex-1 w-full flex items-end justify-between gap-3 px-2 pb-2 h-64">
//                                     {Object.entries(stats.statusBreakdown || {}).map(([status, count], idx) => {
//                                         const percentage = stats.totalLeads > 0 ? (count / stats.totalLeads) * 100 : 0;
//                                         return (
//                                             <div key={idx} className="flex flex-col items-center gap-2 group w-full h-full justify-end relative">
//                                                 <div
//                                                     className={`w-full max-w-[40px] rounded-t-md transition-all duration-500 bg-teal-500 group-hover:brightness-110`}
//                                                     style={{ height: `${Math.max(percentage, 5)}%` }}
//                                                 >
//                                                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
//                                                         {count}
//                                                     </div>
//                                                 </div>
//                                                 <span className="text-[10px] text-gray-500 font-semibold text-center truncate w-full">{status}</span>
//                                             </div>
//                                         );
//                                     })}
//                                     {Object.keys(stats.statusBreakdown || {}).length === 0 && (
//                                         <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No data available</div>
//                                     )}
//                                 </div>
//                             </DashboardCard>

//                             {/* Activity & Performance */}
//                             <DashboardCard icon={ChartBarIcon} title="Agent Performance">
//                                 <div className="overflow-auto flex-1 custom-scrollbar">
//                                     <table className="w-full text-left text-xs">
//                                         <thead className="sticky top-0 bg-white border-b border-gray-100">
//                                             <tr>
//                                                 <th className="pb-3 text-[11px] font-bold text-gray-400 uppercase">Agent</th>
//                                                 <th className="pb-3 text-right text-[11px] font-bold text-gray-400 uppercase">Calls</th>
//                                                 <th className="pb-3 text-right text-[11px] font-bold text-gray-400 uppercase pr-2">Notes</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody className="divide-y divide-gray-50">
//                                             {performance.map((r, i) => (
//                                                 <tr key={i} className="group hover:bg-teal-50/30">
//                                                     <td className="py-3">
//                                                         <div className="flex items-center gap-3">
//                                                             <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#08A698] border border-teal-100 flex items-center justify-center text-[10px] font-bold">{r.name[0]}</div>
//                                                             <span className="text-gray-700 font-semibold">{r.name}</span>
//                                                         </div>
//                                                     </td>
//                                                     <td className="py-3 text-right font-semibold text-gray-700">{r.calls}</td>
//                                                     <td className="py-3 text-right font-bold text-[#08A698] pr-2">{r.notes}</td>
//                                                 </tr>
//                                             ))}
//                                             {performance.length === 0 && (
//                                                 <tr><td colSpan="3" className="py-8 text-center text-gray-400">No performance data yet</td></tr>
//                                             )}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             </DashboardCard>
//                         </div>
//                     </div>
//                 </main>
//             </div>
//         </div>
//     );
// };

// export default Dashboard;
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import {
    ArrowPathIcon,
    CalendarIcon,
    Cog6ToothIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    FunnelIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    ClockIcon,
    BarsArrowDownIcon,
    TableCellsIcon,
    ChartBarIcon,
    MegaphoneIcon
} from '@heroicons/react/24/outline';
import CampaignModal from '../components/CampaignModal';
import TaskModal from '../components/TaskModal';
import WorkspaceGuard from '../components/WorkspaceGuard';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// --- STYLES & HELPERS ---
const StatusPill = ({ count, colorClasses, label }) => {
    if (count === 0 && !label) return <span className="text-gray-300 font-normal">-</span>;
    return (
        <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border border-transparent ${colorClasses}`}>
            {label ? label : count}
        </span>
    );
};

// Premium Card Component
const DashboardCard = ({
    icon: Icon,
    title,
    manageLink,
    onAdd,
    onManage,
    headerDate = "Today",
    children,
    className = "",
    headerRight
}) => (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col transition-all duration-300 hover:shadow-md hover:border-teal-100 ${className}`}>
        {/* Card Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100/80">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-teal-50 to-white rounded-lg border border-teal-50 text-[#08A698] shadow-sm">
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-800 leading-none">{title}</h3>
                        {manageLink && (
                            <span
                                className="text-[10px] font-semibold text-[#08A698] cursor-pointer hover:underline border-l border-gray-300 pl-2 leading-none hover:text-teal-700 transition-colors"
                                onClick={onManage}
                            >
                                Manage
                            </span>
                        )}
                        {onAdd && (
                            <span className="text-[10px] font-semibold text-[#08A698] cursor-pointer hover:underline border-l border-gray-300 pl-2 leading-none hover:text-teal-700 transition-colors" onClick={onAdd}>+ Add</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {headerRight || (
                    <>
                        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors">
                            <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                            {headerDate}
                            <ChevronDownIcon className="w-3 h-3 text-gray-400 ml-0.5" />
                        </button>
                        <button className="text-gray-300 hover:text-gray-500 transition-colors p-1 hover:bg-gray-50 rounded" onClick={onManage}>
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>
        </div>

        {/* Card Body */}
        <div className="flex-1 flex flex-col min-h-0 p-5 space-y-4 overflow-hidden relative">
            {children}
        </div>
    </div>
);

const SearchBar = ({ placeholder = "Search..." }) => (
    <div className="relative group">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#08A698] transition-colors" />
        <input
            type="text"
            placeholder={placeholder}
            className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#08A698] focus:border-[#08A698] outline-none transition-all placeholder:text-gray-400 hover:bg-white focus:bg-white"
        />
    </div>
);

const TableHeader = ({ columns }) => (
    <thead className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <tr>
            {columns.map((col, idx) => (
                <th
                    key={idx}
                    className={`pb-3 pt-1 text-[11px] font-bold uppercase tracking-wider ${col.align === 'center' ? 'text-center' : 'text-left'} text-gray-400 ${col.width || ''}`}
                >
                    <div className={`flex items-center gap-1 ${col.align === 'center' ? 'justify-center' : ''} cursor-pointer hover:text-gray-600 transition-colors`}>
                        {col.label} {col.sortable !== false && <ChevronDownIcon className="w-2.5 h-2.5 opacity-40" />}
                    </div>
                </th>
            ))}
            <th className="pb-3 pt-1 w-6"></th>
        </tr>
    </thead>
);


// --- PAGE COMPONENT ---

const Dashboard = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Default');
    const [stats, setStats] = useState({
        totalLeads: 0,
        wonLeads: 0,
        totalCalls: 0,
        conversionRate: 0,
        statusBreakdown: {},
        recentCampaigns: []
    });
    const [performance, setPerformance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const headers = { 'Authorization': `Bearer ${session.access_token}` };

            const [statsRes, perfRes, campaignsRes] = await Promise.all([
                fetch(`${API_URL}/reports/dashboard`, { headers }),
                fetch(`${API_URL}/reports/performance`, { headers }),
                fetch(`${API_URL}/campaigns?limit=5`, { headers })
            ]);

            const statsResult = await statsRes.json();
            const perfResult = await perfRes.json();
            const campaignsResult = await campaignsRes.json();

            if (statsRes.ok) {
                setStats(prev => ({
                    ...(statsResult.data || statsResult || {}),
                    recentCampaigns: campaignsResult.data || campaignsResult || []
                }));
            }

            if (perfRes.ok) {
                const perfData = perfResult.data || perfResult;
                setPerformance(Array.isArray(perfData) ? perfData : []);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCampaignSuccess = () => {
        fetchDashboardData();
        toast.success('Campaign active on dashboard!');
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased overflow-hidden">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col h-full min-w-0">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 bg-gray-50/50">
                    <WorkspaceGuard>
                        <div className="max-w-[1600px] mx-auto space-y-8">

                            {/* Top Bar */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                                    <button onClick={fetchDashboardData} className="text-[#08A698] hover:text-[#068f82] transition-colors bg-teal-50 hover:bg-teal-100 p-1.5 rounded-lg border border-teal-100/50">
                                        <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-[#08A698] hover:bg-teal-50 hover:border-teal-200 transition-all shadow-sm">
                                        <CalendarIcon className="w-4 h-4" />
                                        <span>Today</span>
                                        <ChevronDownIcon className="w-3 h-3 text-gray-400 ml-1" />
                                    </button>
                                    <button className="p-2.5 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-[#08A698] hover:border-teal-200 hover:bg-teal-50 transition-all shadow-sm">
                                        <Cog6ToothIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Tabs - Simple Line Style */}
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex gap-8" aria-label="Tabs">
                                    {['Default', 'My Dashboard'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`
                                            whitespace-nowrap pb-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 transition-all
                                            ${activeTab === tab
                                                    ? 'border-[#08A698] text-[#08A698]'
                                                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}
                                        `}
                                        >
                                            {tab}
                                            {tab === 'Default' && (
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${activeTab === tab ? 'bg-teal-50 text-[#08A698] border border-teal-100' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>MAIN</span>
                                            )}
                                        </button>
                                    ))}
                                </nav>
                            </div>


                            {/* --- DASHBOARD GRID --- */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-8">

                                {/* Card 1: Follow Ups */}
                                <DashboardCard
                                    icon={ClockIcon}
                                    title="Follow Ups"
                                    onAdd={() => setIsTaskModalOpen(true)}
                                    className="h-[440px]"
                                >
                                    <SearchBar placeholder="Search by assignee..." />
                                    <div className="overflow-auto flex-1 custom-scrollbar -mx-4 px-4 pt-2">
                                        <table className="w-full text-left text-xs">
                                            <TableHeader columns={[
                                                { label: 'Assignee', width: 'w-[32%]' },
                                                { label: 'Upcoming', align: 'center' },
                                                { label: 'Late', align: 'center' },
                                                { label: 'Done', align: 'center' },
                                                { label: 'Cancel', align: 'center' },
                                            ]} />
                                            <tbody className="divide-y divide-gray-50">
                                                {(stats.followUpsSummary || []).map((r, i) => (
                                                    <tr key={i} className="group hover:bg-teal-50/30 transition-colors">
                                                        <td className="py-3 pl-1">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#08A698] border border-teal-100 flex items-center justify-center text-[10px] font-bold shadow-sm">{r.initials}</div>
                                                                <span className="text-gray-700 font-semibold group-hover:text-[#08A698] transition-colors">{r.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 text-center"><StatusPill count={r.upcoming} colorClasses="bg-amber-50 text-amber-600 border-amber-100" /></td>
                                                        <td className="py-3 text-center"><StatusPill count={r.late} colorClasses="bg-rose-50 text-rose-600 border-rose-100" /></td>
                                                        <td className="py-3 text-center"><StatusPill count={r.done} colorClasses="bg-teal-50 text-teal-600 border-teal-100" /></td>
                                                        <td className="py-3 text-center"><StatusPill count={r.cancel} colorClasses="bg-gray-100 text-gray-500 border-gray-200" /></td>
                                                        <td className="py-3 text-center"><ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-[#08A698] transition-colors" /></td>
                                                    </tr>
                                                ))}
                                                {(!stats.followUpsSummary || stats.followUpsSummary.length === 0) && (
                                                    <tr><td colSpan="6" className="py-8 text-center text-gray-400">No followups scheduled</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </DashboardCard>

                                {/* Card 2: Lead by stages */}
                                <DashboardCard icon={BarsArrowDownIcon} title="Lead by stages" manageLink={true} onManage={() => navigate('/pipeline')} className="h-[440px]">
                                    <SearchBar placeholder="Type assigned name..." />
                                    <div className="overflow-auto flex-1 custom-scrollbar -mx-4 px-4 pt-2">
                                        <table className="w-full text-left text-xs">
                                            <TableHeader columns={[
                                                { label: 'Assignee', width: 'w-[32%]' },
                                                { label: 'Fresh', align: 'center' },
                                                { label: 'Active', align: 'center' },
                                                { label: 'Won', align: 'center' },
                                                { label: 'Lost', align: 'center' },
                                            ]} />
                                            <tbody className="divide-y divide-gray-50">
                                                {(stats.leadsByStageSummary || []).map((r, i) => (
                                                    <tr key={i} className="group hover:bg-teal-50/30 transition-colors">
                                                        <td className="py-3 pl-1">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#08A698] border border-teal-100 flex items-center justify-center text-[10px] font-bold shadow-sm">{r.initials}</div>
                                                                <span className="text-gray-700 font-semibold group-hover:text-[#08A698] transition-colors">{r.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 text-center"><StatusPill count={r.fresh} colorClasses="bg-gray-100 text-gray-600 border-gray-200" /></td>
                                                        <td className="py-3 text-center"><StatusPill count={r.active} colorClasses="bg-blue-50 text-blue-600 border-blue-100 font-bold" /></td>
                                                        <td className="py-3 text-center"><StatusPill count={r.won} colorClasses="bg-teal-50 text-teal-600 border-teal-100" /></td>
                                                        <td className="py-3 text-center"><StatusPill count={r.lost} colorClasses="bg-rose-50 text-rose-600 border-rose-100" /></td>
                                                        <td className="py-3 text-center"><ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-[#08A698] transition-colors" /></td>
                                                    </tr>
                                                ))}
                                                {(!stats.leadsByStageSummary || stats.leadsByStageSummary.length === 0) && (
                                                    <tr><td colSpan="6" className="py-8 text-center text-gray-400">No leads assigned</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </DashboardCard>

                                {/* Card 3: Filters */}
                                <DashboardCard icon={TableCellsIcon} title="Filter(s)" manageLink={true} onManage={() => navigate('/filters')} className="h-[400px]">
                                    <SearchBar placeholder="Search filters..." />
                                    <div className="overflow-auto flex-1 custom-scrollbar -mx-4 px-4 pt-2">
                                        <table className="w-full text-left text-xs">
                                            <TableHeader columns={[
                                                { label: 'Filter Name', width: 'w-[32%]' },
                                                { label: 'Fresh', align: 'center' },
                                                { label: 'Active', align: 'center' },
                                                { label: 'Won', align: 'center' },
                                                { label: 'Lost', align: 'center' },
                                            ]} />
                                            <tbody className="divide-y divide-gray-50">
                                                {(stats.filtersSummary || []).map((r, i) => (
                                                    <tr key={i} className="group hover:bg-teal-50/30 transition-colors cursor-pointer" onClick={() => navigate(r.path)}>
                                                        <td className="py-3.5 pl-1">
                                                            <div className="flex items-center gap-2.5">
                                                                <FunnelIcon className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#08A698] transition-colors" />
                                                                <span className="text-gray-700 font-medium truncate max-w-[140px]" title={r.name}>{r.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 text-center text-gray-400 font-medium">{r.fresh || '-'}</td>
                                                        <td className="py-3.5 text-center text-gray-700 font-semibold">{r.active}</td>
                                                        <td className="py-3.5 text-center font-bold text-[#08A698]">{r.won > 0 ? r.won : '-'}</td>
                                                        <td className="py-3.5 text-center font-bold text-rose-500">{r.lost > 0 ? r.lost : '-'}</td>
                                                        <td className="py-3.5 text-center"><ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-[#08A698] transition-colors" /></td>
                                                    </tr>
                                                ))}
                                                {(!stats.filtersSummary || stats.filtersSummary.length === 0) && (
                                                    <tr><td colSpan="6" className="py-8 text-center text-gray-400">No filters available</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </DashboardCard>

                                {/* Card 4: Activity */}
                                <DashboardCard icon={ChartBarIcon} title="Activity & Performance" manageLink={true} onManage={() => navigate('/reports')} className="h-[400px]">
                                    <SearchBar placeholder="Search by name..." />
                                    <div className="overflow-auto flex-1 custom-scrollbar -mx-4 px-4 pt-2">
                                        <table className="w-full text-left text-xs">
                                            <thead className="sticky top-0 bg-white z-10 border-b border-gray-100">
                                                <tr>
                                                    <th className="pb-3 pt-1 pl-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Agent</th>
                                                    <th className="pb-3 pt-1 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Calls</th>
                                                    <th className="pb-3 pt-1 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Time</th>
                                                    <th className="pb-3 pt-1 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider pr-2">Conn.</th>
                                                    <th className="w-6"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {performance.map((r, i) => (
                                                    <tr key={i} className="group hover:bg-teal-50/30 transition-colors">
                                                        <td className="py-3 pl-1">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#08A698] border border-teal-100 flex items-center justify-center text-[10px] font-bold shadow-sm">{r.name ? r.name.substring(0, 2).toUpperCase() : '??'}</div>
                                                                <span className="text-gray-700 font-semibold group-hover:text-[#08A698] transition-colors">{r.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 text-right font-semibold text-gray-700">{r.calls}</td>
                                                        <td className="py-3 text-right font-medium text-gray-500">-</td>
                                                        <td className="py-3 text-right font-bold text-[#08A698] pr-2">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#08A698] shadow-sm shadow-teal-200"></span>
                                                                {r.notes || 0}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 text-right"><ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-[#08A698] ml-auto transition-colors" /></td>
                                                    </tr>
                                                ))}
                                                {performance.length === 0 && !loading && (
                                                    <tr><td colSpan="5" className="py-8 text-center text-gray-400">No performance data yet</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </DashboardCard>

                                {/* Card 5: Campaigns */}
                                <DashboardCard
                                    icon={MegaphoneIcon}
                                    title="Calling Campaigns"
                                    onAdd={() => setIsCampaignModalOpen(true)}
                                    onManage={() => navigate('/campaigns')}
                                    className={`h-[400px] ${stats.recentCampaigns?.length === 0 ? 'border-dashed border-2 hover:border-[#08A698]' : ''}`}
                                >
                                    {stats.recentCampaigns?.length > 0 ? (
                                        <div className="overflow-auto flex-1 custom-scrollbar -mx-4 px-4">
                                            <table className="w-full text-left text-xs">
                                                <TableHeader columns={[
                                                    { label: 'Campaign Name', width: 'w-[45%]' },
                                                    { label: 'Progress', align: 'center' },
                                                    { label: 'Priority', align: 'center' },
                                                ]} />
                                                <tbody className="divide-y divide-gray-50">
                                                    {stats.recentCampaigns.map((c, i) => (
                                                        <tr key={i} className="group hover:bg-teal-50/30 transition-colors">
                                                            <td className="py-3.5">
                                                                <div className="font-semibold text-gray-700 group-hover:text-[#08A698]">{c.name}</div>
                                                                <div className="text-[10px] text-gray-400 mt-0.5">{c.totalLeads} Leads</div>
                                                            </td>
                                                            <td className="py-3.5 text-center">
                                                                <div className="w-full bg-gray-100 rounded-full h-1.5 max-w-[60px] mx-auto overflow-hidden">
                                                                    <div className="bg-[#08A698] h-full transition-all duration-1000" style={{ width: `${c.progress}%` }}></div>
                                                                </div>
                                                                <span className="text-[9px] font-bold text-gray-500 mt-1 block">{c.progress}%</span>
                                                            </td>
                                                            <td className="py-3.5 text-center">
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                                                    {c.priority}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <button
                                                onClick={() => navigate('/campaigns')}
                                                className="w-full mt-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:text-[#08A698] hover:border-teal-200 transition-all"
                                            >
                                                View All Campaigns
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6">
                                            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center shadow-inner">
                                                <MegaphoneIcon className="w-10 h-10 text-[#08A698]" />
                                            </div>

                                            <div className="space-y-2 max-w-xs mx-auto">
                                                <h3 className="text-base font-bold text-gray-900">Optimization in Progress</h3>
                                                <p className="text-gray-500 text-sm">We are enhancing the campaign experience. Check back soon.</p>
                                            </div>

                                            <button
                                                onClick={() => navigate('/campaigns')}
                                                className="px-6 py-2.5 bg-[#08A698] text-white rounded-lg text-sm font-bold hover:bg-[#078F82] transition-all shadow-lg shadow-teal-200 hover:shadow-teal-300 transform hover:-translate-y-0.5"
                                            >
                                                Go to Campaigns
                                            </button>
                                        </div>
                                    )}
                                </DashboardCard>

                                {/* Card 6: All Leads Chart */}
                                <DashboardCard
                                    icon={ChartBarIcon}
                                    title="All Leads Overview"
                                    className="h-[400px]"
                                    headerRight={(
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-[11px] font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors">
                                            <CalendarIcon className="w-3.5 h-3.5 text-gray-500" />
                                            By Creation Date
                                            <ChevronDownIcon className="w-3 h-3 text-gray-400" />
                                        </button>
                                    )}
                                >
                                    <div className="flex-1 w-full flex items-end justify-between gap-3 px-2 pb-2 relative">
                                        {/* Grid Lines */}
                                        <div className="absolute inset-0 flex flex-col justify-between px-2 pb-8 pt-4 pointer-events-none opacity-20">
                                            {[1, 2, 3, 4].map((_, i) => <div key={i} className="w-full h-px bg-gray-300 border-dashed border-b"></div>)}
                                        </div>

                                        {Object.entries(stats.statusBreakdown || {}).length > 0 ? (
                                            Object.entries(stats.statusBreakdown).map(([status, count], idx) => {
                                                const colors = [
                                                    'bg-[#08A698]', 'bg-teal-700', 'bg-blue-400', 'bg-amber-400',
                                                    'bg-rose-400', 'bg-purple-400', 'bg-green-600', 'bg-gray-400', 'bg-gray-300'
                                                ];
                                                const percentage = stats.totalLeads > 0 ? (count / stats.totalLeads) * 100 : 0;
                                                return (
                                                    <div key={idx} className="flex flex-col items-center gap-2 group w-full h-full justify-end relative z-10">
                                                        <div
                                                            className={`w-full max-w-[40px] min-w-[24px] rounded-t-md transition-all duration-500 group-hover:scale-y-105 origin-bottom relative shadow-sm ${colors[idx % colors.length]} group-hover:brightness-110`}
                                                            style={{ height: `${Math.max(percentage, 5)}%` }}
                                                        >
                                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap pointer-events-none z-20 shadow-lg">
                                                                {count}
                                                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900/90"></div>
                                                            </div>
                                                        </div>
                                                        <div className="h-8 flex items-start justify-center w-full">
                                                            <span className="text-[10px] text-gray-500 font-semibold text-center leading-tight w-full block group-hover:text-[#08A698] transition-colors line-clamp-2">{status}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No lead data available</div>
                                        )}
                                    </div>
                                </DashboardCard>

                            </div>

                        </div>
                    </WorkspaceGuard>
                </main>
            </div>

            <CampaignModal
                isOpen={isCampaignModalOpen}
                onClose={() => setIsCampaignModalOpen(false)}
                onSuccess={handleCreateCampaignSuccess}
            />
            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSuccess={fetchDashboardData}
            />
        </div>
    );
};
export default Dashboard;
