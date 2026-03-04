import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import WorkspaceGuard from '../components/WorkspaceGuard';
import { usePermission } from '../hooks/usePermission';
import { useWorkspace } from '../context/WorkspaceContext';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import {
    UsersIcon,
    BuildingOfficeIcon,
    UserPlusIcon,
    ChartBarIcon,
    PhoneIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ClockIcon,
    MegaphoneIcon,
    KeyIcon,
    UserIcon,
    Cog6ToothIcon,
    ShieldCheckIcon,
    ArrowTrendingUpIcon,
    CreditCardIcon,
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const StatCard = ({ icon: Icon, label, value, sub, color = 'teal', trend }) => {
    const colorMap = {
        teal: 'bg-[#08A698]/10 text-[#08A698]',
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        amber: 'bg-amber-50 text-amber-600',
        green: 'bg-green-50 text-green-600',
        rose: 'bg-rose-50 text-rose-600',
    };
    return (
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend !== undefined && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend >= 0 ? '+' : ''}{trend} this week
                    </span>
                )}
            </div>
            <div className="mt-3">
                <div className="text-2xl font-bold text-gray-900">{value ?? <span className="text-gray-300 animate-pulse">—</span>}</div>
                <div className="text-sm font-medium text-gray-700 mt-0.5">{label}</div>
                {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
            </div>
        </div>
    );
};

const RoleTag = ({ role }) => {
    const styles = {
        root: 'bg-purple-50 text-purple-700 border-purple-100',
        billing_admin: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        admin: 'bg-blue-50 text-blue-700 border-blue-100',
        manager: 'bg-teal-50 text-teal-700 border-teal-100',
        marketing: 'bg-amber-50 text-amber-700 border-amber-100',
        caller: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    const icons = { root: KeyIcon, billing_admin: CreditCardIcon, admin: Cog6ToothIcon, manager: UserIcon, marketing: MegaphoneIcon, caller: PhoneIcon };
    const Icon = icons[role] || UserIcon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[role] || styles.caller}`}>
            <Icon className="w-3 h-3" />
            {role?.charAt(0).toUpperCase() + role?.slice(1)}
        </span>
    );
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { isOrgAdmin, isRoot, can } = usePermission();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState(null);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Redirect non-admins
    useEffect(() => {
        if (!isOrgAdmin && !isRoot) navigate('/dashboard');
    }, [isOrgAdmin, isRoot]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const headers = { 'Authorization': `Bearer ${session.access_token}` };

            const [statsRes, activityRes] = await Promise.all([
                fetch(`${API_URL}/admin/stats`, { headers }),
                fetch(`${API_URL}/admin/activity?limit=15`, { headers }),
            ]);

            if (statsRes.ok) {
                const json = await statsRes.json();
                // Handle both wrapped { data: {...} } and direct response
                setStats(json?.data || json);
            }
            if (activityRes.ok) {
                const json = await activityRes.json();
                setActivity(json?.data || json || []);
            }
        } catch (e) {
            console.error('Admin data fetch failed', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'workspaces', label: 'Workspaces' },
        { id: 'activity', label: 'Activity Feed' },
    ];

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <WorkspaceGuard>
                        <div className="max-w-7xl mx-auto">

                            {/* Page Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-[#08A698]/10 rounded-xl">
                                        <ShieldCheckIcon className="w-7 h-7 text-[#08A698]" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                                        <p className="text-sm text-gray-500 mt-0.5">Organization-wide control panel</p>
                                    </div>
                                </div>
                                <button
                                    onClick={fetchData}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all ${loading ? 'opacity-60' : ''}`}
                                >
                                    <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin text-[#08A698]' : ''}`} />
                                    Refresh
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-8 w-fit">
                                {tabs.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setActiveTab(t.id)}
                                        className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            {/* ── Overview Tab ─────────────────────────────────── */}
                            {activeTab === 'overview' && (
                                <div className="space-y-8">

                                    {/* Stat Cards */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <StatCard icon={UsersIcon} label="Total Users" value={stats?.overview.totalUsers} sub={`${stats?.users.byRole?.admin || 0} admins, ${stats?.users.byRole?.caller || 0} callers`} color="teal" trend={stats?.overview.newUsersThisWeek} />
                                        <StatCard icon={BuildingOfficeIcon} label="Workspaces" value={stats?.overview.totalWorkspaces} color="blue" />
                                        <StatCard icon={ArrowTrendingUpIcon} label="Total Leads" value={stats?.overview.totalLeads} sub={`${stats?.overview.newLeadsThisWeek} new this week`} color="purple" trend={stats?.overview.newLeadsThisWeek} />
                                        <StatCard icon={PhoneIcon} label="Calls This Week" value={stats?.overview.callsThisWeek} color="green" />
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <StatCard icon={CheckCircleIcon} label="Tasks Completed" value={stats?.tasks.completed} color="green" />
                                        <StatCard icon={ClockIcon} label="Tasks Pending" value={stats?.tasks.pending} color="amber" />
                                        <StatCard icon={MegaphoneIcon} label="Active Campaigns" value={stats?.overview.activeCampaigns} sub={`${stats?.overview.totalCampaigns} total`} color="rose" />
                                        <StatCard icon={CreditCardIcon} label="Total Campaigns" value={stats?.overview.totalCampaigns} color="blue" />
                                    </div>

                                    {/* User Role Breakdown */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                                <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Users by Role</h2>
                                            </div>
                                            <div className="p-6 space-y-3">
                                                {loading ? (
                                                    <div className="text-gray-400 text-sm text-center py-4">Loading...</div>
                                                ) : stats?.users.byRole ? (
                                                    Object.entries(stats.users.byRole).sort((a, b) => b[1] - a[1]).map(([role, count]) => (
                                                        <div key={role} className="flex items-center justify-between">
                                                            <RoleTag role={role} />
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-32 bg-gray-100 rounded-full h-1.5">
                                                                    <div
                                                                        className="h-1.5 rounded-full bg-[#08A698]"
                                                                        style={{ width: `${(count / stats.users.total) * 100}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-sm font-bold text-gray-900 w-6 text-right">{count}</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : <div className="text-gray-400 text-sm text-center py-4">No data</div>}
                                            </div>
                                        </div>

                                        {/* Lead Status Breakdown */}
                                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                                <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Leads by Status</h2>
                                            </div>
                                            <div className="p-6 space-y-3">
                                                {loading ? (
                                                    <div className="text-gray-400 text-sm text-center py-4">Loading...</div>
                                                ) : stats?.leads.byStatus ? (
                                                    Object.entries(stats.leads.byStatus).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([status, count]) => (
                                                        <div key={status} className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-32 bg-gray-100 rounded-full h-1.5">
                                                                    <div
                                                                        className="h-1.5 rounded-full bg-purple-500"
                                                                        style={{ width: `${(count / stats.leads.total) * 100}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-sm font-bold text-gray-900 w-6 text-right">{count}</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : <div className="text-gray-400 text-sm text-center py-4">No data</div>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                        <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">Quick Actions</h2>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {[
                                                { label: 'Manage Users', icon: UsersIcon, path: '/users', color: 'teal' },
                                                { label: 'Workspaces', icon: BuildingOfficeIcon, path: '/manage-workspaces', color: 'blue' },
                                                { label: 'Billing', icon: CreditCardIcon, path: '/billing', color: 'purple' },
                                                { label: 'Permissions', icon: ShieldCheckIcon, path: '/permission-templates', color: 'amber' },
                                            ].map(action => {
                                                const Icon = action.icon;
                                                return (
                                                    <button
                                                        key={action.label}
                                                        onClick={() => navigate(action.path)}
                                                        className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-[#08A698]/5 border border-gray-100 hover:border-[#08A698]/30 rounded-xl transition-all group"
                                                    >
                                                        <Icon className="w-6 h-6 text-gray-400 group-hover:text-[#08A698] transition-colors" />
                                                        <span className="text-xs font-semibold text-gray-600 group-hover:text-[#08A698] transition-colors text-center">{action.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Workspaces Tab ───────────────────────────────── */}
                            {activeTab === 'workspaces' && (
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                        <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider">
                                            All Workspaces ({stats?.workspaces?.length || 0})
                                        </h2>
                                        <button
                                            onClick={() => navigate('/manage-workspaces')}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-[#08A698] hover:text-[#068f82] transition-colors"
                                        >
                                            <BuildingOfficeIcon className="w-4 h-4" />
                                            Manage →
                                        </button>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {loading ? (
                                            <div className="p-8 text-center text-gray-400">Loading...</div>
                                        ) : stats?.workspaces?.length > 0 ? (
                                            stats.workspaces.map(ws => (
                                                <div key={ws.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-[#08A698]/10 flex items-center justify-center text-[#08A698] font-bold text-lg">
                                                            {ws.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-gray-900 text-sm">{ws.name}</span>
                                                                {ws.isDefault && (
                                                                    <span className="px-1.5 py-0.5 bg-[#08A698]/10 text-[#08A698] text-[10px] font-bold rounded uppercase tracking-wide">Default</span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                {new Date(ws.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <UsersIcon className="w-4 h-4" />
                                                        <span className="font-medium">{ws.memberCount}</span>
                                                        <span className="text-gray-400">members</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-400">No workspaces found</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── Activity Feed Tab ────────────────────────────── */}
                            {activeTab === 'activity' && (
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                        <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Recent Activity (Last 15)</h2>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {loading ? (
                                            <div className="p-8 text-center text-gray-400">Loading...</div>
                                        ) : activity.length > 0 ? (
                                            activity.map(a => (
                                                <div key={a.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                                                    <div className={`mt-0.5 p-1.5 rounded-full ${a.type === 'call' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        {a.type === 'call' ? <PhoneIcon className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-800">
                                                            <span className="font-semibold">{a.user?.name || 'Unknown'}</span>
                                                            {' logged a '}
                                                            <span className="font-medium capitalize">{a.type}</span>
                                                            {a.lead?.name && <> with <span className="font-semibold">{a.lead.name}</span></>}
                                                        </p>
                                                        {(a.details?.outcome || a.details?.notes) && (
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {a.details?.outcome && <>Outcome: {a.details.outcome}</>}
                                                                {a.details?.notes && <> — {a.details.notes}</>}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            {new Date(a.created_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-400">No recent activity found</div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </WorkspaceGuard>
                </main>
            </div>
        </div>
    );
}
