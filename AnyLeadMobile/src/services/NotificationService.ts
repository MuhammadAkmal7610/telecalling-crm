import { Platform, Alert, Linking, AppState, AppStateStatus } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { ApiService } from './ApiService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  type: 'lead_assigned' | 'follow_up' | 'new_lead' | 'team_update' | 'call_reminder' | 'message';
  data?: {
    leadId?: string;
    userId?: string;
    taskId?: string;
    callId?: string;
    messageId?: string;
    [key: string]: string | undefined;
  };
  timestamp: string;
  read: boolean;
}

export interface NotificationChannelConfig {
  id: string;
  name: string;
  description: string;
  importance: 'default' | 'high' | 'low';
  sound?: string;
  vibrationPattern?: number[];
  enableLights?: boolean;
  lightColor?: string;
  lockscreenVisibility?: 'private' | 'public' | 'secret';
}

class NotificationServiceClass {
  private static instance: NotificationServiceClass;
  private pushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;
  private appStateListener: { remove: () => void } | null = null;
  private currentAppState: AppStateStatus = 'active';
  private notificationQueue: NotificationPayload[] = [];
  private onNotificationCallback: ((notification: NotificationPayload) => void) | null = null;

  static getInstance(): NotificationServiceClass {
    if (!NotificationServiceClass.instance) {
      NotificationServiceClass.instance = new NotificationServiceClass();
    }
    return NotificationServiceClass.instance;
  }

  /**
   * Initialize the notification service
   * Should be called from the app root layout
   */
  async initialize(): Promise<boolean> {
    try {
      // Check if we're on a physical device
      if (!Device.isDevice) {
        console.log('Notifications require a physical device');
        return false;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // Get push token
      this.pushToken = await this.getPushTokenAsync();
      console.log('Push Token:', this.pushToken);

      // Setup notification listeners
      this.setupListeners();

      // Setup app state listener for background/foreground handling
      this.setupAppStateListener();

      // Create notification channels (Android)
      await this.createNotificationChannels();

      // Register device with backend
      await this.registerDeviceWithBackend();

      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  /**
   * Get the push token for this device
   */
  private async getPushTokenAsync(): Promise<string | null> {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || 
                        process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
      
      if (!projectId) {
        console.warn('No project ID found for push notifications');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Setup notification listeners
   */
  private setupListeners() {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
      const payload = this.parseNotificationPayload(notification);
      if (this.currentAppState === 'active') {
        this.handleNotificationInForeground(payload);
      } else {
        this.notificationQueue.push(payload);
      }
    });

    // Listener for when user taps on a notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
      const payload = this.parseNotificationPayload(response.notification);
      this.handleNotificationTap(payload);
    });
  }

  /**
   * Setup app state listener
   */
  private setupAppStateListener() {
    this.appStateListener = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (this.currentAppState === 'background' && nextAppState === 'active') {
        // App came to foreground, process queued notifications
        this.processQueuedNotifications();
      }
      this.currentAppState = nextAppState;
    });
  }

  /**
   * Create Android notification channels
   */
  private async createNotificationChannels() {
    if (Platform.OS === 'android') {
      const channels: NotificationChannelConfig[] = [
        {
          id: 'lead-notifications',
          name: 'Lead Notifications',
          description: 'Notifications about new leads and lead assignments',
          importance: 'high',
          sound: 'default',
          enableLights: true,
          lightColor: '#3B82F6',
        },
        {
          id: 'follow-up-reminders',
          name: 'Follow-up Reminders',
          description: 'Reminders for scheduled follow-ups and callbacks',
          importance: 'high',
          sound: 'default',
          vibrationPattern: [0, 250, 250, 250],
          enableLights: true,
          lightColor: '#10B981',
        },
        {
          id: 'team-updates',
          name: 'Team Updates',
          description: 'Notifications about team performance and updates',
          importance: 'default',
          sound: 'default',
        },
        {
          id: 'messages',
          name: 'Messages',
          description: 'WhatsApp and email message notifications',
          importance: 'high',
          sound: 'default',
          vibrationPattern: [0, 100, 100, 100],
        },
      ];

      for (const channel of channels) {
        await Notifications.setNotificationChannelAsync(channel.id, {
          name: channel.name,
          description: channel.description,
          importance: Notifications.AndroidImportance[channel.importance.toUpperCase() as keyof typeof Notifications.AndroidImportance],
          sound: channel.sound,
          vibrationPattern: channel.vibrationPattern,
          enableLights: channel.enableLights,
          lightColor: channel.lightColor,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
        });
      }
    }
  }

  /**
   * Register device with backend for push notifications
   */
  private async registerDeviceWithBackend() {
    if (!this.pushToken) return;

    try {
      await ApiService.post('/notifications/register-device', {
        pushToken: this.pushToken,
        deviceType: Platform.OS,
        deviceInfo: {
          manufacturer: Device.manufacturer,
          modelName: Device.modelName,
          osVersion: typeof Platform.Version === 'number' ? Platform.Version.toString() : String(Platform.Version),
        },
      });
      console.log('Device registered for push notifications');
    } catch (error) {
      console.error('Error registering device:', error);
    }
  }

  /**
   * Parse notification payload from Expo notification
   */
  private parseNotificationPayload(notification: Notifications.Notification): NotificationPayload {
    const data = notification.request.content.data as NotificationPayload['data'] | undefined;
    return {
      id: notification.request.identifier,
      title: notification.request.content.title || '',
      body: notification.request.content.body || '',
      type: (notification.request.content.data?.type as NotificationPayload['type']) || 'message',
      data: data,
      timestamp: (notification.request.content.data?.timestamp as string) || new Date().toISOString(),
      read: false,
    };
  }

  /**
   * Handle notification received while app is in foreground
   */
  private handleNotificationInForeground(payload: NotificationPayload) {
    // Show in-app notification or toast
    if (this.onNotificationCallback) {
      this.onNotificationCallback(payload);
    }

    // Also show a local notification for visibility
    this.showLocalNotification({
      title: payload.title,
      body: payload.body,
      data: payload.data as Record<string, string> | undefined,
      channelId: this.getChannelIdForType(payload.type),
    });
  }

  /**
   * Handle notification tap
   */
  private handleNotificationTap(payload: NotificationPayload) {
    // This will be handled by the app's navigation system
    // The callback should be set by the root layout
    console.log('Navigate to notification:', payload);
  }

  /**
   * Get channel ID for notification type
   */
  private getChannelIdForType(type: string): string {
    switch (type) {
      case 'lead_assigned':
      case 'new_lead':
        return 'lead-notifications';
      case 'follow_up':
      case 'call_reminder':
        return 'follow-up-reminders';
      case 'team_update':
        return 'team-updates';
      case 'message':
        return 'messages';
      default:
        return 'lead-notifications';
    }
  }

  /**
   * Process queued notifications when app comes to foreground
   */
  private processQueuedNotifications() {
    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift();
      if (notification && this.onNotificationCallback) {
        this.onNotificationCallback(notification);
      }
    }
  }

  /**
   * Set callback for notification events
   */
  setNotificationCallback(callback: (notification: NotificationPayload) => void) {
    this.onNotificationCallback = callback;
  }

  /**
   * Show a local notification
   */
  async showLocalNotification(options: {
    title: string;
    body: string;
    data?: Record<string, string>;
    channelId?: string;
    sound?: string;
  }): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: options.title,
        body: options.body,
        data: {
          ...options.data,
          timestamp: new Date().toISOString(),
          channelId: options.channelId || 'lead-notifications',
        },
        sound: options.sound || 'default',
      },
      trigger: null, // Show immediately
    });

    return notificationId;
  }

  /**
   * Schedule a local notification for a future time
   */
  async scheduleLocalNotification(options: {
    title: string;
    body: string;
    data?: Record<string, string>;
    trigger: Date | number;
    channelId?: string;
    repeat?: 'minute' | 'hour' | 'day' | 'week';
  }): Promise<string> {
    let triggerInput: Notifications.NotificationTriggerInput;
    
    if (options.trigger instanceof Date) {
      triggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: options.trigger.getTime(),
      };
    } else {
      triggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: options.trigger as number,
      };
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: options.title,
        body: options.body,
        data: {
          ...options.data,
          timestamp: new Date().toISOString(),
          channelId: options.channelId || 'follow-up-reminders',
        },
        sound: 'default',
      },
      trigger: triggerInput,
    });

    return notificationId;
  }

  /**
   * Get repeat interval in seconds
   */
  private getRepeatInterval(repeat: string): number {
    switch (repeat) {
      case 'minute': return 60;
      case 'hour': return 3600;
      case 'day': return 86400;
      case 'week': return 604800;
      default: return 86400;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * Send a follow-up reminder notification
   */
  async scheduleFollowUpReminder(options: {
    leadId: string;
    leadName: string;
    scheduledTime: Date;
    notes?: string;
  }): Promise<string> {
    return this.scheduleLocalNotification({
      title: `Follow-up: ${options.leadName}`,
      body: options.notes || `Time to follow up with ${options.leadName}`,
      data: {
        type: 'follow_up',
        leadId: options.leadId,
        leadName: options.leadName,
      },
      trigger: options.scheduledTime,
      channelId: 'follow-up-reminders',
    });
  }

  /**
   * Send a call reminder notification
   */
  async scheduleCallReminder(options: {
    leadId: string;
    leadName: string;
    phoneNumber: string;
    scheduledTime: Date;
    notes?: string;
  }): Promise<string> {
    return this.scheduleLocalNotification({
      title: `Call: ${options.leadName}`,
      body: `Call ${options.leadName} at ${options.phoneNumber}`,
      data: {
        type: 'call_reminder',
        leadId: options.leadId,
        leadName: options.leadName,
        phoneNumber: options.phoneNumber,
      },
      trigger: options.scheduledTime,
      channelId: 'follow-up-reminders',
    });
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Check notification permissions
   */
  async checkPermissions(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Open notification settings
   */
  async openSettings(): Promise<void> {
    await Linking.openSettings();
  }

  /**
   * Get the push token
   */
  getPushToken(): string | null {
    return this.pushToken;
  }

  /**
   * Cleanup listeners
   */
  cleanup() {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
    if (this.appStateListener) {
      this.appStateListener.remove();
    }
  }
}

export const NotificationService = NotificationServiceClass.getInstance();
export default NotificationService;