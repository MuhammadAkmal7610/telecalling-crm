import React, { createContext, useContext, useState, useEffect } from 'react';

const DialerContext = createContext();

export function DialerProvider({ children }) {
    const [isWidgetOpen, setIsWidgetOpen] = useState(false);
    const [callData, setCallData] = useState({
        leadId: null,
        callId: null, // New: track backend call record ID
        leadName: '',
        phoneNumber: '',
        status: 'idle', // 'idle' | 'calling' | 'connected' | 'wrapup'
        startTime: null,
    });

    const startCallLog = (phoneNumber, leadId, leadName, callId = null) => {
        setCallData({
            leadId,
            callId,
            leadName,
            phoneNumber,
            status: 'calling',
            startTime: new Date(),
        });
        setIsWidgetOpen(true);

        // Transition to connected after a realistic delay
        setTimeout(() => {
            setCallData(prev =>
                (prev.leadId === leadId && prev.status === 'calling')
                    ? { ...prev, status: 'connected' }
                    : prev
            );
        }, 3000);
    };

    const endCall = () => {
        setCallData(prev => ({ ...prev, status: 'wrapup' }));
    };

    const closeWidget = () => {
        setIsWidgetOpen(false);
        setCallData({
            leadId: null,
            leadName: '',
            phoneNumber: '',
            status: 'idle',
            startTime: null,
        });
    };

    return (
        <DialerContext.Provider value={{
            isWidgetOpen,
            setIsWidgetOpen,
            callData,
            setCallData,
            startCallLog,
            endCall,
            closeWidget
        }}>
            {children}
        </DialerContext.Provider>
    );
}

export function useDialer() {
    return useContext(DialerContext);
}
