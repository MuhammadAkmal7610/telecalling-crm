import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

const initialTasks = [
    { id: 1, text: 'Review quarterly report', done: false },
    { id: 2, text: 'Email marketing team', done: true },
    { id: 3, text: 'Update billing info', done: false },
    { id: 4, text: 'Schedule team meeting', done: false },
];

export default function TaskChecklist() {
    const [tasks, setTasks] = useState(initialTasks);

    const toggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm">My Tasks</h3>
                <button className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors">
                    <PlusIcon className="w-4 h-4" />
                </button>
            </div>
            <div className="p-2">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
                    >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${task.done ? 'bg-teal-500 border-teal-500' : 'border-gray-300 group-hover:border-teal-400'}`}>
                            {task.done && (
                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        <span className={`text-sm ${task.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                            {task.text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
