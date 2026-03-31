import React from 'react';

const StatCard = ({ icon: Icon, label, value, sub, color = 'teal', trend }) => {
    const colorMap = {
        teal: 'bg-[#08A698]/10 text-[#08A698]',
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        amber: 'bg-amber-50 text-amber-600',
        green: 'bg-green-50 text-green-600',
        rose: 'bg-rose-50 text-rose-600',
    };
    return (
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all h-full min-h-[135px] flex flex-col justify-between">
            <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend !== undefined && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend >= 0 ? '+' : ''}{trend} this week
                    </span>
                )}
            </div>
            <div className="mt-3">
                <div className="text-2xl font-bold text-gray-900">{value ?? <span className="text-gray-300 animate-pulse">—</span>}</div>
                <div className="text-sm font-medium text-gray-700 mt-0.5">{label}</div>
                {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
            </div>
        </div>
    );
};

export default StatCard;
