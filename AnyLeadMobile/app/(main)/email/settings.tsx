import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme, Switch, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface EmailSettings {
  isConnected: boolean;
  provider: string;
  senderEmail: string;
  senderName: string;
  replyToEmail: string;
  trackOpens: boolean;
  trackClicks: boolean;
  maxDailySends: number;
  unsubscribeFooter: boolean;
  customFooterText: string;
}

export default function EmailSettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [settings, setSettings] = useState<EmailSettings | null>(null);
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

      const response = await ApiService.get(`/organizations/${user.organization_id}/email/settings`);
      if (response.data) {
        setSettings(response.data);
      } else {
        // Initialize with default settings
        const defaultSettings: EmailSettings = {
          isConnected: false,
          provider: 'smtp',
          senderEmail: '',
          senderName: '',
          replyToEmail: '',
          trackOpens: true,
          trackClicks: true,
          maxDailySends: 500,
          unsubscribeFooter: true,
          customFooterText: 'You are receiving this email because you opted in to receive communications from us. If you no longer wish to receive these emails, you can unsubscribe at any time.',
        };
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading email settings:', error);
      Alert.alert('Error', 'Failed to load email settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings || !user?.organization_id) return;

    try {
      setSaving(true);
      const response = await ApiService.put(`/organizations/${user.organization_id}/email/settings`, settings);
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to save settings');
      }

      Alert.alert('Success', 'Email settings saved successfully');
      setEditing(false);
    } catch (error: any) {
      console.error('Error saving email settings:', error);
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
      // Guide user through email service setup
      Alert.alert(
        'Connect Email Service',
        'To send emails from your CRM, you need to configure an email service provider:',
        [
          {
            text: 'SMTP Setup',
            onPress: () => router.push('/email/smtp-setup' as any)
          },
          {
            text: 'Gmail Integration',
            onPress: () => router.push('/email/gmail-setup' as any)
          },
          {
            text: 'Cancel',
            onPress: () => setSettings(prev => prev ? { ...prev, isConnected: false } : null)
          }
        ]
      );
    }
  };

  const updateSetting = (field: keyof EmailSettings, value: any) => {
    setSettings(prev => prev ? { ...prev, [field]: value } : null);
  };

  const getEmailStatusColor = () => {
    return settings?.isConnected ? '#10B981' : '#EF4444';
  };

  const getEmailStatusText = () => {
    return settings?.isConnected ? 'Connected' : 'Not Connected';
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'gmail': return 'mail';
      case 'outlook': return 'mail';
      case 'smtp': return 'server';
      default: return 'mail';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="mail-outline" size={48} color={colors.primary} />
          <Text style={[styles.loadingText, { color: isDark ? colors.surface : colors.onBackground }]}>
            Loading Email Settings...
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
          Email Settings
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getEmailStatusColor() + '20' }]}>
          <Text style={[styles.statusText, { color: getEmailStatusColor() }]}>
            {getEmailStatusText()}
          </Text>
        </View>
      </View>

      {/* Connection Status */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Email Service Connection
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
              Email service is connected and ready to send campaigns.
            </Text>
          </View>
        ) : (
          <View style={styles.disconnectedInfo}>
            <Ionicons name="alert-circle" size={24} color="#EF4444" />
            <Text style={[styles.disconnectedText, { color: isDark ? colors.surface : colors.onBackground }]}>
              Connect your email service provider to send and track email campaigns directly from your CRM.
            </Text>
          </View>
        )}
      </Card>

      {/* Sender Information */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Sender Information
          </Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Ionicons name={editing ? "checkmark-done" : "create-outline"} size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Sender Name</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: isDark ? '#374151' : '#F9FAFB',
              color: isDark ? colors.surface : colors.onBackground,
              borderColor: isDark ? '#4B5563' : '#E5E7EB'
            }]}
            value={settings?.senderName || ''}
            onChangeText={(value) => updateSetting('senderName', value)}
            editable={editing}
            placeholder="Your Company Name"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Sender Email</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: isDark ? '#374151' : '#F9FAFB',
              color: isDark ? colors.surface : colors.onBackground,
              borderColor: isDark ? '#4B5563' : '#E5E7EB'
            }]}
            value={settings?.senderEmail || ''}
            onChangeText={(value) => updateSetting('senderEmail', value)}
            editable={editing}
            placeholder="noreply@yourcompany.com"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Reply-To Email</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: isDark ? '#374151' : '#F9FAFB',
              color: isDark ? colors.surface : colors.onBackground,
              borderColor: isDark ? '#4B5563' : '#E5E7EB'
            }]}
            value={settings?.replyToEmail || ''}
            onChangeText={(value) => updateSetting('replyToEmail', value)}
            editable={editing}
            placeholder="support@yourcompany.com"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            keyboardType="email-address"
          />
        </View>
      </Card>

      {/* Tracking Settings */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Tracking & Analytics
        </Text>
        
        <View style={styles.switchRow}>
          <View>
            <Text style={[styles.switchLabel, { color: isDark ? colors.surface : colors.onBackground }]}>Track Opens</Text>
            <Text style={[styles.switchSubLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Add tracking pixels to monitor email open rates
            </Text>
          </View>
          <Switch
            value={settings?.trackOpens || false}
            onValueChange={(value) => updateSetting('trackOpens', value)}
            thumbColor="#FFFFFF"
            trackColor={{ false: '#6B7280', true: colors.primary }}
          />
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={[styles.switchLabel, { color: isDark ? colors.surface : colors.onBackground }]}>Track Clicks</Text>
            <Text style={[styles.switchSubLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Track link clicks to measure engagement
            </Text>
          </View>
          <Switch
            value={settings?.trackClicks || false}
            onValueChange={(value) => updateSetting('trackClicks', value)}
            thumbColor="#FFFFFF"
            trackColor={{ false: '#6B7280', true: colors.primary }}
          />
        </View>
      </Card>

      {/* Sending Limits */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Sending Limits
          </Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Ionicons name={editing ? "checkmark-done" : "create-outline"} size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Max Daily Sends</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: isDark ? '#374151' : '#F9FAFB',
              color: isDark ? colors.surface : colors.onBackground,
              borderColor: isDark ? '#4B5563' : '#E5E7EB'
            }]}
            value={settings?.maxDailySends?.toString() || '500'}
            onChangeText={(value) => updateSetting('maxDailySends', parseInt(value) || 500)}
            editable={editing}
            placeholder="500"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            keyboardType="numeric"
          />
        </View>
        
        <Text style={[styles.sectionSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Set limits to avoid hitting email provider restrictions and maintain good sender reputation.
        </Text>
      </Card>

      {/* Footer Settings */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Email Footer
          </Text>
          <Switch
            value={settings?.unsubscribeFooter || false}
            onValueChange={(value) => updateSetting('unsubscribeFooter', value)}
            thumbColor="#FFFFFF"
            trackColor={{ false: '#6B7280', true: colors.primary }}
          />
        </View>

        {settings?.unsubscribeFooter && (
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Custom Footer Text</Text>
            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: isDark ? '#374151' : '#F9FAFB',
                color: isDark ? colors.surface : colors.onBackground,
                borderColor: isDark ? '#4B5563' : '#E5E7EB'
              }]}
              value={settings?.customFooterText || ''}
              onChangeText={(value) => updateSetting('customFooterText', value)}
              editable={editing}
              placeholder="Custom footer text for your emails..."
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              multiline
              numberOfLines={4}
            />
          </View>
        )}
      </Card>

      {/* Provider Information */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Email Provider
        </Text>
        
        <View style={styles.providerInfo}>
          <Ionicons name={getProviderIcon(settings?.provider || 'smtp')} size={24} color={colors.primary} />
          <View style={styles.providerDetails}>
            <Text style={[styles.providerName, { color: isDark ? colors.surface : colors.onBackground }]}>
              {settings?.provider?.toUpperCase() || 'SMTP'}
            </Text>
            <Text style={[styles.providerDesc, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Currently configured email service provider
            </Text>
          </View>
          <TouchableOpacity
            style={styles.configureButton}
            onPress={() => Alert.alert('Configure Provider', 'Provider configuration will be implemented')}
          >
            <Ionicons name="settings-outline" size={16} color={colors.primary} />
            <Text style={[styles.configureText, { color: colors.primary }]}>
              Configure
            </Text>
          </TouchableOpacity>
        </View>
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
          onPress={() => Alert.alert('Test Email', 'Test email functionality will be implemented')}
        >
          <Ionicons name="send-outline" size={20} color={colors.primary} />
          <Text style={[styles.testButtonText, { color: colors.primary }]}>
            Test Email
          </Text>
        </TouchableOpacity>
      </View>

      {/* Help Section */}
      <Card style={[styles.helpCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <Text style={[styles.helpTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Email Best Practices
        </Text>
        <View style={styles.tipList}>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={[styles.tipText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Use a recognizable sender name and email address
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={[styles.tipText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Include clear unsubscribe links in all emails
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={[styles.tipText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Monitor sending limits to avoid provider restrictions
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={[styles.tipText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Enable tracking to measure campaign effectiveness
            </Text>
          </View>
        </View>
        <View style={styles.helpActions}>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => Alert.alert('Email Setup Guide', 'Email setup guide will be implemented')}
          >
            <Ionicons name="book-outline" size={16} color={colors.primary} />
            <Text style={[styles.helpButtonText, { color: colors.primary }]}>
              Setup Guide
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => Alert.alert('Email Deliverability', 'Email deliverability tips will be implemented')}
          >
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
            <Text style={[styles.helpButtonText, { color: colors.primary }]}>
              Deliverability
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 15,
    fontFamily: fonts.nohemi.medium,
  },
  switchSubLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 2,
  },
  providerDesc: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  configureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  configureText: {
    fontSize: 12,
    fontFamily: fonts.nohemi.medium,
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
    marginBottom: 12,
  },
  tipList: {
    gap: 8,
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    lineHeight: 18,
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