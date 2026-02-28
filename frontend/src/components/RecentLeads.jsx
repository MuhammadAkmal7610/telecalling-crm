import React from 'react';
import { EllipsisVerticalIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';

const leads = [
    { name: 'Sarah Wilson', role: 'Marketing Director', company: 'TechFlow', email: 'sarah@techflow.io', status: 'New', statusColor: 'bg-blue-100 text-blue-700', value: '$12,500' },
    { name: 'Michael Chen', role: 'VP Sales', company: 'GlobalSoft', email: 'm.chen@global.net', status: 'Qualified', statusColor: 'bg-teal-100 text-teal-700', value: '$28,000' },
    { name: 'Emma Davis', role: 'Operations', company: 'StartScale', email: 'emma@startscale.com', status: 'Negotiation', statusColor: 'bg-orange-100 text-orange-700', value: '$8,200' },
    { name: 'James Rod', role: 'Founder', company: 'Innovate', email: 'james@innovate.co', status: 'New', statusColor: 'bg-blue-100 text-blue-700', value: '$15,000' },
    { name: 'Marcus Bell', role: 'CTO', company: 'DataSystems', email: 'marcus@datasys.com', status: 'Contacted', statusColor: 'bg-purple-100 text-purple-700', value: '$42,000' },
];

export default function RecentLeads() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="text-gray-900 font-semibold text-lg">Startups & New Leads</h3>
                    <p className="text-gray-500 text-sm mt-1">5 new opportunities today</p>
                </div>
                <button className="text-teal-600 hover:text-teal-700 text-sm font-medium hover:underline">View All</button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead</th>
                            <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Value</th>
                            <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {leads.map((lead, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/80 transition-colors group">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                                            {lead.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{lead.name}</p>
                                            <p className="text-xs text-gray-500">{lead.company}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${lead.statusColor}`}>
                                        {lead.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <span className="text-sm font-medium text-gray-700">{lead.value}</span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 hover:bg-white rounded text-gray-400 hover:text-teal-600 hover:shadow-sm border border-transparent hover:border-gray-200 transition-all">
                                            <EnvelopeIcon className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 hover:bg-white rounded text-gray-400 hover:text-teal-600 hover:shadow-sm border border-transparent hover:border-gray-200 transition-all">
                                            <PhoneIcon className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 hover:bg-white rounded text-gray-400 hover:text-gray-600 hover:shadow-sm border border-transparent hover:border-gray-200 transition-all">
                                            <EllipsisVerticalIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
