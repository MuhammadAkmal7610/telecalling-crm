import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import WorkspaceGuard from '../components/WorkspaceGuard';
import { supabase } from '../lib/supabaseClient';
import {
    ArrowPathIcon,
    Bars2Icon,
    PencilIcon,
    EyeSlashIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    PhoneIcon,
    EnvelopeIcon,
    DocumentTextIcon,
    HashtagIcon,
    ChevronDownIcon,
    EllipsisVerticalIcon,
    XMarkIcon,
    InformationCircleIcon,
    ArrowDownTrayIcon,
    LockClosedIcon,
    CodeBracketIcon,
    ArrowRightIcon,
    ArrowsRightLeftIcon,
    ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const Toggle = ({ enabled, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#08A698] focus:ring-offset-2 ${enabled ? 'bg-[#08A698]' : 'bg-gray-300'}`}
    >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);

const FieldModal = ({ isOpen, onClose, mode = 'edit', field, onSave }) => {
    if (!isOpen) return null;

    const isCreate = mode === 'create';
    const [formData, setFormData] = useState(field || {
        name: '',
        label: '',
        type: 'text',
        show_in_import: true,
        show_in_quick_add: true,
        lock_after_create: false,
        can_use_variable: false,
        is_searchable: true
    });

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">{isCreate ? 'Create Field' : 'Edit Field'}</h2>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                        <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-[#08A698] rounded-lg hover:bg-[#068f82] transition-colors shadow-sm shadow-[#08A698]/20">Save</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">Display Label</label>
                            <input
                                type="text"
                                value={formData.label}
                                onChange={e => setFormData({ ...formData, label: e.target.value, name: isCreate ? e.target.value.toLowerCase().replace(/\s+/g, '_') : formData.name })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#08A698] focus:border-[#08A698]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                disabled={!isCreate}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#08A698] focus:border-[#08A698]"
                            >
                                <option value="text">Text</option>
                                <option value="tel">Phone</option>
                                <option value="email">Email</option>
                                <option value="number">Number</option>
                                <option value="select">Dropdown</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900">Properties</h3>
                        <div className="space-y-4 pl-1">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-600">Show in import</span>
                                <Toggle enabled={formData.show_in_import} onChange={v => setFormData({ ...formData, show_in_import: v })} />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-600">Show in quick add</span>
                                <Toggle enabled={formData.show_in_quick_add} onChange={v => setFormData({ ...formData, show_in_quick_add: v })} />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-600">Searchable</span>
                                <Toggle enabled={formData.is_searchable} onChange={v => setFormData({ ...formData, is_searchable: v })} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FieldRow = ({ field, onEdit, onDelete }) => {
    const Icon = field.type === 'tel' ? PhoneIcon : field.type === 'email' ? EnvelopeIcon : DocumentTextIcon;
    return (
        <div className="group flex items-center bg-white border border-gray-100 p-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg -mb-px relative z-0 hover:z-10">
            <div className="flex items-center gap-4 flex-1">
                <div className="w-8 h-8 flex items-center justify-center text-gray-400">
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{field.label} {field.is_default && <span className="ml-2 text-[10px] text-teal-600 font-bold bg-teal-50 px-1.5 py-0.5 rounded uppercase">Default</span>}</span>
                    <span className="text-xs text-gray-400">{field.type} | {field.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2 pl-4">
                <button onClick={() => onEdit(field)} className="p-1.5 text-gray-400 hover:text-[#08A698] rounded-full hover:bg-[#08A698]/5 transition-colors"><PencilIcon className="w-4 h-4" /></button>
            </div>
        </div>
    );
};

export default function LeadFields() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalState, setModalState] = useState({ isOpen: false, mode: 'edit', field: null });

    useEffect(() => {
        fetchFields();
    }, []);

    const fetchFields = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch(`${API_URL}/lead-fields`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const result = await res.json();
            const data = result.data?.data || result.data || [];
            setFields(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching fields:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (formData) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const method = modalState.mode === 'create' ? 'POST' : 'PATCH';
            const url = modalState.mode === 'create' ? `${API_URL}/lead-fields` : `${API_URL}/lead-fields/${formData.id}`;

            await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            setModalState({ isOpen: false, mode: 'edit', field: null });
            fetchFields();
        } catch (error) {
            console.error('Error saving field:', error);
        }
    };

    const primaryFields = fields.filter(f => f.is_default);
    const otherFields = fields.filter(f => !f.is_default);

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <FieldModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, mode: 'edit', field: null })}
                mode={modalState.mode}
                field={modalState.field}
                onSave={handleSave}
            />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <WorkspaceGuard>
                        <div className="max-w-5xl mx-auto space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        Fields Settings
                                        <button onClick={fetchFields} className="p-1 text-gray-400 hover:text-[#08A698] hover:bg-[#08A698]/5 rounded-full transition-colors">
                                            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </h1>
                                </div>
                                <button onClick={() => setModalState({ isOpen: true, mode: 'create', field: null })} className="bg-[#08A698] hover:bg-[#068f82] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                                    <PlusIcon className="w-4 h-4" /> Add a new field
                                </button>
                            </div>

                            <div>
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Primary Fields</h2>
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
                                    {primaryFields.map(f => (<FieldRow key={f.id} field={f} onEdit={f => setModalState({ isOpen: true, mode: 'edit', field: f })} />))}
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Other Fields</h2>
                                {otherFields.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 italic bg-white rounded-lg border border-dashed border-gray-200">No custom fields created yet</div>
                                ) : (
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
                                        {otherFields.map(f => (<FieldRow key={f.id} field={f} onEdit={f => setModalState({ isOpen: true, mode: 'edit', field: f })} />))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </WorkspaceGuard>
                </main>
            </div>
        </div>
    );
}
