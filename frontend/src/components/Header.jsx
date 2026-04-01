import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useWorkspace } from '../context/WorkspaceContext';
import {
    Bars3Icon, BellIcon, PhoneIcon, MagnifyingGlassIcon,
    Cog8ToothIcon, UsersIcon, CreditCardIcon,
    DocumentTextIcon, UserCircleIcon, ChatBubbleLeftEllipsisIcon, NoSymbolIcon, CogIcon, ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import Logo from '../assets/Logo.png';
import GlobalSearch from './GlobalSearch';
import WorkspaceSwitcher from './WorkspaceSwitcher';

export default function Header({ setIsSidebarOpen }) {
    const { user, signOut } = useAuth();
    const { toggleWorkspaceSwitcher } = useWorkspace();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+K for global search
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            // Ctrl+Shift+W for workspace switcher
            if (e.ctrlKey && e.shiftKey && e.key === 'W') {
                e.preventDefault();
                toggleWorkspaceSwitcher();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleWorkspaceSwitcher]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                const res = await fetch(`${API_URL}/notifications`, {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data?.data || data || []);
                }
            } catch (error) {
                // Silently fail — notifications are not critical
            }
        };
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            // Silently fail
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            await fetch(`${API_URL}/notifications/mark-all-read`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            // Silently fail
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <header className="flex h-16 items-center justify-between bg-white px-6 border-b border-gray-200 gap-4">
            {/* Left Section: Mobile Menu & Posh Logo */}
            <div className="flex items-center gap-4 shrink-0">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden text-gray-500 hover:bg-gray-100 p-2 rounded-full"
                >
                    <Bars3Icon className="h-6 w-6" />
                </button>

                {/* Standard Logo - Aligned with Sidebar */}
                <div className="flex items-center gap-3">
                    {/* <img src={Logo} alt="WeWave" className="w-10 h-10 object-contain" /> */}
                    <span className="text-2xl font-semibold text-gray-900 tracking-tight">
                        {user?.user_metadata?.orgName || 'CRM'}
                    </span>
                </div>
            </div>

            {/* Center Section: Search Bar (Reduced Width & Centered) */}
            <div className="flex-1 flex justify-center px-4">
                <div 
                    onClick={() => setIsSearchOpen(true)}
                    className="hidden md:flex items-center w-64 bg-gray-100/80 rounded-full px-4 py-2 cursor-pointer transition-all duration-300 hover:bg-gray-200/80 border border-transparent"
                >
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 mr-2.5" />
                    <span className="text-gray-400 text-sm font-medium flex-1">Search...</span>
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-gray-300 bg-white text-[10px] font-medium text-gray-400 shadow-sm">
                        Ctrl K
                    </kbd>
                </div>
            </div>

            <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            <div className="flex items-center gap-4">
                {/* Workspace Switcher - New Component */}
                <WorkspaceSwitcher />

                <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>

                <div className="flex items-center gap-2">
                    {/* Call Followups */}
                    {/* Call Followups */}
                    <Link to="/all-tasks" className="relative group p-2 bg-gray-50 text-gray-600 hover:text-[#08A698] hover:bg-gray-100 rounded-lg transition-all border border-transparent hover:border-gray-200">
                        <PhoneIcon className="h-6 w-6" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-[#08A698] rounded-full ring-2 ring-white animate-pulse"></span>

                        {/* Tooltip */}
                        <div className="absolute top-full right-1/2 translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                            Call Followups
                        </div>
                    </Link>

                    {/* Notifications */}
                    <div className="relative group">
                        <button className="relative p-2 bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all border border-transparent hover:border-gray-200">
                            <BellIcon className="h-6 w-6" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#08A698] px-1 text-[10px] font-bold text-white ring-2 ring-white">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50 overflow-hidden ring-1 ring-black/5 transition-all duration-200 ease-in-out delay-200 group-hover:delay-75">
                            {/* Header */}
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-[10px] font-bold text-[#08A698] hover:text-[#068f82] uppercase tracking-wide">
                                        Mark all as read
                                    </button>
                                )}
                            </div>

                            {/* Notification List */}
                            <div className="max-h-[320px] overflow-y-auto">
                                {notifications.length > 0 ? notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                                        className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 relative group/item ${!notif.isRead ? 'bg-gray-50/30' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="shrink-0 mt-1">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!notif.isRead ? 'bg-[#08A698]/10 text-[#08A698]' : 'bg-gray-100 text-gray-500'}`}>
                                                    <BellIcon className="w-4 h-4" />
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-xs text-gray-600">
                                                    <span className="font-semibold text-gray-900">{notif.title}</span> {notif.message}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-medium">
                                                    {new Date(notif.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {!notif.isRead && (
                                                <div className="shrink-0 self-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#08A698]"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                                        No new notifications.
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-2 border-t border-gray-100 bg-gray-50/30 text-center">
                                <Link to="/notifications" className="text-xs font-medium text-gray-500 hover:text-[#08A698] transition-colors block w-full py-1">
                                    View all notifications
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Profile Management - Admin + Settings Icon */}
                    <div className="relative group">
                        <button className="relative p-2 bg-gray-50 text-[#08A698] hover:text-[#068f82] hover:bg-gray-100 rounded-lg transition-all border border-transparent hover:border-gray-200">
                            <UserCircleIcon className="h-6 w-6" />
                            <div className="absolute bottom-0.5 right-0.5 bg-white rounded-full p-0.5 shadow-sm ring-1 ring-gray-100">
                                <Cog8ToothIcon className="h-2.5 w-2.5 text-[#08A698]" />
                            </div>
                        </button>

                        {/* Profile Dropdown Menu */}
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50 overflow-hidden ring-1 ring-black/5 transition-all duration-200 ease-in-out delay-200 group-hover:delay-75">

                            {/* User Info Header */}
                            {/* User Info Header */}
                            <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-gray-900 truncate max-w-[140px]">
                                        {user?.user_metadata?.name || user?.user_metadata?.full_name || 'User'}
                                    </span>
                                    <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-full text-[10px] font-semibold text-gray-600 flex items-center gap-1.5 uppercase tracking-wider shrink-0">
                                        <UsersIcon className="w-3 h-3 text-gray-500" />
                                        {user?.user_metadata?.role || 'User'}
                                    </span>
                                </div>
                                <div className="text-xs text-[#08A698] font-medium truncate">
                                    {user?.email}
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="p-2 space-y-0.5">
                                <Link to="/profile" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#08A698]/10 hover:text-[#08A698] rounded-lg transition-colors text-left group/item">
                                    <UserCircleIcon className="h-4 w-4 text-gray-400 group-hover/item:text-[#08A698]" />
                                    Profile
                                </Link>
                                <Link to="/templates" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#08A698]/10 hover:text-[#08A698] rounded-lg transition-colors text-left group/item">
                                    <ChatBubbleLeftEllipsisIcon className="h-4 w-4 text-gray-400 group-hover/item:text-[#08A698]" />
                                    Message Templates
                                </Link>
                                <Link to="/teammember-blocklist" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#08A698]/10 hover:text-[#08A698] rounded-lg transition-colors text-left group/item">
                                    <NoSymbolIcon className="h-4 w-4 text-gray-400 group-hover/item:text-[#08A698]" />
                                    Blocklist
                                </Link>
                                <Link to="/my-preferences" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#08A698]/10 hover:text-[#08A698] rounded-lg transition-colors text-left group/item">
                                    <CogIcon className="h-4 w-4 text-gray-400 group-hover/item:text-[#08A698]" />
                                    My Preferences
                                </Link>
                            </div>

                            {/* Logout Section */}
                            <div className="p-2 border-t border-gray-100 bg-gray-50/30">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors group/logout"
                                >
                                    <ArrowRightOnRectangleIcon className="h-4 w-4 text-gray-400 group-hover/logout:text-rose-500" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}