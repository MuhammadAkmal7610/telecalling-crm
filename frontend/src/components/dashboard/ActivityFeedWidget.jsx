import React from 'react';
import { PhoneIcon, UserIcon } from '@heroicons/react/24/outline';
import Skeleton from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';

const ActivityFeedWidget = ({ activity, loading }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
                {loading ? (
                    <div className="p-6"><Skeleton rows={5} /></div>
                ) : activity.length > 0 ? (
                    activity.map(a => (
                        <div key={a.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left">
                            <div className={`mt-0.5 p-1.5 rounded-full ${a.type === 'call' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                {a.type === 'call' ? <PhoneIcon className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800">
                                    <span className="font-semibold">{a.user?.name || 'Unknown'}</span>
                                    {' logged a '}
                                    <span className="font-medium capitalize">{a.type}</span>
                                    {a.lead?.name && <> with <span className="font-semibold">{a.lead.name}</span></>}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {new Date(a.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <EmptyState title="No recent activity" subtitle="Your organization has no recent events" />
                )}
            </div>
        </div>
    );
};

export default ActivityFeedWidget;
