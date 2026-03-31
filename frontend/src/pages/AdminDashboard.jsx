import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import WorkspaceGuard from '../components/WorkspaceGuard';
import { usePermission } from '../hooks/usePermission';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import {
    UsersIcon,
    BuildingOfficeIcon,
    PhoneIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ClockIcon,
    MegaphoneIcon,
    ShieldCheckIcon,
    ArrowTrendingUpIcon,
    CreditCardIcon,
    PencilSquareIcon,
    CheckIcon,
    ArrowPathRoundedSquareIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

// New Dashboard Components
import DashboardGrid from '../components/dashboard/DashboardGrid';
import DraggableWidget from '../components/dashboard/DraggableWidget';
import StatCard from '../components/dashboard/StatCard';
import RoleBreakdownWidget from '../components/dashboard/RoleBreakdownWidget';
import StatusBreakdownWidget from '../components/dashboard/StatusBreakdownWidget';
import QuickActionsWidget from '../components/dashboard/QuickActionsWidget';
import ActivityFeedWidget from '../components/dashboard/ActivityFeedWidget';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { isOrgAdmin, isRoot } = usePermission();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState(null);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Customization state
    const [isEditing, setIsEditing] = useState(false);
    const [layout, setLayout] = useState([]);
    const [saving, setSaving] = useState(false);

    const defaultLayout = [
        { id: 'stat-users', type: 'stat', label: 'Total Users', icon: UsersIcon, color: 'teal' },
        { id: 'stat-workspaces', type: 'stat', label: 'Workspaces', icon: BuildingOfficeIcon, color: 'blue' },
        { id: 'stat-leads', type: 'stat', label: 'Total Leads', icon: ArrowTrendingUpIcon, color: 'purple' },
        { id: 'stat-calls', type: 'stat', label: 'Calls This Week', icon: PhoneIcon, color: 'green' },
        { id: 'role-breakdown', type: 'chart', span: 2 },
        { id: 'status-breakdown', type: 'chart', span: 2 },
        { id: 'quick-actions', type: 'actions', span: 2 },
        { id: 'activity-feed', type: 'activity', span: 2 },
        { id: 'stat-tasks-done', type: 'stat', label: 'Tasks Completed', icon: CheckCircleIcon, color: 'green' },
        { id: 'stat-tasks-pending', type: 'stat', label: 'Tasks Pending', icon: ClockIcon, color: 'amber' },
        { id: 'stat-active-campaigns', type: 'stat', label: 'Active Campaigns', icon: MegaphoneIcon, color: 'rose' },
        { id: 'stat-total-campaigns', type: 'stat', label: 'Total Campaigns', icon: CreditCardIcon, color: 'blue' },
    ];

    useEffect(() => {
        if (!isOrgAdmin && !isRoot) navigate('/dashboard');
        fetchData();
        loadLayout();
    }, [isOrgAdmin, isRoot]);

    const loadLayout = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('users')
                .select('dashboard_layout')
                .eq('id', user.id)
                .single();

            if (data?.dashboard_layout && Array.isArray(data.dashboard_layout) && data.dashboard_layout.length > 0) {
                // Ensure icons are mapped back (since JSON doesn't store components)
                const restoredLayout = data.dashboard_layout.map(item => {
                    const def = defaultLayout.find(d => d.id === item.id);
                    return { ...item, icon: def?.icon };
                });
                setLayout(restoredLayout);
            } else {
                setLayout(defaultLayout);
            }
        } catch (e) {
            console.error('Failed to load layout', e);
            setLayout(defaultLayout);
        }
    };

    const saveLayout = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Remove icon components before saving to DB
            const layoutToSave = layout.map(({ icon, ...rest }) => rest);

            const { error } = await supabase
                .from('users')
                .update({ dashboard_layout: layoutToSave })
                .eq('id', user.id);

            if (error) throw error;
            toast.success('Dashboard layout saved');
            setIsEditing(false);
        } catch (e) {
            console.error('Failed to save layout', e);
            toast.error('Failed to save layout');
        } finally {
            setSaving(false);
        }
    };

    const resetLayout = () => {
        setLayout(defaultLayout);
        toast.success('Reset to default');
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const headers = { 'Authorization': `Bearer ${session.access_token}` };

            const [statsRes, activityRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/admin/stats`, { headers }),
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/admin/activity?limit=15`, { headers }),
            ]);

            if (statsRes.ok) {
                const json = await statsRes.json();
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

    const renderWidget = (item) => {
        let content = null;
        let span = item.span === 2 ? 'col-span-2' : 'col-span-1';

        switch (item.id) {
            case 'stat-users': content = <StatCard icon={UsersIcon} label={item.label} value={stats?.overview.totalUsers} sub={`${stats?.users.byRole?.admin || 0} admins, ${stats?.users.byRole?.caller || 0} callers`} color={item.color} trend={stats?.overview.newUsersThisWeek} />; break;
            case 'stat-workspaces': content = <StatCard icon={BuildingOfficeIcon} label={item.label} value={stats?.overview.totalWorkspaces} color={item.color} />; break;
            case 'stat-leads': content = <StatCard icon={ArrowTrendingUpIcon} label={item.label} value={stats?.overview.totalLeads} sub={`${stats?.overview.newLeadsThisWeek} new this week`} color={item.color} trend={stats?.overview.newLeadsThisWeek} />; break;
            case 'stat-calls': content = <StatCard icon={PhoneIcon} label={item.label} value={stats?.overview.callsThisWeek} color={item.color} />; break;
            case 'stat-tasks-done': content = <StatCard icon={CheckCircleIcon} label={item.label} value={stats?.tasks.completed} color={item.color} />; break;
            case 'stat-tasks-pending': content = <StatCard icon={ClockIcon} label={item.label} value={stats?.tasks.pending} color={item.color} />; break;
            case 'stat-active-campaigns': content = <StatCard icon={MegaphoneIcon} label={item.label} value={stats?.overview.activeCampaigns} sub={`${stats?.overview.totalCampaigns} total`} color={item.color} />; break;
            case 'stat-total-campaigns': content = <StatCard icon={CreditCardIcon} label={item.label} value={stats?.overview.totalCampaigns} color={item.color} />; break;
            case 'role-breakdown': content = <RoleBreakdownWidget stats={stats} loading={loading} />; break;
            case 'status-breakdown': content = <StatusBreakdownWidget stats={stats} loading={loading} />; break;
            case 'quick-actions': content = <QuickActionsWidget />; break;
            case 'activity-feed': content = <ActivityFeedWidget activity={activity} loading={loading} />; break;
            default: return null;
        }

        return (
            <div key={item.id} className={`${span} h-full`}>
                <DraggableWidget id={item.id} isEditing={isEditing}>
                    {content}
                </DraggableWidget>
            </div>
        );
    };

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
                                <div className="flex items-center gap-2">
                                    {activeTab === 'overview' && (
                                        <>
                                            {isEditing ? (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={resetLayout} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                                                        <ArrowPathRoundedSquareIcon className="w-4 h-4" />
                                                        Reset
                                                    </button>
                                                    <button onClick={saveLayout} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#08A698] rounded-lg hover:bg-[#068f82] disabled:opacity-50">
                                                        <CheckIcon className="w-4 h-4" />
                                                        {saving ? 'Saving...' : 'Save Layout'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#08A698] bg-[#08A698]/5 border border-[#08A698]/20 rounded-lg hover:bg-[#08A698]/10 transition-all">
                                                    <PencilSquareIcon className="w-4 h-4" />
                                                    Customize
                                                </button>
                                            )}
                                        </>
                                    )}
                                    <button
                                        onClick={fetchData}
                                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all ${loading ? 'opacity-60' : ''}`}
                                    >
                                        <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin text-[#08A698]' : ''}`} />
                                        Refresh
                                    </button>
                                </div>
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
                                    <DashboardGrid 
                                        items={layout} 
                                        setItems={setLayout} 
                                        isEditing={isEditing} 
                                        renderItem={renderWidget}
                                    />
                                </div>
                            )}

                            {/* ── Workspaces Tab ───────────────────────────────── */}
                            {activeTab === 'workspaces' && (
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
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
                                    <div className="divide-y divide-gray-200">
                                        {loading ? (
                                            <div className="p-6"><Skeleton rows={3} /></div>
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
                                            <EmptyState title="No workspaces" subtitle="Create your first workspace" actionLabel="Create Workspace" onAction={() => navigate('/manage-workspaces')} />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── Activity Feed Tab ────────────────────────────── */}
                            {activeTab === 'activity' && (
                                <div className="space-y-4">
                                    <ActivityFeedWidget activity={activity} loading={loading} />
                                </div>
                            )}

                        </div>
                    </WorkspaceGuard>
                </main>
            </div>
        </div>
    );
}
