import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useWorkspace } from '../context/WorkspaceContext';
import {
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    UsersIcon,
    PhoneIcon,
    CurrencyDollarIcon,
    CalendarIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

const AdvancedReporting = () => {
    const { apiFetch } = useApi();
    const { currentWorkspace } = useWorkspace();
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30d');
    const [reportType, setReportType] = useState('overview');
    const [reportData, setReportData] = useState({
        overview: {},
        leads: {},
        calls: {},
        agents: {},
        conversion: {}
    });

    useEffect(() => {
        fetchReportData();
    }, [currentWorkspace, timeRange, reportType]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const response = await apiFetch(`/reports/advanced?type=${reportType}&timeRange=${timeRange}`);
            const data = await response.json();
            setReportData(prev => ({ ...prev, [reportType]: data.data || data }));
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const formatPercentage = (value) => {
        return `${(value || 0).toFixed(1)}%`;
    };

    const MetricCard = ({ title, value, change, icon: Icon, color, format = 'number' }) => {
        const formattedValue = format === 'currency' ? formatCurrency(value) :
                              format === 'percentage' ? formatPercentage(value) :
                              format === 'duration' ? formatDuration(value) :
                              value.toLocaleString();

        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${color}`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    {change !== undefined && (
                        <div className={`flex items-center gap-1 text-sm font-medium ${
                            change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                            {change > 0 ? (
                                <ArrowPathIcon className="w-4 h-4" />
                            ) : change < 0 ? (
                                <ArrowPathIczzon className="w-4 h-4" />
                            ) : null}
                            {Math.abs(change)}%
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">{formattedValue}</h3>
                    <p className="text-sm text-gray-600 mt-1">{title}</p>
                </div>
            </div>
        );
    };

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    };

    const OverviewReport = () => (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Revenue"
                    value={reportData.overview.totalRevenue || 0}
                    change={reportData.overview.revenueChange}
                    icon={CurrencyDollarIcon}
                    color="bg-green-500"
                    format="currency"
                />
                <MetricCard
                    title="Total Leads"
                    value={reportData.overview.totalLeads || 0}
                    change={reportData.overview.leadsChange}
                    icon={UsersIcon}
                    color="bg-blue-500"
                />
                <MetricCard
                    title="Conversion Rate"
                    value={reportData.overview.conversionRate || 0}
                    change={reportData.overview.conversionChange}
                    icon={ArrowTrendingUpIcon}
                    color="bg-purple-500"
                    format="percentage"
                />
                <MetricCard
                    title="Avg Deal Size"
                    value={reportData.overview.avgDealSize || 0}
                    change={reportData.overview.dealSizeChange}
                    icon={CurrencyDollarIcon}
                    color="bg-orange-500"
                    format="currency"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {(reportData.overview.revenueTrend || [45000, 52000, 48000, 61000, 58000, 67000, 72000]).map((value, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div 
                                    className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg relative group"
                                    style={{ height: `${(value / 80000) * 100}%` }}
                                >
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {formatCurrency(value)}
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 mt-2">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Sources</h3>
                    <div className="space-y-3">
                        {(reportData.overview.leadSources || [
                            { source: 'Facebook', count: 245, percentage: 45 },
                            { source: 'Google Ads', count: 180, percentage: 33 },
                            { source: 'Website', count: 89, percentage: 16 },
                            { source: 'Referral', count: 32, percentage: 6 }
                        ]).map((item, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-700">{item.source}</span>
                                    <span className="font-medium text-gray-900">{item.count} ({item.percentage}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-[#08A698] h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${item.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const LeadsReport = () => (
        <div className="space-y-6">
            {/* Lead Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="New Leads"
                    value={reportData.leads.newLeads || 0}
                    change={reportData.leads.newLeadsChange}
                    icon={UsersIcon}
                    color="bg-blue-500"
                />
                <MetricCard
                    title="Qualified Leads"
                    value={reportData.leads.qualifiedLeads || 0}
                    change={reportData.leads.qualifiedChange}
                    icon={FunnelIcon}
                    color="bg-green-500"
                />
                <MetricCard
                    title="Conversion Rate"
                    value={reportData.leads.qualificationRate || 0}
                    change={reportData.leads.qualificationChange}
                    icon={ArrowTrendingUpIcon}
                    color="bg-purple-500"
                    format="percentage"
                />
            </div>

            {/* Lead Status Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Status Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(reportData.leads.statusBreakdown || [
                        { status: 'Fresh', count: 156, color: 'bg-gray-500' },
                        { status: 'Contacted', count: 234, color: 'bg-blue-500' },
                        { status: 'Qualified', count: 89, color: 'bg-green-500' },
                        { status: 'Converted', count: 45, color: 'bg-purple-500' }
                    ]).map((item, index) => (
                        <div key={index} className="text-center">
                            <div className={`w-16 h-16 rounded-full ${item.color} flex items-center justify-center text-white font-bold text-lg mx-auto mb-2`}>
                                {item.count}
                            </div>
                            <p className="text-sm font-medium text-gray-900">{item.status}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lead Conversion Funnel */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
                <div className="space-y-3">
                    {(reportData.leads.funnel || [
                        { stage: 'Leads Generated', count: 524, conversion: 100 },
                        { stage: 'Contacted', count: 412, conversion: 78.6 },
                        { stage: 'Qualified', count: 189, conversion: 36.1 },
                        { stage: 'Proposal', count: 98, conversion: 18.7 },
                        { stage: 'Closed Won', count: 45, conversion: 8.6 }
                    ]).map((stage, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-700">{stage.stage}</span>
                                <div className="flex items-center gap-3">
                                    <span className="font-medium text-gray-900">{stage.count}</span>
                                    <span className="text-gray-500">({stage.conversion}%)</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                    className="bg-gradient-to-r from-[#08A698] to-teal-400 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${stage.conversion}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const CallsReport = () => (
        <div className="space-y-6">
            {/* Call Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Calls"
                    value={reportData.calls.totalCalls || 0}
                    change={reportData.calls.callsChange}
                    icon={PhoneIcon}
                    color="bg-blue-500"
                />
                <MetricCard
                    title="Connected Calls"
                    value={reportData.calls.connectedCalls || 0}
                    change={reportData.calls.connectedChange}
                    icon={UsersIcon}
                    color="bg-green-500"
                />
                <MetricCard
                    title="Talk Time"
                    value={reportData.calls.totalTalkTime || 0}
                    change={reportData.calls.talkTimeChange}
                    icon={ClockIcon}
                    color="bg-purple-500"
                    format="duration"
                />
                <MetricCard
                    title="Avg Call Duration"
                    value={reportData.calls.avgDuration || 0}
                    change={reportData.calls.durationChange}
                    icon={ClockIcon}
                    color="bg-orange-500"
                    format="duration"
                />
            </div>

            {/* Call Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Volume Trend</h3>
                    <div className="h-48 flex items-end justify-between gap-2">
                        {(reportData.calls.callVolume || [45, 62, 38, 71, 55, 48, 67]).map((value, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div 
                                    className="w-full bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t-lg relative group"
                                    style={{ height: `${(value / 80) * 100}%` }}
                                >
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {value}
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 mt-2">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Outcomes</h3>
                    <div className="space-y-3">
                        {(reportData.calls.outcomes || [
                            { outcome: 'Connected', count: 234, percentage: 65, color: 'bg-green-500' },
                            { outcome: 'Not Answered', count: 89, percentage: 25, color: 'bg-red-500' },
                            { outcome: 'Voicemail', count: 28, percentage: 8, color: 'bg-yellow-500' },
                            { outcome: 'Wrong Number', count: 8, percentage: 2, color: 'bg-gray-500' }
                        ]).map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                    <span className="text-sm text-gray-700">{item.outcome}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                                    <span className="text-xs text-gray-500">({item.percentage}%)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">Advanced Reports</h1>
                    <button onClick={fetchReportData} className="text-[#08A698] hover:text-[#068f82]">
                        <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#08A698]"
                    >
                        <option value="overview">Overview</option>
                        <option value="leads">Leads</option>
                        <option value="calls">Calls</option>
                        <option value="agents">Agents</option>
                        <option value="conversion">Conversion</option>
                    </select>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#08A698]"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="1y">Last year</option>
                    </select>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Report Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <ArrowPathIcon className="w-8 h-8 text-[#08A698] animate-spin" />
                </div>
            ) : (
                <>
                    {reportType === 'overview' && <OverviewReport />}
                    {reportType === 'leads' && <LeadsReport />}
                    {reportType === 'calls' && <CallsReport />}
                    {reportType === 'agents' && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                            <UsersIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Agent Reports</h3>
                            <p className="text-gray-500">Coming soon...</p>
                        </div>
                    )}
                    {reportType === 'conversion' && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                            <ArrowTrendingUpIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Conversion Reports</h3>
                            <p className="text-gray-500">Coming soon...</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdvancedReporting;
