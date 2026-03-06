import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useWorkspace } from '../context/WorkspaceContext';
import { useSocket } from '../contexts/SocketContext';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    PhoneIcon,
    ClockIcon,
    CalendarIcon,
    UserIcon,
    ChevronDownIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowPathIcon,
    PlayIcon,
    PauseIcon,
    SpeakerWaveIcon,
    DocumentTextIcon,
 
} from '@heroicons/react/24/outline';

const CallReportDashboard = () => {
    const { apiFetch } = useApi();
    const { currentWorkspace } = useWorkspace();
    const { isConnected } = useSocket();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Day');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAgent, setSelectedAgent] = useState('all');
    const [callData, setCallData] = useState({
        summary: {},
        calls: [],
        recordings: [],
        analytics: {}
    });
    const [timeRange, setTimeRange] = useState('today');

    useEffect(() => {
        fetchCallData();
    }, [currentWorkspace, timeRange, selectedAgent]);

    const fetchCallData = async () => {
        setLoading(true);
        try {
            const [summaryRes, callsRes, analyticsRes] = await Promise.all([
                apiFetch(`/reports/calls/summary?timeRange=${timeRange}&agent=${selectedAgent}`),
                apiFetch(`/calls?limit=50&timeRange=${timeRange}&agent=${selectedAgent}`),
                apiFetch(`/reports/calls/analytics?timeRange=${timeRange}`)
            ]);

            const summary = await summaryRes.json();
            const calls = await callsRes.json();
            const analytics = await analyticsRes.json();

            setCallData({
                summary: summary.data || summary || {},
                calls: calls.data?.data || calls.data || [],
                recordings: calls.data?.data?.filter(c => c.recording_url) || [],
                analytics: analytics.data || analytics || {}
            });
        } catch (error) {
            console.error('Error fetching call data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'connected': return 'bg-green-100 text-green-700';
            case 'missed': return 'bg-red-100 text-red-700';
            case 'voicemail': return 'bg-yellow-100 text-yellow-700';
            case 'busy': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const CallStatsCard = ({ title, value, change, icon: Icon, color }) => (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {change && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                        change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {change > 0 ? (
                            <ArrowTrendingUpIcon className="w-4 h-4" />
                        ) : (
                            <ArrowPathIcon className="w-4 h-4" />
                        )}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                <p className="text-sm text-gray-600 mt-1">{title}</p>
            </div>
        </div>
    );

    const CallRecording = ({ call }) => (
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900">{call.lead?.name || 'Unknown'}</h4>
                        <p className="text-sm text-gray-500">{call.lead?.phone || 'No phone'}</p>
                    </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                    {call.status}
                </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    {new Date(call.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    {formatDuration(call.duration || 0)}
                </div>
                <div className="flex items-center gap-1">
                    <UserIcon className="w-4 h-4" />
                    {call.agent?.name || 'Unknown'}
                </div>
            </div>

            {call.recording_url && (
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                        <button className="p-2 bg-[#08A698] text-white rounded-full hover:bg-[#068f82] transition-colors">
                            <PlayIcon className="w-4 h-4" />
                        </button>
                        <div className="flex-1">
                            <div className="bg-gray-300 h-1 rounded-full">
                                <div className="bg-[#08A698] h-1 rounded-full w-1/3"></div>
                            </div>
                        </div>
                        <span className="text-xs text-gray-500">0:00 / {formatDuration(call.duration || 0)}</span>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                            <SpeakerWaveIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                    {call.transcript && (
                        <button className="text-xs text-[#08A698] hover:text-[#068f82] flex items-center gap-1">
                            <DocumentTextIcon className="w-3 h-3" />
                            Transcript
                        </button>
                    )}
                    {call.summary && (
                        <button className="text-xs text-[#08A698] hover:text-[#068f82] flex items-center gap-1">
                            <ChartBarIcon className="w-3 h-3" />
                            AI Summary
                        </button>
                    )}
                </div>
                <button className="text-xs text-gray-500 hover:text-gray-700">
                    View Details →
                </button>
            </div>
        </div>
    );

    const CallAnalytics = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CallStatsCard
                    title="Total Calls"
                    value={callData.summary.totalCalls || 0}
                    change={callData.summary.callsChange || 0}
                    icon={PhoneIcon}
                    color="bg-blue-500"
                />
                <CallStatsCard
                    title="Connected Calls"
                    value={callData.summary.connectedCalls || 0}
                    change={callData.summary.connectedChange || 0}
                    icon={UserIcon}
                    color="bg-green-500"
                />
                <CallStatsCard
                    title="Total Talk Time"
                    value={formatDuration(callData.summary.totalTalkTime || 0)}
                    change={callData.summary.talkTimeChange || 0}
                    icon={ClockIcon}
                    color="bg-purple-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Volume Trend</h3>
                    <div className="h-48 flex items-end justify-between gap-2">
                        {(callData.analytics.callVolume || [30, 45, 35, 50, 40, 60, 55]).map((value, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div 
                                    className="w-full bg-gradient-to-t from-[#08A698] to-teal-400 rounded-t-lg relative group"
                                    style={{ height: `${(value / 60) * 100}%` }}
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Status Breakdown</h3>
                    <div className="space-y-3">
                        {[
                            { status: 'Connected', count: callData.summary.connectedCalls || 0, color: 'bg-green-500' },
                            { status: 'Missed', count: callData.summary.missedCalls || 0, color: 'bg-red-500' },
                            { status: 'Voicemail', count: callData.summary.voicemailCalls || 0, color: 'bg-yellow-500' },
                            { status: 'Busy', count: callData.summary.busyCalls || 0, color: 'bg-orange-500' }
                        ].map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                    <span className="text-sm text-gray-700">{item.status}</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{item.count}</span>
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
                    <h1 className="text-2xl font-bold text-gray-900">Call Reports</h1>
                    {isConnected && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Live</span>
                    )}
                    <button onClick={fetchCallData} className="text-[#08A698] hover:text-[#068f82]">
                        <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search calls..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#08A698]"
                        />
                    </div>
                    <select
                        value={selectedAgent}
                        onChange={(e) => setSelectedAgent(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#08A698]"
                    >
                        <option value="all">All Agents</option>
                        <option value="me">My Calls</option>
                    </select>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#08A698]"
                    >
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Time Range Tabs */}
            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                {['Day', 'Week', 'Month', 'Year'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTab === tab
                                ? 'bg-[#08A698] text-white'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Analytics Section */}
            <CallAnalytics />

            {/* Call Recordings Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Call Recordings</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                                {callData.recordings.length} recordings
                            </span>
                            <button className="text-sm text-[#08A698] hover:text-[#068f82]">
                                View All
                            </button>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <ArrowPathIcon className="w-8 h-8 text-[#08A698] animate-spin" />
                        </div>
                    ) : callData.recordings.length === 0 ? (
                        <div className="text-center py-20">
                            <PhoneIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No call recordings found</h3>
                            <p className="text-gray-500">Call recordings will appear here once calls are made</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {callData.recordings.slice(0, 6).map(call => (
                                <CallRecording key={call.id} call={call} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CallReportDashboard;
