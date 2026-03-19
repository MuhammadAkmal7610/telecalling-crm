import React from 'react';
import Skeleton from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';

const StatusBreakdownWidget = ({ stats, loading }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Leads by Status</h2>
            </div>
            <div className="p-6 space-y-3">
                {loading ? (
                    <Skeleton rows={5} />
                ) : stats?.leads?.byStatus ? (
                    Object.entries(stats.leads.byStatus).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                            <div className="flex items-center gap-3">
                                <div className="w-32 bg-gray-100 rounded-full h-1.5">
                                    <div
                                        className="h-1.5 rounded-full bg-purple-500"
                                        style={{ width: `${(count / stats.leads.total) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm font-bold text-gray-900 w-6 text-right">{count}</span>
                            </div>
                        </div>
                    ))
                ) : <EmptyState title="No data" subtitle="No leads status found" />}
            </div>
        </div>
    );
};

export default StatusBreakdownWidget;
