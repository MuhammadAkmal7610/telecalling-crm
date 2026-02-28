import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../lib/supabaseClient';
import { useEffect, useState } from 'react';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
    TrashIcon,
    ChartBarIcon,
    EllipsisHorizontalIcon,
    CalendarIcon,
    UserIcon,
    PlusIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import CampaignModal from '../components/CampaignModal';
import { toast } from 'react-hot-toast';

const FlagIcon = ({ priority }) => {
    let color = 'text-gray-300';
    if (priority === 'High') color = 'text-rose-400';
    if (priority === 'Medium') color = 'text-amber-400';

    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${color}`}>
            <path fillRule="evenodd" d="M3 2.25a.75.75 0 01.75.75v.54l1.838-.46a9.75 9.75 0 016.725.738l.108.054a8.25 8.25 0 005.58.652l3.109-.732a.75.75 0 01.917.81 47.784 47.784 0 00.005 10.337.75.75 0 01-.574.812l-3.114.733a9.75 9.75 0 01-6.594-.158l-.106-.053a8.25 8.25 0 00-6.89-1.517l-1.077.291v6.79a.75.75 0 01-1.5 0v-18a.75.75 0 01.75-.75z" clipRule="evenodd" />
        </svg>
    );
};

const ProgressCircle = ({ percent }) => {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    // Color logic - Consistently Teal unless critical
    let color = '#08A698';
    if (percent < 15) color = '#ef4444'; // Red for very low

    return (
        <div className="relative flex items-center justify-center w-10 h-10">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="20" cy="20" r={radius} stroke="#e2e8f0" strokeWidth="3" fill="transparent" />
                <circle
                    cx="20" cy="20" r={radius}
                    stroke={color}
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <span className="absolute text-[9px] font-bold text-gray-700">{percent}%</span>
        </div>
    );
};

const ActionButton = ({ icon: Icon, title, danger, onClick }) => (
    <button
        onClick={onClick}
        className={`p-1.5 rounded-md transition-colors ${danger ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-[#08A698] hover:bg-teal-50'}`}
        title={title}
    >
        <Icon className="w-4 h-4" />
    </button>
);

const FilterDropdown = ({ placeholder, icon: Icon }) => (
    <div className="relative min-w-[140px]">
        <select className="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-gray-300 focus:outline-none focus:border-[#08A698] focus:ring-1 focus:ring-[#08A698] appearance-none cursor-pointer transition-all shadow-sm">
            <option value="">{placeholder}</option>
            <option value="1">Option 1</option>
            <option value="2">Option 2</option>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronDownIcon className="w-3 h-3" />
        </div>
        {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 hidden">
            <Icon className="w-4 h-4" />
        </div>}
    </div>
);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function Campaigns() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`${API_URL}/campaigns`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            const result = await res.json();
            const data = result.data?.data || result.data || result || [];

            const mappedCampaigns = data.map(c => ({
                id: c.id,
                name: c.name,
                priority: c.priority || 'Medium',
                assignees: [c.creator?.name?.substring(0, 2).toUpperCase() || 'AD'],
                totalLeads: c.totalLeads || 0,
                progress: c.progress || 0,
                createdOn: new Date(c.created_at).toLocaleDateString(),
                status: c.status || 'Active'
            }));

            setCampaigns(mappedCampaigns);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this campaign?')) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`${API_URL}/campaigns/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (res.ok) {
                toast.success('Campaign deleted');
                fetchCampaigns();
            }
        } catch (error) {
            toast.error('Failed to delete campaign');
        }
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased overflow-hidden">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col h-full min-w-0">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
                    <div className="mx-auto max-w-7xl space-y-6">

                        {/* Page Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Campaigns</h1>
                                    <button
                                        onClick={fetchCampaigns}
                                        className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#08A698] transition-colors"
                                        title="Refresh Data"
                                    >
                                        <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    Manage your calling lists and outreach programs.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#08A698] hover:bg-[#078F82] text-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm font-semibold"
                            >
                                <PlusIcon className="w-4 h-4" /> Create Campaign
                            </button>
                        </div>

                        {/* Filter Bar */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex flex-col md:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search campaigns..."
                                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#08A698] focus:bg-white transition-all placeholder-gray-400"
                                    />
                                </div>
                                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                                    <FilterDropdown placeholder="Priority" />
                                    <FilterDropdown placeholder="Date Range" icon={CalendarIcon} />
                                    <FilterDropdown placeholder="Assignee" icon={UserIcon} />
                                    <FilterDropdown placeholder="Status" />
                                </div>
                            </div>
                        </div>

                        {/* Campaigns Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Priority</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Assignee</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Total Leads</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Progress</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Created</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {loading && campaigns.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-10 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <ArrowPathIcon className="w-5 h-5 text-[#08A698] animate-spin" />
                                                        <span className="text-gray-500 text-sm">Loading campaigns...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : campaigns.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-10 text-center text-gray-400 italic text-sm">
                                                    No campaigns found
                                                </td>
                                            </tr>
                                        ) : (
                                            campaigns.map((campaign) => (
                                                <tr key={campaign.id} className="hover:bg-teal-50/30 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-semibold text-gray-700 group-hover:text-[#08A698] transition-colors">{campaign.name}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center">
                                                            <FlagIcon priority={campaign.priority} />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex -space-x-2">
                                                            {campaign.assignees.map((initial, idx) => (
                                                                <div key={idx} className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold shadow-sm ${initial.startsWith('+') ? 'bg-gray-100 text-gray-600' : 'bg-teal-50 text-teal-600'}`}>
                                                                    {initial}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-semibold text-gray-700">{campaign.totalLeads}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-center">
                                                            <ProgressCircle percent={campaign.progress} />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">{campaign.createdOn}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                            <ActionButton icon={ChartBarIcon} title="Analytics" />
                                                            <ActionButton icon={ArrowPathIcon} title="Refresh" onClick={fetchCampaigns} />
                                                            <ActionButton icon={TrashIcon} title="Delete" danger onClick={() => handleDelete(campaign.id)} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </main>
            </div>

            <CampaignModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchCampaigns}
            />
        </div>
    );
}
