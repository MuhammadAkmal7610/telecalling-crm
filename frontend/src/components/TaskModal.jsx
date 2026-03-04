import React, { Fragment, useState, useEffect } from 'react';
import { XMarkIcon, CalendarIcon, UserIcon, FlagIcon, ListBulletIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { Dialog, Transition } from '@headlessui/react';
export default function TaskModal({ isOpen, onClose, onSuccess, leadId = null, leadName = null, initialType = 'Todo' }) {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        description: '',
        type: initialType,
        status: 'Pending',
        priority: 'Medium',
        dueDate: '',
        assigneeId: '',
        leadId: leadId || ''
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            setFormData(prev => ({
                ...prev,
                type: initialType,
                leadId: leadId || ''
            }));
        }
    }, [isOpen, leadId, initialType]);

    const fetchUsers = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`${API_URL}/users`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (res.ok) {
                const result = await res.json();
                const userList = result.data?.data || result.data || [];
                const validUsers = (Array.isArray(userList) ? userList : []).filter(u => u.role !== 'root' && u.role !== 'billing_admin');
                setUsers(validUsers);

                // Optional: Set default assignee logic here if needed
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.description) return toast.error('Description is required');

        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return toast.error('Session expired, please login again');

            const res = await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    ...formData,
                    leadId: formData.leadId && formData.leadId !== "" ? formData.leadId : null,
                    dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
                })
            });

            if (res.ok) {
                toast.success('Task created successfully!');
                setFormData({
                    description: '',
                    type: 'Todo',
                    status: 'Pending',
                    priority: 'Medium',
                    dueDate: '',
                    assigneeId: '',
                    leadId: ''
                });
                onSuccess?.();
                onClose();
            } else {
                const error = await res.json();
                toast.error(error.message || 'Failed to create task');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[60]" onClose={onClose}>
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
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-gray-100">
                                <div className="bg-[#F8F9FA] border-b border-gray-200 px-6 py-5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#08A698] rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-100">
                                            {formData.type === 'CallFollowup' ? <PhoneIcon className="w-6 h-6" /> : <ListBulletIcon className="w-6 h-6" />}
                                        </div>
                                        <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                                            {formData.type === 'CallFollowup' ? 'Schedule Followup' : 'Create New Task'}
                                            {leadName && <span className="block text-xs font-medium text-gray-500 mt-0.5">For: {leadName}</span>}
                                        </Dialog.Title>
                                    </div>
                                    <button
                                        type="button"
                                        className="p-2 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
                                        onClick={onClose}
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                                    {/* Task Type Toggle */}
                                    {!leadId && (
                                        <div className="flex bg-gray-100 p-1 rounded-xl">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type: 'Todo' })}
                                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.type === 'Todo' ? 'bg-white text-[#08A698] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                General Todo
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type: 'CallFollowup' })}
                                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.type === 'CallFollowup' ? 'bg-white text-[#08A698] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                Call Followup
                                            </button>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Description</label>
                                            <textarea
                                                rows={3}
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="What needs to be done?"
                                                className="w-full text-sm p-4 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-50 focus:border-[#08A698] transition-all resize-none bg-gray-50/30"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Due Date & Time</label>
                                                <div className="relative">
                                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="datetime-local"
                                                        value={formData.dueDate}
                                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                                        className="w-full text-sm pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white outline-none focus:border-[#08A698] transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Priority</label>
                                                <div className="relative">
                                                    <FlagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <select
                                                        value={formData.priority}
                                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                        className="w-full text-sm pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white outline-none focus:border-[#08A698] transition-all appearance-none"
                                                    >
                                                        <option>Urgent</option>
                                                        <option>High</option>
                                                        <option>Medium</option>
                                                        <option>Low</option>
                                                        <option>None</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Assign To</label>
                                            <div className="relative">
                                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <select
                                                    value={formData.assigneeId}
                                                    onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                                                    className="w-full text-sm pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white outline-none focus:border-[#08A698] transition-all appearance-none"
                                                >
                                                    <option value="">Me (Default)</option>
                                                    {users && users.map(u => (
                                                        <option key={u.id} value={u.id}>{u.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 flex items-center justify-end gap-3 mt-8">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-[#08A698] text-white px-8 py-2.5 rounded-xl text-sm font-black hover:bg-[#078F82] shadow-lg shadow-teal-100 disabled:opacity-50 transition-all flex items-center gap-2"
                                        >
                                            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (formData.type === 'CallFollowup' ? 'Set Followup' : 'Create Task')}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
