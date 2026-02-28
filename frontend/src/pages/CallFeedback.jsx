import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
    PlusCircleIcon,
    EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

const DragHandle = () => (
    <svg className="w-5 h-5 text-gray-300 cursor-move hover:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 2a1 1 0 11-2 0 1 1 0 012 0zm0 5a1 1 0 11-2 0 1 1 0 012 0zM7 12a1 1 0 11-2 0 1 1 0 012 0zm0 5a1 1 0 11-2 0 1 1 0 012 0zm6-15a1 1 0 11-2 0 1 1 0 012 0zm0 5a1 1 0 11-2 0 1 1 0 012 0zM13 12a1 1 0 11-2 0 1 1 0 012 0zm0 5a1 1 0 11-2 0 1 1 0 012 0z" />
    </svg>
);

const StatusItem = ({ label, isDefault }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 rounded-lg group transition-colors">
        <div className="flex items-center gap-4">
            <DragHandle />
            <span className="text-sm font-medium text-gray-700">{label}</span>
            {isDefault && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#08A698]/10 text-[#08A698]">
                    default
                </span>
            )}
        </div>
        <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <EllipsisVerticalIcon className="w-5 h-5" />
        </button>
    </div>
);

export default function CallFeedback() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="max-w-4xl mx-auto space-y-6">

                        {/* Title Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Call Feedback</h1>
                            <p className="text-gray-500 text-sm">
                                Automatically <span className="text-[#08A698] font-medium">default</span> status is assigned if call duration &gt; 0s.
                                <br />
                                However you can update anytime.
                            </p>
                        </div>

                        {/* Settings Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">Available status (7)</h2>
                                <button className="text-[#08A698] hover:text-[#068f82] transition-colors">
                                    <PlusCircleIcon className="w-8 h-8" strokeWidth={1.5} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <StatusItem label="NUMBER BUSY" />
                                <StatusItem label="NO ANSWER" />
                                <StatusItem label="WRONG NUMBER" />
                                <StatusItem label="SWITCHED OFF" />
                                <StatusItem label="CONNECTED" isDefault={true} />
                                <StatusItem label="CALL LATER" />
                                <StatusItem label="REDIALED" />
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
