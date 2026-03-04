import React, { useState, useEffect } from 'react';
import SelectEventModal from './SelectEventModal';
import SelectActionModal from './SelectActionModal';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { ArrowPathIcon, SparklesIcon, UserCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function WorkflowWizard({ isOpen, onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    const [workflowData, setWorkflowData] = useState({
        name: '',
        trigger: null,
        action: null,
        selectedUsers: []
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingUsers, setFetchingUsers] = useState(false);

    useEffect(() => {
        if (isOpen && step === 3 && workflowData.action === 'assign-lead') {
            fetchUsers();
        }
    }, [isOpen, step, workflowData.action]);

    const fetchUsers = async () => {
        setFetchingUsers(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch(`${API_URL}/users`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const result = await res.json();
            const data = result.data?.data || result.data || result || [];
            // Filter only callers/managers/admins for assignment
            setUsers(data.filter(u => ['caller', 'manager', 'admin'].includes(u.role)));
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setFetchingUsers(false);
        }
    };

    const handleNextEvent = (eventId) => {
        setWorkflowData(prev => ({ ...prev, trigger: eventId }));
        setStep(2);
    };

    const handleNextAction = (actionId) => {
        setWorkflowData(prev => ({ ...prev, action: actionId }));
        if (actionId === 'assign-lead') {
            setStep(3); // Configuration step
        } else {
            setStep(4); // Naming step
        }
    };

    const toggleUser = (userId) => {
        setWorkflowData(prev => {
            const selected = prev.selectedUsers.includes(userId)
                ? prev.selectedUsers.filter(id => id !== userId)
                : [...prev.selectedUsers, userId];
            return { ...prev, selectedUsers: selected };
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!workflowData.name) {
            toast.error('Please enter a name for the workflow');
            return;
        }

        if (workflowData.action === 'assign-lead' && workflowData.selectedUsers.length === 0) {
            toast.error('Please select at least one user for assignment');
            return;
        }

        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const triggerMap = {
                'facebook': { type: 'lead_source', value: 'Facebook', text: 'On Facebook Lead' },
                'website': { type: 'lead_source', value: 'Website', text: 'On Website Lead' },
                'manual': { type: 'lead_source', value: 'Manual', text: 'On Manual Lead' },
                'whatsapp': { type: 'lead_source', value: 'Whatsapp', text: 'On Whatsapp Lead' },
                'indiamart': { type: 'lead_source', value: 'IndiaMART', text: 'On IndiaMART Lead' },
                'justdial': { type: 'lead_source', value: 'Justdial', text: 'On Justdial Lead' },
                'status-change': { type: 'status_change', value: '*', text: 'On Status Change' }
            };

            let actionValue = workflowData.selectedUsers;
            let actionText = 'Assign Lead';

            if (workflowData.action === 'assign-lead') {
                if (workflowData.selectedUsers.length > 1) {
                    actionText = `Round Robin (${workflowData.selectedUsers.length} users)`;
                } else {
                    const user = users.find(u => u.id === workflowData.selectedUsers[0]);
                    actionText = `Assign to ${user?.name || 'User'}`;
                    actionValue = workflowData.selectedUsers[0]; // Send as string for single
                }
            }

            const actionMap = {
                'assign-lead': { type: 'assign_to', value: actionValue, text: actionText },
                'send-whatsapp': { type: 'send_whatsapp', value: 'default', text: 'Send Whatsapp' }
            };

            const trigger = triggerMap[workflowData.trigger] || { type: 'generic', value: workflowData.trigger, text: workflowData.trigger };
            const action = actionMap[workflowData.action] || { type: 'generic', value: workflowData.action, text: workflowData.action };

            const res = await fetch(`${API_URL}/workflows`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    name: workflowData.name,
                    trigger,
                    action
                })
            });

            if (!res.ok) throw new Error('Failed to create workflow');

            toast.success('Workflow created successfully');
            onSuccess();
            onClose();
            setTimeout(() => {
                setStep(1);
                setWorkflowData({ name: '', trigger: null, action: null, selectedUsers: [] });
            }, 300);
        } catch (error) {
            console.error('Error creating workflow:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    if (step === 1) {
        return <SelectEventModal isOpen={isOpen} onClose={onClose} onNext={handleNextEvent} />;
    }

    if (step === 2) {
        return <SelectActionModal isOpen={isOpen} onClose={onClose} onBack={() => setStep(1)} onNext={handleNextAction} />;
    }

    if (step === 3 && workflowData.action === 'assign-lead') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col p-8 animate-in fade-in zoom-in duration-300 overflow-hidden relative max-h-[90vh]">
                    <div className="relative flex flex-col h-full">
                        <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center mb-6">
                            <UserCircleIcon className="w-6 h-6 text-[#08A698]" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Configure Assignment</h2>
                        <p className="text-[15px] text-gray-500 mt-2 mb-6">Select users for assignment. Selecting multiple enables <b>Round Robin</b>.</p>

                        <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-2 custom-scrollbar">
                            {fetchingUsers ? (
                                <div className="flex items-center justify-center py-10">
                                    <ArrowPathIcon className="w-6 h-6 animate-spin text-teal-500" />
                                </div>
                            ) : users.length === 0 ? (
                                <p className="text-center py-10 text-gray-400 italic">No eligible users found</p>
                            ) : (
                                users.map(user => (
                                    <div
                                        key={user.id}
                                        onClick={() => toggleUser(user.id)}
                                        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${workflowData.selectedUsers.includes(user.id)
                                            ? 'border-[#08A698] bg-teal-50 shadow-sm'
                                            : 'border-gray-100 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 capitalize">
                                                {user.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                            </div>
                                        </div>
                                        {workflowData.selectedUsers.includes(user.id) && (
                                            <CheckCircleIcon className="w-6 h-6 text-[#08A698]" />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="flex-1 px-6 py-3.5 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm transform active:scale-95"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep(4)}
                                disabled={workflowData.selectedUsers.length === 0}
                                className="flex-[2] px-6 py-3.5 bg-[#08A698] hover:bg-teal-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-teal-100 hover:shadow-2xl transition-all disabled:opacity-50 transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col p-8 animate-in fade-in zoom-in duration-300 overflow-hidden relative">
                {/* Decorative background element */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-50 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-50 rounded-full blur-3xl opacity-50" />

                <div className="relative">
                    <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center mb-6">
                        <SparklesIcon className="w-6 h-6 text-[#08A698]" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Name your workflow</h2>
                    <p className="text-[15px] text-gray-500 mt-2 mb-8">Almost there! Finally, give your automation a descriptive name to keep things organized.</p>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Workflow Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#08A698]/5 focus:border-[#08A698] outline-none transition-all text-gray-800 placeholder-gray-400 shadow-sm"
                                placeholder="e.g. Facebook Lead Auto-responder"
                                value={workflowData.name}
                                onChange={(e) => setWorkflowData(prev => ({ ...prev, name: e.target.value }))}
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-inner">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Trigger</p>
                                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2 capitalize">
                                    <div className="w-2 h-2 rounded-full bg-teal-400" />
                                    {workflowData.trigger?.replace(/-/g, ' ')}
                                </p>
                            </div>
                            <div className="border-l border-gray-200 pl-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Action</p>
                                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2 capitalize">
                                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                                    {workflowData.action?.replace(/-/g, ' ')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setStep(workflowData.action === 'assign-lead' ? 3 : 2)}
                                className="flex-1 px-6 py-3.5 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm transform active:scale-95"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] px-6 py-3.5 bg-[#08A698] hover:bg-teal-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-teal-100 hover:shadow-2xl transition-all disabled:opacity-50 transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>Create Workflow</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
