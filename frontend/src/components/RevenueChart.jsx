import React from 'react';

const data = [
    { month: 'Jan', value: 35, height: 'h-[35%]' },
    { month: 'Feb', value: 42, height: 'h-[42%]' },
    { month: 'Mar', value: 28, height: 'h-[28%]' },
    { month: 'Apr', value: 55, height: 'h-[55%]' },
    { month: 'May', value: 48, height: 'h-[48%]' },
    { month: 'Jun', value: 65, height: 'h-[65%]' },
    { month: 'Jul', value: 52, height: 'h-[52%]' },
    { month: 'Aug', value: 72, height: 'h-[72%]' },
    { month: 'Sep', value: 68, height: 'h-[68%]' },
    { month: 'Oct', value: 85, height: 'h-[85%]' },
    { month: 'Nov', value: 92, height: 'h-[92%]' },
    { month: 'Dec', value: 88, height: 'h-[88%]' },
];

export default function RevenueChart() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-gray-900 font-semibold text-lg">Revenue Trend</h3>
                    <p className="text-gray-500 text-sm mt-1">Monthly performance (2024)</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-teal-500"></span>
                    <span className="text-sm text-gray-600">Projections</span>
                </div>
            </div>

            <div className="h-64 flex items-end justify-between gap-2">
                {data.map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <div className={`w-full bg-teal-50 rounded-t-lg relative group-hover:bg-teal-100 transition-all duration-300 ${item.height}`}>
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                ${item.value}k
                            </div>
                            <div className={`absolute bottom-0 left-0 w-full bg-teal-500 rounded-t-lg transition-all duration-500`} style={{ height: `${item.value}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-400 font-medium group-hover:text-teal-600 transition-colors">{item.month}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
