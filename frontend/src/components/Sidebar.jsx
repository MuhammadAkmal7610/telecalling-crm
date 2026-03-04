import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePermission } from '../hooks/usePermission';

import {
    HomeIcon, MagnifyingGlassIcon, UserPlusIcon, ListBulletIcon,
    MegaphoneIcon, FunnelIcon, QueueListIcon, ChartBarIcon, PhoneIcon,
    BoltIcon, CpuChipIcon, Cog6ToothIcon, PresentationChartLineIcon,
    DocumentArrowUpIcon, UserIcon, ArrowPathRoundedSquareIcon, CalendarIcon, ClipboardDocumentListIcon, CodeBracketIcon,
    TrophyIcon, ArrowDownTrayIcon, DocumentDuplicateIcon,
    UserGroupIcon, IdentificationIcon, ClipboardDocumentCheckIcon, ChatBubbleLeftRightIcon,
    GlobeAltIcon, CursorArrowRaysIcon, ArchiveBoxIcon, Squares2X2Icon, ViewColumnsIcon, DocumentTextIcon,
    ShieldCheckIcon, BuildingOfficeIcon, CreditCardIcon
} from '@heroicons/react/24/outline';
import Logo from '../assets/Logo.png';

const navigation = [

    { name: 'Dashboard', icon: PresentationChartLineIcon, path: '/dashboard' },
    { name: 'Pipeline', icon: ViewColumnsIcon, path: '/pipeline' }, // Core feature added
    { name: 'Search', icon: MagnifyingGlassIcon, path: '/search' }, // Assuming search path, logic was missing before
    { name: 'Add Leads', icon: UserPlusIcon, path: '/add-leads' },
    { name: 'Activities', icon: ListBulletIcon, path: '/activities' },
    { name: 'Campaigns', icon: MegaphoneIcon, path: '/campaigns' },
    { name: 'Filters', icon: FunnelIcon, path: '/filters' },
    { name: 'My Lists', icon: QueueListIcon, path: '/my-lists' },
    { name: 'Reports', icon: ChartBarIcon, path: '/reports' },
    { name: 'Automations', icon: BoltIcon, path: '/automations' },
    { name: 'Integrations', icon: CpuChipIcon, path: '/integrations' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
    const location = useLocation();
    const { can } = usePermission();

    return (
        <>
            {/* Desktop Navigation Rail */}
            <div className="hidden lg:flex flex-col items-center w-20 h-screen bg-white border-r border-gray-200 z-20">

                {/* Logo - Aligned with Header */}
                <Link to="/" className="h-16 w-full flex items-center justify-center border-b border-gray-200 mb-4 hover:bg-gray-50 transition-colors">
                    <img src={Logo} alt="WeWave" className="w-9 h-9 object-contain" />
                </Link>

                {/* Nav Items */}
                <nav className="flex flex-1 flex-col items-center gap-1 w-full px-2 overflow-visible pb-2">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                        const to = item.path || '#';

                        const LinkContent = (
                            <Link
                                key={item.name}
                                to={to}
                                className="group/item flex flex-col items-center justify-center w-full py-1 rounded-lg transition-colors duration-200 hover:bg-gray-50"
                            >
                                <div className={`flex items-center justify-center w-10 h-7 rounded-full mb-1 transition-colors duration-200 ${isActive ? 'bg-gray-100 text-[#08A698]' : 'bg-transparent text-gray-500 group-hover/item:text-gray-900'}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <span className={`text-[9px] font-medium truncate max-w-full px-1 transition-colors duration-200 ${isActive ? 'text-[#08A698]' : 'text-gray-500 group-hover/item:text-gray-900'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        );

                        if (item.name === 'Integrations') {
                            return (
                                <div key={item.name} className="relative group w-full flex justify-center">
                                    <div className="group/item flex flex-col items-center justify-center w-full py-1 rounded-lg transition-colors duration-200 hover:bg-gray-50 cursor-default">
                                        <div className="flex items-center justify-center w-10 h-7 rounded-full mb-1 transition-colors duration-200 bg-transparent text-gray-500 group-hover/item:text-gray-900">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-[9px] font-medium truncate max-w-full px-1 transition-colors duration-200 text-gray-500 group-hover/item:text-gray-900">
                                            {item.name}
                                        </span>
                                    </div>

                                    {/* Hover Card */}
                                    <div className="absolute left-14 top-0 ml-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 p-2 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex flex-col gap-1">
                                            {/* Arrow visual */}
                                            <div className="absolute top-4 -left-1.5 w-3 h-3 bg-white border-t border-l border-gray-100 transform -rotate-45"></div>

                                            <Link to="/integrations" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-md cursor-pointer text-xs font-medium text-gray-700 transition-colors flex items-center gap-2">
                                                <CpuChipIcon className="w-4 h-4" /> All Integrations
                                            </Link>
                                            <Link to="/dialer-settings" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-md cursor-pointer text-xs font-medium text-gray-700 transition-colors flex items-center gap-2">
                                                <PhoneIcon className="w-4 h-4" /> Auto-Dialer Setup
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        if (item.name === 'Add Leads') {
                            return (
                                <div key={item.name} className="relative group w-full flex justify-center">
                                    <div className="group/item flex flex-col items-center justify-center w-full py-1 rounded-lg transition-colors duration-200 hover:bg-gray-50 cursor-default">
                                        <div className="flex items-center justify-center w-10 h-7 rounded-full mb-1 transition-colors duration-200 bg-transparent text-gray-500 group-hover/item:text-gray-900">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-[9px] font-medium truncate max-w-full px-1 transition-colors duration-200 text-gray-500 group-hover/item:text-gray-900">
                                            {item.name}
                                        </span>
                                    </div>

                                    {/* Hover Card */}
                                    <div className="absolute left-14 top-0 ml-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 p-2 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex flex-col gap-1">
                                            {/* Arrow visual */}
                                            <div className="absolute top-4 -left-1.5 w-3 h-3 bg-white border-t border-l border-gray-100 transform -rotate-45"></div>

                                            <Link to="/add-lead" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-md cursor-pointer text-xs font-medium text-gray-700 transition-colors flex items-center gap-2">
                                                <UserIcon className="w-4 h-4" /> Add single lead
                                            </Link>
                                            <Link to="/import-leads" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-md cursor-pointer text-xs font-medium text-gray-700 transition-colors flex items-center gap-2">
                                                <DocumentArrowUpIcon className="w-4 h-4" /> Add from excel
                                            </Link>
                                            <Link to="/integrations" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-md cursor-pointer text-xs font-medium text-gray-700 transition-colors flex items-center gap-2">
                                                <CpuChipIcon className="w-4 h-4" /> Add from Integration
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        if (item.name === 'Automations') {
                            return (
                                <div key={item.name} className="relative group w-full flex justify-center">
                                    <div className="group/item flex flex-col items-center justify-center w-full py-1 rounded-lg transition-colors duration-200 hover:bg-gray-50 cursor-default">
                                        <div className="flex items-center justify-center w-10 h-7 rounded-full mb-1 transition-colors duration-200 bg-transparent text-gray-500 group-hover/item:text-gray-900">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-[9px] font-medium truncate max-w-full px-1 transition-colors duration-200 text-gray-500 group-hover/item:text-gray-900">
                                            {item.name}
                                        </span>
                                    </div>

                                    {/* Hover Card */}
                                    <div className="absolute left-14 top-0 ml-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 p-2 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex flex-col gap-1">
                                            {/* Arrow visual */}
                                            <div className="absolute top-4 -left-1.5 w-3 h-3 bg-white border-t border-l border-gray-100 transform -rotate-45"></div>

                                            <Link to="/workflows" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-md cursor-pointer text-xs font-medium text-gray-700 transition-colors flex items-center gap-2">
                                                <ArrowPathRoundedSquareIcon className="w-4 h-4" /> Workflows
                                            </Link>
                                            <Link to="/schedules" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-md cursor-pointer text-xs font-medium text-gray-700 transition-colors flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4" /> Schedules
                                            </Link>
                                            <Link to="/salesforms" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-md cursor-pointer text-xs font-medium text-gray-700 transition-colors flex items-center gap-2">
                                                <ClipboardDocumentListIcon className="w-4 h-4" /> Salesform
                                            </Link>
                                            <Link to="/api-templates" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-md cursor-pointer text-xs font-medium text-gray-700 transition-colors flex items-center gap-2">
                                                <CodeBracketIcon className="w-4 h-4" /> API Templates
                                            </Link>
                                            <Link to="/call-scripts" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-md cursor-pointer text-xs font-medium text-gray-700 transition-colors flex items-center gap-2">
                                                <DocumentTextIcon className="w-4 h-4" /> Call Scripts
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        if (item.name === 'Campaigns') {
                            return (
                                <div key={item.name} className="relative group w-full flex justify-center">
                                    <div className="group/item flex flex-col items-center justify-center w-full py-1 rounded-lg transition-colors duration-200 hover:bg-gray-50 cursor-default">
                                        <div className="flex items-center justify-center w-10 h-7 rounded-full mb-1 transition-colors duration-200 bg-transparent text-gray-500 group-hover/item:text-gray-900">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-[9px] font-medium truncate max-w-full px-1 transition-colors duration-200 text-gray-500 group-hover/item:text-gray-900">
                                            {item.name}
                                        </span>
                                    </div>

                                    {/* Hover Card */}
                                    <div className="absolute left-14 top-0 ml-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 p-2 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex flex-col gap-1">
                                            {/* Arrow visual */}
                                            <div className="absolute top-4 -left-1.5 w-3 h-3 bg-white border-t border-l border-gray-100 transform -rotate-45"></div>

                                            <Link to="/website-leads" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-md cursor-pointer text-xs font-medium text-gray-700 transition-colors flex items-center gap-2">
                                                <GlobeAltIcon className="w-4 h-4" /> Website Leads
                                            </Link>
                                            <Link to="/facebook-leads" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-md cursor-pointer text-xs font-medium text-gray-700 transition-colors flex items-center gap-2">
                                                <CursorArrowRaysIcon className="w-4 h-4" /> Facebook Leads
                                            </Link>
                                            <Link to="/old-leads" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-md cursor-pointer text-xs font-medium text-gray-700 transition-colors flex items-center gap-2">
                                                <ArchiveBoxIcon className="w-4 h-4" /> Old Leads
                                            </Link>
                                            <Link to="/campaigns" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-md cursor-pointer text-xs font-medium text-gray-700 transition-colors flex items-center gap-2">
                                                <Squares2X2Icon className="w-4 h-4" /> See All
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        if (item.name === 'Filters') {
                            return (
                                <div key={item.name} className="relative group w-full flex justify-center">
                                    <div className="group/item flex flex-col items-center justify-center w-full py-1 rounded-lg transition-colors duration-200 hover:bg-gray-50 cursor-default">
                                        <div className="flex items-center justify-center w-10 h-7 rounded-full mb-1 transition-colors duration-200 bg-transparent text-gray-500 group-hover/item:text-gray-900">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-[9px] font-medium truncate max-w-full px-1 transition-colors duration-200 text-gray-500 group-hover/item:text-gray-900">
                                            {item.name}
                                        </span>
                                    </div>

                                    {/* Hover Card */}
                                    <div className="absolute left-14 top-0 ml-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 p-2 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex flex-col gap-1">
                                            {/* Arrow visual */}
                                            <div className="absolute top-4 -left-1.5 w-3 h-3 bg-white border-t border-l border-gray-100 transform -rotate-45"></div>

                                            <Link to="/all-leads" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-md cursor-pointer text-xs font-medium text-gray-700 transition-colors flex items-center gap-2">
                                                <UserGroupIcon className="w-4 h-4" /> All Leads
                                            </Link>
                                            <Link to="/assigned-leads" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-md cursor-pointer text-xs font-medium text-gray-700 transition-colors flex items-center gap-2">
                                                <UserIcon className="w-4 h-4" /> Leads Assigned to me
                                            </Link>
                                            <Link to="/my-leads" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-md cursor-pointer text-xs font-medium text-gray-700 transition-colors flex items-center gap-2">
                                                <IdentificationIcon className="w-4 h-4" /> My Leads
                                            </Link>
                                            <Link to="/daily-report" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-md cursor-pointer text-xs font-medium text-gray-700 transition-colors flex items-center gap-2">
                                                <ClipboardDocumentCheckIcon className="w-4 h-4" /> Daily Report
                                            </Link>
                                            <Link to="/whatsapp-leads" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-md cursor-pointer text-xs font-medium text-gray-700 transition-colors flex items-center gap-2">
                                                <ChatBubbleLeftRightIcon className="w-4 h-4" /> All Incoming Whatsapp Leads
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        if (item.name === 'Reports') {
                            return (
                                <div key={item.name} className="relative group w-full flex justify-center">
                                    <div className="group/item flex flex-col items-center justify-center w-full py-1 rounded-lg transition-colors duration-200 hover:bg-gray-50 cursor-default">
                                        <div className="flex items-center justify-center w-10 h-7 rounded-full mb-1 transition-colors duration-200 bg-transparent text-gray-500 group-hover/item:text-gray-900">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-[9px] font-medium truncate max-w-full px-1 transition-colors duration-200 text-gray-500 group-hover/item:text-gray-900">
                                            {item.name}
                                        </span>
                                    </div>

                                    {/* Hover Card */}
                                    <div className="absolute left-14 top-0 ml-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex flex-col gap-1">
                                            {/* Arrow visual */}
                                            <div className="absolute top-4 -left-1.5 w-3 h-3 bg-white border-t border-l border-gray-100 transform -rotate-45"></div>

                                            <p className="px-3 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Insights</p>

                                            <Link to="/leaderboard" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-lg cursor-pointer text-xs font-semibold text-gray-700 transition-all flex items-center gap-2">
                                                <TrophyIcon className="w-4 h-4" /> Leaderboard
                                            </Link>
                                            <Link to="/call-report" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-lg cursor-pointer text-xs font-semibold text-gray-700 transition-all flex items-center gap-2">
                                                <PhoneIcon className="w-4 h-4" /> Call Report
                                            </Link>
                                            <Link to="/reports" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-lg cursor-pointer text-xs font-semibold text-gray-700 transition-all flex items-center gap-2">
                                                <ArrowTrendingUpIcon className="w-4 h-4 text-teal-500" /> Conversion Rate
                                            </Link>
                                            <Link to="/reports" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-lg cursor-pointer text-xs font-semibold text-gray-700 transition-all flex items-center gap-2">
                                                <UserGroupIcon className="w-4 h-4 text-teal-500" /> Agent Performance
                                            </Link>

                                            <div className="h-px bg-gray-50 my-1"></div>
                                            <p className="px-3 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Downloads</p>

                                            <Link to="/report-download" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-lg cursor-pointer text-xs font-semibold text-gray-700 transition-all flex items-center gap-2">
                                                <ArrowDownTrayIcon className="w-4 h-4" /> Report Download
                                            </Link>
                                            <Link to="/all-duplicates" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-lg cursor-pointer text-xs font-semibold text-gray-700 transition-all flex items-center gap-2">
                                                <DocumentDuplicateIcon className="w-4 h-4" /> All Duplicates
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return LinkContent;
                    })}
                </nav>

                {/* Admin Section */}
                {(can('manage_users') || can('manage_workspaces') || can('view_billing')) && (
                    <div className="mt-auto w-full pb-2">
                        <div className="mx-2 mb-1">
                            <div className="h-px bg-gray-100"></div>
                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest text-center py-1">Admin</p>
                        </div>
                        {[
                            { name: 'Admin', icon: ShieldCheckIcon, path: '/admin', permission: 'manage_users' },
                            { name: 'Users', icon: UserGroupIcon, path: '/users', permission: 'manage_users' },
                            { name: 'Workspaces', icon: BuildingOfficeIcon, path: '/manage-workspaces', permission: 'manage_workspaces' },
                            { name: 'Billing', icon: CreditCardIcon, path: '/billing', permission: 'view_billing' },
                        ].map(item => {
                            if (item.permission && !can(item.permission)) return null;
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className="group/item flex flex-col items-center justify-center w-full py-1 px-2 rounded-lg transition-colors duration-200 hover:bg-gray-50"
                                >
                                    <div className={`flex items-center justify-center w-10 h-7 rounded-full mb-0.5 transition-colors duration-200 ${isActive ? 'bg-gray-100 text-[#08A698]' : 'bg-transparent text-gray-400 group-hover/item:text-gray-900'
                                        }`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <span className={`text-[8px] font-medium truncate max-w-full px-1 transition-colors duration-200 ${isActive ? 'text-[#08A698]' : 'text-gray-400 group-hover/item:text-gray-700'
                                        }`}>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Mobile Sidebar (Drawer) */}
            <div
                className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-elevation-2 transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex bg-white h-16 items-center px-6 border-b border-gray-100">
                    <img src={Logo} alt="WeWave" className="w-10 h-10 mr-3" />
                    <span className="text-xl font-medium text-gray-800">WeWave</span>
                </div>

                <nav className="p-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                        const to = item.path || '#';

                        return (
                            <Link
                                key={item.name}
                                to={to}
                                className={`flex items-center gap-4 px-6 py-3 rounded-full text-sm font-medium transition-colors ${isActive ? 'bg-teal-50 text-[#08A698]' : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <item.icon className="h-6 w-6" />
                                <span>{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </>
    );
}
