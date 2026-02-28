import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { ArrowPathIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Mock Data
const schedules = []; // Empty as per screenshot

export default function Schedules() {
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
                                    <h1 className="text-2xl font-bold text-gray-900">Schedules</h1>
                                    <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                                        <ArrowPathIcon className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-transform duration-500 hover:rotate-180" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    Keep active connections with automated scheduling <span className="text-[#08A698] underline cursor-pointer hover:text-teal-700">Learn More</span>
                                </p>
                            </div>
                            <button className="bg-[#08A698] hover:bg-[#078F82] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                                <PlusIcon className="w-5 h-5" /> Create Schedule
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 mb-6">
                            {['Published', 'Draft'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${activeTab === tab
                                        ? 'border-[#08A698] text-[#08A698]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Filter Bar */}
                        <div className="flex flex-col md:flex-row gap-3 mb-6">
                            <div className="flex-1 bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-[#08A698]/20 focus-within:border-[#08A698] transition-all flex items-center">
                                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 ml-2 mr-3" />
                                <input
                                    type="text"
                                    placeholder="Search schedules..."
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
                                <div className="bg-white px-3 py-2.5 rounded-xl border border-gray-200 shadow-sm flex items-center min-w-[140px]">
                                    <select className="w-full outline-none text-gray-600 text-sm bg-transparent cursor-pointer">
                                        <option value="">Type: All</option>
                                        <option value="type1">Recurring</option>
                                        <option value="type2">One-time</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="text-xs text-gray-400 mb-4 font-medium">
                            0 matching schedules found
                        </div>

                        {/* Empty State / Table */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1 min-h-[400px]">
                            {schedules.length > 0 ? (
                                <table className="w-full text-sm text-left">
                                    {/* ... (Table Header would go here if data existed) ... */}
                                </table>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-20 px-4">
                                    <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-teal-50/50">
                                        <MagnifyingGlassIcon className="w-10 h-10 text-[#08A698]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Schedules Found</h3>
                                    <p className="text-gray-500 text-center max-w-sm mb-8">
                                        You haven't created any schedules yet. Set up automated tasks to engage with your leads periodically.
                                    </p>
                                    <button className="bg-[#08A698] hover:bg-[#078F82] text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center gap-2">
                                        <PlusIcon className="w-5 h-5" /> Create First Schedule
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
