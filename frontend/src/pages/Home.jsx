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
        <div className="flex h-screen bg-[#F8F9FA] text-[#1e293b] font-sans selection:bg-teal-500 selection:text-white relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-teal-200/40 via-blue-200/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
            <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-gradient-to-tr from-teal-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} className="z-20 relative" />

            <div className="flex flex-1 flex-col overflow-hidden z-10 relative bg-white/40 backdrop-blur-3xl border-l border-white/50 shadow-[-10px_0_30px_rgb(0,0,0,0.02)]">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto px-4 py-8 lg:px-10 bg-transparent">
                    <div className="mx-auto max-w-7xl relative">

                        {/* Top Spacer */}
                        <div className="h-6"></div>

                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
                            {/* Main Content Area (3 Cols) */}
                            <div className="xl:col-span-3 space-y-12">

                                {/* Get Started Section */}
                                <section className="relative z-10">
                                    <div className="flex items-center justify-between mb-10 relative">
                                        <div className="relative z-10">
                                            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 tracking-tight">{config?.uiLabels?.getStartedTitle || 'Get Started'}</h2>
                                            <p className="text-base text-gray-500 mt-2 font-medium">{config?.uiLabels?.getStartedSub || 'Quick actions to setup your CRM.'}</p>
                                        </div>
                                        <div className="absolute -left-4 -top-4 w-24 h-24 bg-teal-100/50 rounded-full blur-2xl -z-10"></div>
                                        <button
                                            onClick={() => handleActionClick({ action: 'setup-guide' })}
                                            className="group text-teal-600 font-semibold text-sm hover:text-white flex items-center gap-2 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-xl border border-teal-100/60 hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-teal-500/25 hover:bg-gradient-to-r hover:from-teal-500 hover:to-teal-600 relative overflow-hidden"
                                        >
                                            <div className="absolute inset-x-0 h-px w-1/2 mx-auto -top-px shadow-2xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <PlayCircleIcon className="w-5 h-5 group-hover:animate-pulse drop-shadow-sm" /> 
                                            <span className="drop-shadow-sm">{config?.uiLabels?.setupGuideBtn || 'Setup Guide'}</span>
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
                                <section className="relative z-10 pt-4">
                                    <div className="flex items-center justify-between mb-8 relative">
                                        <div className="relative z-10">
                                            <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 tracking-tight">{config?.uiLabels?.integrationsTitle || 'Integrations'}</h2>
                                            <p className="text-base text-gray-500 mt-2 font-medium">{config?.uiLabels?.integrationsSub || 'Connect your favorite tools.'}</p>
                                        </div>
                                        <button
                                            onClick={() => navigate('/integrations')}
                                            className="text-teal-600 font-bold text-sm hover:text-teal-700 hover:underline transition-colors px-4 py-2 hover:bg-teal-50/50 rounded-lg"
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
                            <div className="space-y-6 xl:mt-0 xl:pl-4">

                                {/* Authentic Play Store Listing Card */}
                                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-6 overflow-hidden relative group hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-100/50 to-transparent rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                                    <div className="flex gap-4 mb-5 relative z-10">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-teal-50/50 border border-teal-100/50 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                                            <img src={Logo} alt="WeWave" className="w-10 h-10 object-contain drop-shadow-sm" />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h3 className="font-extrabold text-gray-900 text-lg leading-tight truncate tracking-tight">{config?.uiLabels?.appName || 'CRM App'}</h3>
                                            <p className="text-teal-600 text-xs font-bold mt-1 uppercase tracking-wide">{config?.uiLabels?.appSubtitle || 'Verified'}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 font-medium">{config?.appStats?.category || 'Business'}</p>
                                        </div>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="flex items-center justify-between mb-6 px-1 relative z-10 bg-gray-50/50 rounded-xl p-3 border border-gray-100/50">
                                        <div className="flex flex-col items-center gap-1 border-r border-gray-200/60 pr-4 flex-1">
                                            <div className="flex items-center gap-1 font-bold text-gray-800 text-sm">
                                                {config?.appStats?.rating || '4.8'} <StarIconSolid className="w-3.5 h-3.5 pb-0.5 text-yellow-500 drop-shadow-sm" />
                                            </div>
                                            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{config?.appStats?.reviews || '8.2K'} reviews</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1 border-r border-gray-200/60 px-4 flex-1">
                                            <span className="font-bold text-gray-800 text-sm">{config?.appStats?.downloads || '100K+'}</span>
                                            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Downloads</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1 pl-4 flex-1">
                                            <span className="w-5 h-5 flex items-center justify-center border-2 border-gray-800 rounded text-[10px] font-bold text-gray-800 bg-white shadow-sm">E</span>
                                            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Everyone</span>
                                        </div>
                                    </div>

                                    {/* Install Button */}
                                    <button className="w-full relative z-10 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300 text-center flex items-center justify-center gap-2 group/btn">
                                        <DevicePhoneMobileIcon className="w-5 h-5 group-hover/btn:animate-bounce" />
                                        {config?.uiLabels?.installBtn || 'Install Mobile App'}
                                    </button>

                                    {config?.appStats?.verified && (
                                        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium">
                                            <svg className="w-3.5 h-3.5 opacity-60 text-teal-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                                            Protected by Google Play Protect
                                        </div>
                                    )}
                                </div>

                                {/* Support Widget */}
                                <div className="rounded-2xl border-0 shadow-[0_10px_40px_rgb(0,0,0,0.08)] relative overflow-hidden group transition-all duration-500 hover:-translate-y-1">
                                    <div className="flex flex-col gap-5 p-7 bg-gradient-to-br from-teal-600 via-teal-500 to-teal-700 text-white overflow-hidden relative">
                                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors duration-500"></div>
                                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-xl"></div>
                                        
                                        <div className="relative z-10 flex flex-col items-center text-center">
                                            <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-4 border border-white/30 shadow-lg">
                                                <ChatBubbleLeftRightIcon className="w-7 h-7 text-white" />
                                            </div>
                                            <h3 className="text-2xl font-extrabold mb-2 tracking-tight text-white drop-shadow-sm">{config?.uiLabels?.helpTitle || 'Need Help?'}</h3>
                                            <p className="text-teal-50/90 text-sm mb-6 leading-relaxed font-medium">
                                                {config?.uiLabels?.helpSub || 'Stuck somewhere? Request support or watch our guide videos.'}
                                            </p>
                                            <button className="w-full px-6 py-3 bg-white text-teal-600 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-white/20 hover:-translate-y-0.5 active:translate-y-0 hover:bg-gray-50 flex items-center justify-center gap-2">
                                                <PlayCircleIcon className="w-5 h-5" />
                                                {config?.uiLabels?.helpVideosBtn || 'Watch Tutorials'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Important Links Section */}
                                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                    <div className="space-y-5">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{config?.uiLabels?.quickLinksTitle || 'Quick Links'}</h3>
                                        <div className="flex flex-col gap-2">
                                            {(config?.importantLinks || []).map((link, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleActionClick(link)}
                                                    className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-white border border-transparent hover:border-teal-50 hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all duration-300 group text-left relative overflow-hidden"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-teal-50/0 via-teal-50/50 to-teal-50/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-teal-50/50 group-hover:border-teal-100 transition-all duration-300 relative z-10">
                                                        {React.createElement(iconMap[link.icon] || BoltIcon, { className: "w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors" })}
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors relative z-10">{link.name}</span>
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
