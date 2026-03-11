import React, { useState, useEffect } from 'react';
import { useDialer } from '../context/DialerContext';
import { PhoneIcon, XMarkIcon, CheckCircleIcon, SignalIcon, PhoneXMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CallLoggerWidget() {
    const { isWidgetOpen, callData, endCall, closeWidget } = useDialer();
    const [callNotes, setCallNotes] = useState('');
    const [callOutcome, setCallOutcome] = useState('CONNECTED');
    const [durationStr, setDurationStr] = useState('00:00');
    const [durationSecs, setDurationSecs] = useState(0);
    const [feedbackStatuses, setFeedbackStatuses] = useState([]);

    useEffect(() => {
        if (isWidgetOpen) {
            fetchFeedbackStatuses();
        }
    }, [isWidgetOpen]);

    const fetchFeedbackStatuses = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
            const res = await fetch(`${API_URL}/calls/feedback-statuses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setFeedbackStatuses(data);
        } catch (error) {
            console.error('Error fetching statuses', error);
        }
    };
    // Timer Effect
    useEffect(() => {
        let interval;
        if (isWidgetOpen && callData.startTime && (callData.status === 'calling' || callData.status === 'connected')) {
            interval = setInterval(() => {
                const now = new Date();
                const diffMs = now - callData.startTime;
                const totalSecs = Math.floor(diffMs / 1000);

                const mins = Math.floor(totalSecs / 60);
                const secs = totalSecs % 60;

                setDurationSecs(totalSecs);
                setDurationStr(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
            }, 1000);
        } else if (callData.status === 'idle') {
            setDurationStr('00:00');
        }
        return () => clearInterval(interval);
    }, [isWidgetOpen, callData.startTime, callData.status]);

    if (!isWidgetOpen) return null;

    const handleSaveLog = async () => {
        if (!callData.callId) {
            toast.error('No call record found to update.');
            closeWidget();
            return;
        }

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

            const res = await fetch(`${API_URL}/telephony/calls/${callData.callId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: 'ended',
                    duration: durationSecs,
                    notes: callNotes,
                    call_status: callOutcome
                })
            });

            if (res.ok) {
                toast.success('Call logged successfully!');
                setCallNotes('');
                setCallOutcome('CONNECTED');
                closeWidget();
            } else {
                toast.error('Failed to log call.');
            }
        } catch (error) {
            console.error('Error logging call', error);
            toast.error('Network error during logging');
        }
    };

    return (
        <div className="fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden flex flex-col font-sans">
            {/* Header */}
            <div className="bg-[#08A698] text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <PhoneIcon className="w-5 h-5 animate-pulse" />
                    <span className="font-semibold text-sm">Active Call</span>
                </div>
                {callData.status !== 'wrapup' && (
                    <span className="bg-white/20 text-xs px-2 py-0.5 rounded font-mono">
                        {durationStr}
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-4">
                <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900">{callData.leadName || 'Unknown Lead'}</h3>
                    <p className="text-sm text-gray-500 font-mono mt-1">{callData.phoneNumber}</p>

                    {/* Status Badge */}
                    <div className="mt-3 flex justify-center">
                        {callData.status === 'calling' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span> Dialing Native App...
                            </span>
                        )}
                        {callData.status === 'connected' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                <SignalIcon className="w-3.5 h-3.5 text-green-500" /> Connected
                            </span>
                        )}
                        {callData.status === 'wrapup' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                                <CheckCircleIcon className="w-3.5 h-3.5 text-amber-500" /> Wrap Up
                            </span>
                        )}
                    </div>
                </div>

                {/* Call Actions (Before Wrapup) */}
                {callData.status !== 'wrapup' && (
                    <div className="flex justify-center gap-4 mt-2 mb-2">
                        <button
                            onClick={endCall}
                            className="bg-red-500 hover:bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                            title="End Call via CRM"
                        >
                            <PhoneXMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                )}

                {/* Wrap Up Form */}
                {callData.status === 'wrapup' && (
                    <div className="border-t border-gray-100 pt-3 space-y-3 animate-fade-in-up">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Call Outcome</label>
                            <select
                                value={callOutcome}
                                onChange={(e) => setCallOutcome(e.target.value)}
                                className="w-full text-sm border border-gray-300 rounded-lg p-2 outline-none focus:border-[#08A698] cursor-pointer"
                            >
                                {feedbackStatuses.length > 0 ? (
                                    feedbackStatuses.map(s => (
                                        <option key={s.id} value={s.label}>{s.label}</option>
                                    ))
                                ) : (
                                    <>
                                        <option value="CONNECTED">Connected</option>
                                        <option value="NO ANSWER">No Answer</option>
                                        <option value="BUSY">Busy</option>
                                        <option value="WRONG NUMBER">Wrong Number</option>
                                        <option value="INTERESTED">Interested</option>
                                    </>
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Notes</label>
                            <textarea
                                rows="3"
                                value={callNotes}
                                onChange={(e) => setCallNotes(e.target.value)}
                                placeholder="Write wrap-up notes here..."
                                className="w-full text-sm border border-gray-300 rounded-lg p-2 outline-none focus:border-[#08A698] resize-none"
                            ></textarea>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={closeWidget}
                                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveLog}
                                className="flex-1 py-2 bg-[#08A698] hover:bg-[#078F82] text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
                                Save Log
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Minimal Close (Top Right overlay) */}
            <button
                onClick={closeWidget}
                className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
            >
                <XMarkIcon className="w-5 h-5" />
            </button>
        </div>
    );
}
