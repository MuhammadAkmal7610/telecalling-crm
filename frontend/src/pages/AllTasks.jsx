import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../lib/supabaseClient';
import WorkspaceGuard from '../components/WorkspaceGuard';
import {
    ArrowPathIcon,
    ArrowUpTrayIcon,
    FunnelIcon,
    ChevronDownIcon,
    ArrowDownTrayIcon,
    UserIcon,
    CalendarIcon,
    FlagIcon,
    QueueListIcon,
    StarIcon,
    EnvelopeIcon,
    PhoneIcon,
    HashtagIcon,
    TableCellsIcon,
    ListBulletIcon,
    MagnifyingGlassIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import TaskModal from '../components/TaskModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const AllTasks = () => {
    const [activeTab, setActiveTab] = useState('Call Followups');
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, [activeTab]);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Map frontend tab to backend TaskType
            const type = activeTab === 'Call Followups' ? 'CallFollowup' : 'Todo';
            const res = await fetch(`${API_URL}/tasks?type=${type}`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            const result = await res.json();
            const data = result.data?.data || result.data || [];

            setTasks(data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Urgent': return 'text-red-500 fill-red-500';
            case 'High': return 'text-yellow-500 fill-yellow-500';
            case 'Medium': return 'text-sky-400 fill-sky-400';
            case 'Low': return 'text-gray-300 fill-gray-300';
            default: return 'text-gray-400 fill-none';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-400';
            case 'Rescheduled': return 'bg-orange-500';
            case 'Late': return 'bg-red-500';
            case 'Done': return 'bg-green-600';
            case 'Cancelled': return 'bg-gray-500';
            default: return 'bg-gray-400';
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans relative">
            {/* Bulk Upload Modal */}
            {isBulkUploadOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-teal-900/20 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in relative">
                        {/* Header */}
                        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-600 rounded-md flex items-center justify-center shadow-sm">
                                    <span className="text-white font-bold text-xl">X</span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Bulk add tasks</h2>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 border border-[#08A698] text-[#08A698] rounded-lg font-medium text-sm hover:bg-[#08A698]/5 transition-colors">
                                <ArrowDownTrayIcon className="w-4 h-4" />
                                Download sample
                            </button>
                        </div>

                        {/* Body - Dashed Area */}
                        <div className="p-8">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl bg-[#08A698]/[0.02] p-12 relative overflow-hidden group hover:border-[#08A698]/50 transition-colors">
                                {/* Decorative Corner Shapes */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#08A698]/5 transform rotate-45 translate-x-16 -translate-y-16"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#08A698]/5 transform rotate-45 -translate-x-16 translate-y-16"></div>

                                <div className="flex flex-col items-center justify-center relative z-10">
                                    <div className="w-16 h-16 bg-[#08A698]/10 rounded-full flex items-center justify-center mb-4 text-[#08A698]">
                                        <ArrowUpTrayIcon className="w-8 h-8" />
                                    </div>

                                    <p className="text-lg text-gray-700 font-medium mb-6">
                                        Click to upload .csv or .xlsx files
                                    </p>

                                    <button className="bg-[#08A698] hover:bg-[#068f82] text-white px-8 py-2.5 rounded-lg font-bold shadow-sm transition-all transform active:scale-95 flex items-center gap-2 mb-3">
                                        <ArrowUpTrayIcon className="w-5 h-5" />
                                        Upload file
                                    </button>

                                    <button className="text-gray-400 hover:text-[#08A698] text-xs flex items-center gap-1 transition-colors">
                                        <ArrowDownTrayIcon className="w-3 h-3" />
                                        Download sample
                                    </button>
                                </div>

                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                        </div>

                        {/* Close Button (X in corner) */}
                        <button
                            onClick={() => setIsBulkUploadOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    {/* Overlay Click to Close */}
                    <div className="absolute inset-0 z-[-1]" onClick={() => setIsBulkUploadOpen(false)}></div>
                </div>
            )}

            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-6">
                    <WorkspaceGuard>
                        <div className="max-w-7xl mx-auto space-y-4">

                            {/* Top Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl font-bold text-gray-800">Tasks</h1>
                                    <button
                                        onClick={fetchTasks}
                                        className={`text-[#08A698] hover:bg-teal-50 p-1 rounded-full transition-colors ${loading ? 'animate-spin' : ''}`}
                                    >
                                        <ArrowPathIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 relative">
                                    {/* Download Button & Popover */}
                                    <button
                                        onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                                        className="border border-[#08A698] text-[#08A698] hover:bg-[#08A698]/5 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors relative z-20"
                                    >
                                        <ArrowDownTrayIcon className="w-4 h-4" />
                                        Download
                                    </button>

                                    {/* Download Popover */}
                                    {isDownloadOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsDownloadOpen(false)}></div>
                                            <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-30 overflow-hidden animate-fade-in">
                                                {/* Header */}
                                                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                                                    <h3 className="font-bold text-gray-800 text-lg">Select data to download</h3>
                                                    <button className="bg-[#08A698] hover:bg-[#068f82] text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-colors">
                                                        Download
                                                    </button>
                                                </div>

                                                {/* Search */}
                                                <div className="px-5 py-3 bg-gray-50 flex items-center justify-between border-b border-gray-100">
                                                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 flex-1 mr-4">
                                                        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            placeholder="Search Fields"
                                                            className="text-sm outline-none text-gray-700 placeholder-gray-400 w-full"
                                                        />
                                                    </div>
                                                    <button className="text-sm text-[#08A698] hover:underline font-medium whitespace-nowrap">
                                                        Select all
                                                    </button>
                                                </div>

                                                {/* Fields List */}
                                                <div className="max-h-[400px] overflow-y-auto p-2 pointer-events-auto">
                                                    {[
                                                        { label: 'Status', icon: <QueueListIcon className="w-4 h-4" /> },
                                                        { label: 'Lost Reason', icon: null },
                                                        { label: 'Rating', icon: <StarIcon className="w-4 h-4" /> },
                                                        { label: 'Assignee', icon: <UserIcon className="w-4 h-4" /> },
                                                        { label: 'Name', icon: <span className="font-serif font-bold text-xs">T</span> },
                                                        { label: 'Email', icon: <EnvelopeIcon className="w-4 h-4" /> },
                                                        { label: 'Do You Want to earn Millions', icon: <span className="font-serif font-bold text-xs">T</span> },
                                                        { label: 'Phone', icon: <PhoneIcon className="w-4 h-4" /> },
                                                        { label: 'Alternate Phone', icon: <PhoneIcon className="w-4 h-4" /> },
                                                        { label: 'Facebook Ad', icon: <span className="font-serif font-bold text-xs">T</span> },
                                                        { label: 'Facebook Campaign', icon: <span className="font-serif font-bold text-xs">T</span> },
                                                        { label: 'Lead ID FACEBOOK', icon: <span className="font-serif font-bold text-xs">T</span> },
                                                        { label: 'City', icon: <span className="font-serif font-bold text-xs">T</span> },
                                                        { label: 'Age', icon: <HashtagIcon className="w-4 h-4" /> },
                                                        { label: 'Do You Want to earn MillionsS', icon: <ListBulletIcon className="w-4 h-4" /> },
                                                        { label: 'Whats your goal with forex trading', icon: <ListBulletIcon className="w-4 h-4" /> },
                                                        { label: 'Reason of Joining', icon: <ListBulletIcon className="w-4 h-4" /> },
                                                        { label: 'Employment Status', icon: <ListBulletIcon className="w-4 h-4" /> },
                                                        { label: 'Job Title', icon: <span className="font-serif font-bold text-xs">T</span> },
                                                        { label: 'Created On', icon: <CalendarIcon className="w-4 h-4" /> },
                                                        { label: 'Batch Names', icon: <TableCellsIcon className="w-4 h-4" /> },
                                                        { label: 'Assignee Manager', icon: <UserIcon className="w-4 h-4" /> },
                                                    ].map((field, idx) => (
                                                        <div key={idx} className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer group transition-colors">
                                                            <input type="checkbox" className="rounded border-gray-300 text-[#08A698] focus:ring-[#08A698] w-4.5 h-4.5 cursor-pointer" />
                                                            <div className="flex items-center gap-3 text-gray-600 group-hover:text-gray-900">
                                                                {field.icon ? (
                                                                    <div className="w-5 h-5 flex items-center justify-center text-gray-400">
                                                                        {field.icon}
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-5 h-5"></div>
                                                                )}
                                                                <span className="text-sm font-medium">{field.label}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <button
                                        onClick={() => setIsBulkUploadOpen(true)}
                                        className="border border-[#08A698] text-[#08A698] hover:bg-[#08A698]/5 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors relative z-0"
                                    >
                                        <ArrowUpTrayIcon className="w-4 h-4" />
                                        Bulk upload tasks
                                    </button>
                                    <button
                                        onClick={() => setIsTaskModalOpen(true)}
                                        className="bg-[#08A698] hover:bg-[#068f82] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        Create Task
                                    </button>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm -mt-2">
                                Never miss a followup by creating task <a href="#" className="text-[#08A698] hover:underline">Learn More</a>
                            </p>

                            {/* Tabs */}
                            <div className="border-b border-gray-200 mt-6">
                                <div className="flex items-center gap-8">
                                    <button
                                        onClick={() => setActiveTab('Call Followups')}
                                        className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'Call Followups'
                                            ? 'border-[#08A698] text-gray-900'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        Call Followups
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('Todo')}
                                        className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'Todo'
                                            ? 'border-[#08A698] text-gray-900'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        Todo
                                    </button>
                                </div>
                            </div>

                            {/* Filters Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-4 py-2">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <FunnelIcon className="w-4 h-4 text-gray-400" />
                                        For:
                                    </span>
                                    <div className="flex bg-gray-100 rounded-lg p-1">
                                        <button className="px-3 py-1 bg-[#08A698] text-white rounded shadow-sm text-xs font-medium">Me</button>

                                        {/* Team Toggle with Dropdown */}
                                        <div className="relative group/team">
                                            <button className="px-3 py-1 text-gray-600 hover:text-gray-900 text-xs font-medium">Team</button>

                                            {/* Team Member Dropdown */}
                                            <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover/team:opacity-100 group-hover/team:visible transition-all z-30 overflow-hidden">

                                                {/* Search Header */}
                                                <div className="p-3 border-b border-gray-100 flex items-center gap-2">
                                                    <input type="checkbox" className="rounded border-gray-300 text-[#08A698] focus:ring-[#08A698]" />
                                                    <div className="flex-1 flex items-center gap-2 text-gray-400 bg-white">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                        <input
                                                            type="text"
                                                            placeholder="Search"
                                                            className="w-full text-sm outline-none placeholder-gray-400 text-gray-700"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Role Pills */}
                                                <div className="px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar border-b border-gray-50">
                                                    <svg className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                                    </svg>
                                                    {['Root', 'Admin', 'Manager', 'Caller', 'Marketing'].map((role) => (
                                                        <button key={role} className="whitespace-nowrap px-3 py-0.5 rounded-full border border-gray-200 text-[10px] text-gray-500 hover:border-[#08A698] hover:text-[#08A698] transition-colors">
                                                            {role}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Team List */}
                                                <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                                                    {[
                                                        { name: 'Esha Aftab', role: 'Caller', initials: 'EA', color: 'bg-purple-100 text-purple-600' },
                                                        { name: 'Minahil', role: 'Caller', initials: 'MI', color: 'bg-blue-100 text-blue-600' },
                                                        { name: 'Masfa', role: 'Caller', initials: 'MA', color: 'bg-teal-100 text-teal-600' },
                                                        { name: 'Samaha', role: 'Caller', initials: 'SA', color: 'bg-pink-100 text-pink-600' },
                                                        { name: 'Laiba', role: 'Caller', initials: 'LA', color: 'bg-orange-100 text-orange-600' },
                                                        { name: 'Eman', role: 'Caller', initials: 'EM', color: 'bg-teal-100 text-teal-600' },
                                                    ].map((member, idx) => (
                                                        <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer group/member">
                                                            <input type="checkbox" className="rounded border-gray-300 text-[#08A698] focus:ring-[#08A698] w-4 h-4" />
                                                            <div className={`w-8 h-8 rounded-full ${member.color} flex items-center justify-center text-xs font-bold`}>
                                                                {member.initials}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-700">{member.name}</p>
                                                                <p className="text-[10px] text-gray-400">{member.role}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Footer */}
                                                <div className="p-3 border-t border-gray-100 flex justify-end">
                                                    <button className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-[#08A698] transition-colors">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Done
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <span className="text-gray-400">|</span>

                                    <div className="flex items-center gap-2 relative group/due">
                                        <span>Due:</span>
                                        <button className="border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 flex items-center gap-2 hover:border-[#08A698] transition-colors">
                                            All <ChevronDownIcon className="w-3 h-3" />
                                        </button>

                                        {/* Due Date Dropdown */}
                                        <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover/due:opacity-100 group-hover/due:visible transition-all z-20 py-2">
                                            <div className="max-h-60 overflow-y-auto no-scrollbar p-1 space-y-0.5">
                                                {['All', 'Today', 'Yesterday', 'Tomorrow', 'This Week', 'Last Week', 'This Month', 'Last Month', 'This Year'].map((option) => (
                                                    <div
                                                        key={option}
                                                        className={`px-3 py-2 rounded text-sm cursor-pointer transition-colors ${option === 'All'
                                                            ? 'bg-[#08A698]/10 text-[#08A698] font-medium' // Active styling
                                                            : 'text-gray-600 hover:bg-gray-50 hover:text-[#08A698]'
                                                            }`}
                                                    >
                                                        {option}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <span className="text-gray-400">|</span>

                                    <div className="flex items-center gap-2 relative group/status">
                                        <span>Status:</span>
                                        <button className="border border-gray-300 rounded px-2 py-1 bg-white flex items-center gap-2 hover:border-[#08A698] transition-colors">
                                            <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
                                            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                                            <ChevronDownIcon className="w-3 h-3 text-gray-500" />
                                        </button>

                                        {/* Status Dropdown */}
                                        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all z-20 py-2">
                                            {[
                                                { label: 'Pending', color: 'text-yellow-500', checked: true },
                                                { label: 'Rescheduled', color: 'text-orange-500', checked: false },
                                                { label: 'Late', color: 'text-red-500', checked: true },
                                                { label: 'Done', color: 'text-green-600', checked: false },
                                                { label: 'Cancelled', color: 'text-gray-500', checked: false }
                                            ].map((status, index) => (
                                                <div key={status.label} className="px-4 py-2 hover:bg-gray-50 flex items-center gap-3 cursor-pointer">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${status.checked
                                                        ? 'bg-[#08A698] border-[#08A698]'
                                                        : 'border-gray-300 bg-white'
                                                        }`}>
                                                        {status.checked && (
                                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className={`text-sm font-medium ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <span className="text-gray-400">|</span>

                                    <div className="flex items-center gap-2 relative group/select">
                                        <span>Additional Filters:</span>
                                        <button className="border border-[#08A698] text-[#08A698] bg-[#08A698]/5 rounded px-3 py-1 flex items-center gap-2">
                                            Select (2) <ChevronDownIcon className="w-3 h-3" />
                                        </button>

                                        {/* Main Dropdown */}
                                        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover/select:opacity-100 group-hover/select:visible transition-all z-20 py-2">

                                            {/* Priority (Active/Nested) */}
                                            <div className="px-4 py-2 hover:bg-gray-50 flex items-center justify-between text-sm text-gray-600 cursor-pointer group/priority relative">
                                                <div className="flex items-center gap-2">
                                                    <FlagIcon className="w-4 h-4 text-gray-400" />
                                                    Priority
                                                </div>
                                                <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>

                                                {/* Nested Menu */}
                                                <div className="absolute top-0 left-full ml-2 w-40 bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover/priority:block py-2">
                                                    {[
                                                        { label: 'Urgent', color: 'text-red-500', fill: 'fill-red-500' },
                                                        { label: 'High', color: 'text-yellow-500', fill: 'fill-yellow-500' },
                                                        { label: 'Medium', color: 'text-sky-400', fill: 'fill-sky-400' },
                                                        { label: 'Low', color: 'text-gray-300', fill: 'fill-gray-300' },
                                                        { label: 'None', color: 'text-gray-400', fill: 'fill-none' },
                                                    ].map((option) => (
                                                        <div key={option.label} className="px-3 py-2 hover:bg-gray-50 flex items-center gap-3 cursor-pointer">
                                                            <input type="checkbox" className="rounded border-gray-300 text-[#08A698] focus:ring-[#08A698] w-4 h-4" />
                                                            <div className="flex items-center gap-2">
                                                                <FlagIcon className={`w-4 h-4 ${option.color} ${option.fill}`} />
                                                                <span className="text-gray-600">{option.label}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Creator (Active/Nested) */}
                                            <div className="px-4 py-2 hover:bg-gray-50 flex items-center justify-between text-sm text-gray-600 cursor-pointer group/creator relative">
                                                <div className="flex items-center gap-2">
                                                    <UserIcon className="w-4 h-4 text-gray-400" />
                                                    Creator
                                                </div>
                                                <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>

                                                {/* Nested Menu */}
                                                <div className="absolute top-0 left-full ml-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover/creator:block overflow-hidden">
                                                    {/* Search Header */}
                                                    <div className="p-3 border-b border-gray-100 flex items-center gap-2">
                                                        <input type="checkbox" className="rounded border-gray-300 text-[#08A698] focus:ring-[#08A698]" />
                                                        <div className="flex-1 flex items-center gap-2 text-gray-400">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                            </svg>
                                                            <input
                                                                type="text"
                                                                placeholder="Search"
                                                                className="w-full text-sm outline-none placeholder-gray-400 text-gray-700 bg-transparent"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* User List */}
                                                    <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
                                                        {[
                                                            { name: 'Esha Aftab', role: 'Caller', initials: 'EA', color: 'bg-purple-100 text-purple-600' },
                                                            { name: 'Minahil', role: 'Caller', initials: 'MI', color: 'bg-blue-100 text-blue-600' },
                                                            { name: 'Masfa', role: 'Caller', initials: 'MA', color: 'bg-teal-100 text-teal-600' },
                                                            { name: 'Samaha', role: 'Caller', initials: 'SA', color: 'bg-pink-100 text-pink-600' },
                                                            { name: 'Laiba', role: 'Caller', initials: 'LA', color: 'bg-orange-100 text-orange-600' },
                                                            { name: 'Eman', role: 'Caller', initials: 'EM', color: 'bg-teal-100 text-teal-600' },
                                                        ].map((member, idx) => (
                                                            <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer group/member">
                                                                <input type="checkbox" className="rounded border-gray-300 text-[#08A698] focus:ring-[#08A698] w-4 h-4" />
                                                                <div className={`w-8 h-8 rounded-full ${member.color} flex items-center justify-center text-xs font-bold shrink-0`}>
                                                                    {member.initials}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-700">{member.name}</p>
                                                                    <p className="text-[10px] text-gray-400 leading-none">{member.role}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Created On (Active/Nested) */}
                                            <div className="px-4 py-2 bg-[#08A698]/5 flex items-center justify-between text-sm text-[#08A698] cursor-pointer group/created relative">
                                                <div className="flex items-center gap-2 font-medium">
                                                    <CalendarIcon className="w-4 h-4" />
                                                    Created On
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs">All</span>
                                                    <ChevronDownIcon className="w-3 h-3" />
                                                </div>

                                                {/* Nested Menu */}
                                                <div className="absolute top-0 left-full ml-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover/created:block p-2">
                                                    <div className="bg-gray-100/50 rounded-md p-1 space-y-0.5 max-h-[300px] overflow-y-auto no-scrollbar">
                                                        {['All', 'Today', 'Yesterday', 'Tomorrow', 'This Week', 'Last Week', 'This Month', 'Last Month', 'This Year'].map((option) => (
                                                            <div
                                                                key={option}
                                                                className={`px-3 py-1.5 rounded text-sm cursor-pointer transition-colors ${option === 'Yesterday'
                                                                    ? 'bg-gray-200 text-gray-900 font-medium' // Active styling from screenshot
                                                                    : 'text-gray-600 hover:bg-[#08A698]/10 hover:text-[#08A698]'
                                                                    }`}
                                                            >
                                                                {option}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Completed On (Active/Nested) */}
                                            <div className="px-4 py-2 hover:bg-gray-50 flex items-center justify-between text-sm text-gray-600 cursor-pointer group/completed relative">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Completed On
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs">All</span>
                                                    <ChevronDownIcon className="w-3 h-3" />
                                                </div>

                                                {/* Nested Menu */}
                                                <div className="absolute top-0 left-full ml-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover/completed:block p-2">
                                                    <div className="bg-gray-100/50 rounded-md p-1 space-y-0.5 max-h-[300px] overflow-y-auto no-scrollbar">
                                                        {['All', 'Today', 'Yesterday', 'Tomorrow', 'This Week', 'Last Week', 'This Month', 'Last Month', 'This Year'].map((option) => (
                                                            <div
                                                                key={option}
                                                                className={`px-3 py-1.5 rounded text-sm cursor-pointer transition-colors ${option === 'All'
                                                                    ? 'bg-[#08A698]/10 text-[#08A698] font-medium' // Active styling
                                                                    : 'text-gray-600 hover:bg-[#08A698]/10 hover:text-[#08A698]'
                                                                    }`}
                                                            >
                                                                {option}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Table Header */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white min-h-[500px] flex flex-col">
                                    <div className="bg-gray-50 border-b border-gray-200 grid grid-cols-7 py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <div className="col-span-1">Lead</div>
                                        <div className="col-span-2">Description</div>
                                        <div className="col-span-1">Assignee</div>
                                        <div className="col-span-1">Status</div>
                                        <div className="col-span-1 flex items-center gap-1 cursor-pointer hover:text-gray-700">
                                            Due date <ChevronDownIcon className="w-3 h-3" />
                                        </div>
                                        <div className="col-span-1 text-center">Priority</div>
                                    </div>

                                    {loading ? (
                                        <div className="flex-1 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#08A698]"></div>
                                        </div>
                                    ) : tasks.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 italic">
                                            <p className="text-lg">No {activeTab} Tasks</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {tasks.map((task) => (
                                                <div key={task.id} className="grid grid-cols-7 py-4 px-4 text-sm hover:bg-gray-50 transition-colors items-center">
                                                    <div className="col-span-1 font-medium text-[#08A698] truncate">
                                                        {task.lead?.name || 'N/A'}
                                                    </div>
                                                    <div className="col-span-2 text-gray-600 truncate mr-4">
                                                        {task.description}
                                                    </div>
                                                    <div className="col-span-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-[10px] font-bold">
                                                                {task.assignee?.name?.[0] || '?'}
                                                            </div>
                                                            <span className="truncate">{task.assignee?.name || 'Unassigned'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-1">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold text-white ${getStatusColor(task.status)}`}>
                                                            {task.status}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-1 text-gray-500">
                                                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                                                    </div>
                                                    <div className="col-span-1 flex justify-center">
                                                        <FlagIcon className={`w-5 h-5 ${getPriorityColor(task.priority)}`} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    </WorkspaceGuard>
                </main>
            </div>

            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSuccess={fetchTasks}
                initialType={activeTab === 'Call Followups' ? 'CallFollowup' : 'Todo'}
            />
        </div>
    );
};

export default AllTasks;
