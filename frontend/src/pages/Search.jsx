import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import WorkspaceGuard from '../components/WorkspaceGuard';
import {
    MagnifyingGlassIcon,
    DevicePhoneMobileIcon,
    ChatBubbleLeftRightIcon,
    PhoneIcon,
    EnvelopeIcon,
    SparklesIcon,
    FunnelIcon,
    UserIcon,
    ClipboardDocumentCheckIcon,
    UsersIcon
} from '@heroicons/react/24/outline';

const filters = [
    { name: 'All', label: 'All Results', icon: SparklesIcon },
    { name: 'Leads', label: 'Leads', icon: UserIcon },
    { name: 'Tasks', label: 'Tasks', icon: ClipboardDocumentCheckIcon },
    { name: 'Users', label: 'Users', icon: UsersIcon }
];

const Search = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchValue, setSearchValue] = useState('');

    const { apiFetch } = useApi();
    const [results, setResults] = useState({ leads: [], users: [], tasks: [], campaigns: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchValue.length >= 2) {
                handleSearch();
            } else {
                setResults({ leads: [], users: [], tasks: [], campaigns: [] });
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchValue]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const res = await apiFetch(`/search/global?query=${searchValue}`);
            const data = await res.json();
            setResults(data.data || data || { leads: [], users: [], tasks: [], campaigns: [] });
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased overflow-hidden">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col h-full min-w-0">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-gray-50/50">
                    <WorkspaceGuard>
                        <div className="max-w-3xl mx-auto space-y-8 mt-4">

                            {/* Page Title & Intro */}
                            <div className="text-center space-y-2">
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Search Leads</h1>
                                <p className="text-gray-500 text-sm">Find any lead by name, phone number, email, or ID.</p>
                            </div>

                            {/* Search Container */}
                            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200 overflow-hidden ring-4 ring-gray-50/50">

                                {/* Input Field Area */}
                                <div className="relative px-6 py-6 border-b border-gray-100">
                                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className={`w-6 h-6 transition-colors duration-200 ${searchValue ? 'text-[#08A698]' : 'text-gray-400'}`} />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        placeholder="Start typing to search..."
                                        className="w-full pl-10 pr-4 text-lg text-gray-900 placeholder-gray-400 bg-transparent border-none focus:ring-0 outline-none"
                                        autoFocus
                                    />
                                    {searchValue && (
                                        <button
                                            onClick={() => setSearchValue('')}
                                            className="absolute inset-y-0 right-6 flex items-center text-xs font-semibold text-gray-400 hover:text-gray-600 uppercase tracking-wide"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>

                                {/* Filters Toolbar */}
                                <div className="px-4 py-3 bg-gray-50/50 flex flex-wrap items-center justify-center gap-2">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2">Filter by:</span>
                                    {filters.map((filter) => {
                                        const isActive = activeFilter === filter.name;
                                        const Icon = filter.icon;

                                        return (
                                            <button
                                                key={filter.name}
                                                onClick={() => setActiveFilter(filter.name)}
                                                className={`
                                                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border
                                                ${isActive
                                                        ? 'bg-white border-[#08A698] text-[#08A698] shadow-sm ring-1 ring-[#08A698]/20'
                                                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50'}
                                            `}
                                            >
                                                {Icon && <Icon className="w-4 h-4" />}
                                                {filter.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Results / Empty State */}
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-12 space-y-3 opacity-60 animate-pulse">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                        <div className="h-4 w-48 bg-gray-200 rounded"></div>
                                        <div className="h-3 w-32 bg-gray-200 rounded"></div>
                                    </div>
                                ) : searchValue ? (
                                    <div className="space-y-6">
                                        {results.leads?.length > 0 && (
                                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                                                <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Leads</h3>
                                                <div className="divide-y divide-gray-100">
                                                    {results.leads.map(lead => (
                                                        <div key={lead.id} className="py-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer px-2 rounded-lg">
                                                            <div>
                                                                <div className="text-sm font-semibold text-gray-900">{lead.name}</div>
                                                                <div className="text-xs text-gray-500">{lead.phone || lead.email}</div>
                                                            </div>
                                                            <span className="text-xs font-medium text-[#08A698] bg-teal-50 px-2 py-0.5 rounded-full">{lead.status}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {results.tasks?.length > 0 && (
                                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                                                <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Tasks</h3>
                                                <div className="divide-y divide-gray-100">
                                                    {results.tasks.map(task => (
                                                        <div key={task.id} className="py-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer px-2 rounded-lg">
                                                            <div>
                                                                <div className="text-sm font-semibold text-gray-900">{task.title}</div>
                                                                <div className="text-xs text-gray-500">Due: {new Date(task.due_date).toLocaleDateString()}</div>
                                                            </div>
                                                            <span className="text-xs font-medium text-gray-400">{task.status}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {(!results.leads?.length && !results.tasks?.length && !results.users?.length && !results.campaigns?.length) && (
                                            <div className="text-center py-12 text-gray-400 italic">No results found for "{searchValue}"</div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 space-y-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                            <MagnifyingGlassIcon className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium">Type something above to see results.</p>
                                    </div>
                                )}
                            </div>

                        </div>
                    </WorkspaceGuard>
                </main>
            </div>
        </div>
    );
};

export default Search;
