import React from 'react';
import { 
    FunnelIcon, 
    CalendarIcon, 
    UserIcon, 
    TagIcon,
    AdjustmentsHorizontalIcon,
    CheckCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export default function FilterPanel({ 
    isOpen, 
    onClose, 
    filters, 
    onFilterChange, 
    onClearFilters,
    counts = {}
}) {
    // Standard TeleCRM-like filters
    const statusOptions = ['Fresh', 'Contacted', 'Interested', 'Follow Up', 'Won', 'Lost', 'Invalid'];
    const dateOptions = ['Today', 'Yesterday', 'This Week', 'This Month', 'Last Month', 'Custom'];

    return (
        <aside className={`
            fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-2 text-gray-800 font-bold">
                        <FunnelIcon className="w-5 h-5 text-[#08A698]" />
                        <span>Smart Filters</span>
                    </div>
                    <button onClick={onClose} className="lg:hidden p-1 text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Filter Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    
                    {/* Status Filter */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <TagIcon className="w-3.5 h-3.5" /> Lead Status
                        </h3>
                        <div className="space-y-1">
                            {statusOptions.map(status => (
                                <label key={status} className="flex items-center justify-between group cursor-pointer p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-2.5">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 rounded border-gray-300 text-[#08A698] focus:ring-[#08A698] cursor-pointer"
                                            checked={filters.status?.includes(status)}
                                            onChange={(e) => {
                                                const newStatus = e.target.checked 
                                                    ? [...(filters.status || []), status]
                                                    : (filters.status || []).filter(s => s !== status);
                                                onFilterChange('status', newStatus);
                                            }}
                                        />
                                        <span className="text-sm text-gray-600 group-hover:text-gray-900">{status}</span>
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium bg-gray-50 px-1.5 py-0.5 rounded group-hover:bg-white border border-transparent group-hover:border-gray-200 transition-all">
                                        {counts[status] || 0}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* Date Filter */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <CalendarIcon className="w-3.5 h-3.5" /> Creation Date
                        </h3>
                        <select 
                            className="w-full text-sm border-gray-200 rounded-lg focus:ring-[#08A698] focus:border-[#08A698] bg-gray-50/50"
                            value={filters.dateRange || ''}
                            onChange={(e) => onFilterChange('dateRange', e.target.value)}
                        >
                            <option value="">All Time</option>
                            {dateOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* Assignee Filter */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <UserIcon className="w-3.5 h-3.5" /> Assignee
                        </h3>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search member..." 
                                className="w-full text-sm border-gray-200 rounded-lg pl-8 py-2 focus:ring-[#08A698] focus:border-[#08A698]" 
                            />
                            <UserIcon className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/30 space-y-3">
                    <button 
                        onClick={onClearFilters}
                        className="w-full py-2 text-xs font-bold text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-white transition-all shadow-sm"
                    >
                        Clear All Filters
                    </button>
                    <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400">
                        <AdjustmentsHorizontalIcon className="w-3 h-3" />
                        <span>{Object.values(filters).flat().length} filters active</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
