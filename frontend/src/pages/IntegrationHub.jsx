import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
    PuzzlePieceIcon,
    ArrowPathIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabaseClient';

export default function IntegrationHub() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [integrations, setIntegrations] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

    // Mock initial data
    const initialIntegrations = [
        { id: 'fb', name: 'Facebook Lead Ads', description: 'Automatically capture leads from your Facebook campaigns.', enabled: true, category: 'Lead Generation' },
        { id: 'wa', name: 'WhatsApp Business API', description: 'Send and receive WhatsApp messages directly from the CRM.', enabled: true, category: 'Communication' },
        { id: 'google', name: 'Google Workspace', description: 'Sync your calendar and emails.', enabled: false, category: 'Productivity' },
        { id: 'webhook', name: 'Custom Webhooks', description: 'Connect custom applications to send and receive real-time updates.', enabled: false, category: 'Developer Tools' },
    ];

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch(`${API_URL}/integrations`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setIntegrations(data);
            } else {
                setIntegrations(initialIntegrations);
            }
        } catch (error) {
            setIntegrations(initialIntegrations);
        } finally {
            setLoading(false);
        }
    };

    const toggleIntegration = (id) => {
        setIntegrations(integrations.map(int => 
            int.id === id ? { ...int, enabled: !int.enabled } : int
        ));
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <PuzzlePieceIcon className="w-8 h-8 text-gray-500" strokeWidth={1.5} />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-700">Integration Hub</h1>
                                    <p className="text-sm text-gray-500 mt-1">Connect your workspace with third-party tools and services.</p>
                                </div>
                            </div>
                            <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors" onClick={fetchIntegrations}>
                                <ArrowPathIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-12">
                                <ArrowPathIcon className="w-8 h-8 animate-spin text-[#08A698]" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                {integrations.map((integration) => (
                                    <div key={integration.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center">
                                                    <PuzzlePieceIcon className="w-6 h-6 text-gray-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">{integration.name}</h3>
                                                    <span className="text-xs font-medium text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full">
                                                        {integration.category}
                                                    </span>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                    checked={integration.enabled}
                                                    onChange={() => toggleIntegration(integration.id)}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#08A698]"></div>
                                            </label>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-6 min-h-[40px]">
                                            {integration.description}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="text-sm font-medium">
                                                {integration.enabled ? (
                                                    <span className="text-green-600 flex items-center gap-1">
                                                        <div className="w-2 h-2 rounded-full bg-green-500"></div> Active
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 flex items-center gap-1">
                                                        <div className="w-2 h-2 rounded-full bg-gray-300"></div> Inactive
                                                    </span>
                                                )}
                                            </div>
                                            {integration.enabled && (
                                                <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                                    <Cog6ToothIcon className="w-4 h-4" />
                                                    Settings
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
