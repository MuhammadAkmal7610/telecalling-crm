import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import WorkspaceGuard from '../components/WorkspaceGuard';
import ConfirmModal from '../components/ConfirmModal';
import { useApi } from '../hooks/useApi';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
    ArrowPathIcon, 
    PlusIcon, 
    ArrowTopRightOnSquareIcon, 
    BeakerIcon, 
    XMarkIcon, 
    PencilIcon, 
    TrashIcon,
    Bars3Icon,
    KeyIcon,
    VariableIcon,
    LinkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function ApiTemplates() {
    const { apiFetch } = useApi();
    const { currentWorkspace } = useWorkspace();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentTemplate, setCurrentTemplate] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        endpoint: '',
        method: 'POST',
        variables: [''],
        headers: [{ key: '', value: '' }],
        workflow_id: ''
    });

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/api-templates');
            const result = await res.json();
            const dataArray = result.data || result;
            setTemplates(Array.isArray(dataArray) ? dataArray : []);
        } catch (error) {
            console.error('Error fetching API templates:', error);
            toast.error('Failed to load API templates');
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkflows = async () => {
        try {
            const res = await apiFetch('/workflows');
            const result = await res.json();
            const dataArray = result.data || result;
            setWorkflows(Array.isArray(dataArray) ? dataArray : []);
        } catch (error) {
            console.error('Error fetching workflows:', error);
        }
    };

    useEffect(() => {
        if (currentWorkspace?.id) {
            fetchTemplates();
            fetchWorkflows();
        }
    }, [currentWorkspace?.id]);

    const handleOpenModal = (mode, template = null) => {
        setModalMode(mode);
        setCurrentTemplate(template);
        if (template) {
            // Map headers object to key-value array
            const headerArray = Object.entries(template.headers || {}).map(([key, value]) => ({ key, value }));
            setFormData({
                name: template.name || '',
                endpoint: template.endpoint || '',
                method: template.method || 'POST',
                variables: Array.isArray(template.variables) ? [...template.variables] : [''],
                headers: headerArray.length > 0 ? headerArray : [{ key: '', value: '' }],
                workflow_id: template.workflow_id || ''
            });
        } else {
            setFormData({
                name: '',
                endpoint: '',
                method: 'POST',
                variables: [''],
                headers: [{ key: '', value: '' }],
                workflow_id: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentTemplate(null);
    };

    const handleAddVariable = () => {
        setFormData(prev => ({ ...prev, variables: [...prev.variables, ''] }));
    };

    const handleRemoveVariable = (index) => {
        setFormData(prev => ({
            ...prev,
            variables: prev.variables.filter((_, i) => i !== index)
        }));
    };

    const handleVariableChange = (index, value) => {
        const newVars = [...formData.variables];
        newVars[index] = value;
        setFormData(prev => ({ ...prev, variables: newVars }));
    };

    const handleAddHeader = () => {
        setFormData(prev => ({ ...prev, headers: [...prev.headers, { key: '', value: '' }] }));
    };

    const handleRemoveHeader = (index) => {
        setFormData(prev => ({
            ...prev,
            headers: prev.headers.filter((_, i) => i !== index)
        }));
    };

    const handleHeaderChange = (index, field, value) => {
        const newHeaders = [...formData.headers];
        newHeaders[index][field] = value;
        setFormData(prev => ({ ...prev, headers: newHeaders }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clean up variables and headers
        const cleanVars = formData.variables.filter(v => v.trim() !== '');
        const cleanHeaders = {};
        formData.headers.forEach(h => {
            if (h.key.trim() && h.value.trim()) {
                cleanHeaders[h.key.trim()] = h.value.trim();
            }
        });

        const payload = {
            ...formData,
            variables: cleanVars,
            headers: cleanHeaders
        };

        try {
            const url = modalMode === 'edit' ? `/api-templates/${currentTemplate.id}` : '/api-templates';
            const method = modalMode === 'edit' ? 'PATCH' : 'POST';
            
            const res = await apiFetch(url, {
                method,
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(`Template ${modalMode === 'edit' ? 'updated' : 'created'} successfully`);
                fetchTemplates();
                handleCloseModal();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Failed to save template');
            }
        } catch (error) {
            console.error('Error saving template:', error);
            toast.error('An error occurred while saving');
        }
    };

    const handleDeleteClick = (id) => {
        setItemToDelete(id);
        setIsConfirmOpen(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await apiFetch(`/api-templates/${itemToDelete}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Template deleted');
                fetchTemplates();
            } else {
                toast.error('Failed to delete template');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete template');
        } finally {
            setIsDeleting(false);
            setIsConfirmOpen(false);
            setItemToDelete(null);
        }
    };

    const getTimeAgo = (date) => {
        if (!date) return 'N/A';
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "Y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return "Just now";
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto px-6 py-8 md:p-8 bg-gray-50/50">
                    <WorkspaceGuard>
                        <div className="mx-auto max-w-7xl">

                            {/* Page Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-bold text-gray-900">API Templates</h1>
                                        <button 
                                            onClick={fetchTemplates}
                                            disabled={loading}
                                            className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                                        >
                                            <ArrowPathIcon className={`w-5 h-5 text-gray-400 hover:text-gray-600 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">Configure and reuse API templates for your integrations</p>
                                </div>
                                <button 
                                    onClick={() => handleOpenModal('create')}
                                    className="bg-[#08A698] hover:bg-[#078F82] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                                >
                                    <PlusIcon className="w-5 h-5" /> Create Template
                                </button>
                            </div>

                            {/* Table */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                {loading && templates.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                        <p className="text-gray-500 text-sm italic">Loading API templates...</p>
                                    </div>
                                ) : templates.length === 0 ? (
                                    <div className="py-24 text-center px-4">
                                        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <BeakerIcon className="w-8 h-8 text-teal-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">No API templates yet</h3>
                                        <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">Create reusable API templates to trigger outbound webhooks or notifications when leads move stages.</p>
                                        <button 
                                            onClick={() => handleOpenModal('create')}
                                            className="text-[#08A698] font-semibold text-sm hover:underline flex items-center gap-1 mx-auto"
                                        >
                                            <PlusIcon className="w-4 h-4" /> Create your first template
                                        </button>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50/80 text-gray-500 font-medium border-b border-gray-100">
                                                <tr>
                                                    <th className="px-6 py-4 font-semibold">Template Name</th>
                                                    <th className="px-6 py-4 font-semibold">Endpoint Details</th>
                                                    <th className="px-6 py-4 font-semibold">Variables</th>
                                                    <th className="px-6 py-4 font-semibold">Associated Workflow</th>
                                                    <th className="px-6 py-4 font-semibold text-right">Last Modified</th>
                                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {templates.map((template) => (
                                                    <tr key={template.id} className="group hover:bg-teal-50/10 transition-colors">
                                                        <td className="px-6 py-5">
                                                            <div 
                                                                onClick={() => handleOpenModal('edit', template)}
                                                                className="font-semibold text-gray-900 group-hover:text-[#08A698] transition-colors cursor-pointer"
                                                            >
                                                                {template.name}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 text-gray-400">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">{template.method}</span>
                                                                <code className="text-[11px] bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-200 font-mono block w-fit max-w-[220px] truncate" title={template.endpoint}>
                                                                    {template.endpoint}
                                                                </code>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex gap-1.5 flex-wrap">
                                                                {(Array.isArray(template.variables) ? template.variables : []).slice(0, 2).map((v, i) => (
                                                                    <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-mono border border-gray-200">{v}</span>
                                                                ))}
                                                                {template.variables?.length > 2 && (
                                                                    <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded text-[10px] font-mono border border-teal-100 font-semibold">+{template.variables.length - 2}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`w-2 h-2 rounded-full ${template.workflow ? 'bg-teal-400' : 'bg-gray-300'}`}></span>
                                                                <span className="text-gray-700 font-medium">{template.workflow?.name || 'No Workflow'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <div className="flex flex-col items-end gap-0.5">
                                                                <span className="text-gray-900 font-medium whitespace-nowrap">{getTimeAgo(template.updated_at || template.created_at)}</span>
                                                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                                    by <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-[9px] border border-gray-200">
                                                                        {template.creator?.name?.[0]?.toUpperCase() || 'U'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button 
                                                                    onClick={() => handleOpenModal('edit', template)}
                                                                    className="p-2 text-gray-400 hover:text-[#08A698] hover:bg-teal-50 rounded-lg transition-colors border border-gray-200 hover:border-teal-100" 
                                                                    title="Edit"
                                                                >
                                                                    <PencilIcon className="w-4 h-4" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteClick(template.id)}
                                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 hover:border-red-100" 
                                                                    title="Delete"
                                                                >
                                                                    <TrashIcon className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                        </div>
                    </WorkspaceGuard>
                </main>
            </div>

            {/* Template Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <h3 className="text-lg font-bold text-gray-900">
                                {modalMode === 'create' ? 'Create API Template' : 'Edit API Template'}
                            </h3>
                            <button onClick={handleCloseModal} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                                <XMarkIcon className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                            
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <Bars3Icon className="w-4 h-4" /> Basic Information
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Template Name</label>
                                        <input 
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            placeholder="e.g. Lead Forwarding Webhook"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none text-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex gap-2">
                                        <div className="w-24 shrink-0">
                                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Method</label>
                                            <select 
                                                value={formData.method}
                                                onChange={(e) => setFormData({...formData, method: e.target.value})}
                                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none text-sm appearance-none"
                                            >
                                                <option value="POST">POST</option>
                                                <option value="GET">GET</option>
                                                <option value="PUT">PUT</option>
                                                <option value="PATCH">PATCH</option>
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Endpoint (URL)</label>
                                            <input 
                                                type="url"
                                                value={formData.endpoint}
                                                onChange={(e) => setFormData({...formData, endpoint: e.target.value})}
                                                placeholder="https://api.receiver.com/webhook"
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-50" />

                            {/* Variables Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <VariableIcon className="w-4 h-4" /> Dynamic Variables
                                    </h4>
                                    <button 
                                        onClick={handleAddVariable}
                                        className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                                    >
                                        <PlusIcon className="w-3 h-3" /> Add Variable
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {formData.variables.map((variable, idx) => (
                                        <div key={idx} className="relative group">
                                            <input 
                                                type="text"
                                                value={variable}
                                                onChange={(e) => handleVariableChange(idx, e.target.value)}
                                                placeholder="variable_name"
                                                className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none text-xs font-mono"
                                            />
                                            <button 
                                                onClick={() => handleRemoveVariable(idx)}
                                                className="absolute -right-2 -top-2 w-5 h-5 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 shadow-sm opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                                            >
                                                <XMarkIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-gray-50" />

                            {/* Headers Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <KeyIcon className="w-4 h-4" /> Custom Headers
                                    </h4>
                                    <button 
                                        onClick={handleAddHeader}
                                        className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                                    >
                                        <PlusIcon className="w-3 h-3" /> Add Header
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {formData.headers.map((header, idx) => (
                                        <div key={idx} className="flex gap-2 group">
                                            <input 
                                                type="text"
                                                value={header.key}
                                                onChange={(e) => handleHeaderChange(idx, 'key', e.target.value)}
                                                placeholder="Key (e.g. Authorization)"
                                                className="flex-1 px-3 py-2 bg-white border border-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none text-xs"
                                            />
                                            <input 
                                                type="text"
                                                value={header.value}
                                                onChange={(e) => handleHeaderChange(idx, 'value', e.target.value)}
                                                placeholder="Value"
                                                className="flex-1 px-3 py-2 bg-white border border-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none text-xs"
                                            />
                                            <button 
                                                onClick={() => handleRemoveHeader(idx)}
                                                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-gray-50" />

                            {/* Workflow Section */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4" /> Link to Automation
                                </h4>
                                <select 
                                    value={formData.workflow_id}
                                    onChange={(e) => setFormData({...formData, workflow_id: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none text-sm appearance-none"
                                >
                                    <option value="">None (Standalone Template)</option>
                                    {workflows.map(wf => (
                                        <option key={wf.id} value={wf.id}>{wf.name}</option>
                                    ))}
                                </select>
                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
                            <button 
                                onClick={handleCloseModal}
                                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSubmit}
                                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-teal-500/20 transition-all"
                            >
                                {modalMode === 'create' ? 'Create Template' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Template"
                message="Are you sure you want to delete this API template? This action cannot be undone and may break linked automations."
                confirmText={isDeleting ? 'Deleting...' : 'Delete Forever'}
                type="danger"
            />
        </div>
    );
}



