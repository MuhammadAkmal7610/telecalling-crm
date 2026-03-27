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
    if (!dashboardData) return null;

    const { metrics, trends, alerts } = dashboardData;

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Leads"
            value={metrics.leads.total}
            change={12}
            trend="up"
            icon={Users}
            color="bg-blue-500"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${metrics.leads.conversion_rate}%`}
            change={8}
            trend="up"
            icon={Target}
            color="bg-green-500"
          />
          <MetricCard
            title="Total Calls"
            value={metrics.calls.total}
            change={-5}
            trend="down"
            icon={Phone}
            color="bg-purple-500"
          />
          <MetricCard
            title="WhatsApp Messages"
            value={metrics.whatsapp.total_messages}
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
              <AreaChart data={trends.leads}>
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
              <BarChart data={trends.calls}>
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
                  data={Object.entries(metrics.leads.by_source).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(metrics.leads.by_source).map((entry, index) => (
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
                    { name: 'Connected', value: metrics.calls.connected },
                    { name: 'Missed', value: metrics.calls.missed },
                    { name: 'Other', value: metrics.calls.total - metrics.calls.connected - metrics.calls.missed },
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

        {/* Alerts */}
        {alerts && alerts.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Notifications</h3>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className={`flex items-center p-3 rounded-lg border ${
                  alert.type === 'error' ? 'bg-red-50 border-red-200' :
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className={`p-2 rounded-lg mr-3 ${
                    alert.type === 'error' ? 'bg-red-100' :
                    alert.type === 'warning' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    {alert.type === 'error' ? <AlertTriangle className="w-4 h-4 text-red-600" /> :
                     alert.type === 'warning' ? <Clock className="w-4 h-4 text-yellow-600" /> :
                     <CheckCircle className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{alert.title}</p>
                    <p className="text-sm text-gray-600">{alert.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderLeadsAnalytics = () => {
    if (!dashboardData) return null;

    const { metrics, trends } = dashboardData;

    return (
      <div className="space-y-6">
        {/* Lead Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="New Leads"
            value={metrics.leads.new}
            change={12}
            trend="up"
            icon={Users}
            color="bg-blue-500"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${metrics.leads.conversion_rate}%`}
            change={8}
            trend="up"
            icon={Target}
            color="bg-green-500"
          />
          <MetricCard
            title="Total Value"
            value={`$${metrics.revenue.total_value.toLocaleString()}`}
            change={15}
            trend="up"
            icon={DollarSign}
            color="bg-purple-500"
          />
        </div>

        {/* Lead Status Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={Object.entries(metrics.leads.by_status).map(([status, count]) => ({ status, count }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
          <div className="space-y-3">
            {['fresh', 'contacted', 'interested', 'qualified', 'proposal', 'won'].map((stage, index) => {
              const count = metrics.leads.by_status[stage] || 0;
              const percentage = (count / metrics.leads.total) * 100;
              return (
                <div key={stage} className="flex items-center">
                  <div className="w-32 text-sm font-medium text-gray-700 capitalize">{stage}</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-6">
                      <div
                        className="bg-blue-500 h-6 rounded-full flex items-center justify-center text-xs text-white font-medium"
                        style={{ width: `${percentage}%` }}
                      >
                        {count}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">{percentage.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderCallsAnalytics = () => {
    if (!dashboardData) return null;

    const { metrics } = dashboardData;

    return (
      <div className="space-y-6">
        {/* Call Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Total Calls"
            value={metrics.calls.total}
            change={-5}
            trend="down"
            icon={Phone}
            color="bg-purple-500"
          />
          <MetricCard
            title="Connected"
            value={metrics.calls.connected}
            change={8}
            trend="up"
            icon={CheckCircle}
            color="bg-green-500"
          />
          <MetricCard
            title="Missed"
            value={metrics.calls.missed}
            change={-12}
            trend="down"
            icon={X}
            color="bg-red-500"
          />
          <MetricCard
            title="Avg Duration"
            value={`${Math.round(metrics.calls.avg_duration / 60)}m`}
            change={3}
            trend="up"
            icon={Clock}
            color="bg-orange-500"
          />
        </div>

        {/* Call Volume by Hour */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Volume by Hour</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(metrics.calls.by_hour).map(([hour, count]) => ({ hour: `${hour}:00`, count }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderWhatsAppAnalytics = () => {
    if (!dashboardData) return null;

    const { metrics } = dashboardData;

    return (
      <div className="space-y-6">
        {/* WhatsApp Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Total Messages"
            value={metrics.whatsapp.total_messages}
            change={15}
            trend="up"
            icon={MessageSquare}
            color="bg-green-500"
          />
          <MetricCard
            title="Sent"
            value={metrics.whatsapp.sent}
            change={12}
            trend="up"
            icon={Zap}
            color="bg-blue-500"
          />
          <MetricCard
            title="Delivery Rate"
            value={`${metrics.whatsapp.delivery_rate}%`}
            change={5}
            trend="up"
            icon={CheckCircle}
            color="bg-purple-500"
          />
          <MetricCard
            title="Read Rate"
            value={`${metrics.whatsapp.read_rate}%`}
            change={8}
            trend="up"
            icon={Eye}
            color="bg-orange-500"
          />
        </div>

        {/* Message Types */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(metrics.whatsapp.by_type).map(([name, value]) => ({ name, value }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.entries(metrics.whatsapp.by_type).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderTeamPerformance = () => {
    if (!dashboardData) return null;

    const { topPerformers } = dashboardData;

    return (
      <div className="space-y-6">
        {/* Top Performers */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Agents</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leads</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calls</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conversion</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topPerformers?.agents?.map((agent, index) => (
                  <tr key={agent.name}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-semibold text-gray-900">{agent.score}</span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${agent.score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.leads}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.calls}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {Math.round((agent.leads / agent.calls) * 100)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderRealTime = () => {
    if (!realTimeData) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Real-time Metrics</h3>
          <div className="flex items-center text-sm text-gray-500">
            <Activity className="w-4 h-4 mr-1 text-green-500" />
            Live updates every 30 seconds
          </div>
        </div>

        {/* Real-time Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Leads</p>
                <p className="text-2xl font-semibold text-gray-900">{realTimeData.leads.today}</p>
                <p className="text-xs text-gray-500">This hour: {realTimeData.leads.thisHour}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Calls</p>
                <p className="text-2xl font-semibold text-gray-900">{realTimeData.calls.active}</p>
                <p className="text-xs text-gray-500">Today: {realTimeData.calls.today}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500">
                <Phone className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-2xl font-semibold text-gray-900">{realTimeData.messages.unread}</p>
                <p className="text-xs text-gray-500">Today: {realTimeData.messages.today}</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Online Users</p>
                <p className="text-2xl font-semibold text-gray-900">{realTimeData.users.online}</p>
                <p className="text-xs text-gray-500">Total: {realTimeData.users.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Tasks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Overdue Tasks</p>
                  <p className="text-sm text-gray-600">Requires immediate attention</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-600">{realTimeData.tasks.overdue}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Pending Tasks</p>
                  <p className="text-sm text-gray-600">Awaiting completion</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">{realTimeData.tasks.pending}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'leads':
        return renderLeadsAnalytics();
      case 'calls':
        return renderCallsAnalytics();
      case 'whatsapp':
        return renderWhatsAppAnalytics();
      case 'performance':
        return renderTeamPerformance();
      case 'real-time':
        return renderRealTime();
      default:
        return renderOverview();
    }
  };

  return (
    <WorkspaceGuard>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-blue-500" />
              Advanced Analytics
            </h1>
          </div>

          <nav className="px-4 pb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-gray-500">
                  Comprehensive analytics and insights for your CRM
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={fetchDashboardData}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </header>

          {/* Tab Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              renderTabContent()
            )}
          </main>
        </div>
      </div>
    </WorkspaceGuard>
  );
}
