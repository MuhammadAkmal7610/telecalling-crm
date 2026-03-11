import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Switch, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '../../../src/components/common/Card';
import { colors, fonts } from '../../../src/theme/theme';
import { useAuth } from '../../../src/contexts/AuthContext';
import { ApiService } from '../../../src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface UserPreferences {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    desktop: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'team' | 'private';
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    allowDirectMessages: boolean;
  };
  communication: {
    defaultEmailSignature: string;
    autoReplyEnabled: boolean;
    autoReplyMessage: string;
    emailTemplate: string;
  };
  dashboard: {
    defaultView: 'leads' | 'analytics' | 'tasks' | 'calendar';
    widgets: string[];
    refreshInterval: number;
  };
}

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  category: 'leads' | 'tasks' | 'analytics' | 'system' | 'social';
  enabled: boolean;
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
    desktop: boolean;
  };
  conditions: {
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    status?: string;
    assignedToMe?: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  createdAt: string;
}

interface EnterpriseSettings {
  id: string;
  organizationId: string;
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
    ipWhitelist: string[];
    apiRateLimit: number;
  };
  compliance: {
    dataRetention: number;
    auditLogging: boolean;
    gdprCompliance: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    encryptionEnabled: boolean;
  };
  branding: {
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    customDomain?: string;
    whiteLabelEnabled: boolean;
  };
  integrations: {
    apiAccessEnabled: boolean;
    webhookEnabled: boolean;
    ssoEnabled: boolean;
    allowedIntegrations: string[];
  };
  limits: {
    maxUsers: number;
    maxLeads: number;
    maxStorage: number;
    maxApiCalls: number;
  };
}

export default function AdvancedSettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark');
  
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([]);
  const [enterpriseSettings, setEnterpriseSettings] = useState<EnterpriseSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'setup' | 'preferences' | 'notifications' | 'enterprise'>('setup');

  const tabs = [
    { key: 'setup', label: 'Setup & Config', icon: 'checkmark-circle-outline' },
    { key: 'preferences', label: 'User Preferences', icon: 'person-outline' },
    { key: 'notifications', label: 'Notifications', icon: 'notifications-outline' },
    { key: 'enterprise', label: 'Enterprise', icon: 'business-outline' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUserPreferences(),
        loadNotificationRules(),
        loadEnterpriseSettings()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPreferences = async () => {
    // Mock user preferences
    const mockPreferences: UserPreferences = {
      id: '1',
      userId: user?.id || '1',
      theme: 'system',
      language: 'en',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      currency: 'USD',
      notifications: {
        email: true,
        push: true,
        sms: false,
        desktop: false
      },
      privacy: {
        profileVisibility: 'team',
        showOnlineStatus: true,
        showLastSeen: false,
        allowDirectMessages: true
      },
      communication: {
        defaultEmailSignature: 'Best regards,\nJohn Smith\nSales Manager',
        autoReplyEnabled: false,
        autoReplyMessage: 'Thank you for your message. I will get back to you soon.',
        emailTemplate: 'professional'
      },
      dashboard: {
        defaultView: 'leads',
        widgets: ['leads_stats', 'recent_activities', 'tasks', 'performance'],
        refreshInterval: 300
      }
    };
    setUserPreferences(mockPreferences);
  };

  const loadNotificationRules = async () => {
    // Mock notification rules
    const mockRules: NotificationRule[] = [
      {
        id: '1',
        name: 'New Lead Assigned',
        description: 'Get notified when a new lead is assigned to you',
        category: 'leads',
        enabled: true,
        channels: {
          email: true,
          push: true,
          sms: false,
          desktop: false
        },
        conditions: {
          assignedToMe: true,
          priority: 'high'
        },
        frequency: 'immediate',
        createdAt: new Date(Date.now() - 2592000000).toISOString()
      },
      {
        id: '2',
        name: 'Task Due Soon',
        description: 'Remind me about tasks due in the next 24 hours',
        category: 'tasks',
        enabled: true,
        channels: {
          email: true,
          push: true,
          sms: false,
          desktop: true
        },
        conditions: {
          assignedToMe: true
        },
        frequency: 'hourly',
        createdAt: new Date(Date.now() - 5184000000).toISOString()
      },
      {
        id: '3',
        name: 'Weekly Performance Report',
        description: 'Receive weekly summary of your performance metrics',
        category: 'analytics',
        enabled: true,
        channels: {
          email: true,
          push: false,
          sms: false,
          desktop: false
        },
        frequency: 'weekly',
        createdAt: new Date(Date.now() - 7776000000).toISOString()
      },
      {
        id: '4',
        name: 'System Maintenance',
        description: 'Get notified about system maintenance and updates',
        category: 'system',
        enabled: true,
        channels: {
          email: true,
          push: true,
          sms: false,
          desktop: false
        },
        frequency: 'immediate',
        createdAt: new Date(Date.now() - 10368000000).toISOString()
      },
      {
        id: '5',
        name: 'Social Media Lead',
        description: 'New lead from social media platforms',
        category: 'social',
        enabled: false,
        channels: {
          email: true,
          push: true,
          sms: false,
          desktop: false
        },
        conditions: {
          priority: 'medium'
        },
        frequency: 'immediate',
        createdAt: new Date(Date.now() - 12960000000).toISOString()
      }
    ];
    setNotificationRules(mockRules);
  };

  const loadEnterpriseSettings = async () => {
    // Mock enterprise settings
    const mockEnterpriseSettings: EnterpriseSettings = {
      id: '1',
      organizationId: user?.organization_id || 'org1',
      security: {
        twoFactorAuth: true,
        sessionTimeout: 480,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireNumbers: true,
          requireSymbols: true
        },
        ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
        apiRateLimit: 1000
      },
      compliance: {
        dataRetention: 2555, // 7 years
        auditLogging: true,
        gdprCompliance: true,
        backupFrequency: 'daily',
        encryptionEnabled: true
      },
      branding: {
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        whiteLabelEnabled: false
      },
      integrations: {
        apiAccessEnabled: true,
        webhookEnabled: true,
        ssoEnabled: false,
        allowedIntegrations: ['slack', 'google_calendar', 'zapier', 'mailchimp']
      },
      limits: {
        maxUsers: 100,
        maxLeads: 50000,
        maxStorage: 10000,
        maxApiCalls: 1000000
      }
    };
    setEnterpriseSettings(mockEnterpriseSettings);
  };

  const updateUserPreference = async (category: string, field: string, value: any) => {
    try {
      if (userPreferences) {
        const updated = { ...userPreferences };
        if (category.includes('.')) {
          const [parent, child] = category.split('.');
          (updated as any)[parent][field] = value;
        } else {
          (updated as any)[category] = value;
        }
        setUserPreferences(updated);
        Alert.alert('Success', 'Preference updated');
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      Alert.alert('Error', 'Failed to update preference');
    }
  };

  const toggleNotificationRule = async (ruleId: string) => {
    try {
      setNotificationRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      ));
      Alert.alert('Success', 'Notification rule updated');
    } catch (error) {
      console.error('Error updating notification rule:', error);
      Alert.alert('Error', 'Failed to update notification rule');
    }
  };

  const updateEnterpriseSetting = async (category: string, field: string, value: any) => {
    try {
      if (enterpriseSettings) {
        const updated = { ...enterpriseSettings };
        if (category.includes('.')) {
          const [parent, child] = category.split('.');
          (updated as any)[parent][field] = value;
        } else {
          (updated as any)[category] = value;
        }
        setEnterpriseSettings(updated);
        Alert.alert('Success', 'Enterprise setting updated');
      }
    } catch (error) {
      console.error('Error updating enterprise setting:', error);
      Alert.alert('Error', 'Failed to update enterprise setting');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'leads': return 'person-add-outline';
      case 'tasks': return 'checkbox-outline';
      case 'analytics': return 'bar-chart-outline';
      case 'system': return 'settings-outline';
      case 'social': return 'share-outline';
      default: return 'notifications-outline';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'leads': return '#3B82F6';
      case 'tasks': return '#F59E0B';
      case 'analytics': return '#10B981';
      case 'system': return '#6B7280';
      case 'social': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const renderSetupTab = () => (
    <View style={styles.tabContent}>
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="checkmark-circle-outline" size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Setup Validation
          </Text>
        </View>
        <Text style={[styles.sectionDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Validate your WhatsApp and dialer configuration
        </Text>
        <TouchableOpacity
          style={styles.setupButton}
          onPress={() => router.push('/settings/setup-validation' as any)}
        >
          <Ionicons name="shield-checkmark-outline" size={20} color="#FFFFFF" />
          <Text style={styles.setupButtonText}>Run Setup Validation</Text>
        </TouchableOpacity>
      </Card>

      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            WhatsApp Integration
          </Text>
        </View>
        <Text style={[styles.sectionDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Configure WhatsApp Business API for customer communication
        </Text>
        <TouchableOpacity
          style={[styles.configButton, { backgroundColor: '#25D366' }]}
          onPress={() => Alert.alert('WhatsApp Setup', 'WhatsApp configuration will be implemented')}
        >
          <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
          <Text style={styles.configButtonText}>Configure WhatsApp</Text>
        </TouchableOpacity>
      </Card>

      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="call-outline" size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Dialer Configuration
          </Text>
        </View>
        <Text style={[styles.sectionDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Set up voice calling and auto-dialer functionality
        </Text>
        <TouchableOpacity
          style={[styles.configButton, { backgroundColor: colors.primary }]}
          onPress={() => Alert.alert('Dialer Setup', 'Dialer configuration will be implemented')}
        >
          <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
          <Text style={styles.configButtonText}>Configure Dialer</Text>
        </TouchableOpacity>
      </Card>

      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="document-text-outline" size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Environment Variables
          </Text>
        </View>
        <Text style={[styles.sectionDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Configure environment variables for all integrations
        </Text>
        <TouchableOpacity
          style={[styles.configButton, { backgroundColor: '#F59E0B' }]}
          onPress={() => Alert.alert('Environment Setup', 'Environment configuration will be implemented')}
        >
          <Ionicons name="code-outline" size={20} color="#FFFFFF" />
          <Text style={styles.configButtonText}>Setup Environment</Text>
        </TouchableOpacity>
      </Card>
    </View>
  );

  const renderUserPreferencesTab = () => {
    if (!userPreferences) return null;

    return (
      <View style={styles.tabContent}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Appearance Settings */}
          <Card style={styles.settingsCard}>
            <Text style={[styles.cardTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              Appearance
            </Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                  Theme
                </Text>
                <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Choose your preferred theme
                </Text>
              </View>
              <TouchableOpacity
                style={styles.settingValue}
                onPress={() => Alert.alert('Theme', 'Theme selector will be implemented')}
              >
                <Text style={[styles.settingValueText, { color: colors.primary }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                  Timezone
                </Text>
                <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Set your local timezone
                </Text>
              </View>
              <TouchableOpacity
                style={styles.settingValue}
                onPress={() => Alert.alert('Timezone', 'Timezone selector will be implemented')}
              >
                <Text style={[styles.settingValueText, { color: colors.primary }]}>
                  {userPreferences.timezone}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Privacy Settings */}
          <Card style={styles.settingsCard}>
            <Text style={[styles.cardTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              Privacy
            </Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                  Profile Visibility
                </Text>
                <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Who can see your profile
                </Text>
              </View>
              <TouchableOpacity
                style={styles.settingValue}
                onPress={() => Alert.alert('Visibility', 'Visibility selector will be implemented')}
              >
                <Text style={[styles.settingValueText, { color: colors.primary }]}>
                  {userPreferences.privacy.profileVisibility.charAt(0).toUpperCase() + userPreferences.privacy.profileVisibility.slice(1)}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                  Show Online Status
                </Text>
                <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Let others see when you're online
                </Text>
              </View>
              <Switch
                value={userPreferences.privacy.showOnlineStatus}
                onValueChange={(value) => updateUserPreference('privacy', 'showOnlineStatus', value)}
                trackColor={{ false: '#E5E7EB', true: colors.primary + '20' }}
                thumbColor={userPreferences.privacy.showOnlineStatus ? colors.primary : '#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                  Allow Direct Messages
                </Text>
                <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Receive messages from team members
                </Text>
              </View>
              <Switch
                value={userPreferences.privacy.allowDirectMessages}
                onValueChange={(value) => updateUserPreference('privacy', 'allowDirectMessages', value)}
                trackColor={{ false: '#E5E7EB', true: colors.primary + '20' }}
                thumbColor={userPreferences.privacy.allowDirectMessages ? colors.primary : '#FFFFFF'}
              />
            </View>
          </Card>

          {/* Communication Settings */}
          <Card style={styles.settingsCard}>
            <Text style={[styles.cardTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              Communication
            </Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                  Email Signature
                </Text>
                <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Default email signature
                </Text>
              </View>
              <TouchableOpacity
                style={styles.settingValue}
                onPress={() => Alert.alert('Email Signature', 'Email signature editor will be implemented')}
              >
                <Ionicons name="create-outline" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                  Auto Reply
                </Text>
                <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Enable automatic email replies
                </Text>
              </View>
              <Switch
                value={userPreferences.communication.autoReplyEnabled}
                onValueChange={(value) => updateUserPreference('communication', 'autoReplyEnabled', value)}
                trackColor={{ false: '#E5E7EB', true: colors.primary + '20' }}
                thumbColor={userPreferences.communication.autoReplyEnabled ? colors.primary : '#FFFFFF'}
              />
            </View>
          </Card>
        </ScrollView>
      </View>
    );
  };

  const renderNotificationsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Notification Rules ({notificationRules.length})
        </Text>
        <Button
          title="Add Rule"
          onPress={() => router.push('/settings/notifications/create' as any)}
          style={styles.addButton}
        />
      </View>

      <FlatList
        data={notificationRules}
        renderItem={({ item }) => (
          <Card style={[styles.notificationCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.notificationHeader}>
              <View style={styles.notificationInfo}>
                <View style={styles.notificationTitleContainer}>
                  <Ionicons 
                    name={getCategoryIcon(item.category) as any} 
                    size={16} 
                    color={getCategoryColor(item.category)} 
                  />
                  <Text style={[styles.notificationName, { color: isDark ? colors.surface : colors.onBackground }]}>
                    {item.name}
                  </Text>
                </View>
                <Text style={[styles.notificationDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  {item.description}
                </Text>
              </View>
              <Switch
                value={item.enabled}
                onValueChange={() => toggleNotificationRule(item.id)}
                trackColor={{ false: '#E5E7EB', true: colors.primary + '20' }}
                thumbColor={item.enabled ? colors.primary : '#FFFFFF'}
              />
            </View>

            <View style={styles.notificationChannels}>
              <Text style={[styles.channelsLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Channels:
              </Text>
              <View style={styles.channelBadges}>
                {item.channels.email && (
                  <View style={[styles.channelBadge, { backgroundColor: '#3B82F6' + '20' }]}>
                    <Text style={[styles.channelText, { color: '#3B82F6' }]}>Email</Text>
                  </View>
                )}
                {item.channels.push && (
                  <View style={[styles.channelBadge, { backgroundColor: '#10B981' + '20' }]}>
                    <Text style={[styles.channelText, { color: '#10B981' }]}>Push</Text>
                  </View>
                )}
                {item.channels.sms && (
                  <View style={[styles.channelBadge, { backgroundColor: '#F59E0B' + '20' }]}>
                    <Text style={[styles.channelText, { color: '#F59E0B' }]}>SMS</Text>
                  </View>
                )}
                {item.channels.desktop && (
                  <View style={[styles.channelBadge, { backgroundColor: '#8B5CF6' + '20' }]}>
                    <Text style={[styles.channelText, { color: '#8B5CF6' }]}>Desktop</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.notificationFooter}>
              <Text style={[styles.frequencyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Frequency: {item.frequency}
              </Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push(`/settings/notifications/${item.id}/edit` as any)}
              >
                <Ionicons name="create-outline" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </Card>
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No notification rules
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderEnterpriseTab = () => {
    if (!enterpriseSettings) return null;

    return (
      <View style={styles.tabContent}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Security Settings */}
          <Card style={styles.settingsCard}>
            <Text style={[styles.cardTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              Security
            </Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                  Two-Factor Authentication
                </Text>
                <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Require 2FA for all users
                </Text>
              </View>
              <Switch
                value={enterpriseSettings.security.twoFactorAuth}
                onValueChange={(value) => updateEnterpriseSetting('security', 'twoFactorAuth', value)}
                trackColor={{ false: '#E5E7EB', true: colors.primary + '20' }}
                thumbColor={enterpriseSettings.security.twoFactorAuth ? colors.primary : '#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                  Session Timeout
                </Text>
                <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Auto-logout after {enterpriseSettings.security.sessionTimeout} minutes
                </Text>
              </View>
              <TouchableOpacity
                style={styles.settingValue}
                onPress={() => Alert.alert('Session Timeout', 'Session timeout selector will be implemented')}
              >
                <Text style={[styles.settingValueText, { color: colors.primary }]}>
                  {enterpriseSettings.security.sessionTimeout} min
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                  API Rate Limit
                </Text>
                <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Requests per hour per user
                </Text>
              </View>
              <TouchableOpacity
                style={styles.settingValue}
                onPress={() => Alert.alert('Rate Limit', 'Rate limit input will be implemented')}
              >
                <Text style={[styles.settingValueText, { color: colors.primary }]}>
                  {enterpriseSettings.security.apiRateLimit}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Compliance Settings */}
          <Card style={styles.settingsCard}>
            <Text style={[styles.cardTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              Compliance
            </Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                  GDPR Compliance
                </Text>
                <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Enable GDPR compliance features
                </Text>
              </View>
              <Switch
                value={enterpriseSettings.compliance.gdprCompliance}
                onValueChange={(value) => updateEnterpriseSetting('compliance', 'gdprCompliance', value)}
                trackColor={{ false: '#E5E7EB', true: colors.primary + '20' }}
                thumbColor={enterpriseSettings.compliance.gdprCompliance ? colors.primary : '#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                  Audit Logging
                </Text>
                <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Log all user activities
                </Text>
              </View>
              <Switch
                value={enterpriseSettings.compliance.auditLogging}
                onValueChange={(value) => updateEnterpriseSetting('compliance', 'auditLogging', value)}
                trackColor={{ false: '#E5E7EB', true: colors.primary + '20' }}
                thumbColor={enterpriseSettings.compliance.auditLogging ? colors.primary : '#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                  Data Retention
                </Text>
                <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Keep data for {Math.floor(enterpriseSettings.compliance.dataRetention / 365)} years
                </Text>
              </View>
              <TouchableOpacity
                style={styles.settingValue}
                onPress={() => Alert.alert('Data Retention', 'Data retention selector will be implemented')}
              >
                <Text style={[styles.settingValueText, { color: colors.primary }]}>
                  {Math.floor(enterpriseSettings.compliance.dataRetention / 365)} years
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Integration Settings */}
          <Card style={styles.settingsCard}>
            <Text style={[styles.cardTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              Integrations
            </Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                  API Access
                </Text>
                <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Enable API access for developers
                </Text>
              </View>
              <Switch
                value={enterpriseSettings.integrations.apiAccessEnabled}
                onValueChange={(value) => updateEnterpriseSetting('integrations', 'apiAccessEnabled', value)}
                trackColor={{ false: '#E5E7EB', true: colors.primary + '20' }}
                thumbColor={enterpriseSettings.integrations.apiAccessEnabled ? colors.primary : '#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                  Webhooks
                </Text>
                <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Enable webhook support
                </Text>
              </View>
              <Switch
                value={enterpriseSettings.integrations.webhookEnabled}
                onValueChange={(value) => updateEnterpriseSetting('integrations', 'webhookEnabled', value)}
                trackColor={{ false: '#E5E7EB', true: colors.primary + '20' }}
                thumbColor={enterpriseSettings.integrations.webhookEnabled ? colors.primary : '#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                  SSO Authentication
                </Text>
                <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Single Sign-On support
                </Text>
              </View>
              <Switch
                value={enterpriseSettings.integrations.ssoEnabled}
                onValueChange={(value) => updateEnterpriseSetting('integrations', 'ssoEnabled', value)}
                trackColor={{ false: '#E5E7EB', true: colors.primary + '20' }}
                thumbColor={enterpriseSettings.integrations.ssoEnabled ? colors.primary : '#FFFFFF'}
              />
            </View>
          </Card>
        </ScrollView>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'setup':
        return renderSetupTab();
      case 'preferences':
        return renderUserPreferencesTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'enterprise':
        return renderEnterpriseTab();
      default:
        return renderSetupTab();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Advanced Settings
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => Alert.alert('Export Settings', 'Export settings functionality will be implemented')}
          >
            <Ionicons name="download-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.activeTabButton,
              { borderColor: isDark ? '#374151' : '#E5E7EB' }
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={16} 
              color={activeTab === tab.key ? colors.primary : (isDark ? '#6B7280' : '#9CA3AF')} 
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {renderTabContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exportButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
  },
  addButton: {
    paddingHorizontal: 16,
  },
  settingsCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  settingValue: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  settingValueText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    color: colors.primary,
  },
  notificationCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationName: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginLeft: 6,
  },
  notificationDescription: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  notificationChannels: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  channelsLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    marginRight: 8,
  },
  channelBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  channelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  channelText: {
    fontSize: 10,
    fontFamily: fonts.satoshi.bold,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  frequencyText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  editButton: {
    padding: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fonts.satoshi.medium,
    marginTop: 12,
  },
  sectionCard: {
    margin: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    lineHeight: 20,
    marginBottom: 16,
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  setupButtonText: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
    color: '#FFFFFF',
  },
  configButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  configButtonText: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
    color: '#FFFFFF',
  },
});
