import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Bars3Icon, BellIcon, PhoneIcon, ChevronDownIcon, MagnifyingGlassIcon,
    BuildingOfficeIcon, Cog8ToothIcon, ListBulletIcon, FunnelIcon,
    AdjustmentsHorizontalIcon, UsersIcon, ShieldCheckIcon, CreditCardIcon,
    DocumentTextIcon, UserCircleIcon, ChatBubbleLeftEllipsisIcon, NoSymbolIcon, PowerIcon, CogIcon, ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import Logo from '../assets/Logo.png';

export default function Header({ setIsSidebarOpen }) {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (!token) return;
                const res = await fetch(`${API_URL}/notifications`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                }
            } catch (error) {
                console.error("Failed to fetch notifications");
            }
        };
        fetchNotifications();
    }, [API_URL]);

    const handleMarkAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Failed to mark as read");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            await fetch(`${API_URL}/notifications/mark-all-read`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Failed to mark all as read");
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
                        WeWave Inc.
                    </span>
                </div>
            </div>

            {/* Center Section: Search Bar (Reduced Width & Centered) */}
            <div className="flex-1 flex justify-center px-4">
                <div className="hidden md:flex items-center w-64 bg-gray-100/80 rounded-full px-4 py-2 transition-all duration-300 focus-within:bg-white focus-within:shadow-md focus-within:ring-2 focus-within:ring-teal-500/20 border border-transparent focus-within:border-teal-100">
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 mr-2.5" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-gray-700 text-sm w-full placeholder-gray-400 font-medium"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Workspace Settings Dropdown */}
                <div className="relative group">
                    <button className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all focus:ring-2 focus:ring-[#08A698]/20 focus:border-[#08A698]">
                        <BuildingOfficeIcon className="h-4 w-4 text-gray-500" />
                        <span>Workspace Settings</span>
                        <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50 overflow-hidden ring-1 ring-black/5 transition-all duration-200 ease-in-out delay-200 group-hover:delay-75">

                        {/* Section: WORKSPACE */}
                        <div className="bg-gray-50/50 px-4 py-2 border-b border-gray-100">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Workspace</span>
                        </div>
                        <div className="p-2 space-y-0.5">
                            <Link to="/manage-workspaces" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#08A698]/10 hover:text-[#08A698] rounded-lg transition-colors">
                                <Cog8ToothIcon className="h-4 w-4 text-gray-400" />
                                Manage Workspace
                            </Link>
                            <Link to="/lead-fields" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#08A698]/10 hover:text-[#08A698] rounded-lg transition-colors">
                                <ListBulletIcon className="h-4 w-4 text-gray-400" />
                                Lead Fields
                            </Link>
                            <Link to="/lead-stage-configure" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#08A698]/10 hover:text-[#08A698] rounded-lg transition-colors">
                                <FunnelIcon className="h-4 w-4 text-gray-400" />
                                Lead Stage
                            </Link>
                            <Link to="/call-feedback" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#08A698]/10 hover:text-[#08A698] rounded-lg transition-colors">
                                <PhoneIcon className="h-4 w-4 text-gray-400" />
                                Call Feedback
                            </Link>
                            <Link to="/enterprise-preferences" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#08A698]/10 hover:text-[#08A698] rounded-lg transition-colors">
                                <AdjustmentsHorizontalIcon className="h-4 w-4 text-gray-400" />
                                Preferences
                            </Link>
                        </div>

                        {/* Section: TEAM */}
                        <div className="bg-gray-50/50 px-4 py-2 border-y border-gray-100">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Team</span>
                        </div>
                        <div className="p-2 space-y-0.5">
                            <Link to="/users" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#08A698]/10 hover:text-[#08A698] rounded-lg transition-colors">
                                <UsersIcon className="h-4 w-4 text-gray-400" />
                                Users
                            </Link>
                            <Link to="/permission-templates" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#08A698]/10 hover:text-[#08A698] rounded-lg transition-colors">
                                <ShieldCheckIcon className="h-4 w-4 text-gray-400" />
                                Permission Templates
                            </Link>
                        </div>

                        {/* Section: BILLING */}
                        <div className="bg-gray-50/50 px-4 py-2 border-y border-gray-100">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Billing</span>
                        </div>
                        <div className="p-2 space-y-0.5">
                            <Link to="/billing" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#08A698]/10 hover:text-[#08A698] rounded-lg transition-colors">
                                <CreditCardIcon className="h-4 w-4 text-gray-400" />
                                Buy Licenses
                            </Link>
                            <Link to="/transaction-history" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#08A698]/10 hover:text-[#08A698] rounded-lg transition-colors">
                                <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                                Transaction History
                            </Link>
                        </div>
                    </div>
                </div>

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
                                <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-[#08A698] rounded-full ring-1 ring-white"></span>
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
                                    <span className="font-semibold text-gray-900">WeWave Inc.</span>
                                    <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-full text-[10px] font-semibold text-gray-600 flex items-center gap-1.5 uppercase tracking-wider">
                                        <UsersIcon className="w-3 h-3 text-gray-500" />
                                        Root
                                    </span>
                                </div>
                                <div className="text-xs text-[#08A698] font-medium truncate">
                                    admin@wewave.site
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