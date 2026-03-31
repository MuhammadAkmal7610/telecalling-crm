import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PhoneIcon, ChatBubbleLeftRightIcon, CalendarIcon, UserCircleIcon, ClockIcon, PaperAirplaneIcon, BarsArrowDownIcon, EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useDialer } from '../context/DialerContext';
import { toast } from 'react-hot-toast';
import { useApi } from '../hooks/useApi';
import TaskModal from './TaskModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function LeadDetailModal({ isOpen, onClose, lead, onUpdate }) {
    const { startCallLog } = useDialer();
    const { apiFetch } = useApi();
    const [isScheduling, setIsScheduling] = useState(false);
    const [activeTab, setActiveTab] = useState('Activity');
    const [note, setNote] = useState('');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [followupData, setFollowupData] = useState({
        description: '',
        dueDate: ''
    });
    const [remark, setRemark] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedStage, setSelectedStage] = useState('');
    const [selectedActivityType, setSelectedActivityType] = useState('call');
    const [stages, setStages] = useState([]);
    const [activities, setActivities] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loadingStages, setLoadingStages] = useState(false);
    const [loadingTimeline, setLoadingTimeline] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [saving, setSaving] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedAssignee, setSelectedAssignee] = useState('');

    const quickRemarks = [
        "Busy/Not picking up",
        "Call back later",
        "Interested - Send details",
        "Meeting Scheduled",
        "Invalid Number",
        "Wrong Person"
    ];

    useEffect(() => {
        if (isOpen && lead?.id) {
            fetchTimeline();
            fetchStages();
            fetchUsers();
            setSelectedStatus(lead.status || 'Fresh');
            setSelectedStage(lead.stageId || '');
            setSelectedAssignee(lead.assigneeId || '');
        }
    }, [isOpen, lead]);

    const fetchStages = async () => {
        setLoadingStages(true);
        try {
            const res = await apiFetch('/lead-stages');
            if (res.ok) {
                const result = await res.json();
                setStages(Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []));
            }
        } catch (error) {
            console.error("Failed to load stages", error);
        } finally {
            setLoadingStages(false);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await apiFetch('/users');
            if (res.ok) {
                const result = await res.json();
                const data = result.data?.data || result.data || result || [];
                const validUsers = (Array.isArray(data) ? data : []).filter(u => u.role !== 'root' && u.role !== 'billing_admin');
                setUsers(validUsers);
            }
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setLoadingUsers(false);
        }
    };
    const fetchTimeline = async () => {
        setLoadingTimeline(true);
        try {
            // Fetch Activities
            const actRes = await apiFetch(`/activities?leadId=${lead.id}&limit=20`);
            let activitiesData = [];
            if (actRes.ok) {
                const result = await actRes.json();
                activitiesData = (result.data?.data || result.data || []).map(a => ({ ...a, timeline_type: 'activity' }));
            }

            // Fetch Tasks
            const taskRes = await apiFetch(`/tasks?leadId=${lead.id}&limit=20`);
            let tasksData = [];
            if (taskRes.ok) {
                const result = await taskRes.json();
                tasksData = (result.data?.data || result.data || []).map(t => ({ ...t, timeline_type: 'task', created_at: t.created_at || t.due_date }));
            }

            // Merge and Sort
            const merged = [...activitiesData, ...tasksData].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setActivities(merged);
        } catch (error) {
            console.error("Failed to load timeline", error);
        } finally {
            setLoadingTimeline(false);
        }
    };

    const handleSaveActivity = async () => {
        if (!remark && selectedStatus === lead.status) return;
        setSaving(true);
        try {
            // 1. Log Activity
            if (remark) {
                const activityTitle = {
                    'call': 'Call Logged',
                    'whatsapp': 'WhatsApp Sent',
                    'email': 'Email Sent',
                    'note': 'Note Added'
                }[selectedActivityType] || 'Activity Logged';

                await apiFetch('/activities', {
                    method: 'POST',
                    body: JSON.stringify({
                        type: selectedActivityType,
                        title: activityTitle,
                        description: remark,
                        leadId: lead.id
                    })
                });
            }

            // 2. Update Lead Status/Stage/Assignee if changed
            if (selectedStatus !== lead.status || selectedStage !== lead.stageId || selectedAssignee !== lead.assigneeId) {
                await apiFetch(`/leads/${lead.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ 
                        status: selectedStatus, 
                        stageId: selectedStage,
                        assigneeId: selectedAssignee
                    })
                });
                toast.success('Lead updated!');
            }

            toast.success('Activity saved!');
            setRemark('');
            fetchTimeline();
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error('Failed to save activity');
        } finally {
            setSaving(false);
        }
    };

    if (!lead) return null;

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95 translate-y-4"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 translate-y-4"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-gray-100">
                                {/* Header */}
                                <div className="bg-[#F8F9FA] border-b border-gray-200 px-6 py-5 flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-500 to-[#08A698] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal-100">
                                            {lead.name ? lead.name[0].toUpperCase() : '??'}
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 tracking-tight">
                                                {lead.name}
                                            </Dialog.Title>
                                            <div className="text-xs text-gray-500 flex items-center gap-3 mt-1.5">
                                                <span className="bg-white px-2 py-0.5 rounded border border-gray-200 font-mono text-gray-400">
                                                    ID: {lead.id?.substring(0, 8)}...
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <ClockIcon className="w-3.5 h-3.5" /> Updated {new Date(lead.updatedAt || Date.now()).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-white hover:shadow-sm transition-all"
                                        onClick={onClose}
                                    >
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="px-6 py-6 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-6">
                                    {/* Primary Actions */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setIsScheduling(!isScheduling)}
                                            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${isScheduling ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-[#08A698] text-white hover:bg-[#078F82]'}`}>
                                            <CalendarIcon className="w-5 h-5" /> {isScheduling ? 'Cancel Followup' : 'Schedule Followup'}
                                        </button>
                                        <button className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd59] text-white py-3 rounded-xl text-sm font-bold transition-all shadow-sm">
                                            <ChatBubbleLeftRightIcon className="w-5 h-5" /> WhatsApp Message
                                        </button>
                                    </div>

                                    {/* Activity Logging Section */}
                                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                        <div className="p-4 bg-gray-50/50 border-b border-gray-200 space-y-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest hidden sm:block">Update Pipeline</h4>
                                                <div className="flex flex-1 gap-2">
                                                    <div className="flex-1">
                                                        <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Stage</label>
                                                        <select
                                                            value={selectedStage}
                                                            onChange={(e) => setSelectedStage(e.target.value)}
                                                            className="w-full text-[11px] font-bold text-gray-600 border border-gray-200 bg-white rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-teal-500/20"
                                                        >
                                                            <option value="">Select Stage</option>
                                                            {stages.map(s => (
                                                                <option key={s.id} value={s.id}>{s.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Status</label>
                                                        <select
                                                            value={selectedStatus}
                                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                                            className="w-full text-[11px] font-bold text-gray-600 border border-gray-200 bg-white rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-teal-500/20"
                                                        >
                                                            <option>Fresh</option>
                                                            <option>Interested</option>
                                                            <option>Not Interested</option>
                                                            <option>Ringing</option>
                                                            <option>Follow-up</option>
                                                            <option>Won</option>
                                                            <option>Lost</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Assignee</label>
                                                        <select
                                                            value={selectedAssignee}
                                                            onChange={(e) => setSelectedAssignee(e.target.value)}
                                                            className="w-full text-[11px] font-bold text-gray-600 border border-gray-200 bg-white rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-teal-500/20"
                                                        >
                                                            <option value="">Unassigned</option>
                                                            {users.map(u => (
                                                                <option key={u.id} value={u.id}>{u.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Specialized Activity Toggles */}
                                            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl w-fit">
                                                {[
                                                    { id: 'call', icon: PhoneIcon, label: 'Call' },
                                                    { id: 'whatsapp', icon: ChatBubbleLeftRightIcon, label: 'WhatsApp' },
                                                    { id: 'email', icon: EnvelopeIcon, label: 'Email' },
                                                    { id: 'note', icon: UserCircleIcon, label: 'Note' },
                                                ].map((t) => (
                                                    <button
                                                        key={t.id}
                                                        onClick={() => setSelectedActivityType(t.id)}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedActivityType === t.id ? 'bg-white text-[#08A698] shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                                                    >
                                                        <t.icon className="w-4 h-4" />
                                                        {t.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            {/* Quick Remarks */}
                                            <div className="flex flex-wrap gap-2">
                                                {quickRemarks.map(rm => (
                                                    <button
                                                        key={rm}
                                                        onClick={() => setRemark(rm)}
                                                        className="px-3 py-1.5 rounded-lg border border-gray-100 bg-gray-50 text-[10px] font-bold text-gray-500 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 transition-all"
                                                    >
                                                        {rm}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="relative">
                                                <textarea
                                                    value={remark}
                                                    onChange={(e) => setRemark(e.target.value)}
                                                    placeholder="Type a more detailed remark here..."
                                                    className="w-full text-sm p-4 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-50 focus:border-[#08A698] transition-all resize-none h-24 bg-gray-50/30"
                                                />
                                                <button
                                                    disabled={saving || (!remark && selectedStatus === lead.status)}
                                                    onClick={handleSaveActivity}
                                                    className="absolute bottom-3 right-3 p-2 bg-[#08A698] text-white rounded-lg hover:bg-[#078F82] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-100"
                                                >
                                                    {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Scheduling Form */}
                                    {isScheduling && (
                                        <Transition
                                            show={isScheduling}
                                            enter="transition ease-out duration-200"
                                            enterFrom="opacity-0 -translate-y-2 scale-95"
                                            enterTo="opacity-100 translate-y-0 scale-100"
                                        >
                                            {/* Schedule Followup Section */}
                                            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <ClockIcon className="w-5 h-5 text-[#08A698]" />
                                                        <h4 className="text-sm font-bold text-gray-800">Schedule Followup</h4>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-4">Set a reminder to call this lead back at a specific time.</p>
                                                <button
                                                    onClick={() => setIsTaskModalOpen(true)}
                                                    className="w-full bg-[#08A698] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#078F82] transition-colors shadow-sm flex items-center justify-center gap-2"
                                                >
                                                    <CalendarIcon className="w-4 h-4" />
                                                    Pick Date & Time
                                                </button>
                                            </div>
                                        </Transition>
                                    )}

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:bg-white hover:border-teal-100 transition-all">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 whitespace-nowrap">Phone Contact</label>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-bold text-gray-800 tracking-tight">{lead.phone}</p>
                                                <button
                                                    onClick={() => startCallLog(lead.phone, lead.id, lead.name)}
                                                    className="p-1.5 bg-white rounded-lg text-teal-600 shadow-sm border border-gray-100 hover:scale-110 transition-transform"
                                                >
                                                    <PhoneIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:bg-white hover:border-teal-100 transition-all">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 whitespace-nowrap">Email Address</label>
                                            <p className="text-sm font-bold text-gray-800 tracking-tight truncate">{lead.email || 'N/A'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:bg-white hover:border-teal-100 transition-all">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 whitespace-nowrap">Alternate Phone</label>
                                            <p className="text-sm font-bold text-gray-800 tracking-tight">{lead.altPhone || 'N/A'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:bg-white hover:border-teal-100 transition-all">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 whitespace-nowrap">Acquisition Source</label>
                                            <p className="text-sm font-bold text-gray-800 capitalize leading-relaxed truncate">{lead.source?.replace('_', ' ') || 'Organic/Manual'}</p>
                                        </div>

                                        {/* Dynamic Custom Fields */}
                                        {lead.customFields && Object.entries(lead.customFields).map(([key, value]) => (
                                            <div key={key} className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:bg-white hover:border-teal-100 transition-all col-span-2 sm:col-span-1">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 whitespace-nowrap">{key.replace('_', ' ')}</label>
                                                <p className="text-sm font-bold text-gray-800 tracking-tight">{value?.toString() || 'N/A'}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Timeline */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <BarsArrowDownIcon className="w-4 h-4 text-[#08A698]" /> Activity Timeline
                                        </h4>
                                        <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-gray-100">
                                            {loadingTimeline ? (
                                                <div className="flex items-center gap-2 text-xs text-gray-400 italic">
                                                    <div className="w-3 h-3 border-2 border-teal-500 border-t-transparent animate-spin rounded-full"></div> Loading timeline...
                                                </div>
                                            ) : activities.length === 0 ? (
                                                <p className="text-xs text-gray-400 italic">No historical activities yet.</p>
                                            ) : activities.map((item, i) => {
                                                const isTask = item.timeline_type === 'task';
                                                const type = item.type?.toLowerCase();

                                                let Icon = UserCircleIcon;
                                                let iconColor = 'bg-gray-300';

                                                if (isTask) {
                                                    Icon = CheckCircleIcon;
                                                    iconColor = item.status === 'Completed' ? 'bg-emerald-500' : 'bg-rose-400';
                                                } else if (type === 'call') {
                                                    Icon = PhoneIcon;
                                                    iconColor = 'bg-emerald-500';
                                                } else if (type === 'whatsapp') {
                                                    Icon = ChatBubbleLeftRightIcon;
                                                    iconColor = 'bg-[#25D366]';
                                                } else if (type === 'email') {
                                                    Icon = EnvelopeIcon;
                                                    iconColor = 'bg-blue-500';
                                                } else if (type === 'note') {
                                                    Icon = UserCircleIcon;
                                                    iconColor = 'bg-amber-500';
                                                }

                                                return (
                                                    <div key={item.id} className="relative group">
                                                        <div className={`absolute -left-[20px] top-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white ${iconColor} z-10 shadow-sm transition-transform group-hover:scale-110`}>
                                                            <Icon className="w-2.5 h-2.5" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-xs font-bold text-gray-800 capitalize flex items-center gap-1.5">
                                                                    {isTask ? 'Task Scheduled' : (item.title || item.type?.replace('_', ' '))}
                                                                    {isTask && <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter ${item.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{item.status}</span>}
                                                                </p>
                                                                <span className="text-[10px] font-medium text-gray-400 group-hover:text-[#08A698] transition-colors">
                                                                    {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-gray-500 leading-normal">
                                                                {item.description || item.details?.remark || 'Lead interaction recorded.'}
                                                            </p>
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[7px] font-black text-gray-400 uppercase">
                                                                    {isTask ? (item.assignee?.name?.[0] || 'A') : (item.user?.name?.[0] || 'S')}
                                                                </div>
                                                                <span className="text-[9px] font-bold text-gray-400 tracking-tighter uppercase">
                                                                    {isTask ? (item.assignee?.name || 'Assigned Agent') : (item.user?.name || 'System Agent')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
                                    <span className="text-[10px] font-bold text-gray-400 italic tracking-wide">Last active session {new Date().toLocaleTimeString()}</span>
                                    <button
                                        type="button"
                                        className="bg-white px-6 py-2 rounded-xl text-sm font-bold text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 transition-all shadow-sm"
                                        onClick={onClose}
                                    >
                                        Close Details
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>

            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSuccess={fetchTimeline}
                leadId={lead?.id}
                leadName={lead?.name}
                initialType="CallFollowup"
            />
        </Transition>
    );
}
