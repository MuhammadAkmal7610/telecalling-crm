import React, { useState } from 'react';
import SelectEventModal from './SelectEventModal';
import SelectActionModal from './SelectActionModal';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function WorkflowWizard({ isOpen, onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    const [workflowData, setWorkflowData] = useState({
        name: '',
        trigger: null,
        action: null
    });
    const [loading, setLoading] = useState(false);

    const handleNextEvent = (eventId) => {
        setWorkflowData(prev => ({ ...prev, trigger: eventId }));
        setStep(2);
    };

    const handleNextAction = (actionId) => {
        setWorkflowData(prev => ({ ...prev, action: actionId }));
        setStep(3);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!workflowData.name) {
            toast.error('Please enter a name for the workflow');
            return;
        }

        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`${API_URL}/workflows`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    name: workflowData.name,
                    trigger: { text: workflowData.trigger, icon: 'chat' }, // Simplified for now
                    action: { text: workflowData.action, icon: 'phone' }   // Simplified for now
                })
            });

            if (!res.ok) throw new Error('Failed to create workflow');

            toast.success('Workflow created successfully');
            onSuccess();
            onClose();
            // Reset wizard after a delay to avoid flicker
            setTimeout(() => {
                setStep(1);
                setWorkflowData({ name: '', trigger: null, action: null });
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
                                onClick={() => setStep(2)}
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
