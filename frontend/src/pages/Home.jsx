import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ActionCard from '../components/ActionCard';
import IntegrationCard from '../components/IntegrationCard';
import Logo from '../assets/Logo.png';
import { useNavigate } from 'react-router-dom';
import {
    UserPlusIcon, DocumentArrowUpIcon, SignalIcon,
    PresentationChartLineIcon, AdjustmentsHorizontalIcon,
    PhoneIcon, PlayCircleIcon, WrenchScrewdriverIcon,
    ShoppingCartIcon, ChatBubbleLeftRightIcon, BoltIcon,
    RectangleStackIcon, DevicePhoneMobileIcon, MegaphoneIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import CampaignModal from '../components/CampaignModal';
import { toast } from 'react-hot-toast';
import { useApi } from '../hooks/useApi';

// Icon Mapping for Dynamic Icons
const iconMap = {
    UserPlusIcon, DocumentArrowUpIcon, SignalIcon,
    PresentationChartLineIcon, AdjustmentsHorizontalIcon,
    PhoneIcon, PlayCircleIcon, WrenchScrewdriverIcon,
    ShoppingCartIcon, ChatBubbleLeftRightIcon, BoltIcon,
    MegaphoneIcon
};

// SVG Logos
const FacebookLogo = () => (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const GoogleSheetsLogo = () => (
    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v3h14V6H5zm0 5v7h4v-7H5zm6 0v7h8v-7h-8z" />
    </svg>
);

const logoMap = {
    FacebookLogo,
    GoogleSheetsLogo
};

export default function Home() {
    const navigate = useNavigate();
    const { apiFetch } = useApi();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [config, setConfig] = useState({
        uiLabels: {
            getStartedTitle: 'Get Started',
            getStartedSub: 'Quick actions to setup your CRM.',
            setupGuideBtn: 'Setup Guide',
            integrationsTitle: 'Integrations',
            integrationsSub: 'Connect your favorite tools.',
            exploreAll: 'Explore All >',
            appName: 'WeWave CRM',
            appSubtitle: 'WeWave Inc.',
            installBtn: 'Install',
            helpTitle: 'Need Help?',
            helpSub: 'Stuck somewhere? Request support or watch our guide videos.',
            helpVideosBtn: 'View Help Videos',
            quickLinksTitle: 'Quick Links'
        },
        getStartedActions: [],
        integrations: [],
        importantLinks: [],
        appStats: {
            rating: 4.8,
            reviews: "0",
            downloads: "0",
            category: "Business",
            verified: true
        }
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await apiFetch('/app-config/home');
                if (res.ok) {
                    const data = await res.json();
                    setConfig(data);
                }
            } catch (err) {
                console.error('Failed to fetch home config:', err);
            }
        };
        fetchConfig();
    }, []);

    const handleActionClick = (action) => {
        if (action.action === 'create-campaign') {
            setIsCampaignModalOpen(true);
        } else if (action.action === 'setup-guide') {
            toast.success('Setup Guide: 1. Add Team 2. Import Leads 3. Create Campaign', { duration: 5000 });
        } else if (action.path) {
            navigate(action.path);
        }
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto px-4 py-8 lg:px-8 bg-gray-50/50">
                    <div className="mx-auto max-w-7xl">

                        {/* Top Spacer */}
                        <div className="h-6"></div>

                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                            {/* Main Content Area (3 Cols) */}
                            <div className="xl:col-span-3 space-y-12">

                                {/* Get Started Section */}
                                <section>
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{config?.uiLabels?.getStartedTitle || 'Get Started'}</h2>
                                            <p className="text-sm text-gray-500 mt-1">{config?.uiLabels?.getStartedSub || 'Quick actions to setup your CRM.'}</p>
                                        </div>
                                        <button
                                            onClick={() => handleActionClick({ action: 'setup-guide' })}
                                            className="text-[#08A698] font-semibold text-sm hover:underline flex items-center gap-1.5 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100 transition-colors hover:bg-teal-100"
                                        >
                                            <PlayCircleIcon className="w-5 h-5" /> {config?.uiLabels?.setupGuideBtn || 'Setup Guide'}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        {(config?.getStartedActions || []).map((action, idx) => (
                                            <ActionCard
                                                key={idx}
                                                {...action}
                                                icon={iconMap[action.icon] || MegaphoneIcon}
                                                onClick={() => handleActionClick(action)}
                                            />
                                        ))}
                                    </div>
                                </section>

                                {/* Integrations Section */}
                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">{config?.uiLabels?.integrationsTitle || 'Integrations'}</h2>
                                            <p className="text-sm text-gray-500 mt-0.5">{config?.uiLabels?.integrationsSub || 'Connect your favorite tools.'}</p>
                                        </div>
                                        <button
                                            onClick={() => navigate('/integrations')}
                                            className="text-[#08A698] font-medium text-sm hover:text-teal-700 hover:underline"
                                        >
                                            {config?.uiLabels?.exploreAll || 'Explore All >'}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {(config?.integrations || []).map((integration, idx) => (
                                            <IntegrationCard
                                                key={idx}
                                                {...integration}
                                                Logo={logoMap[integration.icon] || FacebookLogo}
                                            />
                                        ))}
                                    </div>
                                </section>

                            </div>

                            {/* Right Sidebar (1 Col) */}
                            <div className="space-y-6 xl:mt-0">

                                {/* Authentic Play Store Listing Card */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 overflow-hidden">
                                    <div className="flex gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-lg bg-teal-50 border border-teal-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            <img src={Logo} alt="WeWave" className="w-12 h-12 object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 text-lg leading-tight truncate">{config?.uiLabels?.appName || 'CRM App'}</h3>
                                            <p className="text-[#01875f] text-xs font-semibold mt-0.5">{config?.uiLabels?.appSubtitle || 'Verified'}</p>
                                            <p className="text-[11px] text-gray-500 mt-0.5">{config?.appStats?.category || 'Business'}</p>
                                        </div>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="flex items-center justify-between mb-5 px-1">
                                        <div className="flex flex-col items-center gap-0.5 border-r border-gray-100 pr-4 flex-1">
                                            <div className="flex items-center gap-1 font-bold text-gray-700 text-xs">
                                                {config?.appStats?.rating || '4.8'} <StarIconSolid className="w-3 h-3 pb-0.5" />
                                            </div>
                                            <span className="text-[10px] text-gray-500">{config?.appStats?.reviews || '0'} reviews</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-0.5 border-r border-gray-100 px-4 flex-1">
                                            <span className="font-bold text-gray-700 text-xs">{config?.appStats?.downloads || '0'}</span>
                                            <span className="text-[10px] text-gray-500">Downloads</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-0.5 pl-4 flex-1">
                                            <span className="w-5 h-5 flex items-center justify-center border border-gray-700 rounded-sm text-[10px] font-bold text-gray-700 bg-white">E</span>
                                            <span className="text-[10px] text-gray-500">Everyone</span>
                                        </div>
                                    </div>

                                    {/* Install Button */}
                                    <button className="w-full bg-[#01875f] hover:bg-[#017250] text-white py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors text-center">
                                        {config?.uiLabels?.installBtn || 'Install'}
                                    </button>

                                    {config?.appStats?.verified && (
                                        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
                                            <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                                            Google Play Verified
                                        </div>
                                    )}
                                </div>

                                {/* Support Widget */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group hover:border-teal-200 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-br from-teal-500 to-[#08A698] text-white overflow-hidden relative shadow-lg">
                                        <div className="relative z-10">
                                            <h3 className="text-xl font-bold mb-2">{config?.uiLabels?.helpTitle || 'Need Help?'}</h3>
                                            <p className="text-teal-50 opacity-90 text-sm max-w-sm">
                                                {config?.uiLabels?.helpSub || 'Stuck somewhere? Request support or watch our guide videos.'}
                                            </p>
                                        </div>
                                        <button className="relative z-10 px-6 py-3 bg-white text-[#08A698] rounded-xl font-bold text-sm shadow-md transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                                            {config?.uiLabels?.helpVideosBtn || 'View Help Videos'}
                                        </button>
                                    </div>
                                </div>

                                {/* Important Links Section - Moved to Sidebar for better fit */}
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200/60">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{config?.uiLabels?.quickLinksTitle || 'Quick Links'}</h3>
                                        <div className="flex flex-col gap-2">
                                            {(config?.importantLinks || []).map((link, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleActionClick(link)}
                                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all group text-left"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                                                        {React.createElement(iconMap[link.icon] || BoltIcon, { className: "w-5 h-5 text-gray-500 group-hover:text-[#08A698]" })}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">{link.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <CampaignModal
                isOpen={isCampaignModalOpen}
                onClose={() => setIsCampaignModalOpen(false)}
                onSuccess={() => {
                    toast.success('Campaign created successfully!');
                    navigate('/campaigns');
                }}
            />
        </div>
    );
}
