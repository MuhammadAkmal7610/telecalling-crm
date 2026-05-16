import React from 'react';
import WorkspaceGuard from '../components/WorkspaceGuard';
import { SparklesIcon, PlayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function AISummarization() {
    const calls = [
        { id: 1, contact: 'Alice Wonderland', duration: '04:12', date: 'Today, 10:30 AM', sentiment: 'Positive', summary: 'Client agreed to the pricing terms. Requested contract by Friday.' },
        { id: 2, contact: 'Bob Builder', duration: '12:45', date: 'Yesterday, 02:15 PM', sentiment: 'Neutral', summary: 'Discussed project scope. Needs to consult with technical team before proceeding.' },
        { id: 3, contact: 'Charlie Chaplin', duration: '02:30', date: 'Oct 12, 11:00 AM', sentiment: 'Negative', summary: 'Pricing is too high. Not interested at the current moment. Follow up in 3 months.' }
    ];

    return (
        <WorkspaceGuard>
            <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-gray-50/50">
                <div className="w-full space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <SparklesIcon className="w-6 h-6 text-purple-600" />
                                AI Call Summarization
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">Automatic transcription and summarization of recorded calls.</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h2 className="font-semibold text-gray-800">Recent Analyzed Calls</h2>
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">Powered by AI</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {calls.map(call => (
                                <div key={call.id} className="p-5 hover:bg-gray-50 transition flex flex-col md:flex-row gap-6">
                                    <div className="md:w-1/4">
                                        <h3 className="font-bold text-gray-900">{call.contact}</h3>
                                        <div className="text-xs text-gray-500 mt-1 space-y-1">
                                            <p>{call.date}</p>
                                            <p>Duration: {call.duration}</p>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            <button className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition">
                                                <PlayIcon className="w-3 h-3" /> Play
                                            </button>
                                            <button className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition">
                                                <DocumentTextIcon className="w-3 h-3" /> Transcript
                                            </button>
                                        </div>
                                    </div>

                                    <div className="md:w-3/4 bg-purple-50/50 p-4 rounded-lg border border-purple-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-purple-800 flex items-center gap-1">
                                                <SparklesIcon className="w-3 h-3" /> AI Summary
                                            </span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide ${call.sentiment === 'Positive' ? 'bg-green-100 text-green-700' :
                                                    call.sentiment === 'Negative' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-200 text-gray-700'
                                                }`}>
                                                {call.sentiment}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            {call.summary}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </WorkspaceGuard>
    );
}

