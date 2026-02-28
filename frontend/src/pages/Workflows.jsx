import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../lib/supabaseClient';
import { useEffect, useState } from 'react';
import { ArrowPathIcon, PlusIcon, MagnifyingGlassIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftRightIcon, UserIcon, PhoneIcon } from '@heroicons/react/24/solid'; // Icons for event pills
import WorkflowWizard from '../components/WorkflowWizard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Mock Data
const workflows = [
    {
        id: 1,
        name: 'FCAPI',
        events: [{ text: 'Lead Status Change +1', color: 'bg-teal-100 text-teal-700' }],
        status: true,
        statusUpdatedOn: '9h ago',
        statusUpdatedBy: 'EH',
    },
    {
        id: 2,
        name: 'On template replied signalgrouprecovery',
        events: [{ text: 'Replied', icon: ChatBubbleLeftRightIcon, color: 'bg-green-100 text-green-700' }],
        status: true,
        statusUpdatedOn: '9h ago',
        statusUpdatedBy: 'EH',
    },
    {
        id: 3,
        name: 'On WhatsApp received',
        draft: true,
        events: [{ text: 'Replied', icon: ChatBubbleLeftRightIcon, color: 'bg-green-100 text-green-700' }],
        status: true,
        statusUpdatedOn: '3d ago',
        statusUpdatedBy: 'EH',
    },
    {
        id: 4,
        name: 'On WhatsApp lead',
        events: [{ text: 'Lead Creation', icon: UserIcon, color: 'bg-green-100 text-green-700' }],
        status: true,
        statusUpdatedOn: '7d ago',
        statusUpdatedBy: 'EH',
    },
    {
        id: 5,
        name: 'Facebook leads',
        draft: true,
        events: [{ text: 'Facebook action', color: 'bg-teal-100 text-teal-700' }],
        status: true,
        statusUpdatedOn: '4M ago',
        statusUpdatedBy: 'EH',
    },
    {
        id: 6,
        name: 'Manual leads',
        events: [{ text: 'Lead Creation', icon: UserIcon, color: 'bg-teal-100 text-teal-700' }],
        status: true,
        statusUpdatedOn: '5M ago',
        statusUpdatedBy: 'EH',
    },
    {
        id: 7,
        name: 'website leads',
        events: [{ text: 'Lead Creation', icon: UserIcon, color: 'bg-teal-100 text-teal-700' }],
        status: true,
        statusUpdatedOn: '5M ago',
        statusUpdatedBy: 'EH',
    },
    {
        id: 8,
        name: 'Outgoing call WF',
        events: [{ text: 'On Outgoing Call Ended', icon: PhoneIcon, color: 'bg-teal-100 text-teal-700' }],
        status: true,
        statusUpdatedOn: '5M ago',
        statusUpdatedBy: 'EH',
    },
];

export default function Workflows() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Published');
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`${API_URL}/workflows`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            const result = await res.json();
            const data = result.data || result || [];

            // Map backend workflow to frontend format
            const mappedWorkflows = data.map(w => ({
                id: w.id,
                name: w.name,
                status: w.is_active,
                statusUpdatedOn: new Date(w.created_at).toLocaleDateString(),
                statusUpdatedBy: 'Admin', // Static for now
                events: [
                    {
                        text: w.trigger?.text || 'Trigger',
                        icon: getEventIcon(w.trigger?.icon),
                        color: 'bg-teal-100 text-teal-700'
                    },
                    {
                        text: w.action?.text || 'Action',
                        icon: getEventIcon(w.action?.icon),
                        color: 'bg-green-100 text-green-700'
                    }
                ]
            }));

            setWorkflows(mappedWorkflows);
        } catch (error) {
            console.error('Error fetching workflows:', error);
        } finally {
            setLoading(false);
        }
    };
    const getEventIcon = (name) => {
        switch (name) {
            case 'chat': return ChatBubbleLeftRightIcon;
            case 'user': return UserIcon;
            case 'phone': return PhoneIcon;
            default: return null;
        }
    };

    const handleCreateWorkflow = () => {
        setIsWizardOpen(true);
    };

    const handleWizardSuccess = () => {
        fetchWorkflows();
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto px-4 py-8 lg:px-8 bg-gray-50/50">
                    <div className="mx-auto max-w-7xl">

                        {/* Page Header */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-semibold text-gray-800">Workflows</h1>
                                <ArrowPathIcon className="w-5 h-5 text-gray-500 cursor-pointer hover:rotate-180 transition-transform duration-500" />
                            </div>
                            <button
                                onClick={handleCreateWorkflow}
                                className="bg-[#08A698] hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                            >
                                Create Workflow <PlusIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">
                            To execute complex automations with ease <span className="text-[#08A698] underline cursor-pointer decoration-dotted">Learn More</span>
                        </p>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 mb-6">
                            {['Published', 'Draft'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                                        ? 'border-[#08A698] text-gray-900'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Filter Bar */}
                        <div className="flex flex-col md:flex-row gap-4 mb-2">
                            <div className="flex-1 bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex items-center">
                                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 ml-2 mr-2" />
                                <input
                                    type="text"
                                    placeholder="Search flowchart by Name"
                                    className="w-full outline-none text-gray-700 placeholder-gray-400 text-sm"
                                />
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex items-center w-full md:w-64 bg-teal-50 border-teal-100">
                                <select className="w-full outline-none text-gray-700 text-sm bg-transparent cursor-pointer">
                                    <option value="">On</option>
                                    <option value="off">Off</option>
                                </select>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex items-center w-full md:w-64">
                                <select className="w-full outline-none text-gray-700 text-sm bg-transparent cursor-pointer text-gray-400">
                                    <option value="">Select Event Types</option>
                                    <option value="type1">Type 1</option>
                                    <option value="type2">Type 2</option>
                                </select>
                            </div>
                        </div>
                        <div className="text-xs text-gray-400 mb-6">
                            {workflows.length} matching flowcharts found
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 min-w-[200px]">Name</th>
                                            <th className="px-6 py-3">Events</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3 bg-gray-100/50 border-x border-gray-200/50 cursor-pointer hover:bg-gray-100 transition-colors">
                                                Status updated on <span className="text-[10px] ml-1">▼</span>
                                            </th>
                                            <th className="px-6 py-3">Status updated by</th>
                                            <th className="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-10 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <ArrowPathIcon className="w-5 h-5 text-[#08A698] animate-spin" />
                                                        <span className="text-gray-500">Loading workflows...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : workflows.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-10 text-center text-gray-400 italic">
                                                    No workflows found
                                                </td>
                                            </tr>
                                        ) : (
                                            workflows.map((workflow) => (
                                                <tr key={workflow.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        <div>{workflow.name}</div>
                                                        {workflow.draft && (
                                                            <div className="text-xs text-[#08A698] font-medium mt-0.5 border-b border-dashed border-[#08A698] w-fit cursor-pointer">View Draft</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            {workflow.events.map((event, idx) => (
                                                                <span key={idx} className={`px-2 py-1 rounded-full text-xs font-medium border border-transparent flex w-fit items-center gap-1.5 ${event.color}`}>
                                                                    {event.icon && <event.icon className="w-3 h-3" />}
                                                                    {event.text}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {/* Custom Toggle Switch */}
                                                        <div className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#08A698] focus:ring-offset-2 ${workflow.status ? 'bg-[#08A698]' : 'bg-gray-200'}`}>
                                                            <span className="sr-only">Use setting</span>
                                                            <span
                                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${workflow.status ? 'translate-x-5' : 'translate-x-0'}`}
                                                            >
                                                                {workflow.status && (
                                                                    <span className="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ease-in">
                                                                        <span className="text-[8px] font-bold text-[#08A698]">ON</span>
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500">{workflow.statusUpdatedOn}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-bold ring-2 ring-white">
                                                            {workflow.statusUpdatedBy}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button className="p-1.5 text-gray-400 hover:text-[#08A698] hover:bg-teal-50 rounded-md transition-colors border border-gray-200">
                                                                <DocumentDuplicateIcon className="w-4 h-4" />
                                                            </button>
                                                            <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors border border-gray-200">
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

            <WorkflowWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                onSuccess={handleWizardSuccess}
            />
        </div>
    );
}
