import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowsPointingOutIcon as DragIcon, XMarkIcon } from '@heroicons/react/24/outline';

const DraggableWidget = ({ id, children, isEditing, onRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.7 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            {isEditing && (
                <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div
                        {...attributes}
                        {...listeners}
                        className="p-1 bgColor-white border border-gray-200 rounded-md shadow-sm cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                        title="Drag to reorder"
                    >
                        <DragIcon className="w-4 h-4" />
                    </div>
                    {onRemove && (
                        <button
                            onClick={() => onRemove(id)}
                            className="p-1 bgColor-white border border-gray-200 rounded-md shadow-sm text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Remove widget"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}
            <div className={`h-full ${isEditing ? 'ring-2 ring-teal-500/20 rounded-xl' : ''}`}>
                {children}
            </div>
        </div>
    );
};

export default DraggableWidget;
