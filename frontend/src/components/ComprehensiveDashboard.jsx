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
    DocumentTextIcon,
    SparklesIcon,
    FireIcon,
    RocketLaunchIcon,
    EyeIcon
} from '@heroicons/react/24/outline';
import {
    SparklesIcon as SparklesIconSolid,
    FireIcon as FireIconSolid,
    RocketLaunchIcon as RocketLaunchIconSolid
} from '@heroicons/react/24/solid';
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

const DashboardWidget = ({ title, icon: Icon, value, change, changeType, color, gradient, children, onClick, size = 'normal' }) => {
    const sizeClasses = {
        small: 'p-4',
        normal: 'p-6',
        large: 'p-8'
    };

    return (
        <div 
            className={`bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-500 cursor-pointer group relative overflow-hidden ${sizeClasses[size]}`}
            onClick={onClick}
        >
            {/* Ambient Glow */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${gradient ? gradient.split(' ')[2] : color}`}></div>
            
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>

            <div className="flex items-start justify-between mb-5 relative z-10">
                <div className={`p-3.5 rounded-2xl ${gradient || color} shadow-lg shadow-black/5 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500`}>
                    <Icon className="w-6 h-6 text-white drop-shadow-md" />
                </div>
                {change && (
                    <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl border backdrop-blur-sm shadow-sm ${
                        changeType === 'increase' 
                            ? 'bg-green-50/80 text-green-700 border-green-200/60' 
                            : 'bg-red-50/80 text-red-700 border-red-200/60'
                    }`}>
                        {changeType === 'increase' ? (
                            <ArrowTrendingUpIcon className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                            <ArrowPathIcon className="w-3.5 h-3.5 rotate-180 stroke-[3]" />
                        )}
                        {change}
                    </div>
                )}
            </div>
            <div className="space-y-1.5 relative z-10">
                <h3 className="text-4xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm">{value}</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{title}</p>
            </div>
            {children}
        </div>
    );
};

const ChartWidget = ({ title, data = [], type = 'bar', height = 200, children, icon: ChartIcon }) => {
    const maxValue = data.length ? Math.max(...data.map(d => d.value)) : 0;
    
    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 relative overflow-hidden group/chart">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    {ChartIcon && (
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-100/50 shadow-sm group-hover/chart:scale-105 group-hover/chart:-rotate-3 transition-transform">
                            <ChartIcon className="w-5 h-5 text-teal-600" />
                        </div>
                    )}
                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">{title}</h3>
                </div>
                <button className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50/80 rounded-xl transition-all duration-300 border border-transparent hover:border-teal-100/50">
                    <Cog6ToothIcon className="w-5 h-5" />
                </button>
            </div>
            <div style={{ height: `${height}px` }} className="relative">
                {children ? children : (
                    type === 'bar' ? (
                        <div className="flex items-end justify-between h-full gap-3">
                            {data.map((item, index) => (
                                <div key={index} className="flex-1 flex flex-col items-center justify-end group">
                                    <div className="w-full relative">
                                        <div 
                                            className="w-full rounded-t-lg bg-gradient-to-t from-[#08A698] to-teal-400 shadow-sm group-hover:from-[#078F82] group-hover:to-teal-500 transition-all duration-300"
                                            style={{ height: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : '0%', minHeight: '4px' }}
                                        />
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                                            {item.value.toLocaleString()}
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-2 text-center font-medium truncate w-full">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-[#08A698] mb-2">{data[0]?.value?.toLocaleString() || 0}</div>
                                <div className="text-sm text-gray-600 font-medium">{data[0]?.label || 'Total'}</div>
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
            case 'call': return 'bg-gradient-to-br from-blue-500 to-blue-600';
            case 'task': return 'bg-gradient-to-br from-green-500 to-green-600';
            case 'lead': return 'bg-gradient-to-br from-purple-500 to-purple-600';
            default: return 'bg-gradient-to-br from-gray-400 to-gray-500';
        }
    };

    const getActivityBg = (type) => {
        switch (type) {
            case 'call': return 'hover:bg-blue-50';
            case 'task': return 'hover:bg-green-50';
            case 'lead': return 'hover:bg-purple-50';
            default: return 'hover:bg-gray-50';
        }
    };

    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-100/50 shadow-sm">
                        <ClockIcon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Recent Activity</h3>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">Last 24 hours</p>
                    </div>
                </div>
                <button className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1 group/btn">
                    View all <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                </button>
            </div>
            <div className="space-y-4 relative z-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {activities.slice(0, 5).map((activity, index) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                        <div 
                            key={index} 
                            className={`flex items-start gap-4 p-4 rounded-xl border border-transparent transition-all duration-300 ${getActivityBg(activity.type)} hover:border-gray-200/50 hover:shadow-sm group cursor-pointer relative overflow-hidden`}
                        >
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-50 transition-opacity"></div>
                            <div className={`p-3 rounded-xl ${getActivityColor(activity.type)} shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 relative z-10`}>
                                <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0 relative z-10">
                                <p className="text-sm font-bold text-gray-900 line-clamp-1">{activity.title}</p>
                                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5 font-medium">{activity.details}</p>
                                <p className="text-[10px] text-gray-400 mt-1.5 font-bold uppercase tracking-wider">{activity.time}</p>
                            </div>
                        </div>
                    );
                })}
                {activities.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-10 opacity-70">
                        <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 border border-white shadow-inner flex items-center justify-center">
                            <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 font-bold">No recent activity</p>
                        <p className="text-xs text-gray-400 mt-1 font-medium">Activity will appear here as it happens</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const PerformanceTable = ({ data }) => {
    const getConversionBadge = (conversion) => {
        if (conversion >= 20) return 'bg-green-50 text-green-700 border border-green-200';
        if (conversion >= 10) return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
        return 'bg-red-50 text-red-700 border border-red-200';
    };

    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 relative overflow-hidden h-full">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-100/50 shadow-sm">
                        <ChartBarIcon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Team Performance</h3>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">{data.length} team members</p>
                    </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50/80 rounded-xl transition-all duration-300 border border-transparent hover:border-teal-100/50">
                    <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="overflow-x-auto relative z-10">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200/60 bg-gray-50/50 backdrop-blur-sm">
                            <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-widest py-4 px-4 rounded-tl-xl">Agent</th>
                            <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-widest py-4 px-4">Calls</th>
                            <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-widest py-4 px-4">Tasks</th>
                            <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-widest py-4 px-4">Leads</th>
                            <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-widest py-4 px-4 rounded-tr-xl">Conversion</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/60">
                        {data.map((agent, index) => (
                            <tr key={index} className="hover:bg-teal-50/40 transition-colors duration-300 group">
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white flex items-center justify-center text-sm font-bold shadow-sm shadow-teal-500/20 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                                            {agent.name?.charAt(0) || 'A'}
                                        </div>
                                        <div>
                                            <span className="text-sm font-bold text-gray-900 group-hover:text-teal-700 transition-colors">{agent.name}</span>
                                            {index < 3 && (
                                                <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                    index === 0 ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200/60 shadow-sm' : 
                                                    index === 1 ? 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 border border-gray-200/60 shadow-sm' : 
                                                    'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200/60 shadow-sm'
                                                }`}>
                                                    #{index + 1}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="text-right text-sm font-semibold text-gray-900 py-4 px-4">{agent.calls?.toLocaleString() || 0}</td>
                                <td className="text-right text-sm font-semibold text-gray-900 py-4 px-4">{agent.tasks?.toLocaleString() || 0}</td>
                                <td className="text-right text-sm font-semibold text-gray-900 py-4 px-4">{agent.leads?.toLocaleString() || 0}</td>
                                <td className="text-right py-4 px-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getConversionBadge(agent.conversion)}`}>
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
                    gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                    onClick={() => navigate('/all-leads')}
                />
                <DashboardWidget
                    title={stats.labels?.activeTasks || 'Active Tasks'}
                    icon={CheckCircleIcon}
                    value={stats.activeTasks || 0}
                    change={stats.taskTrend?.change}
                    changeType={stats.taskTrend?.changeType}
                    gradient="bg-gradient-to-br from-green-500 to-green-600"
                    onClick={() => navigate('/all-tasks')}
                />
                <DashboardWidget
                    title={stats.labels?.totalCalls || 'Total Calls'}
                    icon={PhoneIcon}
                    value={stats.totalCalls || 0}
                    change={stats.callTrend?.change}
                    changeType={stats.callTrend?.changeType}
                    gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                    onClick={() => navigate('/call-report')}
                />
                <DashboardWidget
                    title={stats.labels?.revenue || 'Revenue'}
                    icon={CurrencyDollarIcon}
                    value={`₹${(stats.revenue || 0).toLocaleString()}`}
                    change={stats.revenueTrend?.change}
                    changeType={stats.revenueTrend?.changeType}
                    gradient="bg-gradient-to-br from-orange-500 to-orange-600"
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
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 mt-8 relative overflow-hidden group/actions hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
                
                <div className="flex items-center gap-4 mb-8 relative z-10">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/20 group-hover/actions:scale-110 group-hover/actions:-rotate-3 transition-transform duration-500">
                        <RocketLaunchIcon className="w-6 h-6 text-white drop-shadow-sm" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">{stats.labels?.quickActions || 'Quick Actions'}</h3>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Fast-track your workflows</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                    <button
                        onClick={() => navigate('/add-lead')}
                        className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-1 transition-all duration-300 active:scale-[0.98] group relative overflow-hidden"
                    >
                        <div className="absolute inset-x-0 h-px w-1/2 mx-auto -top-px shadow-2xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <PlusIcon className="w-5 h-5 drop-shadow-sm group-hover:scale-110 transition-transform" />
                        <span className="drop-shadow-sm">{stats.labels?.addLead || 'Add Lead'}</span>
                    </button>
                    <button
                        onClick={() => navigate('/all-tasks')}
                        className="flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold hover:border-transparent hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 active:scale-[0.98] group"
                    >
                        <CheckCircleIcon className="w-5 h-5 group-hover:scale-110 transition-transform group-hover:drop-shadow-sm" />
                        <span className="group-hover:drop-shadow-sm">{stats.labels?.createTask || 'Create Task'}</span>
                    </button>
                    <button
                        onClick={() => navigate('/pipeline')}
                        className="flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold hover:border-transparent hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-purple-600 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-300 active:scale-[0.98] group"
                    >
                        <FunnelIcon className="w-5 h-5 group-hover:scale-110 transition-transform group-hover:drop-shadow-sm" />
                        <span className="group-hover:drop-shadow-sm">{stats.labels?.viewPipeline || 'View Pipeline'}</span>
                    </button>
                    <button
                        onClick={() => navigate('/reports')}
                        className="flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold hover:border-transparent hover:text-white hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-500 hover:shadow-xl hover:shadow-orange-500/20 hover:-translate-y-1 transition-all duration-300 active:scale-[0.98] group"
                    >
                        <ChartBarIcon className="w-5 h-5 group-hover:scale-110 transition-transform group-hover:drop-shadow-sm" />
                        <span className="group-hover:drop-shadow-sm">{stats.labels?.reports || 'Reports'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ComprehensiveDashboard;
