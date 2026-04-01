import React, { useEffect, useRef, useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    BuildingOfficeIcon,
    ChevronDownIcon,
    CheckIcon,
    ArrowTopRightOnSquareIcon,
    Cog6ToothIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';

// Color palette for workspace avatars
const AVATAR_COLORS = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-yellow-500',
    'bg-teal-500',
    'bg-red-500',
    'bg-cyan-500',
];

/**
 * Get initials from workspace name
 */
function getInitials(name) {
    if (!name) return 'W';
    const words = name.split(/\s+/);
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

/**
 * Get a consistent color for a workspace based on its ID
 */
function getWorkspaceColor(workspaceId) {
    if (!workspaceId) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < workspaceId.length; i++) {
        hash = workspaceId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * WorkspaceSwitcher Component
 * 
 * A click-based workspace switcher dropdown that:
 * - Shows current workspace with avatar
 * - Lists all available workspaces
 * - Shows loading state during switching
 * - Provides toast notification on switch
 * - Separates workspace switching from settings
 */
export default function WorkspaceSwitcher() {
    const {
        workspaces,
        currentWorkspace,
        switchingWorkspace,
        workspaceSwitcherOpen,
        switchWorkspace,
        closeWorkspaceSwitcher,
        openWorkspaceSwitcher,
    } = useWorkspace();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const [previousWorkspace, setPreviousWorkspace] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    // Use local state for open/close to avoid timing issues
    const isDropdownOpen = workspaceSwitcherOpen || isOpen;

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                closeWorkspaceSwitcher();
            }
        }
        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen, closeWorkspaceSwitcher]);

    const handleToggle = () => {
        if (isDropdownOpen) {
            setIsOpen(false);
            closeWorkspaceSwitcher();
        } else {
            setIsOpen(true);
            openWorkspaceSwitcher();
        }
    };

    // Track workspace changes for toast notification
    useEffect(() => {
        if (currentWorkspace && previousWorkspace && currentWorkspace.id !== previousWorkspace.id) {
            toast.success(
                <div className="flex items-center gap-2">
                    <BuildingOfficeIcon className="w-4 h-4 text-[#08A698]" />
                    <span>Switched to <strong>{currentWorkspace.name}</strong></span>
                </div>,
                {
                    duration: 3000,
                    position: 'top-center',
                    style: {
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    },
                }
            );
            setPreviousWorkspace(currentWorkspace);
        } else if (currentWorkspace && !previousWorkspace) {
            setPreviousWorkspace(currentWorkspace);
        }
    }, [currentWorkspace, previousWorkspace]);

    // Close switcher when workspace changes
    useEffect(() => {
        if (workspaceSwitcherOpen && !switchingWorkspace) {
            closeWorkspaceSwitcher();
        }
    }, [switchingWorkspace, workspaceSwitcherOpen, closeWorkspaceSwitcher]);

    const isSwitching = switchingWorkspace !== null;
    const currentColor = getWorkspaceColor(currentWorkspace?.id);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Workspace Button */}
            <button
                onClick={handleToggle}
                disabled={isSwitching}
                className={`
                    flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200 border
                    ${isSwitching 
                        ? 'bg-gray-100 text-gray-500 cursor-wait border-gray-200' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                    }
                    focus:outline-none focus:ring-2 focus:ring-[#08A698]/20 focus:border-[#08A698]
                `}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                title={currentWorkspace?.name || 'Select Workspace'}
            >
                {/* Workspace Avatar */}
                <div className={`
                    w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold
                    transition-colors duration-300
                    ${isSwitching ? 'bg-gray-400' : currentColor}
                `}>
                    {isSwitching ? (
                        <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        getInitials(currentWorkspace?.name)
                    )}
                </div>

                {/* Workspace Name */}
                <span className="max-w-[120px] truncate">
                    {currentWorkspace?.name || 'Loading...'}
                </span>

                {/* Dropdown Arrow */}
                <ChevronDownIcon className={`
                    w-4 h-4 text-gray-400 transition-transform duration-200
                    ${isDropdownOpen ? 'rotate-180' : ''}
                `} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <div className="fixed inset-0 z-40 lg:hidden" onClick={() => { setIsOpen(false); closeWorkspaceSwitcher(); }} />
                    
                    <div className={`
                        absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl 
                        border border-gray-100 z-50 overflow-hidden
                        animate-in fade-in zoom-in-95 duration-150
                    `}>
                        {/* Header */}
                        <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                Switch Workspace
                            </span>
                        </div>

                        {/* Workspace List */}
                        <div className="max-h-64 overflow-y-auto p-2">
                            {workspaces.map((workspace) => {
                                const isActive = currentWorkspace?.id === workspace.id;
                                const color = getWorkspaceColor(workspace.id);
                                const isCurrentlySwitching = switchingWorkspace === workspace.id;

                                return (
                                    <button
                                        key={workspace.id}
                                        onClick={() => switchWorkspace(workspace.id)}
                                        disabled={isActive || isCurrentlySwitching}
                                        className={`
                                            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                                            transition-all duration-150
                                            ${isActive 
                                                ? 'bg-[#08A698]/10 text-[#08A698] cursor-default' 
                                                : 'text-gray-700 hover:bg-gray-50'
                                            }
                                            ${isCurrentlySwitching ? 'opacity-60 cursor-wait' : ''}
                                        `}
                                    >
                                        {/* Avatar */}
                                        <div className={`
                                            w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold
                                            ${isActive ? color : 'bg-gray-300'}
                                        `}>
                                            {isCurrentlySwitching ? (
                                                <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                getInitials(workspace.name)
                                            )}
                                        </div>

                                        {/* Name */}
                                        <span className="flex-1 text-left truncate">
                                            {workspace.name}
                                        </span>

                                        {/* Checkmark for active workspace */}
                                        {isActive && (
                                            <CheckIcon className="w-5 h-5 text-[#08A698]" />
                                        )}
                                    </button>
                                );
                            })}

                            {workspaces.length === 0 && !isSwitching && (
                                <div className="text-center py-6 text-gray-500 text-sm">
                                    No workspaces available
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="border-t border-gray-100 p-2 space-y-1">
                            <button
                                onClick={() => {
                                    closeWorkspaceSwitcher();
                                    navigate('/manage-workspaces');
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#08A698] rounded-lg transition-colors"
                            >
                                <Cog6ToothIcon className="w-4 h-4 text-gray-400" />
                                Manage Workspaces
                            </button>
                            <button
                                onClick={() => {
                                    closeWorkspaceSwitcher();
                                    navigate('/manage-workspaces');
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#08A698] rounded-lg transition-colors"
                            >
                                <PlusIcon className="w-4 h-4 text-gray-400" />
                                Create New Workspace
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}