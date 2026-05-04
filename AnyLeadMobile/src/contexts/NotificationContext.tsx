import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NotificationService, NotificationPayload } from '../services/NotificationService';
import { ApiService } from '../services/ApiService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: NotificationPayload[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await ApiService.getNotifications();
      if (response && response.data) {
        setNotifications(response.data);
        setUnreadCount(response.data.filter((n: any) => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await ApiService.markNotificationRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await ApiService.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    if (user) {
      refreshNotifications();
      
      // Setup listener for incoming notifications
      NotificationService.setNotificationCallback((notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
    
    return () => {
      // Cleanup is handled in NotificationService.cleanup() which is called in root layout usually
    };
  }, [user, refreshNotifications]);

  // Optionally poll for new notifications every minute
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(refreshNotifications, 60000);
    return () => clearInterval(interval);
  }, [user, refreshNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
