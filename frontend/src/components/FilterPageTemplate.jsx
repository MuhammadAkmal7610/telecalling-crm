import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import FilterPanel from './FilterPanel';
import TableHeader from './ui/TableHeader';
import Skeleton from './ui/Skeleton';
import EmptyState from './ui/EmptyState';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
    PlusIcon,
    ChevronDownIcon,
    PhoneIcon,
    ChatBubbleLeftRightIcon,
    EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
// import { useDialer } from '../context/DialerContext';
import BulkAssignModal from './BulkAssignModal';

// addType: 'lead' | 'account' | ...
export default function FilterPageTemplate({ 
    title, 
    data = [], 
    loading = false, 
    onRowClick, 
    onAddClick, 
    fetchLeads, 
    addType = 'lead' // default to 'lead' for backward compatibility
}) {
    // const { startCallLog } = useDialer();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [filterPanelOpen, setFilterPanelOpen] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
    const [filters, setFilters] = useState({});

    const toggleSelectAll = () => {
        if (selectedIds.length === data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(data.map(lead => lead.id));
        }
    };

    const toggleSelectLead = (e, id) => {
        e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // Calculate filter counts (mock for UI)
    const counts = data.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
    }, {});

    const filteredData = data.filter(lead => {
        if (filters.status?.length && !filters.status.includes(lead.status)) return false;
        // Add more filter logic here
        return true;
    });

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans overflow-hidden">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            
            <div className="flex flex-1 flex-col h-full min-w-0">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <div className="flex flex-1 overflow-hidden">
                    {/* Left Filter Panel */}
                    <FilterPanel 
                        isOpen={filterPanelOpen} 
                        onClose={() => setFilterPanelOpen(false)}
                        filters={filters}
                        onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
                        onClearFilters={() => setFilters({})}
                        counts={counts}
                    />

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50/50 flex flex-col relative">
                        
                        {/* Mobile Toggle for Filters */}
                        {!filterPanelOpen && (
                            <button 
                                onClick={() => setFilterPanelOpen(true)}
                                className="lg:hidden absolute bottom-4 right-4 z-20 bg-[#08A698] text-white p-3 rounded-full shadow-lg"
                            >
                                <FunnelIcon className="w-6 h-6" />
                            </button>
                        )}

                        {/* Top Toolbar */}
                        <div className="flex flex-col gap-4 mb-6 shrink-0">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search" 
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none transition-all shadow-sm" 
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setFilterPanelOpen(!filterPanelOpen)}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm"
                                    >
                                        <FunnelIcon className="w-4 h-4" />
                                        Filter
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm">
                                        <ChevronDownIcon className="w-4 h-4" />
                                        Short by
                                    </button>
                                    {onAddClick && (
                                        <button 
                                            onClick={onAddClick}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-[#4F46E5] text-white rounded-xl text-sm font-semibold hover:bg-[#4338ca] transition-colors shadow-md shadow-indigo-200"
                                        >
                                            <PlusIcon className="w-5 h-5" />
                                            {addType === 'lead' && '+ Add Lead'}
                                            {addType === 'account' && '+ Add Account'}
                                            {addType !== 'lead' && addType !== 'account' && '+ Add'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 overflow-hidden flex flex-col">
                            {loading ? (
                                <div className="p-6">
                                    <Skeleton rows={10} />
                                </div>
                            ) : filteredData.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <EmptyState 
                                        icon={MagnifyingGlassIcon}
                                        title="No leads found"
                                        subtitle="Try adjusting your filters or search terms"
                                        actionLabel="Clear Filters"
                                        onAction={() => setFilters({})}
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 p-3 border-b border-gray-200 text-sm text-gray-500 bg-gray-50/50 shrink-0">
                                        <span className="bg-white border border-gray-200 rounded-md text-xs font-bold px-2 py-1 shadow-sm">1-20 of {data.length > 0 ? data.length + '024' : '0'}</span>
                                        <ChevronDownIcon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 overflow-auto custom-scrollbar">
                                        <table className="w-full text-left border-collapse table-fixed">
                                            <TableHeader columns={[
                                                { 
                                                    label: (
                                                        <input
                                                            type="checkbox"
                                                            className="w-5 h-5 rounded-md border-gray-300 text-[#08A698] focus:ring-[#08A698] cursor-pointer align-middle"
                                                            checked={data.length > 0 && selectedIds.length === data.length}
                                                            onChange={toggleSelectAll}
                                                        />
                                                    ), 
                                                    width: 'w-14 pl-6 border-b border-gray-100',
                                                    sortable: false
                                                },
                                                { label: 'Name', width: 'w-[25%] border-b border-gray-100' },
                                                { label: 'Website', width: 'w-[20%] border-b border-gray-100' },
                                                { label: 'Industry', width: 'w-[15%] border-b border-gray-100' },
                                                { label: 'Country', width: 'w-[15%] border-b border-gray-100' },
                                                { label: 'Type', width: 'w-[10%] border-b border-gray-100' },
                                                { label: 'Action', width: 'w-16 border-b border-gray-100', align: 'center', sortable: false }
                                            ]} />
                                            <tbody className="bg-white">
                                                {filteredData.map((lead, index) => (
                                                    <tr 
                                                        key={lead.id}
                                                        className={`
                                                            group hover:bg-gray-50/50 transition-colors cursor-pointer border-b border-gray-100
                                                            ${selectedIds.includes(lead.id) ? 'bg-teal-50/30' : ''}
                                                        `}
                                                    >
                                                    <td className="py-4 pl-6" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center gap-4">
                                                            <input
                                                                type="checkbox"
                                                                className="w-5 h-5 rounded-md border-gray-300 text-[#08A698] focus:ring-[#08A698] cursor-pointer"
                                                                checked={selectedIds.includes(lead.id)}
                                                                onChange={(e) => toggleSelectLead(e, lead.id)}
                                                            />
                                                            <span className="text-gray-400 text-xs font-medium w-6">{(index + 1).toString().padStart(2, '0')}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 pr-4" onClick={() => onRowClick && onRowClick(lead)}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-[#08A698] font-bold text-xs shadow-sm overflow-hidden">
                                                                {lead.avatar ? <img src={lead.avatar} className="w-full h-full object-cover" /> : lead.name?.charAt(0)}
                                                            </div>
                                                            <span className="font-semibold text-gray-700 truncate">{lead.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 pr-4 text-gray-500 text-sm truncate">{lead.website || lead.email || 'N/A'}</td>
                                                    <td className="py-4 pr-4 text-gray-600 text-sm truncate">{lead.industry || lead.source || 'General'}</td>
                                                    <td className="py-4 pr-4 text-gray-500 text-sm truncate">{lead.country || 'Global'}</td>
                                                    <td className="py-4 pr-4">
                                                        <StatusBadge status={lead.status} />
                                                    </td>
                                                    <td className="py-4 pr-6 text-center">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); }}
                                                            className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
                                                        >
                                                            <EllipsisHorizontalIcon className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                </>
                            )}
                            
                            {/* Footer / Pagination */}
                            <div className="border-t border-gray-100 px-6 py-4 bg-white flex items-center justify-between">
                                <span className="text-gray-500 text-sm font-medium">02 page of 21</span>
                                <div className="flex gap-2">
                                    <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400 transition-colors">
                                        <ChevronDownIcon className="w-4 h-4 rotate-90" />
                                    </button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-600 font-medium text-xs">01</button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#4F46E5] text-white font-medium text-xs shadow-md shadow-indigo-200">02</button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-600 font-medium text-xs">03</button>
                                    <span className="w-8 h-8 flex items-center justify-center text-gray-400">...</span>
                                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-600 font-medium text-xs">21</button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400 transition-colors">
                                        <ChevronDownIcon className="w-4 h-4 -rotate-90" />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </main>
                </div>
            </div>

            <BulkAssignModal
                isOpen={isBulkAssignModalOpen}
                onClose={() => setIsBulkAssignModalOpen(false)}
                selectedLeadIds={selectedIds}
                onSuccess={() => {
                    setSelectedIds([]);
                    fetchLeads?.();
                }}
            />
        </div>
    );
}

const StatusBadge = ({ status }) => {
    const styles = {
        'Fresh': 'bg-emerald-100 text-emerald-600',
        'Won': 'bg-teal-100 text-teal-600',
        'Lost': 'bg-rose-100 text-rose-600',
        'Dead': 'bg-gray-100 text-gray-600',
        'Interested': 'bg-blue-100 text-blue-600',
        'Follow Up': 'bg-amber-100 text-amber-600',
    };
    
    // Fallback for unknown statuses
    const defaultStyle = 'bg-gray-100 text-gray-600';
    const activeStyle = styles[Object.keys(styles).find(k => status?.includes(k))] || defaultStyle;

    return (
        <span className={`px-3 py-1.5 rounded-md text-xs font-semibold ${activeStyle} whitespace-nowrap`}>
            {status || 'Unknown'}
        </span>
    );
};
