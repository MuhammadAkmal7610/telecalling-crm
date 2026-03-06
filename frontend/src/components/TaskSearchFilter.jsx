import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useWorkspace } from '../context/WorkspaceContext';
import { useSocket } from '../contexts/SocketContext';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    CalendarIcon,
    UserIcon,
    FlagIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    ArrowPathIcon,
    PlusIcon,
    EllipsisHorizontalIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const TaskSearchFilter = ({ onFiltersChange, onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [filters, setFilters] = useState({
        assignee: 'all',
        status: 'all',
        priority: 'all',
        dueDate: 'all',
        type: 'all'
    });

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        onSearch(value);
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const clearFilters = () => {
        const defaultFilters = {
            assignee: 'all',
            status: 'all',
            priority: 'all',
            dueDate: 'all',
            type: 'all'
        };
        setFilters(defaultFilters);
        onFiltersChange(defaultFilters);
    };

    const activeFilterCount = Object.values(filters).filter(v => v !== 'all').length;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search tasks by title, description, or lead name..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#08A698] focus:ring-1 focus:ring-[#08A698]"
                />
                {searchTerm && (
                    <button
                        onClick={() => handleSearchChange('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <XCircleIcon className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Quick filters:</span>
                    <button
                        onClick={() => handleFilterChange('status', 'pending')}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            filters.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <ClockIcon className="w-3 h-3 inline mr-1" />
                        Pending
                    </button>
                    <button
                        onClick={() => handleFilterChange('status', 'late')}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            filters.status === 'late' 
                                ? 'bg-red-100 text-red-700 border border-red-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <ExclamationTriangleIcon className="w-3 h-3 inline mr-1" />
                        Overdue
                    </button>
                    <button
                        onClick={() => handleFilterChange('dueDate', 'today')}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            filters.dueDate === 'today' 
                                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <CalendarIcon className="w-3 h-3 inline mr-1" />
                        Due Today
                    </button>
                </div>

                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        showAdvanced || activeFilterCount > 0
                            ? 'bg-[#08A698] text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    <FunnelIcon className="w-4 h-4" />
                    Advanced {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>

                {activeFilterCount > 0 && (
                    <button
                        onClick={clearFilters}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
                <div className="border-t border-gray-200 pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Assignee Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <UserIcon className="w-4 h-4 inline mr-1" />
                                Assignee
                            </label>
                            <select
                                value={filters.assignee}
                                onChange={(e) => handleFilterChange('assignee', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#08A698]"
                            >
                                <option value="all">All Team Members</option>
                                <option value="me">Assigned to Me</option>
                                <option value="unassigned">Unassigned</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#08A698]"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="late">Late</option>
                            </select>
                        </div>

                        {/* Priority Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FlagIcon className="w-4 h-4 inline mr-1" />
                                Priority
                            </label>
                            <select
                                value={filters.priority}
                                onChange={(e) => handleFilterChange('priority', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#08A698]"
                            >
                                <option value="all">All Priorities</option>
                                <option value="urgent">Urgent</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        {/* Due Date Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <CalendarIcon className="w-4 h-4 inline mr-1" />
                                Due Date
                            </label>
                            <select
                                value={filters.dueDate}
                                onChange={(e) => handleFilterChange('dueDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#08A698]"
                            >
                                <option value="all">Any Time</option>
                                <option value="overdue">Overdue</option>
                                <option value="today">Today</option>
                                <option value="tomorrow">Tomorrow</option>
                                <option value="this_week">This Week</option>
                                <option value="next_week">Next Week</option>
                                <option value="this_month">This Month</option>
                            </select>
                        </div>

                        {/* Task Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type
                            </label>
                            <select
                                value={filters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#08A698]"
                            >
                                <option value="all">All Types</option>
                                <option value="call_followup">Call Follow-up</option>
                                <option value="email">Email</option>
                                <option value="meeting">Meeting</option>
                                <option value="demo">Demo</option>
                                <option value="proposal">Proposal</option>
                                <option value="todo">To-do</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskSearchFilter;
