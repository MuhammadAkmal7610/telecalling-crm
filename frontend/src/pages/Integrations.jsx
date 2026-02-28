import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../lib/supabaseClient';
import { MagnifyingGlassIcon, ArrowPathIcon, ClipboardIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function Integrations() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [integrations, setIntegrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIntegration, setSelectedIntegration] = useState(null);
    const [userOrgId, setUserOrgId] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchIntegrations();
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            // organizationId is stored in the JWT claims or we can fetch from users table
            // Usually it's in the app_metadata or user_metadata in Supabase if set up
            // Or we fetch from our own /users/me endpoint
            setUserOrgId(session.user.id); // Defaulting to userId for now if orgId not found
            // Let's try to get orgId from metadata
            const orgId = session.user.app_metadata?.organizationId || session.user.user_metadata?.organizationId;
            if (orgId) setUserOrgId(orgId);
        }
    };

    const fetchIntegrations = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch(`${API_URL}/integrations`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const result = await res.json();
            setIntegrations(result.data || []);
        } catch (error) {
            console.error('Error fetching integrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = (item) => {
        if (['im', 'jd'].includes(item.id)) {
            setSelectedIntegration(item);
        } else {
            toast.success(`Activation for ${item.name} is coming soon!`);
        }
    };

    const getWebhookUrl = (id) => {
        const baseUrl = API_URL.replace('/api/v1', '');
        if (id === 'im') return `${baseUrl}/api/v1/external-leads/indiamart?orgId=${userOrgId}`;
        if (id === 'jd') return `${baseUrl}/api/v1/external-leads/justdial?orgId=${userOrgId}`;
        return '';
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const activeIntegrations = integrations.filter(i => i.status?.toLowerCase() === 'active');
    const availableIntegrations = [
        { id: 'im', name: 'IndiaMART', description: 'Automatically capture leads from IndiaMART in real-time.', logo: 'https://logo.clearbit.com/indiamart.com' },
        { id: 'jd', name: 'Justdial', description: 'Sync your Justdial inquiries directly into the CRM.', logo: 'https://logo.clearbit.com/justdial.com' },
        { id: 'fb', name: 'Facebook Ads', description: 'Connect Facebook Lead Ads to capture high-intent leads.', logo: 'https://logo.clearbit.com/facebook.com' },
        { id: 'ga', name: 'Google Ads', description: 'Import leads from Google Search and Display ads.', logo: 'https://logo.clearbit.com/google.com' },
        { id: '99', name: '99acres', description: 'Capture 99acres property leads automatically.', logo: 'https://logo.clearbit.com/99acres.com' },
        { id: 'zp', name: 'Zapier', description: 'Connect over 5,000+ apps using Zapier automation.', logo: 'https://logo.clearbit.com/zapier.com' },
        { id: 'cd', name: 'CallerDesk', description: 'Cloud telephony integration for call tracking.', logo: 'https://logo.clearbit.com/callerdesk.io' },
    ];

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto px-4 py-8 lg:px-8 bg-gray-50/50">
                    <div className="mx-auto max-w-7xl space-y-8">

                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                                        Integrations
                                        <button onClick={fetchIntegrations} className="p-1 text-gray-400 hover:text-[#08A698] rounded-full">
                                            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </h1>
                                    <p className="text-sm text-gray-500 mt-1">Manage your connections and extend CRM capabilities.</p>
                                </div>
                            </div>

                            <div className="bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm flex items-center max-w-2xl">
                                <div className="px-4 py-2 bg-gray-50 rounded-lg text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-100 select-none">
                                    Search
                                </div>
                                <div className="flex-1 flex items-center px-3">
                                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-2" />
                                    <input
                                        type="text"
                                        placeholder="Find an integration..."
                                        className="w-full outline-none text-gray-700 placeholder-gray-400 text-sm bg-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Active Section */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Active Integrations</h2>
                                <span className="bg-teal-50 text-[#08A698] text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-100">
                                    {activeIntegrations.length}
                                </span>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <div className="md:col-span-4">Integration</div>
                                    <div className="md:col-span-4 text-center md:text-left">Status</div>
                                    <div className="md:col-span-4 text-right">Actions</div>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {activeIntegrations.length === 0 && !loading && (
                                        <div className="p-10 text-center text-gray-400 italic">No active integrations found</div>
                                    )}
                                    {activeIntegrations.map((item) => (
                                        <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-gray-50/50 transition-colors group">
                                            <div className="md:col-span-4 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg border border-gray-100 bg-white p-1.5 shadow-sm flex-shrink-0">
                                                    <img src={item.config?.logo} alt={item.name} className="w-full h-full object-contain" onError={(e) => { e.target.src = 'https://via.placeholder.com/32' }} />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-800 group-hover:text-[#08A698] transition-colors">{item.name}</span>
                                            </div>
                                            <div className="md:col-span-4 flex justify-center md:justify-start">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                    {item.status}
                                                </span>
                                            </div>
                                            <div className="md:col-span-4 flex justify-end">
                                                <button className="text-gray-600 hover:text-[#08A698] bg-white hover:bg-teal-50 border border-gray-200 hover:border-teal-200 px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow">
                                                    Manage
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Available Section */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Available Integrations</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {availableIntegrations.map((item) => (
                                    <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300 group flex flex-col items-start gap-4 h-full relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                                        <div className="w-12 h-12 rounded-xl border border-gray-100 bg-white p-2 shadow-sm relative z-10">
                                            <img src={item.logo} alt={item.name} className="w-full h-full object-contain" onError={(e) => { e.target.src = 'https://via.placeholder.com/40' }} />
                                        </div>
                                        <div className="relative z-10 flex-1">
                                            <h3 className="text-base font-bold text-gray-800 mb-1 group-hover:text-[#08A698] transition-colors">{item.name}</h3>
                                            <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                                        </div>
                                        <button
                                            onClick={() => handleActivate(item)}
                                            className="w-full mt-2 text-[#08A698] hover:text-white border border-[#08A698] hover:bg-[#08A698] px-4 py-2.5 rounded-lg text-sm font-semibold transition-all relative z-10 shadow-sm hover:shadow-teal-100"
                                        >
                                            Activate Now
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </main>
            </div>

            {/* Webhook Modal */}
            {selectedIntegration && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <img src={selectedIntegration.logo} alt="" className="w-8 h-8 object-contain" />
                                <h2 className="text-xl font-bold text-gray-800">Setup {selectedIntegration.name}</h2>
                            </div>
                            <button onClick={() => setSelectedIntegration(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl space-y-2">
                                    <h3 className="text-sm font-bold text-[#08A698]">Configuration Info</h3>
                                    <p className="text-xs text-teal-800 leading-relaxed">
                                        Please copy the webhook URL below and paste it into your {selectedIntegration.name} seller panel under Webhooks / API settings.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Webhook URL</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono text-xs text-gray-600 truncate">
                                            {getWebhookUrl(selectedIntegration.id)}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(getWebhookUrl(selectedIntegration.id))}
                                            className="p-3 bg-[#08A698] text-white rounded-lg hover:bg-[#078F82] transition-colors shadow-sm"
                                        >
                                            {copied ? <CheckIcon className="w-5 h-5" /> : <ClipboardIcon className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-gray-800">Next Steps:</h3>
                                <ul className="text-xs text-gray-500 space-y-2">
                                    <li className="flex gap-2">
                                        <span className="w-4 h-4 rounded-full bg-teal-100 text-[#08A698] flex items-center justify-center font-bold text-[10px]">1</span>
                                        Log in to your {selectedIntegration.name} portal.
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="w-4 h-4 rounded-full bg-teal-100 text-[#08A698] flex items-center justify-center font-bold text-[10px]">2</span>
                                        Go to Developer / API / Webhook settings.
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="w-4 h-4 rounded-full bg-teal-100 text-[#08A698] flex items-center justify-center font-bold text-[10px]">3</span>
                                        Paste the URL above and save changes.
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setSelectedIntegration(null)}
                                className="bg-[#08A698] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#078F82] transition-colors shadow-lg shadow-teal-100"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
