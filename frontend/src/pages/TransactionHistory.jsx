import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
    ChevronDownIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    CalendarIcon,
    ArrowsUpDownIcon,
    ShoppingCartIcon,
    CheckIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const transactions = [
    {
        id: '6943a83a7cc9e1652986e5aa',
        date: '18 Dec 2025 12:07 PM',
        amount: '₹116,353.00',
        cycle: 'Quarterly',
        status: 'Cancelled',
        action: 'none'
    },
    {
        id: '694236499b0abdc9feb1dc5d',
        date: '17 Dec 2025 09:51 AM',
        amount: '₹21,155.00',
        cycle: 'Quarterly',
        status: 'Successful',
        action: 'invoice'
    },
    {
        id: '694235e236e1c5ab3b811680',
        date: '17 Dec 2025 09:47 AM',
        amount: '₹21,155.00',
        cycle: 'Quarterly',
        status: 'Pending Payment',
        action: 'refresh',
        hasCopy: true
    },
    {
        id: '69423573c476657ce277ccbf',
        date: '17 Dec 2025 09:45 AM',
        amount: '₹56,413.00',
        cycle: 'Annual',
        status: 'Pending Payment',
        action: 'refresh'
    },
    {
        id: '69414204dff11b8fc52e6d01',
        date: '16 Dec 2025 04:27 PM',
        amount: '₹10,578.00',
        cycle: 'Quarterly',
        status: 'Cancelled',
        action: 'none'
    },
    {
        id: '69413ae30b568e921f97936a',
        date: '16 Dec 2025 03:56 PM',
        amount: '₹10,578.00',
        cycle: 'Quarterly',
        status: 'Cancelled',
        action: 'none'
    },
    {
        id: '69413aad70b39f0324ec8549',
        date: '16 Dec 2025 03:55 PM',
        amount: '₹10,578.00',
        cycle: 'Quarterly',
        status: 'Pending Payment',
        action: 'refresh'
    }
];

// Helper Hooks
function useClickOutside(ref, handler) {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
}

const FilterDropdown = ({ label, options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef();
    useClickOutside(ref, () => setIsOpen(false));

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group flex items-center justify-between gap-3 px-4 py-2.5 bg-white border rounded-xl text-sm font-medium transition-all duration-200 outline-none w-[180px]
                ${isOpen || value
                        ? 'border-[#08A698] text-[#08A698] ring-1 ring-[#08A698]/10 shadow-[0_4px_12px_rgba(8,166,152,0.1)]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50/50 shadow-sm'
                    }`}
            >
                <span className="truncate">{value || label}</span>
                <div className="flex items-center">
                    {value && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                            }}
                            className="mr-2 p-0.5 rounded-full hover:bg-[#08A698]/10 text-[#08A698] transition-colors"
                        >
                            <XMarkIcon className="w-3 h-3" />
                        </div>
                    )}
                    <ChevronDownIcon
                        className={`w-4 h-4 transition-transform duration-300 text-gray-400 group-hover:text-gray-500
                        ${isOpen ? 'rotate-180 text-[#08A698]' : ''} 
                        ${value ? 'text-[#08A698]' : ''}`}
                    />
                </div>
            </button>

            {/* Dropdown Menu */}
            <div className={`absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] z-50 overflow-hidden transition-all duration-200 origin-top
                ${isOpen ? 'opacity-100 translate-y-0 visible scale-100' : 'opacity-0 -translate-y-2 invisible scale-95'}`}>
                <div className="py-1 max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    <button
                        onClick={() => { onChange(''); setIsOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between
                        ${!value ? 'bg-[#08A698]/5 text-[#08A698] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <span>All {label}s</span>
                        {!value && <CheckIcon className="w-4 h-4" />}
                    </button>

                    {options.map((option) => (
                        <button
                            key={option}
                            onClick={() => { onChange(option); setIsOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between
                            ${value === option ? 'bg-[#08A698]/5 text-[#08A698] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <span>{option}</span>
                            {value === option && <CheckIcon className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Custom Calendar Component ---
const CustomCalendar = ({ value, onChange, onClose }) => {
    const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
    const [viewDate, setViewDate] = useState(new Date(currentDate)); // For navigating months

    const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const changeMonth = (offset) => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
    };

    const handleDateClick = (day) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        // Format YYYY-MM-DD for consistency with input type="date" value
        const formatted = newDate.toISOString().split('T')[0];
        onChange(formatted);
        onClose();
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    const renderCalendarDays = () => {
        const days = [];
        const totalDays = daysInMonth(viewDate);
        const startDay = firstDayOfMonth(viewDate);

        // Empty slots for previous month
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
        }

        // Days
        for (let i = 1; i <= totalDays; i++) {
            const dateStr = new Date(viewDate.getFullYear(), viewDate.getMonth(), i).toISOString().split('T')[0];
            const isSelected = value === dateStr;
            const isToday = new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), i).toDateString();

            days.push(
                <button
                    key={i}
                    onClick={() => handleDateClick(i)}
                    className={`h-8 w-8 rounded-full text-sm flex items-center justify-center transition-all
                    ${isSelected ? 'bg-[#08A698] text-white font-bold shadow-md shadow-[#08A698]/30' : 'text-gray-700 hover:bg-gray-100'}
                    ${isToday && !isSelected ? 'border border-[#08A698] text-[#08A698] font-semibold' : ''}
                    `}
                >
                    {i}
                </button>
            );
        }
        return days;
    };

    return (
        <div className="p-4 w-64 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors">
                    <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-gray-900">
                    {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                </span>
                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors">
                    <ChevronRightIcon className="w-4 h-4" />
                </button>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map(d => (
                    <div key={d} className="h-8 w-8 flex items-center justify-center text-xs font-medium text-gray-400">
                        {d}
                    </div>
                ))}
                {renderCalendarDays()}
            </div>

            <div className="pt-2 border-t border-gray-100">
                <button
                    onClick={() => { onChange(''); onClose(); }}
                    className="w-full py-1.5 text-xs font-semibold text-gray-500 hover:text-[#08A698] hover:bg-gray-50 rounded-lg transition-colors"
                >
                    Clear Filter
                </button>
            </div>
        </div>
    );
};

export default function TransactionHistory() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Filter States
    const [statusFilter, setStatusFilter] = useState('');
    const [cycleFilter, setCycleFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const calendarRef = useRef();
    useClickOutside(calendarRef, () => setIsCalendarOpen(false));

    const statusOptions = [
        'Successful',
        'Failed',
        'Cancelled',
        'Processing',
        'Pending Payment',
        'Refunded'
    ];

    const cycleOptions = [
        'Quarterly',
        'Annual'
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Cancelled':
            case 'Failed':
                return 'bg-rose-50 text-rose-600 border border-rose-100';
            case 'Successful':
            case 'Refunded':
                return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
            case 'Pending Payment':
            case 'Processing':
                return 'bg-amber-50 text-amber-600 border border-amber-100';
            default:
                return 'bg-gray-50 text-gray-500';
        }
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased selection:bg-[#08A698]/20">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto bg-white p-6 lg:px-12 lg:py-10">
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Billing</h1>
                                <p className="text-gray-500 mt-2 font-medium">Manage your billing information and transaction history</p>
                            </div>
                            <Link to="/billing" className="flex items-center gap-2.5 px-5 py-2.5 bg-white border border-[#08A698] rounded-xl text-[#08A698] text-sm font-semibold hover:bg-[#08A698] hover:text-white transition-all shadow-sm hover:shadow-md hover:shadow-[#08A698]/20 group active:scale-95 duration-200">
                                <ShoppingCartIcon className="w-5 h-5 group-hover:text-white transition-colors" />
                                Buy Licenses
                            </Link>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-100">
                            <div className="flex gap-8">
                                <button className="pb-4 text-sm font-semibold text-[#08A698] border-b-2 border-[#08A698] flex items-center gap-2.5 transition-all">
                                    <DocumentTextIcon className="w-5 h-5" />
                                    Transaction History
                                </button>
                                <button className="pb-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 flex items-center gap-2.5 transition-all">
                                    <DocumentTextIcon className="w-5 h-5" />
                                    Invoices
                                </button>
                            </div>
                        </div>

                        {/* Filters Bar */}
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-gray-50/50 p-2 rounded-2xl border border-gray-100/50">
                            <div className="px-2 text-sm text-gray-500 font-medium">
                                Showing <span className="text-gray-900 font-bold">1-8</span> of <span className="text-gray-900 font-bold">8</span> transactions
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* Status Filter */}
                                <FilterDropdown
                                    label="Status"
                                    options={statusOptions}
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                />

                                {/* Billing Cycle Filter */}
                                <FilterDropdown
                                    label="Billing Cycle"
                                    options={cycleOptions}
                                    value={cycleFilter}
                                    onChange={setCycleFilter}
                                />

                                {/* Custom Calendar Filter */}
                                <div className="relative" ref={calendarRef}>
                                    <button
                                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                                        className={`flex items-center justify-between gap-3 px-4 py-2.5 bg-white border rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer w-[200px] outline-none group
                                        ${isCalendarOpen || dateFilter
                                                ? 'border-[#08A698] text-gray-900 ring-1 ring-[#08A698]/10 shadow-[0_4px_12px_rgba(8,166,152,0.1)]'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-white shadow-sm'
                                            }`}
                                    >
                                        <span className={!dateFilter ? "text-gray-500" : ""}>
                                            {dateFilter || "Select Purchase Date"}
                                        </span>
                                        <div className="flex items-center">
                                            {dateFilter && (
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDateFilter('');
                                                    }}
                                                    className="mr-2 p-0.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    <XMarkIcon className="w-3 h-3" />
                                                </div>
                                            )}
                                            <CalendarIcon className={`w-4 h-4 transition-transform duration-300 
                                                ${isCalendarOpen ? 'text-[#08A698]' : 'text-gray-400 group-hover:text-gray-500'} 
                                                ${dateFilter ? 'text-[#08A698]' : ''}`}
                                            />
                                        </div>
                                    </button>

                                    {/* Calendar Dropdown */}
                                    <div className={`absolute top-full right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 overflow-hidden transition-all duration-200 origin-top-right
                                        ${isCalendarOpen ? 'opacity-100 translate-y-0 visible scale-100' : 'opacity-0 -translate-y-2 invisible scale-95'}`}>
                                        <CustomCalendar
                                            value={dateFilter}
                                            onChange={setDateFilter}
                                            onClose={() => setIsCalendarOpen(false)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/[0.02]">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                            <th className="py-5 px-6 font-medium">Transaction ID</th>
                                            <th className="py-5 px-6 cursor-pointer hover:bg-gray-100 transition-colors group">
                                                <div className="flex items-center gap-1">
                                                    Date
                                                    <ArrowsUpDownIcon className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                                                </div>
                                            </th>
                                            <th className="py-5 px-6 cursor-pointer hover:bg-gray-100 transition-colors group">
                                                <div className="flex items-center gap-1">
                                                    Amount
                                                    <ArrowsUpDownIcon className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                                                </div>
                                            </th>
                                            <th className="py-5 px-6">Billing Cycle</th>
                                            <th className="py-5 px-6">Status</th>
                                            <th className="py-5 px-6 min-w-[200px]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {transactions.map((tx, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-sm text-gray-600 font-medium bg-gray-100/50 px-1.5 py-0.5 rounded border border-transparent group-hover:border-gray-200 transition-colors">
                                                            {tx.id.substring(0, 16)}...
                                                        </span>
                                                        {tx.hasCopy && (
                                                            <button
                                                                className="text-gray-300 hover:text-[#08A698] p-1.5 rounded-lg hover:bg-[#08A698]/10 transition-colors active:scale-90"
                                                                title="Copy ID"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-gray-600 text-sm">{tx.date}</td>
                                                <td className="py-4 px-6 text-sm font-semibold text-gray-900">{tx.amount}</td>
                                                <td className="py-4 px-6 text-sm text-gray-600">{tx.cycle}</td>
                                                <td className="py-4 px-6">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${getStatusStyle(tx.status)}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'Cancelled' ? 'bg-rose-500' : tx.status === 'Successful' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {tx.action === 'none' && (
                                                        <span className="text-gray-400 bg-gray-50 border border-dashed border-gray-200 px-4 py-2 rounded-lg text-xs font-medium inline-block w-full text-center select-none">
                                                            No Action
                                                        </span>
                                                    )}
                                                    {tx.action === 'invoice' && (
                                                        <button className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-200 hover:border-rose-200 bg-white hover:bg-rose-50 text-gray-700 hover:text-rose-600 rounded-lg transition-all text-sm font-medium shadow-sm hover:shadow active:scale-95 duration-200">
                                                            <DocumentTextIcon className="w-4 h-4 text-rose-500" />
                                                            Invoice
                                                        </button>
                                                    )}
                                                    {tx.action === 'refresh' && (
                                                        <button className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-200 hover:border-[#08A698]/30 bg-white hover:bg-[#08A698]/5 text-gray-700 hover:text-[#08A698] rounded-lg transition-all text-sm font-medium shadow-sm hover:shadow active:scale-95 duration-200">
                                                            <ArrowPathIcon className="w-4 h-4" />
                                                            Status
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
