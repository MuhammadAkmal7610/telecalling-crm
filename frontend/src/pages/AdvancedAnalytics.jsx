import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Phone,
  MessageSquare,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Eye,
  BarChart3,
  X,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useWorkspace } from '../context/WorkspaceContext';
import WorkspaceGuard from '../components/WorkspaceGuard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdvancedAnalytics() {
  const { apiFetch } = useApi();
  const { currentWorkspace } = useWorkspace();
  
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [realTimeData, setRealTimeData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const timeRanges = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last Quarter' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'leads', label: 'Lead Analytics', icon: Users },
    { id: 'calls', label: 'Call Analytics', icon: Phone },
    { id: 'whatsapp', label: 'WhatsApp Analytics', icon: MessageSquare },
    { id: 'performance', label: 'Team Performance', icon: Target },
    { id: 'real-time', label: 'Real-time', icon: Activity },
  ];

  useEffect(() => {
    fetchDashboardData();
    fetchRealTimeData();
    
    const interval = setInterval(fetchRealTimeData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange, currentWorkspace]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/analytics/dashboard?timeRange=${timeRange}`);
      const data = await res.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealTimeData = async () => {
    try {
      const res = await apiFetch('/analytics/real-time');
      const data = await res.json();
      setRealTimeData(data);
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    }
  };

  const MetricCard = ({ title, value, change, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-1 text-sm ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {change}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const renderOverview = () => {
    if (!dashboardData || !dashboardData.metrics) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <BarChart3 className="w-12 h-12 mb-4 opacity-20" />
          <p>No analytics data available for this period.</p>
        </div>
      );
    }

    const { metrics, trends, alerts } = dashboardData;
    
    // Safety fallback for metrics
    const leadMetrics = metrics?.leads || { total: 0, conversion_rate: 0, by_source: {}, by_status: {} };
    const callMetrics = metrics?.calls || { total: 0, connected: 0, missed: 0, by_hour: {} };
    const whatsappMetrics = metrics?.whatsapp || { total_messages: 0, sent: 0, delivery_rate: 0, read_rate: 0, by_type: {} };

    return (
      <div className="space-y-6 animate-in fade-in">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Leads"
            value={leadMetrics.total}
            change={12}
            trend="up"
            icon={Users}
            color="bg-blue-500"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${leadMetrics.conversion_rate}%`}
            change={8}
            trend="up"
            icon={Target}
            color="bg-green-500"
          />
          <MetricCard
            title="Total Calls"
            value={callMetrics.total}
            change={-5}
            trend="down"
            icon={Phone}
            color="bg-purple-500"
          />
          <MetricCard
            title="WhatsApp Messages"
            value={whatsappMetrics.total_messages}
            change={15}
            trend="up"
            icon={MessageSquare}
            color="bg-orange-500"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leads Trend */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trends?.leads || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#93bbfc" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Call Volume */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Volume</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trends?.calls || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Funnel & Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lead Sources */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Sources</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(leadMetrics.by_source || {}).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(leadMetrics.by_source || {}).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Call Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Connected', value: callMetrics.connected || 0 },
                    { name: 'Missed', value: callMetrics.missed || 0 },
                    { name: 'Other', value: (callMetrics.total || 0) - (callMetrics.connected || 0) - (callMetrics.missed || 0) },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderLeadsAnalytics = () => {
    if (!dashboardData || !dashboardData.metrics) return null;

    const { metrics } = dashboardData;
    const leadMetrics = metrics?.leads || {};

    return (
      <div className="space-y-6 animate-in fade-in">
        {/* Lead Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="New Leads"
            value={leadMetrics.new || 0}
            change={12}
            trend="up"
            icon={Users}
            color="bg-blue-500"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${leadMetrics.conversion_rate || 0}%`}
            change={8}
            trend="up"
            icon={Target}
            color="bg-green-500"
          />
          <MetricCard
            title="Total Value"
            value={`$${(dashboardData.metrics?.revenue?.total_value || 0).toLocaleString()}`}
            change={15}
            trend="up"
            icon={DollarSign}
            color="bg-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lead Status Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(leadMetrics.by_status || {}).map(([status, count]) => ({ status, count }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Lead Sources Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Sources</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(leadMetrics.by_source || {}).map(([name, value]) => ({ name, value }))}
                  cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100} fill="#8884d8" dataKey="value"
                >
                  {Object.entries(leadMetrics.by_source || {}).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderCallsAnalytics = () => {
    if (!dashboardData || !dashboardData.metrics) return null;
    const callMetrics = dashboardData.metrics.calls || {};
    const trends = dashboardData.trends?.calls || [];

    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard title="Total Calls" value={callMetrics.total || 0} change={5} trend="up" icon={Phone} color="bg-blue-500" />
          <MetricCard title="Connected Calls" value={callMetrics.connected || 0} change={2} trend="up" icon={Phone} color="bg-green-500" />
          <MetricCard title="Connection Rate" value={`${callMetrics.connection_rate || 0}%`} change={-1} trend="down" icon={Activity} color="bg-purple-500" />
          <MetricCard title="Avg Duration" value={`${callMetrics.avg_duration || 0}s`} change={0} trend="up" icon={Clock} color="bg-orange-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Volume Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Calls by Hour</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={Object.entries(callMetrics.by_hour || {}).map(([hour, count]) => ({ hour: `${hour}:00`, count }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderWhatsAppAnalytics = () => {
    if (!dashboardData || !dashboardData.metrics) return null;
    const waMetrics = dashboardData.metrics.whatsapp || {};

    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard title="Total Messages" value={waMetrics.total_messages || 0} change={15} trend="up" icon={MessageSquare} color="bg-emerald-500" />
          <MetricCard title="Sent Messages" value={waMetrics.sent || 0} change={10} trend="up" icon={TrendingUp} color="bg-blue-500" />
          <MetricCard title="Delivery Rate" value={`${waMetrics.delivery_rate || 0}%`} change={2} trend="up" icon={CheckCircle} color="bg-teal-500" />
          <MetricCard title="Read Rate" value={`${waMetrics.read_rate || 0}%`} change={-5} trend="down" icon={Eye} color="bg-indigo-500" />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Types Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(waMetrics.by_type || {}).map(([name, value]) => ({ name, value }))}
                cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100} fill="#8884d8" dataKey="value"
              >
                {Object.entries(waMetrics.by_type || {}).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderTeamPerformance = () => {
    if (!dashboardData || !dashboardData.topPerformers) return null;
    const agents = dashboardData.topPerformers.agents || [];

    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Agents</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Leads</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Calls</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agents.map((agent, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{agent.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(agent.score, 100)}%` }}></div>
                        </div>
                        <span>{agent.score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.leads}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.calls}</td>
                  </tr>
                ))}
                {agents.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No agent performance data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderRealTime = () => {
    if (!realTimeData) return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Activity className="w-12 h-12 mb-4 opacity-20 animate-pulse" />
          <p>Connecting to real-time data stream...</p>
        </div>
    );

    const { leads, calls, messages, tasks, users } = realTimeData;

    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span> Live Status
            </h3>
            <span className="text-xs text-gray-500">Last updated: {new Date(realTimeData.timestamp).toLocaleTimeString()}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white relative overflow-hidden">
            <Users className="w-16 h-16 absolute -right-4 -bottom-4 opacity-20" />
            <p className="text-blue-100 font-medium">Leads Today</p>
            <p className="text-4xl font-bold mt-2">{leads?.today || 0}</p>
            <p className="text-sm text-blue-100 mt-2">+{leads?.thisHour || 0} this hour</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white relative overflow-hidden">
            <Phone className="w-16 h-16 absolute -right-4 -bottom-4 opacity-20" />
            <p className="text-purple-100 font-medium">Active Calls</p>
            <p className="text-4xl font-bold mt-2">{calls?.active || 0}</p>
            <p className="text-sm text-purple-100 mt-2">{calls?.today || 0} total today</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-lg p-6 text-white relative overflow-hidden">
            <MessageSquare className="w-16 h-16 absolute -right-4 -bottom-4 opacity-20" />
            <p className="text-amber-100 font-medium">Unread Messages</p>
            <p className="text-4xl font-bold mt-2">{messages?.unread || 0}</p>
            <p className="text-sm text-amber-100 mt-2">{messages?.today || 0} total today</p>
          </div>

          <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg shadow-lg p-6 text-white relative overflow-hidden">
            <AlertTriangle className="w-16 h-16 absolute -right-4 -bottom-4 opacity-20" />
            <p className="text-rose-100 font-medium">Pending Tasks</p>
            <p className="text-4xl font-bold mt-2">{tasks?.pending || 0}</p>
            <p className="text-sm text-rose-100 mt-2">{tasks?.overdue || 0} overdue</p>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-lg p-6 text-white relative overflow-hidden">
            <Zap className="w-16 h-16 absolute -right-4 -bottom-4 opacity-20" />
            <p className="text-teal-100 font-medium">Online Users</p>
            <p className="text-4xl font-bold mt-2">{users?.online || 0} <span className="text-lg font-normal">/ {users?.total || 0}</span></p>
            <p className="text-sm text-teal-100 mt-2">Team capacity</p>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'leads': return renderLeadsAnalytics();
      case 'calls': return renderCallsAnalytics();
      case 'whatsapp': return renderWhatsAppAnalytics();
      case 'performance': return renderTeamPerformance();
      case 'real-time': return renderRealTime();
      default: return renderOverview();
    }
  };

  return (
    <WorkspaceGuard>
      <div className="relative">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 md:px-8">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                      ${isActive
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <main className="p-6 md:p-8">
          <div className="mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
                <p className="text-gray-500">Insights and performance tracking for your workspace</p>
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {timeRanges.map((range) => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
                
                <button
                  onClick={fetchDashboardData}
                  className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {loading && !dashboardData ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
        </main>
      </div>
    </WorkspaceGuard>
  );
}
