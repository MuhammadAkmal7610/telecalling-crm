import React, { useState } from 'react';
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

const getStartedActions = [
    { title: 'Add Team', description: 'Collaborate with team at one location', icon: UserPlusIcon, buttonText: '+ Add Team', path: '/users' },
    { title: 'Excel upload', description: 'Import your data flexibly', icon: DocumentArrowUpIcon, buttonText: '+ Import data', path: '/import-leads' },
    { title: 'Campaign', description: 'Create calling campaigns for your team', icon: MegaphoneIcon, buttonText: '+ Create Campaign', action: 'create-campaign' },
    { title: 'Lead', description: 'Connect with potential customers', icon: SignalIcon, buttonText: '+ Add lead', path: '/add-lead' },
    { title: 'Reports', description: 'Analyse your team performance', icon: PresentationChartLineIcon, buttonText: 'Check reports', path: '/reports' },
    { title: 'Lead Fields', description: 'Create your custom lead fields', icon: AdjustmentsHorizontalIcon, buttonText: '+ Custom Field', path: '/lead-fields' },
];

const integrations = [
    { name: 'Facebook', description: 'Capture and instantly engage with Facebook leads.', color: 'blue', linkText: 'How to use', buttonText: 'Connect', icon: FacebookLogo },
    { name: 'Google sheet', description: 'Capture and instantly engage with Google Sheet leads.', color: 'green', linkText: 'How to use', buttonText: 'Connect', icon: GoogleSheetsLogo },
];

const importantLinks = [
    { name: 'Configure sim', icon: WrenchScrewdriverIcon, path: '/dialer-settings' },
    { name: 'Configure call recording', icon: PhoneIcon, path: '/dialer-settings' },
    { name: 'How to start calling', icon: PlayCircleIcon, action: 'setup-guide' },
    { name: 'Buy new License', icon: ShoppingCartIcon, path: '/billing' },
    { name: 'Get WhatsApp Official API', icon: ChatBubbleLeftRightIcon, path: '/integrations' },
    { name: 'Create Automation', icon: BoltIcon, path: '/automations' },
];

export default function Home() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

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
                                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Get Started</h2>
                                            <p className="text-sm text-gray-500 mt-1">Quick actions to setup your CRM.</p>
                                        </div>
                                        <button
                                            onClick={() => handleActionClick({ action: 'setup-guide' })}
                                            className="text-[#08A698] font-semibold text-sm hover:underline flex items-center gap-1.5 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100 transition-colors hover:bg-teal-100"
                                        >
                                            <PlayCircleIcon className="w-5 h-5" /> Setup Guide
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        {getStartedActions.map((action, idx) => (
                                            <ActionCard
                                                key={idx}
                                                {...action}
                                                onClick={() => handleActionClick(action)}
                                            />
                                        ))}
                                    </div>
                                </section>

                                {/* Integrations Section */}
                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Integrations</h2>
                                            <p className="text-sm text-gray-500 mt-1">Connect your favorite tools.</p>
                                        </div>
                                        <button
                                            onClick={() => navigate('/integrations')}
                                            className="text-[#08A698] font-medium text-sm hover:text-teal-700 hover:underline"
                                        >
                                            Explore All &gt;
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <IntegrationCard
                                            name="Facebook"
                                            description="Capture and instantly engage with Facebook leads."
                                            color="blue"
                                            linkText="How to use"
                                            buttonText="Connect"
                                            icon={FacebookLogo}
                                            onClick={() => navigate('/integrations')}
                                        />
                                        <IntegrationCard
                                            name="Google sheet"
                                            description="Capture and instantly engage with Google Sheet leads."
                                            color="green"
                                            linkText="How to use"
                                            buttonText="Connect"
                                            icon={GoogleSheetsLogo}
                                            onClick={() => navigate('/integrations')}
                                        />
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
                                            <h3 className="font-bold text-gray-900 text-lg leading-tight truncate">WeWave CRM</h3>
                                            <p className="text-[#01875f] text-xs font-semibold mt-0.5">WeWave Inc.</p>
                                            <p className="text-[11px] text-gray-500 mt-0.5">Business</p>
                                        </div>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="flex items-center justify-between mb-5 px-1">
                                        <div className="flex flex-col items-center gap-0.5 border-r border-gray-100 pr-4 flex-1">
                                            <div className="flex items-center gap-1 font-bold text-gray-700 text-xs">
                                                4.8 <StarIconSolid className="w-3 h-3 pb-0.5" />
                                            </div>
                                            <span className="text-[10px] text-gray-500">2K reviews</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-0.5 border-r border-gray-100 px-4 flex-1">
                                            <span className="font-bold text-gray-700 text-xs">10K+</span>
                                            <span className="text-[10px] text-gray-500">Downloads</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-0.5 pl-4 flex-1">
                                            <span className="w-5 h-5 flex items-center justify-center border border-gray-700 rounded-sm text-[10px] font-bold text-gray-700 bg-white">E</span>
                                            <span className="text-[10px] text-gray-500">Everyone</span>
                                        </div>
                                    </div>

                                    {/* Install Button */}
                                    <button className="w-full bg-[#01875f] hover:bg-[#017250] text-white py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors text-center">
                                        Install
                                    </button>

                                    <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
                                        <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                                        Google Play Verified
                                    </div>
                                </div>

                                {/* Support Widget */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group hover:border-teal-200 transition-colors">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center text-[#08A698]">
                                                <PhoneIcon className="w-5 h-5" />
                                            </div>
                                            <h4 className="font-bold text-gray-900">Need Help?</h4>
                                        </div>

                                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                            Stuck somewhere? Request support or watch our guide videos.
                                        </p>

                                        <button className="w-full border border-[#08A698] text-[#08A698] hover:bg-[#08A698] hover:text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">
                                            View Help Videos
                                        </button>
                                    </div>
                                </div>

                                {/* Important Links Section - Moved to Sidebar for better fit */}
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200/60">
                                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Quick Links</h2>
                                    <div className="space-y-3">
                                        {importantLinks.map((link, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleActionClick(link)}
                                                className="w-full flex items-center gap-3 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:text-[#08A698] hover:border-teal-200 hover:shadow-sm transition-all group"
                                            >
                                                <link.icon className="w-4 h-4 text-gray-400 group-hover:text-[#08A698]" />
                                                <span className="truncate">{link.name}</span>
                                            </button>
                                        ))}
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
