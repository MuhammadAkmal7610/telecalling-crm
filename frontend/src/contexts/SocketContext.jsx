import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService from '../services/socketService';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;

        await socketService.connect(token);
        setIsConnected(true);

        // Listen for custom events
        const handleNewNotification = (event) => {
          setNotifications(prev => [event.detail, ...prev]);
        };

        const handleLeadUpdate = (event) => {
          // Handle lead updates - could trigger data refresh
          console.log('Lead update received:', event.detail);
        };

        const handleCallUpdate = (event) => {
          // Handle call updates
          console.log('Call update received:', event.detail);
        };

        const handleTaskUpdate = (event) => {
          // Handle task updates
          console.log('Task update received:', event.detail);
        };

        window.addEventListener('new_notification', handleNewNotification);
        window.addEventListener('lead_update', handleLeadUpdate);
        window.addEventListener('call_update', handleCallUpdate);
        window.addEventListener('task_update', handleTaskUpdate);

        return () => {
          window.removeEventListener('new_notification', handleNewNotification);
          window.removeEventListener('lead_update', handleLeadUpdate);
          window.removeEventListener('call_update', handleCallUpdate);
          window.removeEventListener('task_update', handleTaskUpdate);
          socketService.disconnect();
        };
      } catch (error) {
        console.error('Failed to initialize socket:', error);
        setIsConnected(false);
      }
    };

    initializeSocket();
  }, []);

  const value = {
    isConnected,
    notifications,
    socketService,
    markNotificationRead: (notificationId) => {
      socketService.markNotificationRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    },
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
