import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
    PlusIcon,
    ChevronDownIcon,
    EllipsisHorizontalIcon,
    PencilSquareIcon,
    CalendarIcon,
    UserIcon,
    ChatBubbleLeftRightIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/outline'; // Outline star for empty rating
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'; // Solid star for filled rating
import { PhoneIcon } from '@heroicons/react/24/outline';
import { useDialer } from '../context/DialerContext';
import BulkAssignModal from './BulkAssignModal';

export default function FilterPageTemplate({ title, data = [], showEmptyState = false, onRowClick, onAddClick, fetchLeads }) {
    const { startCallLog } = useDialer();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);

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

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans overflow-hidden">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
                    <div className="max-w-7xl mx-auto">

                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
                                <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"><PencilSquareIcon className="w-4 h-4" /></button>
                                <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"><ArrowPathIcon className="w-4 h-4" /></button>
                                <button
                                    onClick={onAddClick}
                                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50"><div className="w-4 h-4 flex items-end gap-0.5"><div className="w-1 h-1.5 bg-current rounded-sm"></div><div className="w-1 h-2.5 bg-current rounded-sm"></div><div className="w-1 h-3.5 bg-current rounded-sm"></div></div></button>
                                <button className="p-2 text-primary bg-teal-50 rounded-md shadow-sm ring-1 ring-black/5"><div className="w-4 h-4 flex flex-col gap-0.5"><div className="w-full h-0.5 bg-current rounded-full"></div><div className="w-full h-0.5 bg-current rounded-full"></div><div className="w-full h-0.5 bg-current rounded-full"></div></div></button>
                            </div>
                        </div>

                        {/* Filter Bar */}
                        <div className="bg-white p-1.5 rounded-xl border border-gray-200 mb-6 shadow-sm flex flex-col md:flex-row items-center gap-2">
                            <div className="flex-1 flex w-full md:w-auto">
                                <div className="relative group w-full md:max-w-md">
                                    <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-events-none">
                                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <div className="absolute left-9 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium flex items-center gap-1 cursor-pointer hover:text-gray-700 bg-gray-50 px-2 py-1 rounded-md border border-gray-100"> Name <ChevronDownIcon className="w-3 h-3" /> </div>
                                    <input
                                        type="text"
                                        placeholder="Search lead..."
                                        className="w-full pl-28 pr-4 py-2 bg-transparent border-none text-sm focus:ring-0 placeholder-gray-400 text-gray-700 font-medium"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar px-2">
                                <FilterPill label="Assignee" icon={UserIcon} />
                                <FilterPill label="Creation Date" icon={CalendarIcon} />
                                <FilterPill label="Status" />
                            </div>
                        </div>

                        {/* Bulk Actions (Optional / Contextual) */}
                        <div className="flex items-center justify-end gap-2 mb-4">
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={() => setIsBulkAssignModalOpen(true)}
                                    className="px-4 py-2 bg-[#08A698] text-white rounded-lg text-sm font-bold hover:bg-teal-700 flex items-center gap-2 transition-all shadow-md shadow-teal-100 animate-in fade-in slide-in-from-right-4"
                                >
                                    <UserGroupIcon className="w-4 h-4" /> Bulk Assign ({selectedIds.length})
                                </button>
                            )}
                            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-primary hover:text-primary flex items-center gap-2 transition-colors shadow-sm"><PencilSquareIcon className="w-4 h-4" /> Bulk Edit</button>
                            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-primary hover:text-primary flex items-center gap-2 transition-colors shadow-sm"><ChatBubbleLeftRightIcon className="w-4 h-4" /> Bulk WACA Message</button>
                            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-gray-300 flex items-center gap-2 transition-colors shadow-sm">More <ChevronDownIcon className="w-4 h-4" /></button>
                        </div>

                        {/* Table Content */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            {showEmptyState ? (
                                <div className="flex flex-col items-center justify-center py-24 bg-gray-50/30">
                                    <div className="w-16 h-16 bg-white border border-gray-100 shadow-sm rounded-2xl flex items-center justify-center mb-4 text-gray-300">
                                        <MagnifyingGlassIcon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-gray-900 font-bold text-lg">No Results Found</h3>
                                    <p className="text-gray-500 text-sm mt-1 max-w-xs text-center">We couldn't find any leads matching your filters. Try clearing some filters.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 p-3 border-b border-gray-100 text-sm text-gray-500 bg-gray-50/50">
                                        <span className="bg-white border border-gray-200 rounded-md text-xs font-bold px-2 py-1 shadow-sm">1-20 of {data.length > 0 ? data.length + '024' : '0'}</span>
                                        <ChevronDownIcon className="w-4 h-4" />
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                                    <th className="w-12 px-6 py-4">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                            checked={data.length > 0 && selectedIds.length === data.length}
                                                            onChange={toggleSelectAll}
                                                        />
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Assignee</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Created On</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Modified On</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Lead source</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {data.map((lead) => (
                                                    <tr
                                                        key={lead.id}
                                                        onClick={() => onRowClick && onRowClick(lead)}
                                                        className="hover:bg-teal-50/30 transition-colors group cursor-pointer"
                                                    >
                                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                                checked={selectedIds.includes(lead.id)}
                                                                onChange={(e) => toggleSelectLead(e, lead.id)}
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors">{lead.name}</span>
                                                                {lead.phone && (
                                                                    <a
                                                                        href={`tel:${lead.phone}`}
                                                                        onClick={(e) => { e.stopPropagation(); startCallLog(lead.phone, lead.id, lead.name); }}
                                                                        className="p-1 rounded-full bg-teal-50 text-teal-600 hover:bg-teal-100 transition shadow-sm"
                                                                        title={`Call ${lead.name}`}
                                                                    >
                                                                        <PhoneIcon className="w-3.5 h-3.5" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <StatusBadge status={lead.status} subStatus={lead.subStatus} />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <StarIcon className="w-4 h-4 text-gray-300" />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold uppercase ring-1 ring-white shadow-sm">{lead.assigneeInitials}</div>
                                                                <span className="text-xs font-medium text-gray-600">{lead.assigneeName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-gray-500 font-medium">{lead.createdOn}</td>
                                                        <td className="px-6 py-4 text-xs text-gray-500 font-medium">{lead.modifiedOn}</td>
                                                        <td className="px-6 py-4">
                                                            {lead.source && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold border border-gray-200 rounded-md">{lead.source}</span>}
                                                            {!lead.source && <span className="text-gray-300 text-xs">--</span>}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </main>
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

const FilterPill = ({ label, icon: Icon }) => (
    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:border-primary hover:text-primary flex items-center gap-2 whitespace-nowrap shadow-sm transition-all group">
        {Icon && <Icon className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />}
        {label} <ChevronDownIcon className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
    </button>
);

const StatusBadge = ({ status, subStatus }) => {
    let styles = 'bg-emerald-50 text-emerald-700 border-emerald-100'; // Fresh/Default
    if (status === 'Lost') styles = 'bg-red-50 text-red-700 border-red-100';
    if (status === 'Dead') styles = 'bg-gray-100 text-gray-600 border-gray-200';
    if (status.includes('Attempted')) styles = 'bg-amber-50 text-amber-700 border-amber-100';
    if (status.includes('Support')) styles = 'bg-blue-50 text-blue-700 border-blue-100';
    if (status.includes('Interested')) styles = 'bg-teal-50 text-teal-700 border-teal-100';
    if (status.includes('Recapture')) styles = 'bg-orange-50 text-orange-700 border-orange-100';

    return (
        <div className="flex flex-col items-start gap-1">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${styles} whitespace-nowrap shadow-sm`}>
                {status}
            </span>
            {subStatus && (
                <span className="text-[9px] text-gray-400 flex items-center gap-1 ml-0.5 font-medium">
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span> {subStatus}
                </span>
            )}
        </div>
    );
};
