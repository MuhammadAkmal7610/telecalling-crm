import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    PhoneIcon,
    CalendarIcon,
    UserCircleIcon,
    EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';

const LeadCard = ({ lead, onClick, onStageChange }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: lead.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const getTimeAgo = (date) => {
        if (!date) return 'N/A';
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m";
        return Math.floor(seconds) + "s";
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick(lead)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`bg-white p-3.5 rounded-xl border shadow-sm cursor-pointer transition-all relative border-l-4 border-l-transparent hover:border-l-primary hover:shadow-md active:scale-[0.98] ${
                isDragging ? 'cursor-grabbing shadow-lg' : 'cursor-grab'
            }`}
        >
            {/* Drag indicator */}
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-0.5">
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                </div>
            </div>

            {/* Card Header */}
            <div className="flex justify-between items-start mb-2.5">
                <h3 className="font-bold text-sm text-gray-800 line-clamp-1 pr-6" title={lead.name}>
                    {lead.name}
                </h3>
                <div className="flex items-center gap-1">
                    {/* Quick actions */}
                    {isHovered && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                // Add quick call functionality
                            }}
                            className="w-6 h-6 rounded bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors"
                            title="Quick Call"
                        >
                            <PhoneIcon className="w-3 h-3" />
                        </button>
                    )}
                    <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 text-[#08A698] text-[10px] font-bold flex items-center justify-center shadow-sm shrink-0">
                        {lead.assignee?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'UN'}
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-1.5 rounded-lg border border-gray-100/50">
                    <PhoneIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="font-medium tracking-tight whitespace-nowrap">{lead.phone || 'N/A'}</span>
                </div>
                
                <div className="flex items-center justify-between gap-1.5 text-[10px] text-gray-400 font-semibold pt-1">
                    <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {getTimeAgo(lead.updated_at)} ago
                    </div>
                    <div className="px-1.5 bg-gray-100 rounded text-gray-500">
                        ID: {lead.id.substring(0, 4)}
                    </div>
                </div>

                {/* Lead value indicator (for future implementation) */}
                {lead.value && (
                    <div className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">
                        ₹{lead.value.toLocaleString()}
                    </div>
                )}
            </div>

            {/* Status indicators */}
            <div className="flex gap-1 mt-2">
                {lead.is_hot && (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[9px] font-bold rounded">HOT</span>
                )}
                {lead.priority === 'high' && (
                    <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 text-[9px] font-bold rounded">HIGH</span>
                )}
            </div>
        </div>
    );
};

export default LeadCard;
