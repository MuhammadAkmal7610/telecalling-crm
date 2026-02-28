import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
    ShieldCheckIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    TrashIcon,
    EyeIcon,
    ArrowPathIcon,
    Bars3Icon,
    PhoneIcon,
    UserIcon,
    MegaphoneIcon,
    KeyIcon,
    Cog6ToothIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export default function PermissionTemplates() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('All');
    const [isEnableModalOpen, setIsEnableModalOpen] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch(`${API_URL}/templates`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTemplates(data);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const defaultTemplates = templates.filter(t => t.is_default); // Assuming we have is_default
    const displayTemplates = activeTab === 'All' ? templates : templates.filter(t => t.is_default);

    const getRoleIcon = (type) => {
        const iconClass = "w-4 h-4 text-gray-600";
        const containerClass = "w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center";

        switch (type) {
            case 'caller': return <div className={containerClass}><PhoneIcon className={iconClass} /></div>;
            case 'manager': return <div className={containerClass}><UserIcon className={iconClass} /></div>;
            case 'marketing': return <div className={containerClass}><MegaphoneIcon className={iconClass} /></div>;
            case 'root': return <div className={containerClass}><KeyIcon className={iconClass} /></div>;
            case 'admin': return <div className={containerClass}><Cog6ToothIcon className={iconClass} /></div>;
            default: return <div className={containerClass}><ShieldCheckIcon className={iconClass} /></div>;
        }
    };

    const EnableTemplateModal = ({ isOpen, onClose }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Enable permission template</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
                            <p>
                                Permission template will help you manage your teams permission granually.
                            </p>
                            <p>
                                To enable permission template feature for your workspace, contact your respective account manager.
                            </p>

                            <div className="pt-2">
                                <label className="block text-gray-700 font-medium mb-2">
                                    Enter the <span className="font-bold text-gray-900">key</span> given by your account manager
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter your key here"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#08A698] focus:ring-1 focus:ring-[#08A698] transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-8">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button className="px-6 py-2.5 bg-[#08A698] hover:bg-[#079186] text-white font-medium rounded-lg shadow-sm active:scale-95 transition-all">
                                Proceed
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <EnableTemplateModal isOpen={isEnableModalOpen} onClose={() => setIsEnableModalOpen(false)} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">

                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <ShieldCheckIcon className="w-8 h-8 text-gray-500" strokeWidth={1.5} />
                                <h1 className="text-2xl font-bold text-gray-700">Permission Templates</h1>
                                <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                                    <ArrowPathIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <button
                                onClick={() => setIsEnableModalOpen(true)}
                                className="flex items-center justify-center gap-2 bg-[#08A698] hover:bg-[#079186] text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm active:scale-95"
                            >
                                <PlusIcon className="w-5 h-5" />
                                Add new
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
                            {['All', 'Defaults'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-3 px-1 text-sm font-medium transition-all relative ${activeTab === tab
                                        ? 'text-gray-900 border-b-2 border-[#08A698]'
                                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Search and Table Container */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

                            {/* Search Bar */}
                            <div className="p-4 border-b border-gray-100">
                                <div className="relative max-w-full">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:border-[#08A698] focus:ring-1 focus:ring-[#08A698] sm:text-sm transition-colors"
                                    />
                                </div>
                                <div className="mt-2 text-xs text-gray-500 font-medium px-1">
                                    {activeTab === 'All' ? templates.length : defaultTemplates.length} templates found
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            {activeTab === 'Defaults' && (
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Role
                                                </th>
                                            )}
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {activeTab === 'Defaults' ? 'Permission template' : 'Name'}
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Assigned to
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider group cursor-pointer hover:text-gray-700">
                                                <div className="flex items-center justify-center gap-1">
                                                    Last modified on
                                                    <Bars3Icon className="w-3 h-3 rotate-90" />
                                                </div>
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                    <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2 text-[#08A698]" />
                                                    Loading templates...
                                                </td>
                                            </tr>
                                        ) : displayTemplates.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                                                    No templates found
                                                </td>
                                            </tr>
                                        ) : (
                                            displayTemplates.map((template) => (
                                                <tr key={template.id} className="hover:bg-gray-50/80 transition-colors">
                                                    {activeTab === 'Defaults' && (
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-3">
                                                                {getRoleIcon(template.type)}
                                                                <span className="text-sm font-medium text-gray-900 capitalize">{template.type}</span>
                                                            </div>
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <ShieldCheckIcon className="flex-shrink-0 h-5 w-5 text-gray-600 mr-3" />
                                                            <div className="text-sm font-medium text-gray-900">{template.name}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className="text-sm text-gray-600 font-medium">{template.assigned_count || 0}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                                        {new Date(template.updated_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {template.type === 'root' ? (
                                                                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors border border-gray-200">
                                                                    <EyeIcon className="w-4 h-4" />
                                                                </button>
                                                            ) : (
                                                                <button className="p-1.5 text-gray-400 hover:text-[#08A698] hover:bg-[#08A698]/5 rounded-md transition-colors border border-gray-200 hover:border-[#08A698]/30">
                                                                    <PencilSquareIcon className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors border border-gray-200 hover:border-red-200">
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
