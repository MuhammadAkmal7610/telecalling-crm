import React, { useState } from 'react';

import WorkspaceGuard from '../components/WorkspaceGuard';
import { MapPinIcon, UserCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function FieldTracking() {
    const agents = [
        { id: 1, name: 'John Doe', location: 'Downtown Hub', status: 'Active', lastCheckIn: '10 mins ago' },
        { id: 2, name: 'Jane Smith', location: 'North Branch', status: 'On Route', lastCheckIn: '1 hour ago' },
        { id: 3, name: 'Mike Johnson', location: 'Westside Client', status: 'Checked In', lastCheckIn: '5 mins ago' }
    ];

    return (
        <WorkspaceGuard>
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-gray-50/50">
                <div className="w-full mx-auto space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Field Tracking (Geo-Tagging)</h1>
                                    <p className="text-sm text-gray-500 mt-1">Real-time GPS tracking and check-ins for on-field sales teams.</p>
                                </div>
                                <button className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition">
                                    Export Logs
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Map Placeholder */}
                                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-[500px] flex items-center justify-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-blue-50 opacity-50"></div>
                                    <div className="absolute inset-0 border-2 border-dashed border-blue-200 rounded-lg m-4 flex flex-col items-center justify-center text-blue-400">
                                        <MapPinIcon className="w-12 h-12 mb-2" />
                                        <p className="font-medium">Interactive Map View</p>
                                        <p className="text-sm">Google Maps / Mapbox Integration goes here</p>
                                    </div>
                                </div>

                                {/* Agent List */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                                        <h2 className="font-semibold text-gray-800">Active Field Agents</h2>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {agents.map(agent => (
                                            <div key={agent.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition">
                                                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0">
                                                    <UserCircleIcon className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold text-gray-900 truncate">{agent.name}</h3>
                                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                                        <MapPinIcon className="w-3 h-3 mr-1" />
                                                        <span className="truncate">{agent.location}</span>
                                                    </div>
                                                    <div className="flex items-center text-xs text-gray-400 mt-1">
                                                        <ClockIcon className="w-3 h-3 mr-1" />
                                                        {agent.lastCheckIn}
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                                                    agent.status === 'Active' ? 'bg-green-100 text-green-700' :
                                                    agent.status === 'On Route' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {agent.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                </div>
            </div>
        </WorkspaceGuard>
    );
}
