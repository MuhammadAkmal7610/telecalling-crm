import { io, Socket } from 'socket.io-client';

class SocketService {
  socket = null;
  reconnectAttempts = 0;
  maxReconnectAttempts = 5;

  connect(token) {
    return new Promise((resolve, reject) => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const SOCKET_URL = API_URL.replace('/api/v1', '');

      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        this.reconnectAttempts = 0;
        resolve(this.socket);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket server:', reason);
        // Do not immediately reconnect on 'io server disconnect' to prevent 
        // infinite loops when authentication fails. Socket.io naturally handles 
        // network-related reconnects.
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.reconnectAttempts++;

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
          reject(error);
        }
      });

      this.socket.on('notification', (notification) => {
        this.handleNotification(notification);
      });

      this.socket.on('lead_update', (data) => {
        this.handleLeadUpdate(data);
      });

      this.socket.on('call_update', (data) => {
        this.handleCallUpdate(data);
      });

      this.socket.on('task_update', (data) => {
        this.handleTaskUpdate(data);
      });

      this.socket.on('task_action_complete', (data) => {
        this.handleTaskActionComplete(data);
      });

      this.socket.on('whatsapp_message_received', (data) => {
        this.handleWhatsAppMessage(data);
      });

      this.socket.on('whatsapp_message_status', (data) => {
        this.handleWhatsAppStatus(data);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  handleNotification(notification) {
    // Store notification in local state or trigger UI update
    this.updateNotificationList(notification);

    // Show browser notification if permitted
    this.showBrowserNotification(notification);

    // Emit custom event for components to listen to
    window.dispatchEvent(new CustomEvent('new_notification', {
      detail: notification
    }));
  }

  handleLeadUpdate(data) {
    // Create notification for lead creation
    if (data.action === 'lead_created') {
      const notification = {
        id: `lead_${data.id}_${Date.now()}`,
        title: 'New Lead Created',
        message: `${data.user?.name || 'Someone'} created a new lead: ${data.lead?.name || 'Unknown'}`,
        type: 'lead_created',
        read: false,
        timestamp: new Date().toISOString(),
        data: data
      };

      this.updateNotificationList(notification);
      this.showBrowserNotification(notification);

      // Emit custom event for components to listen to
      window.dispatchEvent(new CustomEvent('new_notification', {
        detail: notification
      }));
    }

    // Create notification for lead stage changes
    if (data.action === 'stage_changed') {
      const notification = {
        id: `stage_${data.id}_${Date.now()}`,
        title: 'Lead Stage Changed',
        message: `Lead stage was updated`,
        type: 'stage_changed',
        read: false,
        timestamp: new Date().toISOString(),
        data: data
      };

      this.updateNotificationList(notification);
      this.showBrowserNotification(notification);

      // Emit custom event for components to listen to
      window.dispatchEvent(new CustomEvent('new_notification', {
        detail: notification
      }));
    }

    // Emit custom event for components to listen to
    window.dispatchEvent(new CustomEvent('lead_update', {
      detail: data
    }));
  }

  handleCallUpdate(data) {
    window.dispatchEvent(new CustomEvent('call_update', {
      detail: data
    }));
  }

  handleTaskUpdate(data) {
    // Store task update in local state or trigger UI update
    window.dispatchEvent(new CustomEvent('task_update', {
      detail: data
    }));
  }

  handleWhatsAppMessage(data) {
    window.dispatchEvent(new CustomEvent('whatsapp_message_received', {
      detail: data
    }));
  }

  handleWhatsAppStatus(data) {
    window.dispatchEvent(new CustomEvent('whatsapp_message_status', {
      detail: data
    }));
  }

  handleTaskActionComplete(data) {
    // Handle task action completion
    window.dispatchEvent(new CustomEvent('task_action_complete', {
      detail: data
    }));
  }

  updateNotificationList(notification) {
    // Get current notifications from localStorage or update global state
    const currentNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = [notification, ...currentNotifications].slice(0, 50); // Keep last 50
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  }

  async showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: false,
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      // Request permission on first notification
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.showBrowserNotification(notification);
      }
    }
  }

  // Socket emit methods
  joinRoom(room) {
    this.socket?.emit('join_room', { room });
  }

  leaveRoom(room) {
    this.socket?.emit('leave_room', { room });
  }

  markNotificationRead(notificationId) {
    this.socket?.emit('mark_notification_read', { notificationId });
  }

  sendTaskAction(taskId, action, data) {
    this.socket?.emit('task_action', { taskId, action, data });
  }

  // Get socket connection status
  isConnected() {
    return this.socket?.connected || false;
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();
