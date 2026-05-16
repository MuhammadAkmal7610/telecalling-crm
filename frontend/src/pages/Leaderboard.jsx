import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../lib/supabaseClient';
import { useEffect, useState } from 'react';
import WorkspaceGuard from '../components/WorkspaceGuard';
import {
    ArrowPathIcon,
    ArrowDownTrayIcon,
    ChartBarIcon,
    ChevronRightIcon,
    ClockIcon,
    PhoneIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    XCircleIcon,
    FunnelIcon,
    CalendarIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Data fetched via API

export default function Leaderboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Day');
    const [performance, setPerformance] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const headers = { 'Authorization': `Bearer ${session.access_token}` };
            const [perfRes, statsRes] = await Promise.all([
                fetch(`${API_URL}/reports/performance`, { headers }),
                fetch(`${API_URL}/reports/dashboard`, { headers })
            ]);

            const perfData = await perfRes.json();
            const statsData = await statsRes.json();

            setPerformance(perfData || []);
            setStats(statsData || null);
        } catch (error) {
            console.error('Error fetching leaderboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <WorkspaceGuard>
            <div className="relative">
                <div className="mx-auto w-full">
                    <div className="flex flex-col lg:flex-row gap-6 p-6 lg:p-8">
                        {/* Left Column: Agents List */}
                        <div className="lg:w-1/3 flex flex-col gap-6">
                            {/* Header & Tabs */}
                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                    Leaderboard
                                    <ArrowPathIcon
                                        className={`w-6 h-6 text-gray-400 cursor-pointer hover:text-teal-600 transition-colors ${loading ? 'animate-spin' : ''}`}
                                        onClick={fetchData}
                                    />
                                </h1>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-white rounded-xl text-gray-500 shadow-sm border border-gray-100 transition-all"><ChartBarIcon className="w-5 h-5" /></button>
                                    <button className="p-2 hover:bg-white rounded-xl text-gray-500 shadow-sm border border-gray-100 transition-all"><ArrowDownTrayIcon className="w-5 h-5" /></button>
                                </div>
                            </div>

                            <div className="bg-white/50 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 p-1 flex mb-2">
                                {['Day', 'Week', 'Month', 'Year'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === tab ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        {tab.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            {/* Search & Total Stats */}
                            <div className="bg-gradient-to-br from-teal-600 via-teal-500 to-teal-700 rounded-3xl p-8 border border-teal-400/30 shadow-[0_20px_50px_rgba(8,166,152,0.2)] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <ChartBarIcon className="w-32 h-32 text-white -mr-8 -mt-8" />
                                </div>
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <span className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white"><ChartBarIcon className="w-6 h-6" /></span>
                                        <span className="text-lg font-bold text-white">Workspace Overview</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 divide-x divide-white/20 relative z-10">
                                    <div className="text-center px-2">
                                        <div className="text-3xl font-black text-white">{stats?.totalCalls || 0}</div>
                                        <div className="text-[10px] text-teal-100 uppercase font-black tracking-widest mt-1">Calls</div>
                                    </div>
                                    <div className="text-center px-2">
                                        <div className="text-3xl font-black text-white">{stats?.totalLeads || 0}</div>
                                        <div className="text-[10px] text-teal-100 uppercase font-black tracking-widest mt-1">Leads</div>
                                    </div>
                                    <div className="text-center px-2">
                                        <div className="text-3xl font-black text-white">{stats?.wonLeads || 0}</div>
                                        <div className="text-[10px] text-teal-100 uppercase font-black tracking-widest mt-1">Sales</div>
                                    </div>
                                </div>
                            </div>

                            {/* Agents List */}
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="text-center py-20">
                                        <div className="w-12 h-12 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
                                        <p className="text-sm text-gray-400 font-bold tracking-tight">Calculating rankings...</p>
                                    </div>
                                ) : performance.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                        <p className="text-gray-400 italic text-sm">No performance data yet</p>
                                    </div>
                                ) : performance?.length > 0 && performance?.map((agent, index) => (
                                    <div key={agent.id || index} className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden">
                                        {index < 3 && (
                                            <div className={`absolute top-0 left-0 w-1.5 h-full ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-slate-300' : 'bg-amber-600'}`}></div>
                                        )}
                                        <div className="flex items-center justify-between mb-4 pl-2">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    {index < 3 && (
                                                        <span className={`absolute -top-3 -left-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shadow-lg z-10 ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-slate-400' : 'bg-amber-600'}`}>
                                                            {index + 1}
                                                        </span>
                                                    )}
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black bg-teal-50 text-teal-600 shadow-inner ring-4 ring-white`}>
                                                        {agent.name?.split(' ').map(n => n[0]).join('') || 'U'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-gray-900 group-hover:text-teal-600 transition-colors">{agent.name}</h3>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Premium Agent</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 border-t border-gray-50 pt-4">
                                            <div className="bg-gray-50/50 rounded-2xl p-2 text-center">
                                                <span className="block text-lg font-black text-gray-900">{agent.calls || 0}</span>
                                                <span className="block text-[8px] text-gray-400 font-black uppercase tracking-widest">Calls</span>
                                            </div>
                                            <div className="bg-gray-50/50 rounded-2xl p-2 text-center">
                                                <span className="block text-lg font-black text-gray-900">{agent.notes || 0}</span>
                                                <span className="block text-[8px] text-gray-400 font-black uppercase tracking-widest">Notes</span>
                                            </div>
                                            <div className="bg-gray-50/50 rounded-2xl p-2 text-center">
                                                <span className="block text-lg font-black text-gray-900">{agent.sales || 0}</span>
                                                <span className="block text-[8px] text-gray-400 font-black uppercase tracking-widest">Sales</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Details & Stats */}
                        <div className="flex-1">
                            <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 shadow-2xl p-8 lg:p-12 sticky top-8">
                                <div className="flex items-center justify-between mb-10 border-b border-gray-100/50 pb-8">
                                    <div>
                                        <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Total Revenue</h2>
                                        <p className="text-gray-400 font-medium mt-1">Real-time workspace valuation</p>
                                    </div>
                                    <div className="text-5xl font-black text-teal-600 flex items-baseline gap-2 tracking-tighter">
                                        <span className="text-xl text-teal-400 font-black">PKR</span>
                                        {stats?.wonLeads ? (stats.wonLeads * 5000).toLocaleString() : '0'}
                                    </div>
                                </div>

                                {/* Detailed Breakdown Sections */}
                                <div className="space-y-12">
                                    {/* Calls Section */}
                                    <StatSection title="Communication Performance" items={[
                                        { label: 'Total Outreach', value: `${stats?.totalCalls || 0}`, icon: PhoneIcon, highlight: true },
                                        { label: 'Inbound Leads', value: `${stats?.totalLeads || 0}`, icon: ArrowDownTrayIcon },
                                        { label: 'Closed Deals', value: `${stats?.wonLeads || 0}`, icon: CheckCircleIcon, color: 'text-green-500' },
                                        { label: 'Success Velocity', value: `${stats?.conversionRate?.toFixed(1) || 0}%`, icon: ChartBarIcon, color: 'text-teal-600' },
                                    ]} />

                                    {/* Tasks Section */}
                                    <StatSection title="Workflow Efficiency" items={[
                                        { label: 'High Priority (Late)', value: `${stats?.tasksSummary?.late || 0}`, icon: ClockIcon, color: 'text-red-500' },
                                        { label: 'Active Pipeline', value: `${stats?.tasksSummary?.pending || 0}`, icon: CalendarIcon },
                                        { label: 'Completed Tasks', value: `${stats?.tasksSummary?.done || 0}`, icon: CheckCircleIcon, color: 'text-green-500' },
                                        { label: 'New Assignments', value: `${stats?.tasksSummary?.created || 0}`, icon: PlusIcon },
                                    ]} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </WorkspaceGuard>
    );
}

// Helper Components
const StatSection = ({ title, items }) => (
    <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-l-4 border-[#08A698] pl-3">{title}</h3>
        <div className="space-y-1">
            {items.map((item, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group ${item.highlight ? 'bg-gray-50 font-medium' : ''}`}>
                    <div className="flex items-center gap-3">
                        <item.icon className={`w-4 h-4 ${item.color || 'text-gray-400'} group-hover:text-[#08A698] transition-colors`} />
                        <span className="text-sm text-gray-600 font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-900">{item.value}</span>
                        <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-[#08A698]" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

