import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import LeadCard from './LeadCard';
import {
    PlusIcon,
    EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';

const PipelineColumn = ({ 
    stage, 
    leads, 
    onLeadClick, 
    onAddLead, 
    onStageEdit,
    onStageDelete,
    isDropTarget = false 
}) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const { setNodeRef, isOver, active } = useDroppable({
        id: stage.id,
        data: {
            accepts: ['lead'],
            stage: stage.id
        }
    });

    const getStageColor = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('fresh')) return 'border-blue-500';
        if (lower.includes('attempt')) return 'border-yellow-500';
        if (lower.includes('connected')) return 'border-slate-400';
        if (lower.includes('interested')) return 'border-teal-500';
        if (lower.includes('won')) return 'border-green-500';
        if (lower.includes('lost')) return 'border-red-500';
        return 'border-gray-300';
    };

    const getStageBadgeColor = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('fresh')) return 'bg-blue-50 text-blue-700';
        if (lower.includes('attempt')) return 'bg-yellow-50 text-yellow-700';
        if (lower.includes('connected')) return 'bg-slate-50 text-slate-700';
        if (lower.includes('interested')) return 'bg-teal-50 text-teal-700';
        if (lower.includes('won')) return 'bg-green-50 text-green-700';
        if (lower.includes('lost')) return 'bg-red-50 text-red-700';
        return 'bg-gray-50 text-gray-700';
    };

    const borderColor = getStageColor(stage.name);
    const badgeColor = getStageBadgeColor(stage.name);

    return (
        <div className="w-72 flex-shrink-0 flex flex-col h-full bg-gray-50/50 rounded-xl border border-gray-200/80 max-h-full">
            {/* Column Header */}
            <div 
                className={`p-3 border-t-4 rounded-t-xl bg-white border-b border-gray-200/50 flex items-center justify-between ${borderColor}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-gray-800">{stage.name}</h3>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm ${badgeColor}`}>
                        {leads.length}
                    </span>
                    {stage.probability && (
                        <span className="text-[9px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            {stage.probability}%
                        </span>
                    )}
                </div>
                <div className="flex gap-1">
                    <button 
                        onClick={() => onAddLead(stage.id)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                        title="Add Lead"
                    >
                        <PlusIcon className="w-4 h-4" />
                    </button>
                    {isHovered && (
                        <>
                            <button 
                                onClick={() => onStageEdit(stage)}
                                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                title="Edit Stage"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            {!stage.is_default && (
                                <button 
                                    onClick={() => onStageDelete(stage)}
                                    className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 focus:outline-none transition-colors"
                                    title="Delete Stage"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </>
                    )}
                    <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 focus:outline-none transition-colors">
                        <EllipsisHorizontalIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Drop Zone */}
            <div 
                ref={setNodeRef}
                className={`flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar transition-colors ${
                    isOver && active ? 'bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg' : ''
                }`}
            >
                {leads.length === 0 ? (
                    <div className="py-12 text-center text-[10px] text-gray-400 italic">
                        {isOver ? 'Drop lead here' : 'No leads in this stage'}
                    </div>
                ) : (
                    <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
                        {leads.map((lead) => (
                            <LeadCard
                                key={lead.id}
                                lead={lead}
                                onClick={onLeadClick}
                            />
                        ))}
                    </SortableContext>
                )}
            </div>

            {/* Stage Footer Info */}
            <div className="p-2 bg-white border-t border-gray-100 text-xs text-gray-500">
                <div className="flex justify-between items-center">
                    <span>Total: {leads.length}</span>
                    {stage.avg_days && (
                        <span>Avg: {stage.avg_days}d</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PipelineColumn;
