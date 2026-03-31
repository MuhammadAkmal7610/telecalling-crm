import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { usePermission } from '../hooks/usePermission';
import { useTheme } from '../context/ThemeContext';

import {
    HomeIcon, MagnifyingGlassIcon, UserPlusIcon, ListBulletIcon,
    MegaphoneIcon, FunnelIcon, QueueListIcon, ChartBarIcon, PhoneIcon,
    BoltIcon, CpuChipIcon, Cog6ToothIcon, PresentationChartLineIcon,
    DocumentArrowUpIcon, UserIcon, ArrowPathRoundedSquareIcon, CalendarIcon, ClipboardDocumentListIcon, CodeBracketIcon,
    TrophyIcon, ArrowDownTrayIcon, DocumentDuplicateIcon,
    UserGroupIcon, IdentificationIcon, ClipboardDocumentCheckIcon, ChatBubbleLeftRightIcon,
    GlobeAltIcon, CursorArrowRaysIcon, ArchiveBoxIcon, Squares2X2Icon, ViewColumnsIcon, DocumentTextIcon,
    ShieldCheckIcon, BuildingOfficeIcon, CreditCardIcon, ArrowTrendingUpIcon, ChatBubbleLeftRightIcon as WhatsAppIcon,
    EnvelopeIcon, SunIcon, MoonIcon, ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import Logo from '../assets/Logo.png';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const navigation = [
    { name: 'Dashboard', icon: PresentationChartLineIcon, path: '/dashboard' },
    { name: 'Pipeline', icon: ViewColumnsIcon, path: '/pipeline' },
    { name: 'Search', icon: MagnifyingGlassIcon, path: '/search' },
    { name: 'Email', icon: EnvelopeIcon, path: '/email-campaigns' },
    { name: 'Add Leads', icon: UserPlusIcon, path: '/add-leads' },
    { name: 'Activities', icon: ListBulletIcon, path: '/activities' },
    { name: 'WhatsApp', icon: WhatsAppIcon, path: '/whatsapp' },
    { name: 'Analytics', icon: ChartBarIcon, path: '/advanced-analytics' },
    { name: 'Campaigns', icon: MegaphoneIcon, path: '/campaigns' },
    { name: 'Filters', icon: FunnelIcon, path: '/filters' },
    { name: 'My Lists', icon: QueueListIcon, path: '/my-lists' },
    { name: 'Reports', icon: ChartBarIcon, path: '/reports' },
    { name: 'Automations', icon: BoltIcon, path: '/automations' },
    { name: 'My Preferences', icon: Cog6ToothIcon, path: '/my-preferences' },
    { name: 'Advanced Settings', icon: Cog6ToothIcon, path: '/enterprise-preferences' },
    { name: 'Integrations', icon: CpuChipIcon, path: '/integrations' },
];

function HoverMenu({ children, menuContent }) {
    const [isHovered, setIsHovered] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const timeoutRef = useRef(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // Align middle of the tooltip exactly with the item icon
            let topPosition = rect.top + (rect.height / 2);
            setPosition({ top: topPosition, left: rect.right });
        }
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsHovered(false);
        }, 150);
    };

    return (
        <div
            ref={triggerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="w-full relative flex justify-center"
        >
            {children}
            {isHovered && createPortal(
                <div
                    className="fixed z-[9999] pl-2 pointer-events-auto"
                    style={{ top: position.top + 'px', left: position.left + 'px', transform: 'translateY(-50%)' }}
                    onMouseEnter={() => {
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                        setIsHovered(true);
                    }}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-3 min-w-[220px] max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 relative">
                        <div className="absolute left-0 top-1/2 -ml-1.5 w-3 h-3 bg-white border-b border-l border-gray-100 transform -translate-y-1/2 rotate-45"></div>
                        <div className="relative z-10">{menuContent}</div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

export default function Sidebar({ isOpen, setIsOpen }) {
    const location = useLocation();
    const { can } = usePermission();
    const { isDarkMode, toggleTheme } = useTheme();
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <>
            {/* Desktop Navigation Rail */}
            <div className="hidden lg:flex flex-col items-center w-20 h-screen bg-white border-r border-gray-200 z-[100]">

                <Link to="/" className="h-16 w-full flex items-center justify-center border-b border-gray-200 mb-4 hover:bg-gray-50 transition-colors flex-shrink-0">
                    <img src={Logo} alt="WeWave" className="w-9 h-9 object-contain" />
                </Link>

                <nav className="flex flex-1 flex-col items-center gap-1 w-full px-2 overflow-y-auto overflow-x-hidden pb-2 sidebar-scrollbar relative">
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

                        const StaticTrigger = (
                            <div className="group/item flex flex-col items-center justify-center w-full py-1 rounded-lg transition-colors duration-200 hover:bg-gray-50 cursor-pointer">
                                <div className="flex items-center justify-center w-10 h-7 rounded-full mb-1 transition-colors duration-200 bg-transparent text-gray-500 group-hover/item:text-gray-900">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <span className="text-[9px] font-medium truncate max-w-full px-1 transition-colors duration-200 text-gray-500 group-hover/item:text-gray-900">
                                    {item.name}
                                </span>
                            </div>
                        );

                        if (item.name === 'Integrations') {
                            const content = (
                                <div className="flex flex-col gap-1 w-56">
                                    <Link to="/integrations" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-md cursor-pointer text-xs font-medium text-gray-700 transition-colors flex items-center gap-2">
                                        <CpuChipIcon className="w-4 h-4" /> All Integrations
                                    </Link>
                                    <Link to="/dialer-settings" className="px-3 py-2 hover:bg-teal-50 hover:text-teal-600 rounded-md cursor-pointer text-xs font-medium text-gray-700 transition-colors flex items-center gap-2">
                                        <PhoneIcon className="w-4 h-4" /> Auto-Dialer Setup
                                    </Link>
                                </div>
                            );
                            return <HoverMenu key={item.name} menuContent={content}>{StaticTrigger}</HoverMenu>;
                        }

                        if (item.name === 'Add Leads') {
                            const content = (
                                <div className="flex flex-col gap-1 w-56">
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
                            );
                            return <HoverMenu key={item.name} menuContent={content}>{StaticTrigger}</HoverMenu>;
                        }

                        if (item.name === 'Automations') {
                            const content = (
                                <div className="flex flex-col gap-1 w-56">
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
                            );
                            return <HoverMenu key={item.name} menuContent={content}>{StaticTrigger}</HoverMenu>;
                        }

                        if (item.name === 'Campaigns') {
                            const content = (
                                <div className="flex flex-col gap-1 w-56">
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
                            );
                            return <HoverMenu key={item.name} menuContent={content}>{StaticTrigger}</HoverMenu>;
                        }

                        if (item.name === 'Filters') {
                            const content = (
                                <div className="flex flex-col gap-1 w-56">
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
                            );
                            return <HoverMenu key={item.name} menuContent={content}>{StaticTrigger}</HoverMenu>;
                        }

                        if (item.name === 'Reports') {
                            const content = (
                                <div className="flex flex-col gap-1 w-64">
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
                            );
                            return <HoverMenu key={item.name} menuContent={content}>{StaticTrigger}</HoverMenu>;
                        }

                        return LinkContent;
                    })}
                </nav>

                {/* Admin Section */}
                {(can('manage_users') || can('manage_workspaces') || can('view_billing')) && (
                    <div className="mt-auto w-full pb-2 flex-shrink-0">
                        <div className="mx-2 mb-1">
                            <div className="h-px bg-gray-100"></div>
                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest text-center py-1">Admin</p>
                        </div>
                        <nav className="flex flex-col items-center gap-0.5 w-full px-2">
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
                        </nav>
                    </div>
                )}

                {/* Theme Toggle */}
                <div className="w-full pb-2 px-4">
                    <button
                        onClick={toggleTheme}
                        className="flex items-center justify-center w-full py-2 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group"
                        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {isDarkMode ? (
                            <SunIcon className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
                        ) : (
                            <MoonIcon className="w-5 h-5 text-gray-500 group-hover:scale-110 transition-transform" />
                        )}
                    </button>
                </div>

                {/* Logout Button */}
                <div className="w-full pb-4 px-2">
                    <button
                        onClick={handleLogout}
                        className="group/item flex flex-col items-center justify-center w-full py-1 rounded-lg transition-colors duration-200 hover:bg-rose-50 text-gray-500 hover:text-rose-600"
                        title="Sign Out"
                    >
                        <div className="flex items-center justify-center w-10 h-7 rounded-full mb-1">
                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        </div>
                        <span className="text-[9px] font-medium truncate max-w-full px-1">
                            Sign Out
                        </span>
                    </button>
                </div>
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
                    
                    {/* Mobile Logout Case */}
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-4 px-6 py-3 rounded-full text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors mt-4"
                    >
                        <ArrowRightOnRectangleIcon className="h-6 w-6" />
                        <span>Sign Out</span>
                    </button>
                </nav>
            </div>
        </>
    );
}
