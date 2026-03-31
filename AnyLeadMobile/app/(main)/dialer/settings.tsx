import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme, Switch, TextInput, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface DialerSettings {
  defaultCallerId?: string;
  recordingEnabled: boolean;
  autoDialerEnabled: boolean;
  callDistribution: 'round_robin' | 'random' | 'priority_based';
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

export default function DialerSettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [settings, setSettings] = useState<DialerSettings | null>(null);
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

      const response = await ApiService.get(`/organizations/${user.organization_id}/dialer/settings`);
      if (response.data) {
        setSettings(response.data);
      } else {
        // Initialize with default settings
        const defaultSettings: DialerSettings = {
          defaultCallerId: '',
          recordingEnabled: true,
          autoDialerEnabled: false,
          callDistribution: 'round_robin',
          businessHours: {
            enabled: true,
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
      console.error('Error loading dialer settings:', error);
      Alert.alert('Error', 'Failed to load dialer settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings || !user?.organization_id) return;

    try {
      setSaving(true);
      const response = await ApiService.put(`/organizations/${user.organization_id}/dialer/settings`, settings);
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to save settings');
      }

      Alert.alert('Success', 'Dialer settings saved successfully');
      setEditing(false);
    } catch (error: any) {
      console.error('Error saving dialer settings:', error);
      Alert.alert('Error', error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
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

  const getDeviceInfo = () => {
    return {
      model: 'Unknown',
      os: Platform.OS,
      osVersion: 'Unknown',
      manufacturer: 'Unknown',
      deviceYearClass: 'Unknown',
    };
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="call-outline" size={48} color={colors.primary} />
          <Text style={[styles.loadingText, { color: isDark ? colors.surface : colors.onBackground }]}>
            Loading Dialer Settings...
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
          Dialer Settings
        </Text>
        <View style={styles.deviceInfo}>
          <Ionicons name="phone-portrait-outline" size={16} color={colors.primary} />
          <Text style={[styles.deviceText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {getDeviceInfo().model} • {getDeviceInfo().os}
          </Text>
        </View>
      </View>

      {/* Call Recording */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Call Recording
          </Text>
          <Switch
            value={settings?.recordingEnabled || false}
            onValueChange={(value) => setSettings(prev => prev ? { ...prev, recordingEnabled: value } : null)}
            thumbColor="#FFFFFF"
            trackColor={{ false: '#6B7280', true: colors.primary }}
          />
        </View>
        
        <Text style={[styles.sectionSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Enable automatic recording of all calls for quality assurance and training purposes.
        </Text>
        
        {settings?.recordingEnabled && (
          <View style={styles.warningBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#F59E0B" />
            <Text style={[styles.warningText, { color: isDark ? '#F59E0B' : '#D97706' }]}>
              Note: Call recording may be subject to local laws and regulations. Ensure compliance in your region.
            </Text>
          </View>
        )}
      </Card>

      {/* Auto-Dialer */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Auto-Dialer
          </Text>
          <Switch
            value={settings?.autoDialerEnabled || false}
            onValueChange={(value) => setSettings(prev => prev ? { ...prev, autoDialerEnabled: value } : null)}
            thumbColor="#FFFFFF"
            trackColor={{ false: '#6B7280', true: colors.primary }}
          />
        </View>
        
        <Text style={[styles.sectionSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Automatically dial leads from your call lists to increase productivity and reduce manual effort.
        </Text>

        {settings?.autoDialerEnabled && (
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Call Distribution</Text>
            <View style={[styles.pickerContainer, { backgroundColor: isDark ? '#374151' : '#F9FAFB' }]}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => {
                  // Simple dropdown implementation
                  const options = [
                    { label: 'Round Robin', value: 'round_robin' },
                    { label: 'Random', value: 'random' },
                    { label: 'Priority Based', value: 'priority_based' }
                  ];
                  const currentIndex = options.findIndex(opt => opt.value === settings.callDistribution);
                  const nextIndex = (currentIndex + 1) % options.length;
                  setSettings(prev => prev ? { ...prev, callDistribution: options[nextIndex].value } : null);
                }}
              >
                <Text style={[styles.dropdownText, { color: isDark ? colors.surface : colors.onBackground }]}>
                  {settings.callDistribution === 'round_robin' ? 'Round Robin' : 
                   settings.callDistribution === 'random' ? 'Random' : 'Priority Based'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Card>

      {/* Caller ID */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Caller ID
          </Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Ionicons name={editing ? "checkmark-done" : "create-outline"} size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Default Caller ID</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: isDark ? '#374151' : '#F9FAFB',
              color: isDark ? colors.surface : colors.onBackground,
              borderColor: isDark ? '#4B5563' : '#E5E7EB'
            }]}
            value={settings?.defaultCallerId || ''}
            onChangeText={(value) => setSettings(prev => prev ? { ...prev, defaultCallerId: value } : null)}
            editable={editing}
            placeholder="+1234567890"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            keyboardType="phone-pad"
          />
        </View>
        
        <Text style={[styles.sectionSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Set a default caller ID that will be displayed to recipients when making calls.
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

      {/* Performance Settings */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Performance Settings
        </Text>
        
        <View style={styles.performanceRow}>
          <View style={styles.performanceItem}>
            <Ionicons name="battery-charging-outline" size={24} color={colors.primary} />
            <View>
              <Text style={[styles.performanceLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                Battery Optimization
              </Text>
              <Text style={[styles.performanceValue, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Enabled
              </Text>
            </View>
          </View>
          <View style={styles.performanceItem}>
            <Ionicons name="wifi-outline" size={24} color={colors.primary} />
            <View>
              <Text style={[styles.performanceLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                Network Mode
              </Text>
              <Text style={[styles.performanceValue, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Auto
              </Text>
            </View>
          </View>
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
          onPress={() => Alert.alert('Test Dialer', 'Test functionality will be implemented')}
        >
          <Ionicons name="play-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.testButtonText, { color: colors.primary }]}>
            Test Dialer
          </Text>
        </TouchableOpacity>
      </View>

      {/* Help Section */}
      <Card style={[styles.helpCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <Text style={[styles.helpTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Dialer Tips
        </Text>
        <View style={styles.tipList}>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={[styles.tipText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Use auto-dialer during peak business hours for maximum productivity
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={[styles.tipText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Enable call recording for quality assurance and training
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={[styles.tipText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Set appropriate business hours to respect customer preferences
            </Text>
          </View>
        </View>
        <View style={styles.helpActions}>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => Alert.alert('Dialer Guide', 'Dialer usage guide will be implemented')}
          >
            <Ionicons name="book-outline" size={16} color={colors.primary} />
            <Text style={[styles.helpButtonText, { color: colors.primary }]}>
              Usage Guide
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => Alert.alert('Troubleshooting', 'Dialer troubleshooting will be implemented')}
          >
            <Ionicons name="bug-outline" size={16} color={colors.primary} />
            <Text style={[styles.helpButtonText, { color: colors.primary }]}>
              Troubleshooting
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
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deviceText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
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
    marginBottom: 12,
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
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#F59E0B20',
    borderRadius: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
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
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#E5E7EB',
  },
  picker: {
    height: 50,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
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
  performanceRow: {
    flexDirection: 'row',
    gap: 16,
  },
  performanceItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  performanceLabel: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 2,
  },
  performanceValue: {
    fontSize: 12,
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