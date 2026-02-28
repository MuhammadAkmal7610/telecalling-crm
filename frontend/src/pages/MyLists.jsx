import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
    MagnifyingGlassIcon,
    PlusIcon,
    EllipsisHorizontalIcon,
    UserGroupIcon,
    CalendarIcon,
    ArrowRightIcon,
    TrashIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';

const mockLists = [
    { id: 1, name: 'Hot Leads Q1', description: 'Priority leads for the first quarter sales push.', count: 128, createdOn: 'Jan 10, 2024', color: 'bg-teal-50 text-teal-600 border-teal-100' },
    { id: 2, name: 'Conference Follow-ups', description: 'Contacts gathered from the Tech Summit 2023.', count: 45, createdOn: 'Dec 15, 2023', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { id: 3, name: 'VIP Clients', description: 'High-value existing clients requiring monthly check-ins.', count: 12, createdOn: 'Nov 02, 2023', color: 'bg-teal-100 text-teal-700 border-teal-200' },
    { id: 4, name: 'Cold Outreach', description: 'Initial contact lists for cold calling campaigns.', count: 350, createdOn: 'Jan 05, 2024', color: 'bg-gray-50 text-gray-600 border-gray-100' },
    { id: 5, name: 'Website Signups', description: 'Leads generated from the website contact form.', count: 1250, createdOn: 'Oct 20, 2023', color: 'bg-teal-50 text-teal-600 border-teal-100' },
    { id: 6, name: 'Lost Opportunities', description: 'Leads marked as lost, to be revisited in 6 months.', count: 89, createdOn: 'Sep 12, 2023', color: 'bg-gray-50 text-gray-600 border-gray-100' },
];

export default function MyLists() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased overflow-hidden">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col h-full min-w-0">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
                    <div className="mx-auto max-w-7xl space-y-8">

                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Lists</h1>
                                <p className="text-sm text-gray-500 mt-1">Organize and manage your custom lead collections.</p>
                            </div>
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-secondary text-white rounded-xl shadow-md hover:shadow-lg transition-all text-sm font-semibold">
                                <PlusIcon className="w-5 h-5" /> Create New List
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative max-w-md">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search your lists..."
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm placeholder-gray-400"
                            />
                        </div>

                        {/* Lists Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mockLists.map((list) => (
                                <div key={list.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300 group cursor-pointer relative overflow-hidden flex flex-col">
                                    <div className={`absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2`}>
                                        <button className="p-1.5 text-gray-400 hover:text-primary bg-white rounded-lg shadow-sm border border-gray-100 hover:border-primary transition-colors">
                                            <PencilSquareIcon className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 text-gray-400 hover:text-red-600 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-red-200 transition-colors">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${list.color}`}>
                                            <UserGroupIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-primary transition-colors">{list.name}</h3>
                                            <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-1">
                                                <CalendarIcon className="w-3.5 h-3.5" /> Created {list.createdOn}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-500 mb-6 line-clamp-2 h-10 leading-relaxed">
                                        {list.description}
                                    </p>

                                    <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold text-gray-900 tracking-tight">{list.count.toLocaleString()}</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-1.5 py-0.5 rounded">Leads</span>
                                        </div>
                                        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                            <ArrowRightIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Create New Placeholder Card */}
                            <button className="bg-gray-50/30 rounded-xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center text-center hover:border-primary hover:bg-teal-50/10 transition-colors group">
                                <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-4 group-hover:border-primary transition-all shadow-sm group-hover:scale-110 duration-200">
                                    <PlusIcon className="w-7 h-7 text-gray-400 group-hover:text-primary" />
                                </div>
                                <h3 className="font-bold text-gray-600 group-hover:text-primary text-lg">Create New List</h3>
                                <p className="text-sm text-gray-400 mt-1">Start a new collection</p>
                            </button>

                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
