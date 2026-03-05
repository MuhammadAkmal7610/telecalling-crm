import React, { useState, useEffect } from 'react';
import { XMarkIcon, UserCircleIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, BriefcaseIcon, CalendarIcon, PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabaseClient';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function LeadFormModal({ isOpen, onClose, onSuccess }) {
    const [fields, setFields] = useState([]);
    const [users, setUsers] = useState([]);
    const [stages, setStages] = useState([]);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchFields();
            fetchUsers();
            fetchStages();
            setFormData({}); // Reset form
        }
    }, [isOpen]);

    const fetchStages = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await axios.get(`${API_URL}/lead-stages`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            const data = res.data.data?.data || res.data.data || res.data || [];
            setStages(Array.isArray(data) ? data : []);
            // Set default stage if available
            const defaultStage = data.find(s => s.is_default);
            if (defaultStage) {
                setFormData(prev => ({ ...prev, stageId: defaultStage.id }));
            }
        } catch (error) {
            console.error('Error fetching stages:', error);
        }
    };

    const fetchFields = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await axios.get(`${API_URL}/lead-fields`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            const data = res.data.data?.data || res.data.data || res.data || [];
            setFields(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching fields:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await axios.get(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            const data = res.data.data?.data || res.data.data || res.data || [];
            const validUsers = (Array.isArray(data) ? data : []).filter(u => u.role !== 'root' && u.role !== 'billing_admin');
            setUsers(validUsers);
            // Set default assignee to current user
            setFormData(prev => ({ ...prev, assigneeId: session.user.id }));
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Split formData into main fields and custom fields
            const mainFields = ['name', 'phone', 'email', 'altPhone', 'stageId', 'assigneeId', 'source', 'rating', 'campaign_id'];
            const payload = {};
            const customFields = {};

            Object.keys(formData).forEach(key => {
                if (mainFields.includes(key)) {
                    payload[key] = formData[key];
                } else {
                    customFields[key] = formData[key];
                }
            });

            await axios.post(`${API_URL}/leads`, { ...payload, customFields }, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });

            toast.success('Lead added successfully!');
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error adding lead:', error);
            toast.error(error.response?.data?.message || 'Failed to add lead');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const renderIcon = (fieldName) => {
        const n = fieldName.toLowerCase();
        if (n.includes('phone')) return <PhoneIcon className="w-4 h-4" />;
        if (n.includes('email')) return <EnvelopeIcon className="w-4 h-4" />;
        if (n.includes('name')) return <UserCircleIcon className="w-4 h-4" />;
        if (n.includes('city') || n.includes('address')) return <MapPinIcon className="w-4 h-4" />;
        if (n.includes('job') || n.includes('title')) return <BriefcaseIcon className="w-4 h-4" />;
        if (n.includes('age') || n.includes('date')) return <CalendarIcon className="w-4 h-4" />;
        return <PlusIcon className="w-4 h-4" />;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-teal-50/30">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Add New Lead</h2>
                        <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest">Dynamic Form Submission</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all text-gray-400 hover:text-red-500 shadow-sm">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {fields.filter(f => f.show_in_quick_add).sort((a, b) => a.position - b.position).map((field) => (
                            <div key={field.id} className="space-y-1.5 group">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-1.5 group-focus-within:text-[#08A698] transition-colors">
                                    {renderIcon(field.name)}
                                    {field.label}
                                    {field.is_default && <span className="text-red-500 font-black text-xs">*</span>}
                                </label>
                                <div className="relative">
                                    <input
                                        type={field.type === 'number' ? 'number' : 'text'}
                                        required={field.is_default}
                                        value={formData[field.name] || ''}
                                        onChange={(e) => handleChange(field.name, e.target.value)}
                                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#08A698] focus:bg-white focus:ring-4 focus:ring-[#08A698]/5 transition-all outline-none"
                                    />
                                    {formData[field.name] && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#08A698] shadow-[0_0_8px_rgba(8,166,152,0.8)]" />}
                                </div>
                            </div>
                        ))}

                        {/* Lead Source Dropdown */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
                                <FunnelIcon className="w-4 h-4" /> Lead Source <span className="text-red-500 font-black text-xs">*</span>
                            </label>
                            <select
                                value={formData.source || ''}
                                onChange={e => handleChange('source', e.target.value)}
                                required
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#08A698] focus:bg-white transition-all outline-none appearance-none"
                            >
                                <option value="">Select Source</option>
                                <option value="Facebook">Facebook</option>
                                <option value="Website">Website</option>
                                <option value="WhatsApp">WhatsApp</option>
                                <option value="Referral">Referral</option>
                                <option value="Manual">Manual</option>
                                <option value="Import">Import</option>
                                <option value="IndiaMART">IndiaMART</option>
                                <option value="Justdial">Justdial</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
                                <FunnelIcon className="w-4 h-4" /> Pipeline Stage
                            </label>
                            <select
                                value={formData.stageId || ''}
                                onChange={(e) => handleChange('stageId', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#08A698] focus:bg-white transition-all outline-none appearance-none"
                            >
                                <option value="">Select Stage</option>
                                {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
                                <UserCircleIcon className="w-4 h-4" /> Assign To
                            </label>
                            <select
                                value={formData.assigneeId || ''}
                                onChange={(e) => handleChange('assigneeId', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#08A698] focus:bg-white transition-all outline-none appearance-none"
                            >
                                <option value="">Select Assignee</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[3px] text-center mb-1">Status Preview</p>
                        <div className="flex justify-center gap-4">
                            <span className="px-3 py-1 bg-[#08A698] text-white text-[10px] font-black rounded-lg shadow-md shadow-teal-100 uppercase tracking-widest">Fresh Lead</span>
                            <span className="px-3 py-1 bg-white border border-gray-200 text-gray-400 text-[10px] font-bold rounded-lg uppercase tracking-widest">Auto Assigned</span>
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-10 py-2.5 bg-[#08A698] hover:bg-teal-700 text-white rounded-xl font-black text-sm shadow-xl shadow-teal-100 hover:shadow-2xl transition-all disabled:opacity-50 transform active:scale-95 flex items-center gap-2"
                    >
                        {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : 'Save Lead'}
                    </button>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
            `}</style>
        </div>
    );
}
