import React, { useState, useEffect, useRef } from 'react';
import { useApi } from '../hooks/useApi';
import { useWorkspace } from '../context/WorkspaceContext';
import { useSocket } from '../contexts/SocketContext';
import {
    PhoneIcon,
    PhoneXMarkIcon,
    PauseIcon,
    PlayIcon,
    MicrophoneIcon,
    SpeakerWaveIcon,
    ClockIcon,
    UserIcon,
    DocumentTextIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const TeleDialer = () => {
    const { apiFetch } = useApi();
    const { currentWorkspace } = useWorkspace();
    const { socketService, isConnected } = useSocket();
    const [dialerState, setDialerState] = useState('idle'); // idle, dialing, connected, ended
    const [currentLead, setCurrentLead] = useState(null);
    const [callDuration, setCallDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [callNotes, setCallNotes] = useState('');
    const [callStatus, setCallStatus] = useState('');
    const [nextLead, setNextLead] = useState(null);
    const [callHistory, setCallHistory] = useState([]);
    const [feedbackStatuses, setFeedbackStatuses] = useState([]);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (dialerState === 'connected') {
            intervalRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [dialerState]);

    useEffect(() => {
        // Fetch next lead and feedback statuses when component mounts
        fetchNextLead();
        fetchFeedbackStatuses();
    }, []);

    const fetchFeedbackStatuses = async () => {
        try {
            const response = await apiFetch('/calls/feedback-statuses');
            const data = await response.json();
            if (response.ok) {
                setFeedbackStatuses(data);
            }
        } catch (error) {
            console.error('Error fetching feedback statuses:', error);
        }
    };

    const fetchNextLead = async () => {
        try {
            const response = await apiFetch('/telephony/leads/next-to-call');
            const data = await response.json();
            if (response.ok) {
                setNextLead(data);
            }
        } catch (error) {
            console.error('Error fetching next lead:', error);
        }
    };

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    };

    const initiateCall = async (lead) => {
        if (!lead) return;

        setCurrentLead(lead);
        setDialerState('dialing');
        setCallDuration(0);
        setCallNotes('');
        setCallStatus('');

        try {
            // Trigger actual call via protocol
            window.location.href = `tel:${lead.phone}`;

            // Log call initiation to backend
            const res = await apiFetch('/telephony/calls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lead_id: lead.id,
                    status: 'initiated',
                    workspace_id: currentWorkspace?.workspaceId,
                    organization_id: currentWorkspace?.organizationId
                })
            });
            const callData = await res.json();
            if (res.ok) {
                // Store the call record ID for updates
                setCurrentLead(prev => ({ ...prev, callId: callData.id }));
            }

            // Simulate "Connected" since tel: doesn't give feedback 
            // In a real SIP integration, this would come from an event
            setTimeout(() => {
                setDialerState('connected');
                setIsRecording(false); // Only simulated recording
            }, 3000);

        } catch (error) {
            console.error('Error initiating call:', error);
            setDialerState('idle');
        }
    };

    const endCall = async () => {
        if (!currentLead || !currentLead.callId) return;

        setDialerState('ended');
        setIsRecording(false);

        try {
            // Update call record
            await apiFetch(`/telephony/calls/${currentLead.callId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'ended',
                    duration: callDuration,
                    notes: callNotes,
                    call_status: callStatus
                })
            });

            // Add to local call history for UI
            setCallHistory(prev => [{
                lead: currentLead,
                duration: callDuration,
                status: callStatus,
                notes: callNotes,
                timestamp: new Date()
            }, ...prev]);

            // Reset and prepare for next call
            const progressiveEnabled = localStorage.getItem('progressive_dialer') === 'true';
            const wrapupTime = parseInt(localStorage.getItem('wrapup_time')) || 10;

            if (progressiveEnabled) {
                toast.success(`Call ended. Next call in ${wrapupTime}s...`);
            }

            setTimeout(() => {
                setCurrentLead(null);
                setDialerState('idle');
                fetchNextLead();

                if (progressiveEnabled && nextLead) {
                    initiateCall(nextLead);
                }
            }, progressiveEnabled ? wrapupTime * 1000 : 2000);

        } catch (error) {
            console.error('Error ending call:', error);
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        // Implement actual mute functionality
    };

    const toggleSpeaker = () => {
        setIsSpeakerOn(!isSpeakerOn);
        // Implement actual speaker functionality
    };

    const CallStatusButton = ({ status, label, color, onClick }) => (
        <button
            onClick={() => setCallStatus(status)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${callStatus === status
                ? `${color} text-white`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">TeleDialer</h1>
                <div className="flex items-center gap-3">
                    {isConnected && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Connected</span>
                    )}
                    <button
                        onClick={fetchNextLead}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Dialer */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Current Call */}
                    {currentLead ? (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center">
                                    <UserIcon className="w-10 h-10 text-gray-500" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{currentLead.name}</h2>
                                <p className="text-gray-600">{currentLead.phone}</p>
                                {currentLead.email && (
                                    <p className="text-sm text-gray-500">{currentLead.email}</p>
                                )}
                            </div>

                            {/* Call Status */}
                            <div className="text-center mb-6">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${dialerState === 'dialing' ? 'bg-yellow-100 text-yellow-700' :
                                    dialerState === 'connected' ? 'bg-green-100 text-green-700' :
                                        dialerState === 'ended' ? 'bg-gray-100 text-gray-700' :
                                            'bg-gray-100 text-gray-700'
                                    }`}>
                                    {dialerState === 'dialing' && <PhoneIcon className="w-4 h-4 animate-pulse" />}
                                    {dialerState === 'connected' && <CheckCircleIcon className="w-4 h-4" />}
                                    {dialerState === 'ended' && <XCircleIcon className="w-4 h-4" />}
                                    {dialerState === 'idle' && <PhoneIcon className="w-4 h-4" />}
                                    {dialerState === 'dialing' ? 'Dialing...' :
                                        dialerState === 'connected' ? 'Connected' :
                                            dialerState === 'ended' ? 'Call Ended' : 'Ready'}
                                </div>
                                {dialerState === 'connected' && (
                                    <div className="text-2xl font-mono text-gray-900 mt-2">
                                        {formatDuration(callDuration)}
                                    </div>
                                )}
                            </div>

                            {/* Call Controls */}
                            <div className="flex justify-center gap-4 mb-6">
                                {dialerState === 'idle' && (
                                    <button
                                        onClick={() => initiateCall(currentLead)}
                                        className="p-4 bg-[#08A698] text-white rounded-full hover:bg-[#068f82] transition-colors"
                                    >
                                        <PhoneIcon className="w-6 h-6" />
                                    </button>
                                )}

                                {(dialerState === 'dialing' || dialerState === 'connected') && (
                                    <button
                                        onClick={endCall}
                                        className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <PhoneXMarkIcon className="w-6 h-6" />
                                    </button>
                                )}

                                {dialerState === 'connected' && (
                                    <>
                                        <button
                                            onClick={toggleMute}
                                            className={`p-3 rounded-full transition-colors ${isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            <MicrophoneIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={toggleSpeaker}
                                            className={`p-3 rounded-full transition-colors ${isSpeakerOn ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            <SpeakerWaveIcon className="w-5 h-5" />
                                        </button>
                                        {isRecording && (
                                            <div className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded-full">
                                                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                                                <span className="text-xs font-medium">Recording</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Call Status Options */}
                            {dialerState === 'connected' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Call Status</label>
                                        <div className="flex flex-wrap gap-2">
                                            {feedbackStatuses.length > 0 ? (
                                                feedbackStatuses.map(status => (
                                                    <CallStatusButton
                                                        key={status.id}
                                                        status={status.label}
                                                        label={status.label}
                                                        color={status.isDefault ? "bg-[#08A698]" : "bg-gray-500"}
                                                    />
                                                ))
                                            ) : (
                                                <>
                                                    <CallStatusButton status="CONNECTED" label="Connected" color="bg-green-500" />
                                                    <CallStatusButton status="NOT INTERESTED" label="Not Interested" color="bg-red-500" />
                                                    <CallStatusButton status="INTERESTED" label="Interested" color="bg-[#08A698]" />
                                                    <CallStatusButton status="FOLLOW UP" label="Follow Up" color="bg-yellow-500" />
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Call Notes</label>
                                        <textarea
                                            value={callNotes}
                                            onChange={(e) => setCallNotes(e.target.value)}
                                            placeholder="Add notes about this call..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#08A698]"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* No Active Call */
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                            <PhoneIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Call</h3>
                            <p className="text-gray-500 mb-6">Select a lead to start calling</p>
                            {nextLead && (
                                <button
                                    onClick={() => initiateCall(nextLead)}
                                    className="px-6 py-3 bg-[#08A698] text-white rounded-lg hover:bg-[#068f82] transition-colors"
                                >
                                    Call Next Lead: {nextLead.name}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Next Lead Preview */}
                    {nextLead && !currentLead && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Lead</h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-900">{nextLead.name}</h4>
                                    <p className="text-sm text-gray-600">{nextLead.phone}</p>
                                    {nextLead.status && (
                                        <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full mt-1">
                                            {nextLead.status}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => initiateCall(nextLead)}
                                    className="p-3 bg-[#08A698] text-white rounded-full hover:bg-[#068f82] transition-colors"
                                >
                                    <PhoneIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Call History */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Calls</h3>
                        <div className="space-y-3">
                            {callHistory.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No calls yet today</p>
                            ) : (
                                callHistory.slice(0, 5).map((call, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                <UserIcon className="w-4 h-4 text-gray-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900 text-sm">{call.lead.name}</h4>
                                                <p className="text-xs text-gray-500">{formatDuration(call.duration)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${call.status === 'connected' ? 'bg-green-100 text-green-700' :
                                                call.status === 'not_interested' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {call.status || 'Completed'}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(call.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Stats</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total Calls</span>
                                <span className="text-sm font-medium text-gray-900">{callHistory.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Connected</span>
                                <span className="text-sm font-medium text-green-600">
                                    {callHistory.filter(c => c.status === 'connected').length}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total Talk Time</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {formatDuration(callHistory.reduce((sum, c) => sum + c.duration, 0))}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeleDialer;
