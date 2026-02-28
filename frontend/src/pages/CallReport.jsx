import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    PhoneIcon,
    ClockIcon,
    CalendarIcon,
    UserIcon,
    ChevronDownIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

export default function CallReport() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Day');

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-hidden flex flex-col lg:flex-row relative">

                    {/* LEFT COLUMN: Report Charts (Replacing standard filters) */}
                    <div className="w-full lg:w-1/4 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto">
                        <div className="p-4 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-gray-800">Reports</h2>
                                <div className="flex gap-1 text-[10px] font-bold bg-gray-100 p-1 rounded-md">
                                    {['Day', 'Week', 'Month', 'Year'].map(t => (
                                        <button key={t} onClick={() => setActiveTab(t)} className={`px-2 py-1 rounded ${activeTab === t ? 'bg-white shadow-sm text-[#08A698]' : 'text-gray-500'}`}>{t.toUpperCase()}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-3 gap-2 mb-6">
                                <div className="bg-[#08A698] text-white p-2 rounded-lg text-center shadow-lg shadow-teal-200">
                                    <div className="text-[10px] font-medium opacity-80 uppercase">Calls</div>
                                    <div className="text-lg font-bold">563</div>
                                </div>
                                <div className="border border-gray-200 p-2 rounded-lg text-center">
                                    <div className="text-[10px] font-medium text-gray-400 uppercase">Time</div>
                                    <div className="text-lg font-bold text-gray-700">4:06h</div>
                                </div>
                                <div className="border border-gray-200 p-2 rounded-lg text-center">
                                    <div className="text-[10px] font-medium text-gray-400 uppercase">Sales</div>
                                    <div className="text-lg font-bold text-gray-700">5K</div>
                                </div>
                            </div>

                            {/* Fake Bar Chart Visualization */}
                            <div className="h-48 flex items-end justify-between px-2 gap-2 border-b border-gray-100 pb-4 mb-4">
                                {[20, 45, 10, 80, 50, 90, 30].map((h, i) => (
                                    <div key={i} className="w-full h-full bg-gray-50 rounded-t-lg relative group overflow-hidden">
                                        <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#08A698] to-teal-400 rounded-t-md transition-all duration-500 shadow-[0_0_10px_rgba(8,166,152,0.3)]" style={{ height: `${h}%` }}></div>
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">{h}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center text-xs font-medium text-[#08A698] pb-2">10 Jan Calls Reports (350 Leads) <ArrowDownTrayIcon className="w-3 h-3 inline" /></div>
                        </div>

                        {/* List of matching leads/items for report */}
                        <div className="flex-1 overflow-y-auto">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer group transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-sm font-bold text-gray-800 group-hover:text-[#08A698]">Ali Ahmed</h3>
                                        <span className="w-6 h-6 rounded-full bg-gray-100 text-[10px] flex items-center justify-center font-bold text-gray-500">WA</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mb-2">923022177333</div>
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">First Contact Attempted</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MIDDLE COLUMN: Lead Detail (Simplified for example) */}
                    <div className="hidden lg:flex flex-1 flex-col bg-[#F8F9FA] relative">
                        {/* Using a placeholder for the detail view as it's complex and replicated from WebsiteLeads */}
                        <div className="flex-1 p-8 overflow-y-auto">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-3xl mx-auto">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h1 className="text-2xl font-bold text-gray-900">Ali Ahmed</h1>
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        </div>
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold uppercase rounded-full">First Contact Attempted</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 border border-gray-200 rounded-lg hover:border-[#08A698] text-gray-500 hover:text-[#08A698] transition-colors"><ChatBubbleLeftRightIcon className="w-5 h-5" /></button>
                                        <button className="p-2 border border-gray-200 rounded-lg hover:border-[#08A698] text-gray-500 hover:text-[#08A698] transition-colors"><PhoneIcon className="w-5 h-5" /></button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Phone</label>
                                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2"><PhoneIcon className="w-3 h-3 text-[#08A698]" /> 923022177333</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Facebook Ad</label>
                                        <div className="text-sm font-medium text-gray-900">Success Story Ad</div>
                                    </div>
                                </div>

                                {/* Tabs for activity */}
                                <div className="border-b border-gray-200 flex gap-6 mb-6">
                                    <button className="pb-3 border-b-2 border-[#08A698] text-[#08A698] font-bold text-sm">Activity History</button>
                                    <button className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">Task</button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                            <div className="w-px h-full bg-gray-200 my-1"></div>
                                        </div>
                                        <div className="pb-4">
                                            <p className="text-xs text-gray-500">Status changed from <span className="font-bold text-gray-700">Fresh</span> → <span className="font-bold text-gray-700">First Contact Attempted</span></p>
                                            <span className="text-[10px] text-gray-400">1m ago</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-2 h-2 bg-[#08A698] rounded-full"></div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-800 font-medium">Wrong Number <span className="text-gray-400 font-normal">not responding number</span></p>
                                            <span className="text-[10px] text-gray-400">3m ago</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
