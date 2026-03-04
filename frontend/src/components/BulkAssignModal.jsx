import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, UserGroupIcon, CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabaseClient';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function BulkAssignModal({ isOpen, onClose, selectedLeadIds, onSuccess }) {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingUsers, setFetchingUsers] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            setSelectedUserId('');
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        setFetchingUsers(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await axios.get(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            const userData = res.data.data?.data || res.data.data || res.data || [];
            const validUsers = (Array.isArray(userData) ? userData : []).filter(u => u.role !== 'root' && u.role !== 'billing_admin');
            setUsers(validUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setFetchingUsers(false);
        }
    };

    const handleBulkAssign = async () => {
        if (!selectedUserId) return toast.error('Please select a user');
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            await axios.patch(`${API_URL}/leads/bulk-assign`, {
                leadIds: selectedLeadIds,
                assigneeId: selectedUserId
            }, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });

            toast.success(`Successfully assigned ${selectedLeadIds.length} leads!`);
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Bulk assignment error:', error);
            toast.error(error.response?.data?.message || 'Failed to assign leads');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition.Root show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-[60]" onClose={onClose}>
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <UserGroupIcon className="h-6 w-6 text-[#08A698]" aria-hidden="true" />
                                        </div>
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                            <Dialog.Title as="h3" className="text-base font-bold leading-6 text-gray-900">
                                                Bulk Assign Leads
                                            </Dialog.Title>
                                            <div className="mt-2 text-sm text-gray-500">
                                                Assigning <span className="font-bold text-[#08A698]">{selectedLeadIds?.length || 0}</span> selected leads to a team member.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-4">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            Select Team Member
                                        </label>
                                        <div className="relative group">
                                            <select
                                                value={selectedUserId}
                                                onChange={(e) => setSelectedUserId(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#08A698] focus:bg-white focus:ring-4 focus:ring-[#08A698]/5 transition-all outline-none appearance-none cursor-pointer"
                                                disabled={fetchingUsers}
                                            >
                                                <option value="">Choose a user...</option>
                                                {users.map(u => (
                                                    <option key={u.id} value={u.id}>
                                                        {u.name} ({u.role || 'User'})
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                        {fetchingUsers && (
                                            <p className="text-xs text-teal-600 animate-pulse">Loading team members...</p>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
                                    <button
                                        type="button"
                                        disabled={loading || !selectedUserId}
                                        className="inline-flex w-full justify-center rounded-xl bg-[#08A698] px-8 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-teal-700 sm:w-auto transition-all active:scale-95 disabled:opacity-50"
                                        onClick={handleBulkAssign}
                                    >
                                        {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Confirm Assignment'}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-8 py-2.5 text-sm font-bold text-gray-600 border border-gray-200 shadow-sm hover:bg-gray-50 sm:mt-0 sm:w-auto transition-all"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
