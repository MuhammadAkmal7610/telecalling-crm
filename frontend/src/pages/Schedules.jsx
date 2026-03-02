import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import TaskModal from '../components/TaskModal';
import { supabase } from '../lib/supabaseClient';
import {
    ArrowPathIcon, PlusIcon, MagnifyingGlassIcon, PhoneIcon, FlagIcon,
    CalendarDaysIcon, UserIcon, TrashIcon, PencilSquareIcon,
    CheckCircleIcon, ClockIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const PRIORITY_CONFIG = {
    Urgent: { color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500' },
    High: { color: 'text-orange-600', bg: 'bg-orange-50', dot: 'bg-orange-500' },
    Medium: { color: 'text-sky-600', bg: 'bg-sky-50', dot: 'bg-sky-500' },
    Low: { color: 'text-gray-500', bg: 'bg-gray-50', dot: 'bg-gray-400' },
    None: { color: 'text-gray-400', bg: 'bg-gray-50', dot: 'bg-gray-300' },
};

const STATUS_CONFIG = {
    Pending: { color: 'text-yellow-700', bg: 'bg-yellow-100', icon: ClockIcon },
    Rescheduled: { color: 'text-orange-700', bg: 'bg-orange-100', icon: ArrowPathIcon },
    Late: { color: 'text-red-700', bg: 'bg-red-100', icon: ClockIcon },
    Done: { color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircleIcon },
    Cancelled: { color: 'text-gray-600', bg: 'bg-gray-100', icon: TrashIcon },
};

function formatDueDate(dateStr) {
    if (!dateStr) return { text: 'No date set', isOverdue: false };
    const date = new Date(dateStr);
    const now = new Date();
    const isOverdue = date < now;
    const text = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return { text, isOverdue };
}

export default function Schedules() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editSchedule, setEditSchedule] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const fetchSchedules = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const params = new URLSearchParams({ limit: '50' });
            if (statusFilter) params.set('status', statusFilter);

            const res = await fetch(`${API_URL}/schedules?${params}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch');
            const result = await res.json();
            const data = result.data?.data || result.data || [];
            const count = result.data?.total ?? data.length;
            setSchedules(data);
            setTotal(count);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load schedules');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, refreshKey]);

    useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this schedule?')) return;
        setDeletingId(id);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/schedules/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (res.ok) {
                toast.success('Schedule deleted');
                setRefreshKey(k => k + 1);
            } else {
                toast.error('Failed to delete');
            }
        } catch { toast.error('Something went wrong'); }
        finally { setDeletingId(null); }
    };

    const handleMarkDone = async (id) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/schedules/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                body: JSON.stringify({ status: 'Done', completedAt: new Date().toISOString() })
            });
            if (res.ok) {
                toast.success('Marked as done!');
                setRefreshKey(k => k + 1);
            } else toast.error('Failed to update');
        } catch { toast.error('Something went wrong'); }
    };

    // Client-side search filter
    const filtered = schedules.filter(s => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            s.description?.toLowerCase().includes(q) ||
            s.lead?.name?.toLowerCase().includes(q) ||
            s.lead?.phone?.includes(q) ||
            s.assignee?.name?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto px-6 py-8 md:p-8 bg-gray-50/50">
                    <div className="mx-auto max-w-7xl">

                        {/* Page Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 bg-[#08A698]/10 rounded-xl flex items-center justify-center">
                                        <PhoneIcon className="w-5 h-5 text-[#08A698]" />
                                    </div>
                                    <h1 className="text-2xl font-bold text-gray-900">Schedules</h1>
                                    <button
                                        onClick={() => setRefreshKey(k => k + 1)}
                                        className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${loading ? 'animate-spin' : ''}`}
                                    >
                                        <ArrowPathIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 mt-1 ml-11">
                                    Call followup schedules — never miss a lead touchpoint.{' '}
                                    <span className="text-[#08A698] font-medium">{total} total</span>
                                </p>
                            </div>
                            <button
                                onClick={() => { setEditSchedule(null); setIsTaskModalOpen(true); }}
                                className="bg-[#08A698] hover:bg-[#078F82] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
                            >
                                <PlusIcon className="w-5 h-5" /> Create Schedule
                            </button>
                        </div>

                        {/* Filter Bar */}
                        <div className="flex flex-col md:flex-row gap-3 mb-6">
                            {/* Search */}
                            <div className="flex-1 bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-[#08A698]/20 focus-within:border-[#08A698] transition-all flex items-center">
                                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 ml-2 mr-3 shrink-0" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by lead, description, or assignee..."
                                    className="w-full outline-none text-gray-700 placeholder-gray-400 text-sm bg-transparent"
                                />
                            </div>
                            {/* Status filter */}
                            <div className="bg-white px-3 py-2.5 rounded-xl border border-gray-200 shadow-sm flex items-center min-w-[160px]">
                                <select
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    className="w-full outline-none text-gray-600 text-sm bg-transparent cursor-pointer"
                                >
                                    <option value="">Status: All</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Rescheduled">Rescheduled</option>
                                    <option value="Late">Late</option>
                                    <option value="Done">Done</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div className="text-xs text-gray-400 mb-4 font-medium">
                            {loading ? 'Loading...' : `${filtered.length} schedule${filtered.length !== 1 ? 's' : ''} found`}
                        </div>

                        {/* Table / Empty State */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-24">
                                    <div className="w-10 h-10 rounded-full border-4 border-[#08A698]/30 border-t-[#08A698] animate-spin mb-4" />
                                    <p className="text-sm text-gray-400">Loading schedules...</p>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 px-4">
                                    <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-teal-50/50">
                                        <PhoneIcon className="w-10 h-10 text-[#08A698]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Schedules Found</h3>
                                    <p className="text-gray-500 text-center max-w-sm mb-8">
                                        {search || statusFilter
                                            ? "No schedules match your current filters."
                                            : "You haven't created any call followup schedules yet. Schedule your first followup to keep leads engaged."}
                                    </p>
                                    {!search && !statusFilter && (
                                        <button
                                            onClick={() => setIsTaskModalOpen(true)}
                                            className="bg-[#08A698] hover:bg-[#078F82] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center gap-2"
                                        >
                                            <PlusIcon className="w-5 h-5" /> Create First Schedule
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="px-5 py-3.5 text-xs font-black text-gray-400 uppercase tracking-wider">Lead</th>
                                                <th className="px-5 py-3.5 text-xs font-black text-gray-400 uppercase tracking-wider">Description</th>
                                                <th className="px-5 py-3.5 text-xs font-black text-gray-400 uppercase tracking-wider">
                                                    <div className="flex items-center gap-1"><CalendarDaysIcon className="w-3.5 h-3.5" /> Due Date</div>
                                                </th>
                                                <th className="px-5 py-3.5 text-xs font-black text-gray-400 uppercase tracking-wider">
                                                    <div className="flex items-center gap-1"><UserIcon className="w-3.5 h-3.5" /> Assignee</div>
                                                </th>
                                                <th className="px-5 py-3.5 text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                                                <th className="px-5 py-3.5 text-xs font-black text-gray-400 uppercase tracking-wider">
                                                    <div className="flex items-center gap-1"><FlagIcon className="w-3.5 h-3.5" /> Priority</div>
                                                </th>
                                                <th className="px-5 py-3.5 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filtered.map((schedule) => {
                                                const due = formatDueDate(schedule.due_date);
                                                const priority = PRIORITY_CONFIG[schedule.priority] || PRIORITY_CONFIG.None;
                                                const status = STATUS_CONFIG[schedule.status] || STATUS_CONFIG.Pending;
                                                const StatusIcon = status.icon;
                                                const isDone = schedule.status === 'Done';

                                                return (
                                                    <tr key={schedule.id} className={`hover:bg-gray-50/70 transition-colors ${isDone ? 'opacity-60' : ''}`}>
                                                        {/* Lead */}
                                                        <td className="px-5 py-4">
                                                            {schedule.lead ? (
                                                                <div>
                                                                    <p className="font-semibold text-gray-800 truncate max-w-[130px]">{schedule.lead.name}</p>
                                                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                                        <PhoneIcon className="w-3 h-3" /> {schedule.lead.phone}
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 italic text-xs">No lead</span>
                                                            )}
                                                        </td>

                                                        {/* Description */}
                                                        <td className="px-5 py-4 max-w-[220px]">
                                                            <p className={`text-gray-700 line-clamp-2 ${isDone ? 'line-through text-gray-400' : ''}`}>
                                                                {schedule.description}
                                                            </p>
                                                        </td>

                                                        {/* Due Date */}
                                                        <td className="px-5 py-4 whitespace-nowrap">
                                                            <span className={`text-xs font-medium ${due.isOverdue && !isDone ? 'text-red-600' : 'text-gray-500'}`}>
                                                                {due.isOverdue && !isDone && <span className="mr-1">⚠</span>}
                                                                {due.text}
                                                            </span>
                                                        </td>

                                                        {/* Assignee */}
                                                        <td className="px-5 py-4">
                                                            {schedule.assignee ? (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                                        {schedule.assignee.name?.[0]?.toUpperCase() || '?'}
                                                                    </div>
                                                                    <span className="text-gray-700 text-xs font-medium truncate max-w-[90px]">
                                                                        {schedule.assignee.name}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 text-xs italic">Unassigned</span>
                                                            )}
                                                        </td>

                                                        {/* Status */}
                                                        <td className="px-5 py-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                                                                <StatusIcon className="w-3 h-3" />
                                                                {schedule.status}
                                                            </span>
                                                        </td>

                                                        {/* Priority */}
                                                        <td className="px-5 py-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${priority.bg} ${priority.color}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                                                                {schedule.priority || 'None'}
                                                            </span>
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center justify-center gap-1">
                                                                {!isDone && (
                                                                    <button
                                                                        onClick={() => handleMarkDone(schedule.id)}
                                                                        title="Mark as Done"
                                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                                                                    >
                                                                        <CheckCircleIcon className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDelete(schedule.id)}
                                                                    disabled={deletingId === schedule.id}
                                                                    title="Delete"
                                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                                >
                                                                    {deletingId === schedule.id
                                                                        ? <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                                                        : <TrashIcon className="w-4 h-4" />
                                                                    }
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                    </div>
                </main>
            </div>

            {/* Create/Edit Schedule Modal (reuses TaskModal with CallFollowup type) */}
            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => { setIsTaskModalOpen(false); setEditSchedule(null); }}
                onSuccess={() => setRefreshKey(k => k + 1)}
                initialType="CallFollowup"
                leadId={editSchedule?.lead_id || null}
                leadName={editSchedule?.lead?.name || null}
            />
        </div>
    );
}
