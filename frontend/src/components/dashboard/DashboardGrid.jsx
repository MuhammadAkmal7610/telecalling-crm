import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';

const DashboardGrid = ({ items, setItems, isEditing, renderItem, columns = 'grid-cols-4' }) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((i) => (i.id || i) === active.id);
                const newIndex = items.findIndex((i) => (i.id || i) === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={items} strategy={rectSortingStrategy}>
                <div className={`grid gap-4 ${columns}`}>
                    {items.map((item) => renderItem(item))}
                </div>
            </SortableContext>
        </DndContext>
    );
};

export default DashboardGrid;
