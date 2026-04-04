import { createContext, useContext, useState, useCallback } from 'react';

/**
 * NotificationContext
 * 
 * Provides a global notification system for the application.
 * Supports different types of notifications: success, error, warning, info
 */

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  /**
   * Generate a unique ID for each notification
   */
  const generateId = () => {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Show a notification
   * @param {Object} options - Notification options
   * @param {string} options.type - Type of notification: 'success', 'error', 'warning', 'info'
   * @param {string} options.title - Title of the notification
   * @param {string} options.message - Message content
   * @param {number} options.duration - Duration in milliseconds (default: 4000, 0 = persistent)
   * @param {Function} options.onClose - Callback when notification is closed
   * @param {boolean} options.showClose - Show close button (default: true)
   * @param {string} options.position - Position: 'top-right', 'top-center', 'top-left', 'bottom-right', 'bottom-center', 'bottom-left'
   */
  const showNotification = useCallback(({
    type = 'info',
    title = '',
    message = '',
    duration = 4000,
    onClose,
    showClose = true,
    position = 'top-right'
  }) => {
    const id = generateId();
    
    const notification = {
      id,
      type,
      title,
      message,
      showClose,
      position,
      onClose
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove if duration is set
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  /**
   * Remove a notification by ID
   */
  const removeNotification = useCallback((id) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification && notification.onClose) {
        notification.onClose();
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Convenience methods for different notification types
   */
  const success = useCallback((title, message, options = {}) => {
    return showNotification({ type: 'success', title, message, ...options });
  }, [showNotification]);

  const error = useCallback((title, message, options = {}) => {
    return showNotification({ type: 'error', title, message, ...options });
  }, [showNotification]);

  const warning = useCallback((title, message, options = {}) => {
    return showNotification({ type: 'warning', title, message, ...options });
  }, [showNotification]);

  const info = useCallback((title, message, options = {}) => {
    return showNotification({ type: 'info', title, message, ...options });
  }, [showNotification]);

  /**
   * Get notifications by position
   */
  const getNotificationsByPosition = useCallback((position) => {
    return notifications.filter(n => n.position === position);
  }, [notifications]);

  /**
   * Get all unique positions
   */
  const getPositions = useCallback(() => {
    return [...new Set(notifications.map(n => n.position))];
  }, [notifications]);

  const value = {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications,
    success,
    error,
    warning,
    info,
    getNotificationsByPosition,
    getPositions
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;