import React, { createContext, useContext, useState, useEffect } from 'react';

const DialerContext = createContext();

export function DialerProvider({ children }) {
    const [isWidgetOpen, setIsWidgetOpen] = useState(false);
    const [callData, setCallData] = useState({
        leadId: null,
        leadName: '',
        phoneNumber: '',
        status: 'idle', // 'idle' | 'calling' | 'connected' | 'wrapup'
        startTime: null,
    });

    const startCallLog = (phoneNumber, leadId, leadName) => {
        setCallData({
            leadId,
            leadName,
            phoneNumber,
            status: 'calling',
            startTime: new Date(),
        });
        setIsWidgetOpen(true);

        // Simulate a move to 'connected' after a brief delay 
        // (Since it's a native tel: call, we don't know exact connect state, so we guess)
        setTimeout(() => {
            setCallData(prev => prev.status === 'calling' ? { ...prev, status: 'connected' } : prev);
        }, 5000);
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
