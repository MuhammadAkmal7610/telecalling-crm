import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { ArrowPathIcon, PlusIcon, MagnifyingGlassIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

// Mock Data
const salesforms = [
    {
        id: 1,
        name: 'Basic Lead qualification',
        events: 'On Button Click',
        status: true, // true = ON, false = OFF
        statusUpdatedOn: '5M ago',
        statusUpdatedBy: 'EH',
    }
];

export default function Salesforms() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Published');

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto px-6 py-8 md:p-8 bg-gray-50/50">
                    <div className="mx-auto max-w-7xl">

                        {/* Page Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold text-gray-900">Salesforms</h1>
                                    <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                                        <ArrowPathIcon className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-transform duration-500 hover:rotate-180" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Automatically capture and qualify leads with custom forms</p>
                            </div>
                            <button className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                                <PlusIcon className="w-5 h-5" /> Create Salesform
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 mb-6">
                            {['Published', 'Draft'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-8 py-3.5 text-sm font-medium border-b-2 transition-all duration-200 ${activeTab === tab
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Filter Bar */}
                        <div className="flex flex-col md:flex-row gap-3 mb-6">
                            <div className="flex-1 bg-white p-3 rounded-xl border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all flex items-center">
                                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 ml-2 mr-3" />
                                <input
                                    type="text"
                                    placeholder="Search salesforms..."
                                    className="w-full outline-none text-gray-700 placeholder-gray-400 text-sm bg-transparent"
                                />
                            </div>
                            <div className="flex gap-3">
                                <div className="bg-white px-3 py-2.5 rounded-xl border border-gray-200 shadow-sm flex items-center min-w-[140px]">
                                    <select className="w-full outline-none text-gray-600 text-sm bg-transparent cursor-pointer">
                                        <option value="">Status: All</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50/80 text-gray-500 font-medium border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Name</th>
                                            <th className="px-6 py-4 font-semibold">Trigger</th>
                                            <th className="px-6 py-4 font-semibold">Status</th>
                                            <th className="px-6 py-4 font-semibold text-right">Last Updated</th>
                                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {activeTab === 'Published' && salesforms.map((form) => (
                                            <tr key={form.id} className="group hover:bg-teal-50/10 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors cursor-pointer">{form.name}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                        {form.events}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" className="sr-only peer" defaultChecked={form.status} />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                    </label>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex flex-col items-end gap-0.5">
                                                        <span className="text-gray-900 font-medium">{form.statusUpdatedOn}</span>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            by <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-[9px] border border-gray-200">{form.statusUpdatedBy}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="p-2 text-gray-400 hover:text-primary hover:bg-teal-50 rounded-lg transition-colors" title="Duplicate">
                                                            <DocumentDuplicateIcon className="w-5 h-5" />
                                                        </button>
                                                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {activeTab === 'Draft' && (
                                    <div className="flex flex-col items-center justify-center py-20 bg-white">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <DocumentDuplicateIcon className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <h3 className="text-gray-900 font-medium mb-1">No drafts found</h3>
                                        <p className="text-sm text-gray-500">Create a new salesform to save it as a draft</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
