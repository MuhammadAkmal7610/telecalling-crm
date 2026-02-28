import React from 'react';

const activities = [
    { user: 'David K.', action: 'created a new campaign', target: 'Q4 Outreach', time: '2h ago', color: 'bg-teal-100 text-teal-700' },
    { user: 'Sarah W.', action: 'added 50 new leads to', target: 'Tech Corps', time: '4h ago', color: 'bg-blue-100 text-blue-700' },
    { user: 'System', action: 'completed data sync with', target: 'Salesforce', time: '5h ago', color: 'bg-gray-100 text-gray-700' },
    { user: 'Michael C.', action: 'scheduled a demo with', target: 'GlobalSoft', time: '1d ago', color: 'bg-purple-100 text-purple-700' },
];

export default function ActivityFeed() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm">Team Activity</h3>
                <span className="text-xs text-gray-400">Recent</span>
            </div>
            <div className="p-4">
                <ol className="relative border-l border-gray-200 ml-2 space-y-6">
                    {activities.map((item, idx) => (
                        <li key={idx} className="ml-6">
                            <span className={`absolute flex items-center justify-center w-4 h-4 rounded-full -left-2 ring-4 ring-white ${item.color.replace('text-', 'bg-').split(' ')[0]}`}>
                            </span>
                            <div className="flex flex-col gap-0.5">
                                <p className="text-sm font-medium text-gray-900">
                                    {item.user} <span className="font-normal text-gray-500">{item.action}</span> <span className="text-gray-900 font-medium">{item.target}</span>
                                </p>
                                <time className="text-xs font-normal text-gray-400">{item.time}</time>
                            </div>
                        </li>
                    ))}
                </ol>
                <button className="w-full mt-4 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors py-2 border border-dashed border-gray-200 rounded-lg hover:bg-gray-50">
                    View full history
                </button>
            </div>
        </div>
    );
}
