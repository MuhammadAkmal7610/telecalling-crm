import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../lib/supabaseClient';
import { useEffect, useState } from 'react';
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
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <div className="flex flex-col lg:flex-row gap-6 h-full">

                        {/* Left Column: Agents List */}
                        <div className="lg:w-1/3 flex flex-col gap-6">
                            {/* Header & Tabs */}
                            <div className="flex items-center justify-between">
                                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">Leaderboard <ArrowPathIcon className="w-5 h-5 text-gray-400 group-hover:animate-spin cursor-pointer" /></h1>
                                <div className="flex gap-2">
                                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><ChartBarIcon className="w-5 h-5" /></button>
                                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><ArrowDownTrayIcon className="w-5 h-5" /></button>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 flex mb-2">
                                {['Day', 'Week', 'Month', 'Year'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === tab ? 'bg-gray-100 text-[#08A698]' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        {tab.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            {/* Search & Total Stats */}
                            <div className="bg-gradient-to-br from-teal-50 via-white to-white rounded-xl p-6 border border-teal-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <ChartBarIcon className="w-24 h-24 text-[#08A698] -mr-8 -mt-8" />
                                </div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="p-1.5 bg-white rounded-lg shadow-sm text-[#08A698]"><ChartBarIcon className="w-5 h-5" /></span>
                                        <span className="text-sm font-bold text-gray-700">Total Stats</span>
                                    </div>
                                    <span className="text-[10px] font-medium bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Team size: 30</span>
                                </div>
                                <div className="grid grid-cols-3 divide-x divide-gray-200">
                                    <div className="text-center px-2">
                                        <div className="text-2xl font-bold text-gray-900">{stats?.totalCalls || 0}</div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">Calls</div>
                                    </div>
                                    <div className="text-center px-2">
                                        <div className="text-2xl font-bold text-gray-900">{stats?.totalLeads || 0}</div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">Leads</div>
                                    </div>
                                    <div className="text-center px-2">
                                        <div className="text-2xl font-bold text-gray-900">{stats?.wonLeads || 0}</div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">Sales</div>
                                    </div>
                                </div>
                            </div>

                            {/* Agents List */}
                            <div className="space-y-3">
                                {loading ? (
                                    <div className="text-center py-10">
                                        <ArrowPathIcon className="w-6 h-6 text-[#08A698] animate-spin mx-auto mb-2" />
                                        <p className="text-xs text-gray-400 font-medium">Loading ranking...</p>
                                    </div>
                                ) : performance.length === 0 ? (
                                    <div className="text-center py-10 text-gray-400 italic text-xs">No performance data yet</div>
                                ) : performance?.length > 0 && performance?.map((agent, index) => (
                                    <div key={agent.id || index} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-100/50 transition-all cursor-pointer group relative overflow-hidden">

                                        {/* Rank Badge */}
                                        <div className={`absolute top-0 left-0 w-1 h-full ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : index === 2 ? 'bg-amber-600' : 'bg-transparent'}`}></div>

                                        <div className="flex items-center justify-between mb-3 pl-2">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    {index < 3 && (
                                                        <span className={`absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm z-10 ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'}`}>
                                                            {index + 1}
                                                        </span>
                                                    )}
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold bg-teal-50 text-teal-700 shadow-sm ring-2 ring-white`}>
                                                        {agent.name?.split(' ').map(n => n[0]).join('') || 'U'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-gray-900 group-hover:text-[#08A698] transition-colors">{agent.name}</h3>
                                                    <p className="text-xs text-gray-400 font-medium">Team Member</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 divide-x divide-gray-50 border-t border-gray-50 pt-3">
                                            <div className="text-center">
                                                <span className="block text-lg font-bold text-gray-800">{agent.calls || 0}</span>
                                                <span className="block text-[9px] text-gray-400">Calls</span>
                                            </div>
                                            <div className="text-center">
                                                <span className="block text-lg font-bold text-gray-800">{agent.notes || 0}</span>
                                                <span className="block text-[9px] text-gray-400">Notes</span>
                                            </div>
                                            <div className="text-center">
                                                <span className="block text-lg font-bold text-gray-800">{agent.sales || 0}</span>
                                                <span className="block text-[9px] text-gray-400">Sales</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Details & Stats */}
                        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8">
                            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                                <h2 className="text-2xl font-bold text-gray-900">Total Stats</h2>
                                <div className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                                    <span className="text-base text-gray-400 font-normal">PKR</span> {stats?.wonLeads ? (stats.wonLeads * 5000).toLocaleString() : '0'} <ChevronRightIcon className="w-5 h-5 text-gray-300" />
                                </div>
                            </div>

                            {/* Detailed Breakdown Sections */}
                            <div className="space-y-8">

                                {/* Calls Section */}
                                <StatSection title="Calls" items={[
                                    { label: 'All Calls', value: `${stats?.totalCalls || 0}`, icon: PhoneIcon, highlight: true },
                                    { label: 'Total Leads', value: `${stats?.totalLeads || 0}`, icon: ArrowDownTrayIcon },
                                    { label: 'Won Leads', value: `${stats?.wonLeads || 0}`, icon: CheckCircleIcon, color: 'text-green-500' },
                                    { label: 'Conversion Rate', value: `${stats?.conversionRate?.toFixed(1) || 0}%`, icon: ChartBarIcon, color: 'text-[#08A698]' },
                                ]} />

                                {/* Tasks Section */}
                                <StatSection title="Tasks" items={[
                                    { label: 'Late', value: `${stats?.tasksSummary?.late || 0}`, icon: ClockIcon, color: 'text-red-500' },
                                    { label: 'Pending', value: `${stats?.tasksSummary?.pending || 0}`, icon: CalendarIcon },
                                    { label: 'Done', value: `${stats?.tasksSummary?.done || 0}`, icon: CheckCircleIcon, color: 'text-green-500' },
                                    { label: 'Created', value: `${stats?.tasksSummary?.created || 0}`, icon: PlusIcon },
                                ]} />
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
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

