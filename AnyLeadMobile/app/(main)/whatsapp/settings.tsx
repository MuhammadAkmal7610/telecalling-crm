import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme, Switch, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

interface WhatsAppSettings {
  isConnected: boolean;
  phoneNumber: string;
  businessProfile: {
    name: string;
    description: string;
    address?: string;
    email?: string;
    website?: string;
  };
  webhookUrl: string;
  autoReplyEnabled: boolean;
  businessHours: {
    enabled: boolean;
    timezone: string;
    hours: Array<{
      day: string;
      open: string;
      close: string;
    }>;
  };
}

export default function WhatsAppSettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [settings, setSettings] = useState<WhatsAppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      if (!user?.organization_id) return;

      const response = await ApiService.get(`/organizations/${user.organization_id}/whatsapp/settings`);
      if (response.data) {
        setSettings(response.data);
      } else {
        // Initialize with default settings
        const defaultSettings: WhatsAppSettings = {
          isConnected: false,
          phoneNumber: '',
          businessProfile: {
            name: '',
            description: '',
            address: '',
            email: '',
            website: '',
          },
          webhookUrl: '',
          autoReplyEnabled: false,
          businessHours: {
            enabled: false,
            timezone: 'UTC',
            hours: [
              { day: 'Monday', open: '09:00', close: '17:00' },
              { day: 'Tuesday', open: '09:00', close: '17:00' },
              { day: 'Wednesday', open: '09:00', close: '17:00' },
              { day: 'Thursday', open: '09:00', close: '17:00' },
              { day: 'Friday', open: '09:00', close: '17:00' },
              { day: 'Saturday', open: '10:00', close: '14:00' },
              { day: 'Sunday', open: '10:00', close: '14:00' },
            ],
          },
        };
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading WhatsApp settings:', error);
      Alert.alert('Error', 'Failed to load WhatsApp settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings || !user?.organization_id) return;

    try {
      setSaving(true);
      const response = await ApiService.put(`/organizations/${user.organization_id}/whatsapp/settings`, settings);
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to save settings');
      }

      Alert.alert('Success', 'WhatsApp settings saved successfully');
      setEditing(false);
    } catch (error: any) {
      console.error('Error saving WhatsApp settings:', error);
      Alert.alert('Error', error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleConnection = async () => {
    if (!settings) return;

    const newStatus = !settings.isConnected;
    setSettings(prev => prev ? { ...prev, isConnected: newStatus } : null);

    if (newStatus) {
      // Guide user through WhatsApp Business API setup
      Alert.alert(
        'Connect WhatsApp Business API',
        'To connect your WhatsApp Business API, you need to:',
        [
          {
            text: 'Setup Guide',
            onPress: () => Linking.openURL('https://developers.facebook.com/docs/whatsapp/cloud-api/get-started')
          },
          {
            text: 'Enter Credentials',
            onPress: () => setEditing(true)
          },
          {
            text: 'Cancel',
            onPress: () => setSettings(prev => prev ? { ...prev, isConnected: false } : null)
          }
        ]
      );
    }
  };

  const updateBusinessProfile = (field: string, value: string) => {
    setSettings(prev => prev ? {
      ...prev,
      businessProfile: {
        ...prev.businessProfile,
        [field]: value
      }
    } : null);
  };

  const updateBusinessHours = (dayIndex: number, field: 'open' | 'close', value: string) => {
    setSettings(prev => prev ? {
      ...prev,
      businessHours: {
        ...prev.businessHours,
        hours: prev.businessHours.hours.map((hour, index) =>
          index === dayIndex ? { ...hour, [field]: value } : hour
        )
      }
    } : null);
  };

  const toggleBusinessHours = () => {
    setSettings(prev => prev ? {
      ...prev,
      businessHours: {
        ...prev.businessHours,
        enabled: !prev.businessHours.enabled
      }
    } : null);
  };

  const getWhatsAppStatusColor = () => {
    return settings?.isConnected ? '#10B981' : '#EF4444';
  };

  const getWhatsAppStatusText = () => {
    return settings?.isConnected ? 'Connected' : 'Not Connected';
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="settings-outline" size={48} color={colors.primary} />
          <Text style={[styles.loadingText, { color: isDark ? colors.surface : colors.onBackground }]}>
            Loading WhatsApp Settings...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          WhatsApp Business Settings
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getWhatsAppStatusColor() + '20' }]}>
          <Text style={[styles.statusText, { color: getWhatsAppStatusColor() }]}>
            {getWhatsAppStatusText()}
          </Text>
        </View>
      </View>

      {/* Connection Status */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Connection Status
          </Text>
          <Switch
            value={settings?.isConnected || false}
            onValueChange={toggleConnection}
            thumbColor={settings?.isConnected ? '#FFFFFF' : '#FFFFFF'}
            trackColor={{ false: '#6B7280', true: '#10B981' }}
          />
        </View>
        
        {settings?.isConnected ? (
          <View style={styles.connectedInfo}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={[styles.connectedText, { color: isDark ? colors.surface : colors.onBackground }]}>
              WhatsApp Business API is connected and ready to use.
            </Text>
          </View>
        ) : (
          <View style={styles.disconnectedInfo}>
            <Ionicons name="alert-circle" size={24} color="#EF4444" />
            <Text style={[styles.disconnectedText, { color: isDark ? colors.surface : colors.onBackground }]}>
              Connect your WhatsApp Business API to send and receive messages directly from your CRM.
            </Text>
          </View>
        )}
      </Card>

      {/* Business Profile */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Business Profile
          </Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Ionicons name={editing ? "checkmark-done" : "create-outline"} size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Business Name</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: isDark ? '#374151' : '#F9FAFB',
              color: isDark ? colors.surface : colors.onBackground,
              borderColor: isDark ? '#4B5563' : '#E5E7EB'
            }]}
            value={settings?.businessProfile.name || ''}
            onChangeText={(value) => updateBusinessProfile('name', value)}
            editable={editing}
            placeholder="Your Business Name"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea, { 
              backgroundColor: isDark ? '#374151' : '#F9FAFB',
              color: isDark ? colors.surface : colors.onBackground,
              borderColor: isDark ? '#4B5563' : '#E5E7EB'
            }]}
            value={settings?.businessProfile.description || ''}
            onChangeText={(value) => updateBusinessProfile('description', value)}
            editable={editing}
            placeholder="Brief description of your business"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.formRow}>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Email</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: isDark ? '#374151' : '#F9FAFB',
                color: isDark ? colors.surface : colors.onBackground,
                borderColor: isDark ? '#4B5563' : '#E5E7EB'
              }]}
              value={settings?.businessProfile.email || ''}
              onChangeText={(value) => updateBusinessProfile('email', value)}
              editable={editing}
              placeholder="business@example.com"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              keyboardType="email-address"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Website</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: isDark ? '#374151' : '#F9FAFB',
                color: isDark ? colors.surface : colors.onBackground,
                borderColor: isDark ? '#4B5563' : '#E5E7EB'
              }]}
              value={settings?.businessProfile.website || ''}
              onChangeText={(value) => updateBusinessProfile('website', value)}
              editable={editing}
              placeholder="https://yourbusiness.com"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              keyboardType="url"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Address</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: isDark ? '#374151' : '#F9FAFB',
              color: isDark ? colors.surface : colors.onBackground,
              borderColor: isDark ? '#4B5563' : '#E5E7EB'
            }]}
            value={settings?.businessProfile.address || ''}
            onChangeText={(value) => updateBusinessProfile('address', value)}
            editable={editing}
            placeholder="Your business address"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          />
        </View>
      </Card>

      {/* Auto-Reply Settings */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Auto-Reply Settings
          </Text>
          <Switch
            value={settings?.autoReplyEnabled || false}
            onValueChange={(value) => setSettings(prev => prev ? { ...prev, autoReplyEnabled: value } : null)}
            thumbColor="#FFFFFF"
            trackColor={{ false: '#6B7280', true: colors.primary }}
          />
        </View>
        
        <Text style={[styles.sectionSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Enable automatic replies when you're unavailable or to provide instant responses to common queries.
        </Text>
      </Card>

      {/* Business Hours */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Business Hours
          </Text>
          <Switch
            value={settings?.businessHours.enabled || false}
            onValueChange={toggleBusinessHours}
            thumbColor="#FFFFFF"
            trackColor={{ false: '#6B7280', true: colors.primary }}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Timezone</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: isDark ? '#374151' : '#F9FAFB',
              color: isDark ? colors.surface : colors.onBackground,
              borderColor: isDark ? '#4B5563' : '#E5E7EB'
            }]}
            value={settings?.businessHours.timezone || 'UTC'}
            onChangeText={(value) => setSettings(prev => prev ? { ...prev, businessHours: { ...prev.businessHours, timezone: value } } : null)}
            editable={editing}
            placeholder="UTC"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          />
        </View>

        {settings?.businessHours.hours.map((hour, index) => (
          <View key={index} style={styles.businessHourRow}>
            <Text style={[styles.dayText, { color: isDark ? colors.surface : colors.onBackground }]}>
              {hour.day}
            </Text>
            <View style={styles.timeRow}>
              <View style={styles.timeInput}>
                <Text style={[styles.timeLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Open</Text>
                <TextInput
                  style={[styles.timeInputField, { 
                    backgroundColor: isDark ? '#374151' : '#F9FAFB',
                    color: isDark ? colors.surface : colors.onBackground,
                    borderColor: isDark ? '#4B5563' : '#E5E7EB'
                  }]}
                  value={hour.open}
                  onChangeText={(value) => updateBusinessHours(index, 'open', value)}
                  editable={editing}
                  placeholder="09:00"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                />
              </View>
              <View style={styles.timeInput}>
                <Text style={[styles.timeLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Close</Text>
                <TextInput
                  style={[styles.timeInputField, { 
                    backgroundColor: isDark ? '#374151' : '#F9FAFB',
                    color: isDark ? colors.surface : colors.onBackground,
                    borderColor: isDark ? '#4B5563' : '#E5E7EB'
                  }]}
                  value={hour.close}
                  onChangeText={(value) => updateBusinessHours(index, 'close', value)}
                  editable={editing}
                  placeholder="17:00"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                />
              </View>
            </View>
          </View>
        ))}
      </Card>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Button
          title="Save Settings"
          onPress={saveSettings}
          disabled={!editing || saving}
          style={[styles.saveButton, (!editing || saving) && styles.saveButtonDisabled]}
        />
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => Alert.alert('Test Connection', 'Test functionality will be implemented')}
        >
          <Ionicons name="play-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.testButtonText, { color: colors.primary }]}>
            Test Connection
          </Text>
        </TouchableOpacity>
      </View>

      {/* Help Section */}
      <Card style={[styles.helpCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <Text style={[styles.helpTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Need Help?
        </Text>
        <Text style={[styles.helpText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Visit our WhatsApp Business API setup guide or contact support for assistance with configuration.
        </Text>
        <View style={styles.helpActions}>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => Linking.openURL('https://developers.facebook.com/docs/whatsapp/cloud-api/get-started')}
          >
            <Ionicons name="help-circle-outline" size={16} color={colors.primary} />
            <Text style={[styles.helpButtonText, { color: colors.primary }]}>
              Setup Guide
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => Alert.alert('Contact Support', 'Support contact will be implemented')}
          >
            <Ionicons name="headset-outline" size={16} color={colors.primary} />
            <Text style={[styles.helpButtonText, { color: colors.primary }]}>
              Contact Support
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    </ScrollView>
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontFamily: fonts.nohemi.bold,
    textTransform: 'uppercase',
  },
  sectionCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: fonts.satoshi.medium,
    marginTop: 12,
  },
  connectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#10B98120',
    borderRadius: 8,
  },
  connectedText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  disconnectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#EF444420',
    borderRadius: 8,
  },
  disconnectedText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  businessHourRow: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 4,
  },
  timeInputField: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  actionsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  testButtonText: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
  },
  helpCard: {
    margin: 20,
    padding: 16,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  helpTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 16,
  },
  helpActions: {
    flexDirection: 'row',
    gap: 12,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  helpButtonText: {
    fontSize: 12,
    fontFamily: fonts.nohemi.medium,
  },
});