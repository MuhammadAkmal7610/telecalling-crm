import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { ArrowPathIcon, PlusIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'; // Using generic icons for actions

// Mock Data
const templates = [
    {
        id: 1,
        name: 'Telecrm Facebook Api',
        endpoint: 'https://graph.facebook.com/v23.0/5332060898...',
        variables: ['status', '+4'],
        workflow: 'FCAPI',
        lastModified: '4M ago',
        lastModifiedBy: 'EH',
    }
];

export default function ApiTemplates() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto px-6 py-8 md:p-8 bg-gray-50/50">
                    <div className="mx-auto max-w-7xl">

                        {/* Page Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold text-gray-900">API Templates</h1>
                                    <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                                        <ArrowPathIcon className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-transform duration-500 hover:rotate-180" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Configure and reuse API templates for your integrations</p>
                            </div>
                            <button className="bg-[#08A698] hover:bg-[#078F82] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                                <PlusIcon className="w-5 h-5" /> Create Template
                            </button>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
                                                    <div className="font-semibold text-gray-900 group-hover:text-[#08A698] transition-colors cursor-pointer">{template.name}</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <code className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-200 font-mono block w-fit max-w-[200px] truncate" title={template.endpoint}>
                                                        {template.endpoint}
                                                    </code>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex gap-1.5 flex-wrap">
                                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-mono border border-gray-200">{template.variables[0]}</span>
                                                        <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded text-[10px] font-mono border border-teal-100 font-semibold">{template.variables[1]}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                                                        <span className="text-gray-700 font-medium">{template.workflow}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex flex-col items-end gap-0.5">
                                                        <span className="text-gray-900 font-medium">{template.lastModified}</span>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            by <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-[9px] border border-gray-200">{template.lastModifiedBy}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <button className="p-2 text-gray-400 hover:text-[#08A698] hover:bg-teal-50 rounded-lg transition-colors border border-gray-200 hover:border-teal-100" title="Open">
                                                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
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
