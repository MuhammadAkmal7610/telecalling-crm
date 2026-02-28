import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, MegaphoneIcon, UserGroupIcon, FlagIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function CampaignModal({ isOpen, onClose, onSuccess }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) return toast.error('Campaign name is required');

        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('No session');

            const res = await fetch(`${API_URL}/campaigns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    name,
                    description,
                    priority,
                    status: 'Active'
                })
            });

            if (!res.ok) throw new Error('Failed to create campaign');

            toast.success('Campaign created successfully!');
            setName('');
            setDescription('');
            setPriority('Medium');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

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
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
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
                                {/* Header */}
                                <div className="bg-[#F8F9FA] border-b border-gray-200 px-6 py-5 flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-100">
                                            <MegaphoneIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-xl font-bold text-gray-900">
                                                Create Campaign
                                            </Dialog.Title>
                                            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-black">Outreach Program</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="p-2 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
                                        onClick={onClose}
                                    >
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                    {/* Campaign Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <DocumentTextIcon className="w-4 h-4 text-[#08A698]" /> Campaign Name
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g., Summer Outreach 2024"
                                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-50 focus:border-[#08A698] transition-all placeholder:text-gray-300"
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            Description (Optional)
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="What is this campaign about?"
                                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-50 focus:border-[#08A698] transition-all placeholder:text-gray-300 h-24 resize-none"
                                        />
                                    </div>

                                    {/* Priority Toggle */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <FlagIcon className="w-4 h-4 text-[#08A698]" /> Priority Level
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['Low', 'Medium', 'High'].map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setPriority(p)}
                                                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${priority === p
                                                        ? p === 'High' ? 'bg-rose-50 border-rose-200 text-rose-600' : p === 'Medium' ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-teal-50 border-teal-200 text-teal-600'
                                                        : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="pt-4 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 py-3 bg-[#08A698] text-white rounded-xl text-sm font-black hover:bg-[#078F82] shadow-lg shadow-teal-100 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Creating...' : 'Create Campaign'}
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
