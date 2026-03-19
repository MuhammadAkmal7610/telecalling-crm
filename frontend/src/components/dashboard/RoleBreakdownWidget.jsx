import React from 'react';
import Skeleton from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';
import { Cog6ToothIcon, KeyIcon, UserIcon, MegaphoneIcon, PhoneIcon, CreditCardIcon } from '@heroicons/react/24/outline';

const RoleTag = ({ role }) => {
    const styles = {
        root: 'bg-purple-50 text-purple-700 border-purple-100',
        billing_admin: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        admin: 'bg-blue-50 text-blue-700 border-blue-100',
        manager: 'bg-teal-50 text-teal-700 border-teal-100',
        marketing: 'bg-amber-50 text-amber-700 border-amber-100',
        caller: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    const icons = { root: KeyIcon, billing_admin: CreditCardIcon, admin: Cog6ToothIcon, manager: UserIcon, marketing: MegaphoneIcon, caller: PhoneIcon };
    const Icon = icons[role] || UserIcon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[role] || styles.caller}`}>
            <Icon className="w-3 h-3" />
            {role?.charAt(0).toUpperCase() + role?.slice(1)}
        </span>
    );
};

const RoleBreakdownWidget = ({ stats, loading }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Users by Role</h2>
            </div>
            <div className="p-6 space-y-3">
                {loading ? (
                    <Skeleton rows={5} />
                ) : stats?.users?.byRole ? (
                    Object.entries(stats.users.byRole).sort((a, b) => b[1] - a[1]).map(([role, count]) => (
                        <div key={role} className="flex items-center justify-between">
                            <RoleTag role={role} />
                            <div className="flex items-center gap-3">
                                <div className="w-32 bg-gray-100 rounded-full h-1.5">
                                    <div
                                        className="h-1.5 rounded-full bg-[#08A698]"
                                        style={{ width: `${(count / stats.users.total) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm font-bold text-gray-900 w-6 text-right">{count}</span>
                            </div>
                        </div>
                    ))
                ) : <EmptyState title="No data" subtitle="No role distribution available" />}
            </div>
        </div>
    );
};

export default RoleBreakdownWidget;
