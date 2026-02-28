import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

export default function StatsCard({ title, value, trend, trendValue }) {
    const isPositive = trend === 'up';

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm transition-shadow hover:shadow-md h-full flex flex-col justify-between">
            <h3 className="text-gray-500 text-sm font-medium tracking-wide mb-4">{title}</h3>
            <div className="flex items-end justify-between">
                <span className="text-4xl text-gray-900 tracking-tight">{value}</span>
                {trendValue && (
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {isPositive ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                        {trendValue}
                    </div>
                )}
            </div>
        </div>
    );
}
