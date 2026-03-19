import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UsersIcon, BuildingOfficeIcon, CreditCardIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const QuickActionsWidget = () => {
    const navigate = useNavigate();
    const actions = [
        { label: 'Manage Users', icon: UsersIcon, path: '/users', color: 'teal' },
        { label: 'Workspaces', icon: BuildingOfficeIcon, path: '/manage-workspaces', color: 'blue' },
        { label: 'Billing', icon: CreditCardIcon, path: '/billing', color: 'purple' },
        { label: 'Permissions', icon: ShieldCheckIcon, path: '/permission-templates', color: 'amber' },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-full">
            <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
                {actions.map(action => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.label}
                            onClick={() => navigate(action.path)}
                            className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-[#08A698]/5 border border-gray-100 hover:border-[#08A698]/30 rounded-xl transition-all group"
                        >
                            <Icon className="w-6 h-6 text-gray-400 group-hover:text-[#08A698] transition-colors" />
                            <span className="text-xs font-semibold text-gray-600 group-hover:text-[#08A698] transition-colors text-center">{action.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuickActionsWidget;
