import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PhoneIcon, ChatBubbleLeftRightIcon, CalendarIcon, UserCircleIcon, ClockIcon, PaperAirplaneIcon, BarsArrowDownIcon } from '@heroicons/react/24/outline';
import { useDialer } from '../context/DialerContext';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import TaskModal from './TaskModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function LeadDetailModal({ isOpen, onClose, lead, onUpdate }) {
    const { startCallLog } = useDialer();
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
    const [activities, setActivities] = useState([]);
    const [loadingActivities, setLoadingActivities] = useState(false);
    const [saving, setSaving] = useState(false);

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
            fetchActivities();
            setSelectedStatus(lead.status || 'Fresh');
        }
    }, [isOpen, lead]);

    const fetchActivities = async () => {
        setLoadingActivities(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`${API_URL}/activities?leadId=${lead.id}&limit=10`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (res.ok) {
                const result = await res.json();
                setActivities(result.data?.data || result.data || []);
            }
        } catch (error) {
            console.error("Failed to load activities", error);
        } finally {
            setLoadingActivities(false);
        }
    };

    const handleSaveActivity = async () => {
        if (!remark && selectedStatus === lead.status) return;
        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return toast.error('Session expired');
            const token = session.access_token;

            // 1. Log Activity
            if (remark) {
                await fetch(`${API_URL}/activities`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        type: 'note',
                        title: 'Activity Logged',
                        description: remark,
                        leadId: lead.id
                    })
                });
            }

            // 2. Update Lead Status if changed
            if (selectedStatus !== lead.status) {
                await fetch(`${API_URL}/leads/${lead.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: selectedStatus })
                });
                toast.success('Lead status updated!');
            }

            toast.success('Activity saved!');
            setRemark('');
            fetchActivities();
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
                                                    <ClockIcon className="w-3.5 h-3.5" /> Updated {new Date(lead.updated_at || Date.now()).toLocaleDateString()}
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
                                        <div className="p-4 bg-gray-50/50 border-b border-gray-200 flex items-center justify-between">
                                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Update Lead Progress</h4>
                                            <div className="flex gap-1.5">
                                                <select
                                                    value={selectedStatus}
                                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                                    className="text-[11px] font-bold text-gray-600 border border-gray-200 bg-white rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-teal-500/20"
                                                >
                                                    <option>Fresh</option>
                                                    <option>Interested</option>
                                                    <option>Not Interested</option>
                                                    <option>Ringing</option>
                                                    <option>Follow-up</option>
                                                    <option>Won</option>
                                                </select>
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
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Phone Contact</label>
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
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Acquisition Source</label>
                                            <p className="text-sm font-bold text-gray-800 capitalize leading-relaxed">{lead.source?.replace('_', ' ') || 'Organic/Manual'}</p>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <BarsArrowDownIcon className="w-4 h-4 text-[#08A698]" /> Activity Timeline
                                        </h4>
                                        <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-gray-100">
                                            {loadingActivities ? (
                                                <div className="flex items-center gap-2 text-xs text-gray-400 italic">
                                                    <div className="w-3 h-3 border-2 border-teal-500 border-t-transparent animate-spin rounded-full"></div> Loading timeline...
                                                </div>
                                            ) : activities.length === 0 ? (
                                                <p className="text-xs text-gray-400 italic">No historical activities yet.</p>
                                            ) : activities.map((act, i) => (
                                                <div key={act.id} className="relative group">
                                                    <div className={`absolute -left-[20px] top-1.5 w-3.5 h-3.5 rounded-full ${i === 0 ? 'bg-teal-500 animate-pulse outline outline-4 outline-teal-50' : 'bg-white border-2 border-gray-300'} z-10`} />
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-xs font-bold text-gray-800 capitalize">
                                                                {act.type?.replace('_', ' ')}
                                                            </p>
                                                            <span className="text-[10px] font-medium text-gray-400 group-hover:text-[#08A698] transition-colors">{new Date(act.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-[11px] text-gray-500 leading-normal">
                                                            {act.description || act.details?.remark || 'Lead interaction recorded.'}
                                                        </p>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[7px] font-black text-gray-400">SYS</div>
                                                            <span className="text-[9px] font-bold text-gray-400 tracking-tighter uppercase">{act.user?.name || 'System Agent'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
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
                onSuccess={fetchActivities}
                leadId={lead?.id}
                leadName={lead?.name}
                initialType="CallFollowup"
            />
        </Transition>
    );
}
