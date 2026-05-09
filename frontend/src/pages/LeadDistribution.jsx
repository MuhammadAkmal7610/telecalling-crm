import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import WorkspaceGuard from '../components/WorkspaceGuard';
import { ArrowPathIcon, MapIcon, ChartBarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function LeadDistribution() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />
                <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-gray-50/50">
                    <WorkspaceGuard>
                        <div className="max-w-5xl mx-auto space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Smart Lead Distribution</h1>
                                    <p className="text-sm text-gray-500 mt-1">Configure logic-based automatic assignment for incoming leads.</p>
                                </div>
                                <button className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition">
                                    Save Configuration
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Rule Cards */}
                                <div className="bg-white rounded-xl shadow-sm border border-teal-500 p-5 relative overflow-hidden group cursor-pointer">
                                    <div className="absolute top-0 right-0 bg-teal-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold">ACTIVE</div>
                                    <ArrowPathIcon className="w-8 h-8 text-teal-600 mb-3" />
                                    <h3 className="font-bold text-gray-900">Round-Robin</h3>
                                    <p className="text-xs text-gray-500 mt-1">Distribute leads equally among selected team members sequentially.</p>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-teal-300 transition cursor-pointer">
                                    <MapIcon className="w-8 h-8 text-gray-400 mb-3" />
                                    <h3 className="font-bold text-gray-900">Location-Based</h3>
                                    <p className="text-xs text-gray-500 mt-1">Assign leads to agents based on the lead's city or region.</p>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-teal-300 transition cursor-pointer">
                                    <ChartBarIcon className="w-8 h-8 text-gray-400 mb-3" />
                                    <h3 className="font-bold text-gray-900">Performance-Weighted</h3>
                                    <p className="text-xs text-gray-500 mt-1">Route more leads to high-performing agents automatically.</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">Round-Robin Settings</h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Teams/Agents</label>
                                        <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                                            <option>All Sales Agents</option>
                                            <option>Tier 1 Support</option>
                                            <option>Enterprise Team</option>
                                        </select>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div>
                                            <p className="font-medium text-sm text-gray-800">Online Agents Only</p>
                                            <p className="text-xs text-gray-500">Only distribute to agents currently logged in.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div>
                                            <p className="font-medium text-sm text-gray-800">Daily Cap Limit</p>
                                            <p className="text-xs text-gray-500">Stop assigning when an agent reaches their daily limit.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </WorkspaceGuard>
                </main>
            </div>
        </div>
    );
}
