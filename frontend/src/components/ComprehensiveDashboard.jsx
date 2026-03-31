import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useWorkspace } from '../context/WorkspaceContext';
import { useSocket } from '../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';
import {
    ChartBarIcon,
    UsersIcon,
    PhoneIcon,
    ArrowTrendingUpIcon,
    CalendarIcon,
    ClockIcon,
    FunnelIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    PlusIcon,
    Cog6ToothIcon,
    MagnifyingGlassIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell, 
    Tooltip, 
    Legend, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    LineChart, 
    Line, 
    AreaChart, 
    Area 
} from 'recharts';

const COLORS = ['#08A698', '#0ea5e9', '#8b5cf6', '#ec4899', '#f97316', '#eab308'];

const DashboardWidget = ({ title, icon: Icon, value, change, changeType, color, children, onClick, size = 'normal' }) => {
    const sizeClasses = {
        small: 'p-4',
        normal: 'p-6',
        large: 'p-8'
    };

    return (
        <div 
            className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer ${sizeClasses[size]}`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {change && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                        changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {changeType === 'increase' ? (
                            <ArrowTrendingUpIcon className="w-4 h-4" />
                        ) : (
                            <ArrowPathIcon className="w-4 h-4 rotate-180" />
                        )}
                        {change}
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                <p className="text-sm text-gray-600 mt-1">{title}</p>
            </div>
            {children}
        </div>
    );
};

const ChartWidget = ({ title, data = [], type = 'bar', height = 200, children }) => {
    const maxValue = data.length ? Math.max(...data.map(d => d.value)) : 0;
    
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <button className="text-gray-400 hover:text-gray-600">
                    <Cog6ToothIcon className="w-5 h-5" />
                </button>
            </div>
            <div style={{ height: `${height}px` }} className="relative">
                {children ? children : (
                    type === 'bar' ? (
                        <div className="flex items-end justify-between h-full gap-2">
                            {data.map((item, index) => (
                                <div key={index} className="flex-1 flex flex-col items-center justify-end">
                                    <div className="w-full bg-gradient-to-t from-[#08A698] to-teal-400 rounded-t-lg relative group">
                                        <div 
                                            className="w-full rounded-t-lg transition-all duration-500"
                                            style={{ height: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : '0%' }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                {item.value}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-2 text-center">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-[#08A698] mb-2">{data[0]?.value || 0}</div>
                                <div className="text-sm text-gray-600">{data[0]?.label || 'Total'}</div>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

const ActivityFeed = ({ activities }) => {
    const getActivityIcon = (type) => {
        switch (type) {
            case 'call': return PhoneIcon;
            case 'task': return CheckCircleIcon;
            case 'lead': return UsersIcon;
            default: return DocumentTextIcon;
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'call': return 'bg-blue-100 text-blue-600';
            case 'task': return 'bg-green-100 text-green-600';
            case 'lead': return 'bg-purple-100 text-purple-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button className="text-sm text-[#08A698] hover:text-[#068f82]">View all</button>
            </div>
            <div className="space-y-4">
                {activities.slice(0, 5).map((activity, index) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                        <div key={index} className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-900">{activity.title}</p>
                                <p className="text-xs text-gray-500">{activity.details}</p>
                                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                            </div>
                        </div>
                    );
                })}
                {activities.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No recent activity</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const PerformanceTable = ({ data }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
                <button className="text-gray-400 hover:text-gray-600">
                    <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Agent</th>
                            <th className="text-right text-xs font-medium text-gray-500 uppercase pb-3">Calls</th>
                            <th className="text-right text-xs font-medium text-gray-500 uppercase pb-3">Tasks</th>
                            <th className="text-right text-xs font-medium text-gray-500 uppercase pb-3">Leads</th>
                            <th className="text-right text-xs font-medium text-gray-500 uppercase pb-3">Conversion</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((agent, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#08A698] text-white flex items-center justify-center text-sm font-bold">
                                            {agent.name?.charAt(0) || 'A'}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{agent.name}</span>
                                    </div>
                                </td>
                                <td className="text-right text-sm text-gray-900">{agent.calls || 0}</td>
                                <td className="text-right text-sm text-gray-900">{agent.tasks || 0}</td>
                                <td className="text-right text-sm text-gray-900">{agent.leads || 0}</td>
                                <td className="text-right text-sm">
                                    <span className={`font-medium ${
                                        agent.conversion >= 20 ? 'text-green-600' : 
                                        agent.conversion >= 10 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                        {agent.conversion || 0}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ComprehensiveDashboard = () => {
    const { apiFetch } = useApi();
    const { currentWorkspace } = useWorkspace();
    const { isConnected } = useSocket();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        stats: {},
        charts: {},
        activities: [],
        performance: []
    });
    const [timeRange, setTimeRange] = useState('7d');

    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (!currentWorkspace) return;
        fetchDashboardData(true);
    }, [currentWorkspace, timeRange]);

    const fetchDashboardData = async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        else setIsRefreshing(true);
        
        try {
            const response = await apiFetch(`/reports/dashboard?timeRange=${timeRange}`);
            const data = await response.json();

            // The backend now returns a flattened object with everything we need
            const dashboard = data.data || data;

            setDashboardData({
                stats: dashboard,
                charts: {
                    leadByStatus: dashboard.leadByStatus,
                    taskByPriority: dashboard.taskByPriority,
                    callActivity: dashboard.callActivity,
                    revenueOverTime: dashboard.revenueOverTime
                },
                activities: dashboard.activities || [],
                performance: dashboard.performance || []
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <ArrowPathIcon className="w-8 h-8 text-[#08A698] animate-spin" />
            </div>
        );
    }

    const { stats, charts, activities, performance } = dashboardData;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    {isConnected && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Live</span>
                    )}
                    <button 
                        onClick={() => fetchDashboardData(false)} 
                        disabled={isRefreshing}
                        className={`text-[#08A698] hover:text-[#068f82] transition-transform ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        disabled={isRefreshing}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#08A698] disabled:bg-gray-50"
                    >
                        <option value="1d">Today</option>
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                    </select>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Cog6ToothIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardWidget
                    title={stats.labels?.totalLeads || 'Total Leads'}
                    icon={UsersIcon}
                    value={stats.totalLeads || 0}
                    change={stats.leadTrend?.change}
                    changeType={stats.leadTrend?.changeType}
                    color="bg-blue-500"
                    onClick={() => navigate('/all-leads')}
                />
                <DashboardWidget
                    title={stats.labels?.activeTasks || 'Active Tasks'}
                    icon={CheckCircleIcon}
                    value={stats.activeTasks || 0}
                    change={stats.taskTrend?.change}
                    changeType={stats.taskTrend?.changeType}
                    color="bg-green-500"
                    onClick={() => navigate('/all-tasks')}
                />
                <DashboardWidget
                    title={stats.labels?.totalCalls || 'Total Calls'}
                    icon={PhoneIcon}
                    value={stats.totalCalls || 0}
                    change={stats.callTrend?.change}
                    changeType={stats.callTrend?.changeType}
                    color="bg-purple-500"
                    onClick={() => navigate('/call-report')}
                />
                <DashboardWidget
                    title={stats.labels?.revenue || 'Revenue'}
                    icon={CurrencyDollarIcon}
                    value={`₹${(stats.revenue || 0).toLocaleString()}`}
                    change={stats.revenueTrend?.change}
                    changeType={stats.revenueTrend?.changeType}
                    color="bg-orange-500"
                    onClick={() => navigate('/reports')}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <ChartWidget title={stats.labels?.leadsByStatus || 'Leads by Status'} height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats.leadByStatus || []}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {(stats.leadByStatus || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartWidget>

                <ChartWidget title={stats.labels?.tasksByPriority || 'Tasks by Priority'} height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.taskByPriority || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="priority" />
                            <YAxis />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {(stats.taskByPriority || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartWidget>

                <ChartWidget title={stats.labels?.callActivity || 'Call Activity'} height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.callActivity || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="calls" stroke="#8884d8" name="Total Calls" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartWidget>

                <ChartWidget title={stats.labels?.revenueOverTime || 'Revenue Over Time'} height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.revenueOverTime || []}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#08A698" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#08A698" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="amount" stroke="#08A698" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartWidget>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-2">
                    <PerformanceTable data={performance} />
                </div>
                <ActivityFeed activities={activities} />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{stats.labels?.quickActions || 'Quick Actions'}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => navigate('/add-lead')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-[#08A698] text-white rounded-lg hover:bg-[#068f82] transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" />
                        {stats.labels?.addLead || 'Add Lead'}
                    </button>
                    <button
                        onClick={() => navigate('/all-tasks')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <CheckCircleIcon className="w-4 h-4" />
                        {stats.labels?.createTask || 'Create Task'}
                    </button>
                    <button
                        onClick={() => navigate('/pipeline')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <FunnelIcon className="w-4 h-4" />
                        {stats.labels?.viewPipeline || 'View Pipeline'}
                    </button>
                    <button
                        onClick={() => navigate('/reports')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ChartBarIcon className="w-4 h-4" />
                        {stats.labels?.reports || 'Reports'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ComprehensiveDashboard;
