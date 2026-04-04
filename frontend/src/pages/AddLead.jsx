
import { useState, useEffect } from 'react';
import WorkspaceGuard from '../components/WorkspaceGuard';
import { supabase } from '../lib/supabaseClient';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNotification } from '../context/NotificationContext';
import { useApi } from '../hooks/useApi';
import { useWorkspace } from '../context/WorkspaceContext';
import {
    MagnifyingGlassIcon,
    ArrowTopRightOnSquareIcon,
    Bars3Icon,
    VariableIcon,
    PhoneIcon,
    UserCircleIcon,
    FunnelIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/**
 * Helper to create axios instance with auth and workspace headers
 */
const createAuthAxios = async (workspaceId) => {
    const { data: { session } } = await supabase.auth.getSession();
    return axios.create({
        headers: {
            'Authorization': `Bearer ${session?.access_token || ''}`,
            'x-workspace-id': workspaceId || '',
        },
    });
};

// State for sidebar
let sidebarOpen = false;
function setSidebarOpen(open) { sidebarOpen = open; }

// Reusable Input Component - Moved outside to prevent re-creation on each render
const InputField = ({ label, placeholder, icon: Icon, type = "text", value, onChange, required = false }) => (
    <div className="mb-5">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#08A698]">
                {Icon && <Icon className="h-4 w-4 text-gray-400 group-focus-within:text-[#08A698]" />}
            </div>
            <input
                type={type}
                value={value || ''}
                onChange={onChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-[#08A698] focus:ring-1 focus:ring-[#08A698] transition-all bg-white text-gray-700 shadow-sm hover:border-gray-300"
                placeholder={placeholder}
            />
        </div>
    </div>
);

// Reusable Select Component - Moved outside to prevent re-creation on each render
const SelectField = ({ label, options, value, onChange, icon: Icon = Bars3Icon, required = false }) => (
    <div className="mb-5">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon className="h-4 w-4 text-gray-400 group-focus-within:text-[#08A698]" />
            </div>
            <select
                value={value || ''}
                onChange={onChange}
                className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#08A698] focus:ring-1 focus:ring-[#08A698] transition-all bg-white appearance-none cursor-pointer shadow-sm hover:border-gray-300"
            >
                <option value="">Select</option>
                {options.map((opt, idx) => (
                    <option key={idx} value={opt.id || opt}>{opt.name || opt}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-xs">▼</span>
            </div>
        </div>
    </div>
);

export default function AddLead() {
    const { apiFetch } = useApi();
    const { currentWorkspace } = useWorkspace();
    const { success: notifySuccess, error: notifyError, warning: notifyWarning } = useNotification();
    const [loading, setLoading] = useState(false);
    const [fields, setFields] = useState([]);
    const [users, setUsers] = useState([]);
    const [stages, setStages] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        altPhone: '', // Backend uses altPhone camelCase in LeadFormModal
        email: '',
        source: '',
        stageId: '',
        assigneeId: '',
    });

    useEffect(() => {
        fetchFields();
        fetchUsers();
        fetchStages();
    }, []);

    const fetchStages = async () => {
        try {
            const workspaceId = currentWorkspace?.id || localStorage.getItem('crm_workspace_id');
            if (!workspaceId) return;
            const axiosInstance = await createAuthAxios(workspaceId);
            const res = await axiosInstance.get(`${API_URL}/lead-stages`);
            const data = res.data.data?.data || res.data.data || res.data || [];
            setStages(Array.isArray(data) ? data : []);
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
            const workspaceId = currentWorkspace?.id || localStorage.getItem('crm_workspace_id');
            if (!workspaceId) return;
            const axiosInstance = await createAuthAxios(workspaceId);
            const res = await axiosInstance.get(`${API_URL}/lead-fields`);
            const data = res.data.data?.data || res.data.data || res.data || [];
            setFields(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching fields:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const workspaceId = currentWorkspace?.id || localStorage.getItem('crm_workspace_id');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const axiosInstance = await createAuthAxios(workspaceId);
            const res = await axiosInstance.get(`${API_URL}/users/team`);
            const data = res.data || [];
            const validUsers = (Array.isArray(data) ? data : []).filter(u => u.role !== 'root' && u.role !== 'billing_admin');
            setUsers(validUsers);
            setFormData(prev => ({ ...prev, assigneeId: session.user.id }));
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) {
            toast.error('Name and Phone are required');
            notifyWarning('Missing Information', 'Please fill in the required fields (Name and Phone).');
            return;
        }

        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error('Session expired. Please login again.');
                notifyError('Session Expired', 'Please login again to continue.');
                return;
            }

            // Get workspace ID
            const workspaceId = currentWorkspace?.id || localStorage.getItem('crm_workspace_id');
            if (!workspaceId) {
                toast.error('Please select a workspace first.');
                notifyError('No Workspace', 'Please select a workspace before adding a lead.');
                setLoading(false);
                return;
            }

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

            const response = await fetch(`${API_URL}/leads`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                    'x-workspace-id': workspaceId
                },
                body: JSON.stringify({ ...payload, customFields })
            });

            if (response.ok) {
                toast.success('Lead added successfully!');
                notifySuccess(
                    'Lead Created Successfully!',
                    `${formData.name} has been added to your pipeline.`
                );
                setFormData({
                    name: '',
                    phone: '',
                    altPhone: '',
                    email: '',
                    source: '',
                    stageId: stages.find(s => s.is_default)?.id || '',
                    assigneeId: session.user.id
                });
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to add lead');
                notifyError('Failed to Add Lead', error.message || 'Please check the information and try again.');
            }
        } catch (error) {
            console.error('Error adding lead:', error);
            toast.error('An error occurred. Please try again.');
            notifyError('Connection Error', 'Unable to add lead. Please check your internet connection.');
        } finally {
            setLoading(false);
        }
    };

    const renderIcon = (fieldName) => {
        const n = fieldName.toLowerCase();
        if (n.includes('phone')) return PhoneIcon;
        if (n.includes('email')) return EnvelopeIcon;
        if (n.includes('name')) return UserCircleIcon;
        return VariableIcon;
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto bg-gray-50/50">
                    <WorkspaceGuard>
                        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4 py-8 lg:px-8">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-gray-900">Add Leads</h1>
                                <p className="text-sm text-gray-500 mt-1">Add individual leads to your CRM manually.</p>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-10 space-y-8">
                                <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-2">
                                    <h2 className="text-lg font-bold text-gray-800">Add New Lead</h2>
                                    <span className="bg-teal-50 text-[#08A698] text-xs font-bold px-2 py-0.5 rounded border border-teal-100">Details</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                    {/* Map dynamic fields that are set to show in quick add (default fields) */}
                                    {fields.filter(f => f.show_in_quick_add).sort((a, b) => a.position - b.position).map((field) => (
                                        field.name === 'phone' ? (
                                            <div key={field.id} className="mb-5">
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">
                                                    {field.label} <span className="text-red-500">*</span>
                                                </label>
                                                <div className="flex group relative">
                                                    <div className="flex items-center justify-center px-4 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-gray-600 text-sm group-focus-within:border-[#08A698] transition-colors">
                                                        <span className="text-lg mr-1 ml-1 leading-none">🇵🇰</span>
                                                        <span className="font-semibold">+92</span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={formData[field.name] || ''}
                                                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                        placeholder="300 1234567"
                                                        className="flex-1 block w-full px-4 py-3 border border-gray-200 bg-white rounded-r-lg text-sm placeholder-gray-400 focus:outline-none focus:border-[#08A698] focus:ring-1 focus:ring-[#08A698] transition-all text-gray-700 shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <InputField
                                                key={field.id}
                                                label={field.label}
                                                placeholder={`Enter ${field.label.toLowerCase()}...`}
                                                icon={renderIcon(field.name)}
                                                value={formData[field.name]}
                                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                required={field.name === 'name'}
                                            />
                                        )
                                    ))}

                                    <SelectField
                                        label="Lead Source"
                                        options={["Facebook", "Website", "WhatsApp", "Referral", "Manual", "Import", "IndiaMART", "Justdial"]}
                                        value={formData.source}
                                        onChange={(e) => handleInputChange('source', e.target.value)}
                                        icon={FunnelIcon}
                                    />
                                    
                                    <SelectField
                                        label="Pipeline Stage"
                                        options={stages}
                                        value={formData.stageId}
                                        onChange={(e) => handleInputChange('stageId', e.target.value)}
                                        icon={FunnelIcon}
                                    />

                                    <SelectField
                                        label="Assign To"
                                        options={users}
                                        value={formData.assigneeId}
                                        onChange={(e) => handleInputChange('assigneeId', e.target.value)}
                                        icon={UserCircleIcon}
                                    />
                                </div>

                                <div className="pt-8 flex justify-center sticky bottom-0 bg-white/95 backdrop-blur-sm p-4 border-t border-gray-100 -mx-6 -mb-6 lg:-mx-10 lg:-mb-10 rounded-b-xl z-20">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-[#08A698] text-white px-16 py-3.5 rounded-lg text-sm font-bold tracking-wide hover:bg-teal-700 transition-all duration-300 shadow-lg shadow-teal-100 transform hover:-translate-y-0.5 disabled:opacity-50"
                                    >
                                        {loading ? 'ADDING...' : '+ ADD LEAD'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </WorkspaceGuard>
                </main>
            </div>
        </div>
    );
}
