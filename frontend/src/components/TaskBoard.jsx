import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useWorkspace } from '../context/WorkspaceContext';
import { useSocket } from '../contexts/SocketContext';
import {
    UserIcon,
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    PhoneIcon,
    EnvelopeIcon,
    VideoCameraIcon,
    DocumentTextIcon,
    FlagIcon,
    EllipsisHorizontalIcon,
    ArrowPathIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import TaskSearchFilter from './TaskSearchFilter';
import TaskModal from './TaskModal';

const TaskBoard = () => {
    const { apiFetch } = useApi();
    const { currentWorkspace } = useWorkspace();
    const { isConnected, socketService } = useSocket();
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        assignee: 'all',
        status: 'all',
        priority: 'all',
        dueDate: 'all',
        type: 'all'
    });
    const [viewMode, setViewMode] = useState('kanban'); // kanban, list, calendar
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, [currentWorkspace]);

    useEffect(() => {
        applyFiltersAndSearch();
    }, [tasks, searchTerm, filters]);

    useEffect(() => {
        if (!isConnected) return;

        const handleTaskUpdate = (event) => {
            const { task, action } = event.detail;
            if (action === 'created' || action === 'updated' || action === 'deleted') {
                fetchTasks();
            }
        };

        window.addEventListener('task_update', handleTaskUpdate);
        return () => window.removeEventListener('task_update', handleTaskUpdate);
    }, [isConnected]);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await apiFetch('/tasks');
            const data = await response.json();
            const tasksData = data.data?.data || data.data || [];
            setTasks(tasksData);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFiltersAndSearch = () => {
        let filtered = [...tasks];

        // Apply search
        if (searchTerm) {
            filtered = filtered.filter(task =>
                task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.lead?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply filters
        if (filters.assignee !== 'all') {
            filtered = filtered.filter(task => {
                if (filters.assignee === 'me') {
                    return task.assignee_id === currentWorkspace?.userId;
                } else if (filters.assignee === 'unassigned') {
                    return !task.assignee_id;
                }
                return task.assignee_id === filters.assignee;
            });
        }

        if (filters.status !== 'all') {
            filtered = filtered.filter(task => task.status === filters.status);
        }

        if (filters.priority !== 'all') {
            filtered = filtered.filter(task => task.priority === filters.priority);
        }

        if (filters.dueDate !== 'all') {
            filtered = filtered.filter(task => {
                const dueDate = new Date(task.due_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                switch (filters.dueDate) {
                    case 'overdue':
                        return dueDate < today && task.status !== 'completed';
                    case 'today':
                        return dueDate.toDateString() === today.toDateString();
                    case 'tomorrow':
                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        return dueDate.toDateString() === tomorrow.toDateString();
                    case 'this_week':
                        const weekEnd = new Date(today);
                        weekEnd.setDate(weekEnd.getDate() + 6);
                        return dueDate >= today && dueDate <= weekEnd;
                    case 'next_week':
                        const nextWeekStart = new Date(today);
                        nextWeekStart.setDate(nextWeekStart.getDate() + 7);
                        const nextWeekEnd = new Date(nextWeekStart);
                        nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);
                        return dueDate >= nextWeekStart && dueDate <= nextWeekEnd;
                    case 'this_month':
                        return dueDate.getMonth() === today.getMonth() && 
                               dueDate.getFullYear() === today.getFullYear();
                    default:
                        return true;
                }
            });
        }

        if (filters.type !== 'all') {
            filtered = filtered.filter(task => task.type === filters.type);
        }

        setFilteredTasks(filtered);
    };

    const getTaskIcon = (type) => {
        switch (type) {
            case 'call_followup': return PhoneIcon;
            case 'email': return EnvelopeIcon;
            case 'meeting': return VideoCameraIcon;
            case 'demo': return VideoCameraIcon;
            case 'proposal': return DocumentTextIcon;
            default: return ClockIcon;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'medium': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'late': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const isOverdue = (task) => {
        if (task.status === 'completed' || task.status === 'cancelled') return false;
        return new Date(task.due_date) < new Date().setHours(0, 0, 0, 0);
    };

    const TaskCard = ({ task }) => {
        const TaskIcon = getTaskIcon(task.type);
        const overdue = isOverdue(task);

        return (
            <div className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all cursor-pointer ${
                overdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
            }`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${getPriorityColor(task.priority)}`}>
                            <TaskIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm">{task.title}</h3>
                            {task.lead && (
                                <p className="text-xs text-gray-500">Lead: {task.lead.name}</p>
                            )}
                        </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                        <EllipsisHorizontalIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* Description */}
                {task.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status}
                        </span>
                        {overdue && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                Overdue
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <CalendarIcon className="w-3 h-3" />
                        {new Date(task.due_date).toLocaleDateString()}
                    </div>
                </div>

                {/* Assignee */}
                {task.assignee && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                            {task.assignee.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-xs text-gray-600">{task.assignee.name}</span>
                    </div>
                )}
            </div>
        );
    };

    const KanbanView = () => {
        const columns = [
            { id: 'todo', title: 'To Do', status: 'pending' },
            { id: 'in_progress', title: 'In Progress', status: 'in_progress' },
            { id: 'completed', title: 'Completed', status: 'completed' },
            { id: 'cancelled', title: 'Cancelled', status: 'cancelled' }
        ];

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {columns.map(column => (
                    <div key={column.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">{column.title}</h3>
                            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                                {filteredTasks.filter(t => t.status === column.status).length}
                            </span>
                        </div>
                        <div className="space-y-3">
                            {filteredTasks
                                .filter(task => task.status === column.status)
                                .map(task => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const ListView = () => (
        <div className="bg-white rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignee</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredTasks.map(task => (
                            <tr key={task.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4">
                                    <div>
                                        <div className="font-medium text-gray-900">{task.title}</div>
                                        {task.lead && (
                                            <div className="text-sm text-gray-500">Lead: {task.lead.name}</div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    {task.assignee ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                                                {task.assignee.name?.charAt(0)}
                                            </div>
                                            <span className="text-sm text-gray-900">{task.assignee.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-500">Unassigned</span>
                                    )}
                                </td>
                                <td className="px-4 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                        {task.priority}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                        {task.status}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-900">
                                    {new Date(task.due_date).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-4">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <EllipsisHorizontalIcon className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
                    {isConnected && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Live</span>
                    )}
                    <button onClick={fetchTasks} className="text-[#08A698] hover:text-[#068f82]">
                        <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Mode Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {['kanban', 'list'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    viewMode === mode
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {mode === 'kanban' ? 'Kanban' : 'List'}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setIsTaskModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#08A698] hover:bg-[#068f82] text-white rounded-lg text-sm font-medium"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Create Task
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <TaskSearchFilter
                onSearch={setSearchTerm}
                onFiltersChange={setFilters}
            />

            {/* Task Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Tasks', value: filteredTasks.length, color: 'bg-blue-50 text-blue-700' },
                    { label: 'Pending', value: filteredTasks.filter(t => t.status === 'pending').length, color: 'bg-yellow-50 text-yellow-700' },
                    { label: 'Overdue', value: filteredTasks.filter(t => isOverdue(t)).length, color: 'bg-red-50 text-red-700' },
                    { label: 'Completed', value: filteredTasks.filter(t => t.status === 'completed').length, color: 'bg-green-50 text-green-700' }
                ].map(stat => (
                    <div key={stat.label} className={`p-4 rounded-lg border ${stat.color.replace('text-', 'border-').replace('50', '200')}`}>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-sm font-medium">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Tasks View */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <ArrowPathIcon className="w-8 h-8 text-[#08A698] animate-spin" />
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-gray-400 mb-4">
                        <MagnifyingGlassIcon className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
            ) : (
                viewMode === 'kanban' ? <KanbanView /> : <ListView />
            )}

            {/* Task Modal */}
            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                task={selectedTask}
                onSuccess={fetchTasks}
            />
        </div>
    );
};

export default TaskBoard;
