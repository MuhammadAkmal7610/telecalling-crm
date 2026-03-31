import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { toast } from 'react-hot-toast';
import WorkspaceGuard from '../components/WorkspaceGuard';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    PhoneIcon,
    EnvelopeIcon,
    ChatBubbleLeftRightIcon,
    UserCircleIcon,
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
    ArrowPathIcon,
    EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Mock Data Grouped by Date
const activities = [
    {
        date: 'Today',
        items: [
            {
                id: 1,
                type: 'call',
                title: 'Outbound Call - Connected',
                subtitle: 'Sarah Wilson',
                description: 'Discussed project requirements and timeline. Client is interested in the premium plan.',
                time: '10:42 AM',
                user: 'John Doe',
                duration: '4m 32s',
                badgeColor: 'text-emerald-600 bg-emerald-50 border-emerald-100'
            },
            {
                id: 2,
                type: 'email',
                title: 'Email Sent',
                subtitle: 'Proposal Follow-up',
                description: 'Sent the revised proposal document as requested in the last meeting.',
                time: '09:15 AM',
                user: 'John Doe',
                badgeColor: 'text-blue-600 bg-blue-50 border-blue-100'
            }
        ]
    },
    {
        date: 'Yesterday',
        items: [
            {
                id: 3,
                type: 'meeting',
                title: 'Meeting Scheduled',
                subtitle: 'Demo with Engineering',
                description: 'Demo scheduled with the engineering team for next Tuesday.',
                time: '4:00 PM',
                user: 'Alice Smith',
                badgeColor: 'text-purple-600 bg-purple-50 border-purple-100'
            },
            {
                id: 4,
                type: 'note',
                title: 'Note Added',
                subtitle: 'Billing Query',
                description: 'Client asked to hold off on billing until the new fiscal year starts.',
                time: '1:30 PM',
                user: 'John Doe',
                badgeColor: 'text-amber-600 bg-amber-50 border-amber-100'
            }
        ]
    },
    {
        date: 'Oct 12, 2023',
        items: [
            {
                id: 5,
                type: 'whatsapp',
                title: 'Incoming Message',
                subtitle: 'Pricing Question',
                description: 'Can you send me the pricing sheet again? Also needing info on enterprise tiers.',
                time: '11:20 AM',
                user: 'Sarah Wilson',
                badgeColor: 'text-teal-600 bg-teal-50 border-teal-100'
            }
        ]
    }
];

const ActivityIcon = ({ type }) => {
    switch (type?.toLowerCase()) {
        case 'call': return <PhoneIcon className="w-4 h-4" />;
        case 'email': return <EnvelopeIcon className="w-4 h-4" />;
        case 'whatsapp': return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
        case 'meeting': return <CalendarIcon className="w-4 h-4" />;
        case 'note': return <UserCircleIcon className="w-4 h-4" />;
        case 'task': return <CheckCircleIcon className="w-4 h-4" />;
        case 'status_change': return <ArrowPathIcon className="w-4 h-4" />;
        default: return <ClockIcon className="w-4 h-4" />;
    }
};

export default function Activities() {
    const { apiFetch } = useApi();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            // Fetch Activities
            const actRes = await apiFetch('/activities?limit=50');
            let activitiesData = [];
            if (actRes.ok) {
                const result = await actRes.json();
                activitiesData = (result.data?.data || result.data || []).map(a => ({ ...a, timeline_type: 'activity' }));
            }

            // Fetch Tasks
            const taskRes = await apiFetch('/tasks?limit=50');
            let tasksData = [];
            if (taskRes.ok) {
                const result = await taskRes.json();
                tasksData = (result.data?.data || result.data || []).map(t => ({ ...t, timeline_type: 'task', created_at: t.created_at || t.due_date }));
            }

            // Merge and Group by Date
            const allItems = [...activitiesData, ...tasksData].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            const grouped = allItems.reduce((acc, curr) => {
                const date = new Date(curr.created_at).toLocaleDateString([], {
                    year: 'numeric', month: 'short', day: 'numeric'
                });
                const existing = acc.find(g => g.date === date);

                const isTask = curr.timeline_type === 'task';
                const item = {
                    id: curr.id,
                    type: isTask ? 'task' : (curr.type || 'note'),
                    title: isTask ? `Task: ${curr.type || 'Follow-up'}` : (curr.title || 'Activity Logged'),
                    subtitle: curr.lead?.name || 'Lead update',
                    description: curr.description || curr.details?.remark || 'No details provided.',
                    time: new Date(curr.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    user: isTask ? (curr.assignee?.name || 'Assigned Agent') : (curr.user?.name || 'System'),
                    duration: curr.duration || curr.details?.duration,
                    status: isTask ? curr.status : null,
                    badgeColor: getBadgeColor(isTask ? 'task' : curr.type)
                };

                if (existing) {
                    existing.items.push(item);
                } else {
                    acc.push({ date, items: [item] });
                }
                return acc;
            }, []);

            setActivities(grouped);
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getBadgeColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'call': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'email': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'whatsapp': return 'text-teal-600 bg-teal-50 border-teal-100';
            case 'meeting': return 'text-purple-600 bg-purple-50 border-purple-100';
            case 'note': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'task': return 'text-rose-600 bg-rose-50 border-rose-100';
            case 'status_change': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased overflow-hidden">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col h-full min-w-0">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
                    <WorkspaceGuard>
                        <div className="mx-auto max-w-5xl space-y-6">

                            {/* Page Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Activities</h1>
                                    <p className="text-sm text-gray-500 mt-1">Track all interactions and updates.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search activities..."
                                            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full sm:w-72 transition-all shadow-sm"
                                        />
                                    </div>
                                    <button className="p-2.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-primary hover:border-primary transition-colors shadow-sm">
                                        <FunnelIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="space-y-8 relative">
                                {/* Vertical Line for Timeline */}
                                <div className="absolute left-[27px] top-4 bottom-4 w-px bg-gray-200 hidden sm:block"></div>

                                {loading ? (
                                    <div className="space-y-6">
                                        {[1, 2].map(i => (
                                            <div key={i} className="animate-pulse flex items-start gap-4">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex-shrink-0"></div>
                                                <div className="flex-1 space-y-3 py-1">
                                                    <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                                                    <div className="h-20 bg-gray-100 rounded"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : activities.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                                        <ClockIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                        <p className="text-gray-400 font-medium italic">No activities logged yet</p>
                                    </div>
                                ) : activities.map((group, groupIdx) => (
                                    <div key={groupIdx} className="relative">
                                        {/* Date Label */}
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-[54px] hidden sm:flex justify-center">
                                                <div className="w-3 h-3 rounded-full bg-gray-300 ring-4 ring-[#F8F9FA]"></div>
                                            </div>
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-[#F8F9FA] pr-2 z-10">{group.date}</h3>
                                        </div>

                                        <div className="space-y-4">
                                            {group.items.map((item) => (
                                                <div key={item.id} className="relative sm:pl-14 group">
                                                    {/* Connector Line (Mobile hidden) */}

                                                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm transition-all hover:shadow-md hover:border-teal-100 min-h-[100px] flex flex-col sm:flex-row gap-4">

                                                        {/* Icon */}
                                                        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border ${item.badgeColor}`}>
                                                            <ActivityIcon type={item.type} />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div>
                                                                    <h4 className="text-sm font-bold text-gray-900">{item.title} <span className="font-normal text-gray-500 mx-1">•</span> <span className="font-medium text-gray-700">{item.subtitle}</span></h4>
                                                                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.description}</p>
                                                                </div>
                                                                <div className="flex items-center text-xs text-gray-500 gap-1.5 whitespace-nowrap font-medium">
                                                                    <ClockIcon className="w-4 h-4" />
                                                                    {item.time}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3 mt-4">
                                                                <div className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                                                                    <UserCircleIcon className="w-3.5 h-3.5" />
                                                                    {item.user}
                                                                </div>
                                                                {item.duration && (
                                                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                                                        Duration: <span className="text-gray-600 font-medium">{item.duration}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Action Menu Placeholder */}
                                                        <button className="self-start sm:self-center p-1 text-gray-300 hover:text-gray-500 transition-colors">
                                                            <EllipsisHorizontalIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </WorkspaceGuard>
                </main>
            </div>
        </div>
    );
}
