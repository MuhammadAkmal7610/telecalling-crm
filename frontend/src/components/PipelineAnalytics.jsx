import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useWorkspace } from '../context/WorkspaceContext';
import {
    ChartBarIcon,
    FunnelIcon,
    UsersIcon,
  
    CalendarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const PipelineAnalytics = ({ isOpen, onClose }) => {
    const { apiFetch } = useApi();
    const { currentWorkspace } = useWorkspace();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30d');

    useEffect(() => {
        if (isOpen && currentWorkspace) {
            fetchAnalytics();
        }
    }, [isOpen, currentWorkspace, timeRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const [stagesRes, leadsRes, conversionRes] = await Promise.all([
                apiFetch('/lead-stages'),
                apiFetch(`/leads?limit=1000&timeRange=${timeRange}`),
                apiFetch(`/reports/pipeline-conversion?timeRange=${timeRange}`)
            ]);

            const stagesData = await stagesRes.json();
            const leadsData = await leadsRes.json();
            const conversionData = await conversionRes.json();

            const stages = Array.isArray(stagesData.data) ? stagesData.data : (Array.isArray(stagesData) ? stagesData : []);
            const leads = Array.isArray(leadsData.data?.data) ? leadsData.data.data : (Array.isArray(leadsData.data) ? leadsData.data : []);

            // Calculate funnel data
            const funnelData = stages.map(stage => {
                const stageLeads = leads.filter(l => l.stageId === stage.id);
                const conversionRate = stageLeads.length > 0 ? 
                    (stageLeads.filter(l => l.status === 'won').length / stageLeads.length * 100) : 0;
                
                return {
                    id: stage.id,
                    name: stage.name,
                    count: stageLeads.length,
                    value: stageLeads.reduce((sum, lead) => sum + (lead.value || 0), 0),
                    conversionRate: conversionRate.toFixed(1),
                    avgDays: stageLeads.length > 0 ? 
                        Math.round(stageLeads.reduce((sum, lead) => {
                            const days = Math.floor((new Date() - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24));
                            return sum + days;
                        }, 0) / stageLeads.length) : 0
                };
            });

            // Calculate overall metrics
            const totalLeads = leads.length;
            const wonLeads = leads.filter(l => l.status === 'won').length;
            const lostLeads = leads.filter(l => l.status === 'lost').length;
            const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);
            const wonValue = leads.filter(l => l.status === 'won').reduce((sum, lead) => sum + (lead.value || 0), 0);

            setAnalytics({
                funnel: funnelData,
                metrics: {
                    totalLeads,
                    wonLeads,
                    lostLeads,
                    winRate: totalLeads > 0 ? (wonLeads / totalLeads * 100).toFixed(1) : 0,
                    totalValue,
                    wonValue,
                    avgDealSize: wonLeads > 0 ? Math.round(wonValue / wonLeads) : 0
                },
                conversion: conversionData || {}
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <ChartBarIcon className="w-6 h-6 text-[#08A698]" />
                        <h2 className="text-xl font-bold text-gray-900">Pipeline Analytics</h2>
                    </div>
                    <div className="flex items-center gap-3">
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
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#08A698]"></div>
                        </div>
                    ) : analytics ? (
                        <div className="space-y-8">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <UsersIcon className="w-5 h-5 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-600">Total Leads</span>
                                    </div>
                                    <div className="text-2xl font-bold text-blue-900">{analytics.metrics.totalLeads}</div>
                                </div>
                                
                                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                                        <span className="text-sm font-medium text-green-600">Win Rate</span>
                                    </div>
                                    <div className="text-2xl font-bold text-green-900">{analytics.metrics.winRate}%</div>
                                </div>
                                
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FunnelIcon className="w-5 h-5 text-purple-600" />
                                        <span className="text-sm font-medium text-purple-600">Avg Deal Size</span>
                                    </div>
                                    <div className="text-2xl font-bold text-purple-900">₹{analytics.metrics.avgDealSize.toLocaleString()}</div>
                                </div>
                                
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CalendarIcon className="w-5 h-5 text-orange-600" />
                                        <span className="text-sm font-medium text-orange-600">Pipeline Value</span>
                                    </div>
                                    <div className="text-2xl font-bold text-orange-900">₹{analytics.metrics.totalValue.toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Funnel Visualization */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FunnelIcon className="w-5 h-5 text-[#08A698]" />
                                    Pipeline Funnel
                                </h3>
                                <div className="space-y-2">
                                    {analytics.funnel.map((stage, index) => {
                                        const maxCount = Math.max(...analytics.funnel.map(s => s.count));
                                        const width = maxCount > 0 ? (stage.count / maxCount * 100) : 0;
                                        
                                        return (
                                            <div key={stage.id} className="space-y-1">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="font-medium text-gray-700">{stage.name}</span>
                                                    <div className="flex items-center gap-4 text-gray-500">
                                                        <span>{stage.count} leads</span>
                                                        <span>{stage.conversionRate}%</span>
                                                        <span>₹{stage.value.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                                                    <div
                                                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#08A698] to-teal-500 rounded-lg transition-all duration-500"
                                                        style={{ width: `${width}%` }}
                                                    >
                                                        <div className="h-full flex items-center justify-end pr-3">
                                                            <span className="text-white text-xs font-bold">{stage.count}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Stage Details Table */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage Performance</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Days</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {analytics.funnel.map((stage) => (
                                                <tr key={stage.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stage.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stage.count}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{stage.value.toLocaleString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <span>{stage.conversionRate}%</span>
                                                            {parseFloat(stage.conversionRate) > 20 ? (
                                                                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                                                            ) : parseFloat(stage.conversionRate) < 10 ? (
                                                                <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                                                            ) : null}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stage.avgDays}d</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            <ChartBarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No analytics data available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PipelineAnalytics;
