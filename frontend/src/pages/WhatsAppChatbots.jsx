import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import WorkspaceGuard from '../components/WorkspaceGuard';
import { ChatBubbleLeftRightIcon, BoltIcon, PlusIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

export default function WhatsAppChatbots() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const bots = [
        { id: 1, name: 'Welcome Bot', status: 'Active', queries: 1240 },
        { id: 2, name: 'Lead Qualifier', status: 'Paused', queries: 850 },
        { id: 3, name: 'Support Auto-Reply', status: 'Active', queries: 3200 }
    ];

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />
                <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-gray-50/50">
                    <WorkspaceGuard>
                        <div className="max-w-7xl mx-auto space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">WhatsApp Chatbots</h1>
                                    <p className="text-sm text-gray-500 mt-1">Automated bots to handle queries, collect details, and qualify leads 24/7.</p>
                                </div>
                                <button className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition flex items-center gap-2">
                                    <PlusIcon className="w-4 h-4" /> Create New Bot
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {bots.map(bot => (
                                    <div key={bot.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                                                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                            </div>
                                            <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                                                bot.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {bot.status}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800">{bot.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">Handled {bot.queries.toLocaleString()} interactions</p>
                                        
                                        <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                                            <button className="text-sm text-teal-600 font-medium hover:text-teal-700">Edit Flow</button>
                                            <button className="text-sm text-gray-400 hover:text-gray-600">Analytics</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                        <CodeBracketIcon className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-800">Visual Flow Builder</h2>
                                </div>
                                <div className="bg-gray-50 rounded-lg border border-dashed border-gray-200 h-64 flex flex-col items-center justify-center text-gray-400">
                                    <BoltIcon className="w-8 h-8 mb-2 opacity-50" />
                                    <p>Select a bot to edit its conversational flow.</p>
                                </div>
                            </div>
                        </div>
                    </WorkspaceGuard>
                </main>
            </div>
        </div>
    );
}
