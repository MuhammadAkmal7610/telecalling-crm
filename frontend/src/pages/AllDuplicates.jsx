import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../lib/supabaseClient';
import {
    MagnifyingGlassIcon,
    PhoneIcon,
    EnvelopeIcon,
    ChevronRightIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function AllDuplicates() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('phone'); // 'phone' | 'email'
    const [duplicates, setDuplicates] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDuplicates();
    }, [activeTab]);

    const fetchDuplicates = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch(`${API_URL}/leads/duplicates?type=${activeTab}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const result = await res.json();
            setDuplicates(result || []);
            if (result.length > 0) {
                setSelectedGroup(result[0]);
            } else {
                setSelectedGroup(null);
            }
        } catch (error) {
            console.error('Error fetching duplicates:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-hidden flex flex-col lg:flex-row relative">

                    <div className="w-full lg:w-1/4 bg-white border-r border-gray-200 flex flex-col h-full">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
                                All Duplicates
                                <button onClick={fetchDuplicates} className="p-1 text-gray-400 hover:text-[#08A698]">
                                    <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                            </h2>
                            <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                                <button
                                    onClick={() => setActiveTab('phone')}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${activeTab === 'phone' ? 'bg-white text-[#08A698] shadow-sm' : 'text-gray-500'}`}
                                >
                                    <PhoneIcon className="w-3 h-3" /> Phone
                                </button>
                                <button
                                    onClick={() => setActiveTab('email')}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${activeTab === 'email' ? 'bg-white text-[#08A698] shadow-sm' : 'text-gray-500'}`}
                                >
                                    <EnvelopeIcon className="w-3 h-3" /> Email
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {duplicates.length === 0 && !loading && (
                                <div className="p-10 text-center text-gray-400 italic text-sm">No duplicates found</div>
                            )}
                            {duplicates.map((group, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedGroup(group)}
                                    className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedGroup?.key === group.key ? 'bg-teal-50/50 border-l-4 border-l-[#08A698]' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className={`text-sm font-bold ${selectedGroup?.key === group.key ? 'text-[#08A698]' : 'text-gray-800'}`}>{group.key}</p>
                                            <p className="text-xs text-gray-400">{group.leads.length} Leads</p>
                                        </div>
                                        <ChevronRightIcon className="w-4 h-4 text-gray-300 ml-auto" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-full lg:w-1/4 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
                        <div className="p-4 border-b border-gray-200 bg-white">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Duplicate Leads</p>
                            <p className="text-xs text-gray-500">{selectedGroup?.leads.length || 0} entries for '{selectedGroup?.key}'</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                            {selectedGroup?.leads.map((lead, idx) => (
                                <div key={idx} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-sm font-bold text-gray-800">{lead.name}</h3>
                                        <span className="text-[10px] font-bold bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded capitalize">
                                            {lead.assignee?.name?.substring(0, 2).toUpperCase() || 'UN'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2 font-mono">{lead.phone || lead.email}</p>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">{lead.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 bg-white p-8 overflow-y-auto custom-scrollbar">
                        {selectedGroup ? (
                            <div className="max-w-3xl mx-auto">
                                <h1 className="text-2xl font-bold text-gray-900 mb-8">Merge Duplicates</h1>
                                <p className="text-sm text-gray-500 mb-6">Review the leads above and merge them into a single record. (Merge functionality coming soon)</p>
                                <div className="space-y-6">
                                    <div className="p-6 bg-teal-50/50 rounded-xl border border-teal-100">
                                        <h4 className="text-sm font-bold text-teal-800 mb-2">Recommendation</h4>
                                        <p className="text-xs text-teal-700">Merge these {selectedGroup.leads.length} leads to keep your database clean. All timeline activities will be combined.</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 italic">Select a group to review duplicates</div>
                        )}
                    </div>

                </main>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
            `}</style>
        </div>
    );
}
