import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { CommunicationService } from '../services/CommunicationService';
import { CallFeedbackModal } from '../components/dialer/CallFeedbackModal';
import { ApiService } from '../services/ApiService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CallTrackerContextType {
  isTracking: boolean;
}

const CallTrackerContext = createContext<CallTrackerContextType | undefined>(undefined);

export function CallTrackerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentCall, setCurrentCall] = useState<any>(null);
  
  const communicationService = CommunicationService.getInstance();

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      const context = communicationService.getCurrentCallContext();
      if (context && !modalVisible) {
        // We found a pending call log
        setCurrentCall(context);
        setModalVisible(true);
      }
    }
  }, [communicationService, modalVisible]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [handleAppStateChange]);

  const handleSubmitFeedback = async (data: { status: string, notes: string }) => {
    if (!currentCall) return;

    try {
      const startTime = new Date(currentCall.startTime).getTime();
      const endTime = Date.now();
      const duration = Math.floor((endTime - startTime) / 1000);

      await communicationService.logCallActivity({
        leadId: currentCall.leadId,
        phone: '', // Backend will resolve
        duration: duration,
        status: 'completed',
        notes: data.notes,
        outcome: data.status as any,
      });

      // Also update lead status if needed
      await ApiService.updateLead(currentCall.leadId, {
        status: data.status === 'qualified' ? 'Qualified' : 
                data.status === 'converted' ? 'Converted' : 
                data.status === 'not_interested' ? 'Lost' : undefined
      });

      showToast({ message: 'Call activity logged successfully', type: 'success' });
    } catch (error) {
      console.error('Failed to log call feedback:', error);
      showToast({ message: 'Failed to log call feedback', type: 'error' });
    } finally {
      communicationService.clearCallContext();
      setCurrentCall(null);
      setModalVisible(false);
    }
  };

  const handleCloseModal = () => {
    communicationService.clearCallContext();
    setCurrentCall(null);
    setModalVisible(false);
  };

  return (
    <CallTrackerContext.Provider value={{ isTracking: !!currentCall }}>
      {children}
      {currentCall && (
        <CallFeedbackModal
          visible={modalVisible}
          leadName={currentCall.leadName}
          onClose={handleCloseModal}
          onSubmit={handleSubmitFeedback}
        />
      )}
    </CallTrackerContext.Provider>
  );
}

export function useCallTracker() {
  const context = useContext(CallTrackerContext);
  if (context === undefined) {
    throw new Error('useCallTracker must be used within a CallTrackerProvider');
  }
  return context;
}
