import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme, Switch, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

type SyncMode = 'personal' | 'work' | 'block';

interface SyncSettings {
  syncMode: SyncMode;
  autoSyncWorkHours: boolean;
  blockPersonalNumbers: boolean;
  blockedNumbers: string[];
  syncIncomingCalls: boolean;
  syncOutgoingCalls: boolean;
  syncMissedCalls: boolean;
  notifyOnSync: boolean;
}

interface SyncLog {
  id: string;
  phoneNumber: string;
  type: 'incoming' | 'outgoing' | 'missed';
  duration?: number;
  synced: boolean;
  syncMode: SyncMode;
  timestamp: string;
}

export default function SyncOptionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [settings, setSettings] = useState<SyncSettings>({
    syncMode: 'work',
    autoSyncWorkHours: true,
    blockPersonalNumbers: false,
    blockedNumbers: [],
    syncIncomingCalls: true,
    syncOutgoingCalls: true,
    syncMissedCalls: true,
    notifyOnSync: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddNumber, setShowAddNumber] = useState(false);
  const [newBlockedNumber, setNewBlockedNumber] = useState('');
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      if (!user?.organization_id) return;

      const response = await ApiService.get(`/organizations/${user.organization_id}/dialer/sync-settings`);
      if (response.data) {
        setSettings(response.data);
      }
      
      // Load recent sync logs
      const logsResponse = await ApiService.get(`/dialer/sync-logs`);
      if (logsResponse.data) {
        setSyncLogs(logsResponse.data);
      }
    } catch (error) {
      console.error('Error loading sync settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user?.organization_id) return;

    try {
      setSaving(true);
      const response = await ApiService.put(
        `/organizations/${user.organization_id}/dialer/sync-settings`,
        settings
      );
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to save settings');
      }

      Alert.alert('Success', 'Sync settings saved successfully');
    } catch (error: any) {
      console.error('Error saving sync settings:', error);
      Alert.alert('Error', error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addBlockedNumber = () => {
    if (!newBlockedNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    if (settings.blockedNumbers.includes(newBlockedNumber.trim())) {
      Alert.alert('Error', 'This number is already blocked');
      return;
    }

    setSettings(prev => ({
      ...prev,
      blockedNumbers: [...prev.blockedNumbers, newBlockedNumber.trim()]
    }));
    setNewBlockedNumber('');
    setShowAddNumber(false);
  };

  const removeBlockedNumber = (number: string) => {
    setSettings(prev => ({
      ...prev,
      blockedNumbers: prev.blockedNumbers.filter(n => n !== number)
    }));
  };

  const getSyncModeInfo = (mode: SyncMode) => {
    switch (mode) {
      case 'personal':
        return {
          title: 'Personal Mode',
          description: 'No calls are synced to the CRM. Use this for personal calls.',
          icon: 'lock-closed-outline',
          color: '#6B7280',
        };
      case 'work':
        return {
          title: 'Work Mode',
          description: 'All calls are automatically synced to the CRM. Recommended for sales teams.',
          icon: 'cloud-upload-outline',
          color: '#10B981',
        };
      case 'block':
        return {
          title: 'Block Mode',
          description: 'Selectively sync calls. Block specific numbers from being synced.',
          icon: 'filter-outline',
          color: '#3B82F6',
        };
    }
  };

  const getRecentSyncStats = () => {
    const today = new Date().toDateString();
    const todayLogs = syncLogs.filter(log => new Date(log.timestamp).toDateString() === today);
    
    return {
      total: todayLogs.length,
      synced: todayLogs.filter(log => log.synced).length,
      blocked: todayLogs.filter(log => !log.synced).length,
    };
  };

  const syncStats = getRecentSyncStats();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="sync-outline" size={48} color={colors.primary} />
          <Text style={[styles.loadingText, { color: isDark ? colors.surface : colors.onBackground }]}>
            Loading Sync Settings...
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
          Call Sync Options
        </Text>
      </View>

      {/* Current Mode Display */}
      <Card style={[styles.modeCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.modeHeader}>
          <View style={[styles.modeIcon, { backgroundColor: getSyncModeInfo(settings.syncMode).color + '20' }]}>
            <Ionicons 
              name={getSyncModeInfo(settings.syncMode).icon as any} 
              size={24} 
              color={getSyncModeInfo(settings.syncMode).color} 
            />
          </View>
          <View style={styles.modeInfo}>
            <Text style={[styles.modeTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              {getSyncModeInfo(settings.syncMode).title}
            </Text>
            <Text style={[styles.modeDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {getSyncModeInfo(settings.syncMode).description}
            </Text>
          </View>
        </View>
      </Card>

      {/* Sync Mode Selection */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Select Sync Mode
        </Text>
        
        <View style={styles.modeSelector}>
          {(['personal', 'work', 'block'] as SyncMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.modeOption,
                settings.syncMode === mode && styles.selectedModeOption,
                { 
                  backgroundColor: settings.syncMode === mode ? getSyncModeInfo(mode).color + '10' : (isDark ? '#374151' : '#F9FAFB'),
                  borderColor: settings.syncMode === mode ? getSyncModeInfo(mode).color : (isDark ? '#4B5563' : '#E5E7EB')
                }
              ]}
              onPress={() => setSettings(prev => ({ ...prev, syncMode: mode }))}
            >
              <Ionicons 
                name={getSyncModeInfo(mode).icon as any} 
                size={20} 
                color={settings.syncMode === mode ? getSyncModeInfo(mode).color : (isDark ? '#6B7280' : '#9CA3AF')} 
              />
              <Text style={[
                styles.modeOptionText,
                settings.syncMode === mode && { color: getSyncModeInfo(mode).color, fontFamily: fonts.nohemi.semiBold }
              ]}>
                {getSyncModeInfo(mode).title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Today's Stats */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Today's Activity
        </Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
              {syncStats.total}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Total Calls
            </Text>
          </View>
          <View style={[styles.statItem, styles.statItemBorder]}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {syncStats.synced}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Synced
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>
              {syncStats.blocked}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Blocked
            </Text>
          </View>
        </View>
      </Card>

      {/* Sync Preferences */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Sync Preferences
        </Text>

        {/* Incoming Calls */}
        <View style={styles.preferenceRow}>
          <View style={styles.preferenceInfo}>
            <Ionicons name="call-outline" size={20} color={colors.primary} />
            <View>
              <Text style={[styles.preferenceLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                Sync Incoming Calls
              </Text>
              <Text style={[styles.preferenceDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Automatically sync incoming calls to CRM
              </Text>
            </View>
          </View>
          <Switch
            value={settings.syncIncomingCalls}
            onValueChange={(value) => setSettings(prev => ({ ...prev, syncIncomingCalls: value }))}
            thumbColor="#FFFFFF"
            trackColor={{ false: '#6B7280', true: colors.primary }}
          />
        </View>

        {/* Outgoing Calls */}
        <View style={styles.preferenceRow}>
          <View style={styles.preferenceInfo}>
            <Ionicons name="call-outline" size={20} color={colors.primary} />
            <View>
              <Text style={[styles.preferenceLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                Sync Outgoing Calls
              </Text>
              <Text style={[styles.preferenceDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Automatically sync outgoing calls to CRM
              </Text>
            </View>
          </View>
          <Switch
            value={settings.syncOutgoingCalls}
            onValueChange={(value) => setSettings(prev => ({ ...prev, syncOutgoingCalls: value }))}
            thumbColor="#FFFFFF"
            trackColor={{ false: '#6B7280', true: colors.primary }}
          />
        </View>

        {/* Missed Calls */}
        <View style={styles.preferenceRow}>
          <View style={styles.preferenceInfo}>
            <Ionicons name="call-outline" size={20} color={colors.primary} />
            <View>
              <Text style={[styles.preferenceLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                Sync Missed Calls
              </Text>
              <Text style={[styles.preferenceDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Track missed calls for follow-up
              </Text>
            </View>
          </View>
          <Switch
            value={settings.syncMissedCalls}
            onValueChange={(value) => setSettings(prev => ({ ...prev, syncMissedCalls: value }))}
            thumbColor="#FFFFFF"
            trackColor={{ false: '#6B7280', true: colors.primary }}
          />
        </View>

        {/* Work Hours Auto-Sync */}
        <View style={styles.preferenceRow}>
          <View style={styles.preferenceInfo}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <View>
              <Text style={[styles.preferenceLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                Auto-Sync During Work Hours
              </Text>
              <Text style={[styles.preferenceDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Automatically switch to Work mode during business hours
              </Text>
            </View>
          </View>
          <Switch
            value={settings.autoSyncWorkHours}
            onValueChange={(value) => setSettings(prev => ({ ...prev, autoSyncWorkHours: value }))}
            thumbColor="#FFFFFF"
            trackColor={{ false: '#6B7280', true: colors.primary }}
          />
        </View>

        {/* Notifications */}
        <View style={styles.preferenceRow}>
          <View style={styles.preferenceInfo}>
            <Ionicons name="notifications-outline" size={20} color={colors.primary} />
            <View>
              <Text style={[styles.preferenceLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                Sync Notifications
              </Text>
              <Text style={[styles.preferenceDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Notify when calls are synced
              </Text>
            </View>
          </View>
          <Switch
            value={settings.notifyOnSync}
            onValueChange={(value) => setSettings(prev => ({ ...prev, notifyOnSync: value }))}
            thumbColor="#FFFFFF"
            trackColor={{ false: '#6B7280', true: colors.primary }}
          />
        </View>
      </Card>

      {/* Blocked Numbers (Only shown in Block mode) */}
      {settings.syncMode === 'block' && (
        <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              Blocked Numbers
            </Text>
            <TouchableOpacity
              style={[styles.addNumberButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddNumber(true)}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.addNumberText}>Add Number</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Calls from these numbers will not be synced to the CRM.
          </Text>

          {settings.blockedNumbers.length === 0 ? (
            <View style={styles.emptyBlocked}>
              <Ionicons name="phone-portrait-outline" size={24} color={isDark ? '#6B7280' : '#9CA3AF'} />
              <Text style={[styles.emptyBlockedText, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
                No blocked numbers
              </Text>
            </View>
          ) : (
            <View style={styles.blockedNumbersList}>
              {settings.blockedNumbers.map((number) => (
                <View key={number} style={styles.blockedNumberItem}>
                  <Ionicons name="phone-portrait-outline" size={16} color={isDark ? '#6B7280' : '#9CA3AF'} />
                  <Text style={[styles.blockedNumber, { color: isDark ? colors.surface : colors.onBackground }]}>
                    {number}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeBlockedButton}
                    onPress={() => removeBlockedNumber(number)}
                  >
                    <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </Card>
      )}

      {/* Add Blocked Number Modal */}
      {showAddNumber && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              Add Blocked Number
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: isDark ? '#374151' : '#F9FAFB',
                color: isDark ? colors.surface : colors.onBackground,
                borderColor: isDark ? '#4B5563' : '#E5E7EB'
              }]}
              placeholder="Enter phone number"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              value={newBlockedNumber}
              onChangeText={setNewBlockedNumber}
              keyboardType="phone-pad"
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowAddNumber(false);
                  setNewBlockedNumber('');
                }}
                style={styles.cancelButton}
              />
              <Button
                title="Add"
                onPress={addBlockedNumber}
                style={styles.addButton}
              />
            </View>
          </View>
        </View>
      )}

      {/* Recent Sync Logs */}
      {syncLogs.length > 0 && (
        <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Recent Activity
          </Text>

          <View style={styles.logList}>
            {syncLogs.slice(0, 5).map((log) => (
              <View key={log.id} style={styles.logItem}>
                <View style={[styles.logIcon, { backgroundColor: log.synced ? '#10B98120' : '#EF444420' }]}>
                  <Ionicons 
                    name="call-outline" 
                    size={16} 
                    color={log.synced ? '#10B981' : '#EF4444'} 
                  />
                </View>
                <View style={styles.logInfo}>
                  <Text style={[styles.logPhone, { color: isDark ? colors.surface : colors.onBackground }]}>
                    {log.phoneNumber}
                  </Text>
                  <Text style={[styles.logTime, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
                    {new Date(log.timestamp).toLocaleString()}
                    {log.duration && ` • ${Math.floor(log.duration / 60)}m ${log.duration % 60}s`}
                  </Text>
                </View>
                <View style={[styles.logStatus, { backgroundColor: log.synced ? '#10B98120' : '#EF444420' }]}>
                  <Text style={[styles.logStatusText, { color: log.synced ? '#10B981' : '#EF4444' }]}>
                    {log.synced ? 'Synced' : 'Blocked'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <Button
          title="Save Settings"
          onPress={saveSettings}
          disabled={saving}
          style={styles.saveButton}
        />
      </View>

      {/* Help Section */}
      <Card style={[styles.helpCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <Text style={[styles.helpTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Understanding Sync Modes
        </Text>
        
        <View style={styles.helpList}>
          <View style={styles.helpItem}>
            <Ionicons name="lock-closed" size={16} color="#6B7280" />
            <View>
              <Text style={[styles.helpItemTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
                Personal Mode
              </Text>
              <Text style={[styles.helpItemText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Use this mode when making personal calls. No call data will be synced to the CRM.
              </Text>
            </View>
          </View>
          
          <View style={styles.helpItem}>
            <Ionicons name="cloud-upload" size={16} color="#10B981" />
            <View>
              <Text style={[styles.helpItemTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
                Work Mode
              </Text>
              <Text style={[styles.helpItemText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                All calls are automatically synced. Best for dedicated work phones.
              </Text>
            </View>
          </View>
          
          <View style={styles.helpItem}>
            <Ionicons name="filter" size={16} color="#3B82F6" />
            <View>
              <Text style={[styles.helpItemTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
                Block Mode
              </Text>
              <Text style={[styles.helpItemText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Sync all calls except those from numbers you've blocked. Good for personal numbers mixed with work.
              </Text>
            </View>
          </View>
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
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
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
  modeCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    lineHeight: 20,
  },
  sectionCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    color: '#6B7280',
    marginBottom: 12,
  },
  modeSelector: {
    gap: 8,
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
  },
  selectedModeOption: {
    borderWidth: 2,
  },
  modeOptionText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statItemBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E5E7EB30',
  },
  statValue: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB30',
  },
  preferenceInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  preferenceLabel: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  addNumberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fonts.nohemi.medium,
  },
  emptyBlocked: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyBlockedText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  blockedNumbersList: {
    marginTop: 8,
  },
  blockedNumberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F620',
    borderRadius: 8,
    marginBottom: 6,
  },
  blockedNumber: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginLeft: 8,
  },
  removeBlockedButton: {
    padding: 4,
  },
  logList: {
    marginTop: 8,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB30',
  },
  logIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
  },
  logPhone: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 2,
  },
  logTime: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  logStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  logStatusText: {
    fontSize: 12,
    fontFamily: fonts.nohemi.semiBold,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
  addButton: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  saveContainer: {
    margin: 20,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  helpCard: {
    margin: 20,
    padding: 16,
    marginBottom: 40,
  },
  helpTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 16,
  },
  helpList: {
    gap: 16,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  helpItemTitle: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  helpItemText: {
    fontSize: 13,
    fontFamily: fonts.satoshi.regular,
    lineHeight: 18,
  },
});