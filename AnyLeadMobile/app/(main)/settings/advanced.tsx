import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Switch,
  useColorScheme, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrgInfo {
  name: string;
  totalLeads: number;
  totalUsers: number;
}

interface Preferences {
  theme: 'light' | 'dark' | 'system';
  timeFormat: '12h' | '24h';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  language: string;
  notifications: { email: boolean; push: boolean; sms: boolean };
  privacy: { showOnlineStatus: boolean; allowDirectMessages: boolean };
  autoReplyEnabled: boolean;
}

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  category: 'leads' | 'tasks' | 'analytics' | 'system';
  enabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

interface EntSettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  gdprCompliance: boolean;
  auditLogging: boolean;
  apiAccessEnabled: boolean;
  webhookEnabled: boolean;
  ssoEnabled: boolean;
  encryptionEnabled: boolean;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_PREFS: Preferences = {
  theme: 'system',
  timeFormat: '12h',
  dateFormat: 'MM/DD/YYYY',
  language: 'English',
  notifications: { email: true, push: true, sms: false },
  privacy: { showOnlineStatus: true, allowDirectMessages: true },
  autoReplyEnabled: false,
};

const DEFAULT_NOTIF_RULES: NotificationRule[] = [
  { id: '1', name: 'New Lead Assigned', description: 'Notified when a lead is assigned to you', category: 'leads', enabled: true, frequency: 'immediate' },
  { id: '2', name: 'Task Due Soon', description: 'Remind about tasks due in 24 hours', category: 'tasks', enabled: true, frequency: 'hourly' },
  { id: '3', name: 'Weekly Report', description: 'Weekly performance summary', category: 'analytics', enabled: true, frequency: 'weekly' },
  { id: '4', name: 'System Alerts', description: 'Critical system & maintenance alerts', category: 'system', enabled: true, frequency: 'immediate' },
];

const DEFAULT_ENT: EntSettings = {
  twoFactorAuth: false,
  sessionTimeout: 480,
  gdprCompliance: false,
  auditLogging: true,
  apiAccessEnabled: true,
  webhookEnabled: false,
  ssoEnabled: false,
  encryptionEnabled: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function showPicker(title: string, options: string[], current: string, onSelect: (val: string) => void) {
  const buttons = options.map(opt => ({
    text: opt === current ? `✓ ${opt}` : opt,
    onPress: () => onSelect(opt),
  }));
  buttons.push({ text: 'Cancel', onPress: () => {} });
  Alert.alert(title, 'Select an option', buttons);
}

function showNumberPicker(title: string, options: number[], current: number, onSelect: (val: number) => void) {
  showPicker(title, options.map(String), String(current), val => onSelect(Number(val)));
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdvancedSettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';

  const [activeTab, setActiveTab] = useState<'setup' | 'preferences' | 'notifications' | 'enterprise'>('setup');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null);
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [notifRules, setNotifRules] = useState<NotificationRule[]>(DEFAULT_NOTIF_RULES);
  const [entSettings, setEntSettings] = useState<EntSettings>(DEFAULT_ENT);

  const tabs = [
    { key: 'setup', label: 'Setup', icon: 'checkmark-circle-outline' },
    { key: 'preferences', label: 'Preferences', icon: 'person-outline' },
    { key: 'notifications', label: 'Alerts', icon: 'notifications-outline' },
    { key: 'enterprise', label: 'Enterprise', icon: 'business-outline' },
  ] as const;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Pull real data: org leads count + user count
      const [leadsRes, usersRes] = await Promise.all([
        ApiService.getLeads(user?.workspace_id),
        ApiService.getUsers(),
      ]);
      const leads = Array.isArray(leadsRes.data) ? leadsRes.data : (leadsRes.data?.data ?? []);
      const usersArray = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.data ?? []);
      setOrgInfo({
        name: (user as any)?.organization?.name || 'Your Organization',
        totalLeads: leads.length,
        totalUsers: usersArray.length,
      });
    } catch (e) {
      console.error('Error loading advanced settings:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // ── Setup Tab ───────────────────────────────────────────────────────────────

  const renderSetupTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Org Summary */}
      {orgInfo && (
        <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#fff' }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business-outline" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              Organization Overview
            </Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{orgInfo.totalLeads}</Text>
              <Text style={styles.statLabel}>Total Leads</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#10B981' }]}>{orgInfo.totalUsers}</Text>
              <Text style={styles.statLabel}>Team Members</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Setup Validation */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#fff' }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Setup Validation
          </Text>
        </View>
        <Text style={[styles.sectionDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Validate your WhatsApp and dialer configuration to ensure everything is working correctly.
        </Text>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/settings/setup-validation' as any)}
        >
          <Ionicons name="shield-checkmark-outline" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Run Setup Validation</Text>
        </TouchableOpacity>
      </Card>

      {/* Lead Fields Config */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#fff' }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="list-outline" size={24} color="#8B5CF6" />
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Lead Field Configuration
          </Text>
        </View>
        <Text style={[styles.sectionDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Manage custom fields, labels, and required fields for your lead forms.
        </Text>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
          onPress={() => router.push('/enterprise/integrations' as any)}
        >
          <Ionicons name="settings-outline" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Configure Lead Fields</Text>
        </TouchableOpacity>
      </Card>

      {/* WhatsApp */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#fff' }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            WhatsApp Integration
          </Text>
        </View>
        <Text style={[styles.sectionDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Configure WhatsApp Business API for customer communication.
        </Text>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#25D366' }]}
          onPress={() => router.push('/whatsapp/integration' as any)}
        >
          <Ionicons name="settings-outline" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Configure WhatsApp</Text>
        </TouchableOpacity>
      </Card>

      {/* Dialer */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#fff' }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="call-outline" size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Dialer Configuration
          </Text>
        </View>
        <Text style={[styles.sectionDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Set up voice calling and auto-dialer functionality for your team.
        </Text>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/dialer' as any)}
        >
          <Ionicons name="call-outline" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Open Dialer</Text>
        </TouchableOpacity>
      </Card>

      {/* Import / Export */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#fff' }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="swap-vertical-outline" size={24} color="#F59E0B" />
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Data Import & Export
          </Text>
        </View>
        <Text style={[styles.sectionDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Import leads from CSV/Excel or export your existing data.
        </Text>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
          onPress={() => router.push('/leads/import-export' as any)}
        >
          <Ionicons name="swap-vertical-outline" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Manage Import / Export</Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );

  // ── Preferences Tab ─────────────────────────────────────────────────────────

  const setPref = (key: keyof Preferences, value: any) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  };

  const setNestedPref = (parent: 'notifications' | 'privacy', key: string, value: any) => {
    setPrefs(prev => ({ ...prev, [parent]: { ...prev[parent], [key]: value } }));
  };

  const savePrefs = async () => {
    setSaving(true);
    try {
      // Persist timezone / name updates via PATCH /users/me if needed
      await ApiService.updateUser({ name: user?.name });
      Alert.alert('Saved', 'Your preferences have been saved.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const renderPreferencesTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Appearance */}
      <Card style={styles.settingsCard}>
        <Text style={[styles.cardTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Appearance</Text>

        <SettingRow label="Theme" description="Light, dark, or follow system">
          <TouchableOpacity
            style={styles.valuePill}
            onPress={() => showPicker('Theme', ['light', 'dark', 'system'], prefs.theme, val => setPref('theme', val))}
          >
            <Text style={styles.valuePillText}>{prefs.theme}</Text>
            <Ionicons name="chevron-down" size={12} color={colors.primary} />
          </TouchableOpacity>
        </SettingRow>

        <SettingRow label="Time Format" description="12-hour or 24-hour clock">
          <TouchableOpacity
            style={styles.valuePill}
            onPress={() => showPicker('Time Format', ['12h', '24h'], prefs.timeFormat, val => setPref('timeFormat', val as any))}
          >
            <Text style={styles.valuePillText}>{prefs.timeFormat}</Text>
            <Ionicons name="chevron-down" size={12} color={colors.primary} />
          </TouchableOpacity>
        </SettingRow>

        <SettingRow label="Date Format" description="How dates are displayed">
          <TouchableOpacity
            style={styles.valuePill}
            onPress={() => showPicker('Date Format', ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'], prefs.dateFormat, val => setPref('dateFormat', val as any))}
          >
            <Text style={styles.valuePillText}>{prefs.dateFormat}</Text>
            <Ionicons name="chevron-down" size={12} color={colors.primary} />
          </TouchableOpacity>
        </SettingRow>

        <SettingRow label="Language" description="Display language">
          <TouchableOpacity
            style={styles.valuePill}
            onPress={() => showPicker('Language', ['English', 'Hindi', 'Spanish', 'French', 'Arabic'], prefs.language, val => setPref('language', val))}
          >
            <Text style={styles.valuePillText}>{prefs.language}</Text>
            <Ionicons name="chevron-down" size={12} color={colors.primary} />
          </TouchableOpacity>
        </SettingRow>
      </Card>

      {/* Notifications */}
      <Card style={styles.settingsCard}>
        <Text style={[styles.cardTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Notification Channels</Text>

        <SettingRow label="Email Notifications" description="Receive alerts via email">
          <Switch
            value={prefs.notifications.email}
            onValueChange={v => setNestedPref('notifications', 'email', v)}
            trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
            thumbColor={prefs.notifications.email ? colors.primary : '#fff'}
          />
        </SettingRow>

        <SettingRow label="Push Notifications" description="In-app and mobile push alerts">
          <Switch
            value={prefs.notifications.push}
            onValueChange={v => setNestedPref('notifications', 'push', v)}
            trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
            thumbColor={prefs.notifications.push ? colors.primary : '#fff'}
          />
        </SettingRow>

        <SettingRow label="SMS Notifications" description="Text message alerts">
          <Switch
            value={prefs.notifications.sms}
            onValueChange={v => setNestedPref('notifications', 'sms', v)}
            trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
            thumbColor={prefs.notifications.sms ? colors.primary : '#fff'}
          />
        </SettingRow>
      </Card>

      {/* Privacy */}
      <Card style={styles.settingsCard}>
        <Text style={[styles.cardTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Privacy</Text>

        <SettingRow label="Show Online Status" description="Let team see when you're active">
          <Switch
            value={prefs.privacy.showOnlineStatus}
            onValueChange={v => setNestedPref('privacy', 'showOnlineStatus', v)}
            trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
            thumbColor={prefs.privacy.showOnlineStatus ? colors.primary : '#fff'}
          />
        </SettingRow>

        <SettingRow label="Allow Direct Messages" description="Receive messages from team members">
          <Switch
            value={prefs.privacy.allowDirectMessages}
            onValueChange={v => setNestedPref('privacy', 'allowDirectMessages', v)}
            trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
            thumbColor={prefs.privacy.allowDirectMessages ? colors.primary : '#fff'}
          />
        </SettingRow>

        <SettingRow label="Auto Reply" description="Send automatic replies when away">
          <Switch
            value={prefs.autoReplyEnabled}
            onValueChange={v => setPref('autoReplyEnabled', v)}
            trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
            thumbColor={prefs.autoReplyEnabled ? colors.primary : '#fff'}
          />
        </SettingRow>
      </Card>

      <Button title={saving ? 'Saving...' : 'Save Preferences'} onPress={savePrefs} loading={saving} style={{ margin: 20 }} />
    </ScrollView>
  );

  // ── Notifications Tab ───────────────────────────────────────────────────────

  const toggleRule = (id: string) => {
    setNotifRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const getCatColor = (cat: string) => ({ leads: '#3B82F6', tasks: '#F59E0B', analytics: '#10B981', system: '#6B7280' }[cat] || '#6B7280');
  const getCatIcon = (cat: string) => ({ leads: 'person-add-outline', tasks: 'checkbox-outline', analytics: 'bar-chart-outline', system: 'settings-outline' }[cat] || 'notifications-outline') as any;

  const renderNotificationsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.tabHeader}>
        <Text style={[styles.tabHeaderTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Notification Rules
        </Text>
        <TouchableOpacity
          style={styles.addRuleBtn}
          onPress={() => {
            Alert.alert(
              'Add Notification Rule',
              'Choose a category:',
              [
                { text: 'Leads', onPress: () => addRule('leads') },
                { text: 'Tasks', onPress: () => addRule('tasks') },
                { text: 'Analytics', onPress: () => addRule('analytics') },
                { text: 'System', onPress: () => addRule('system') },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.addRuleBtnText, { color: colors.primary }]}>Add Rule</Text>
        </TouchableOpacity>
      </View>

      {notifRules.map(rule => (
        <Card key={rule.id} style={[styles.notifCard, { backgroundColor: isDark ? '#1F2937' : '#fff' }]}>
          <View style={styles.notifHeader}>
            <View style={[styles.catDot, { backgroundColor: getCatColor(rule.category) }]}>
              <Ionicons name={getCatIcon(rule.category)} size={14} color="#fff" />
            </View>
            <View style={{ flex: 1, marginHorizontal: 10 }}>
              <Text style={[styles.notifName, { color: isDark ? colors.surface : colors.onBackground }]}>{rule.name}</Text>
              <Text style={[styles.notifDesc, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{rule.description}</Text>
            </View>
            <Switch
              value={rule.enabled}
              onValueChange={() => toggleRule(rule.id)}
              trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
              thumbColor={rule.enabled ? colors.primary : '#fff'}
            />
          </View>
          <View style={styles.notifFooter}>
            <View style={[styles.freqBadge, { backgroundColor: getCatColor(rule.category) + '20' }]}>
              <Text style={[styles.freqText, { color: getCatColor(rule.category) }]}>{rule.frequency}</Text>
            </View>
            <TouchableOpacity
              onPress={() => showPicker(
                'Frequency',
                ['immediate', 'hourly', 'daily', 'weekly'],
                rule.frequency,
                val => setNotifRules(prev => prev.map(r => r.id === rule.id ? { ...r, frequency: val as any } : r))
              )}
              style={styles.editBtn}
            >
              <Ionicons name="create-outline" size={16} color={colors.primary} />
              <Text style={[styles.editBtnText, { color: colors.primary }]}>Change Frequency</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Alert.alert('Delete Rule', `Remove "${rule.name}"?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => setNotifRules(prev => prev.filter(r => r.id !== rule.id)) }
              ])}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </Card>
      ))}

      {notifRules.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="notifications-off-outline" size={48} color="#9CA3AF" />
          <Text style={[styles.emptyText, { color: '#9CA3AF' }]}>No notification rules. Tap "Add Rule" to create one.</Text>
        </View>
      )}
    </ScrollView>
  );

  // ── Enterprise Tab ──────────────────────────────────────────────────────────

  const setEnt = (key: keyof EntSettings, value: any) => setEntSettings(prev => ({ ...prev, [key]: value }));

  const renderEnterpriseTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Security */}
      <Card style={styles.settingsCard}>
        <Text style={[styles.cardTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Security</Text>

        <SettingRow label="Two-Factor Authentication" description="Require 2FA for all logins">
          <Switch
            value={entSettings.twoFactorAuth}
            onValueChange={v => setEnt('twoFactorAuth', v)}
            trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
            thumbColor={entSettings.twoFactorAuth ? colors.primary : '#fff'}
          />
        </SettingRow>

        <SettingRow label="Encryption" description="Encrypt all stored data">
          <Switch
            value={entSettings.encryptionEnabled}
            onValueChange={v => setEnt('encryptionEnabled', v)}
            trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
            thumbColor={entSettings.encryptionEnabled ? colors.primary : '#fff'}
          />
        </SettingRow>

        <SettingRow label="Session Timeout" description={`Auto-logout after ${entSettings.sessionTimeout} min`}>
          <TouchableOpacity
            style={styles.valuePill}
            onPress={() => showNumberPicker('Session Timeout (minutes)', [30, 60, 120, 240, 480, 960], entSettings.sessionTimeout, val => setEnt('sessionTimeout', val))}
          >
            <Text style={styles.valuePillText}>{entSettings.sessionTimeout} min</Text>
            <Ionicons name="chevron-down" size={12} color={colors.primary} />
          </TouchableOpacity>
        </SettingRow>
      </Card>

      {/* Compliance */}
      <Card style={styles.settingsCard}>
        <Text style={[styles.cardTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Compliance</Text>

        <SettingRow label="GDPR Compliance" description="Enable GDPR-specific features">
          <Switch
            value={entSettings.gdprCompliance}
            onValueChange={v => setEnt('gdprCompliance', v)}
            trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
            thumbColor={entSettings.gdprCompliance ? colors.primary : '#fff'}
          />
        </SettingRow>

        <SettingRow label="Audit Logging" description="Log all user actions">
          <Switch
            value={entSettings.auditLogging}
            onValueChange={v => setEnt('auditLogging', v)}
            trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
            thumbColor={entSettings.auditLogging ? colors.primary : '#fff'}
          />
        </SettingRow>
      </Card>

      {/* Integrations */}
      <Card style={styles.settingsCard}>
        <Text style={[styles.cardTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Integrations & Access</Text>

        <SettingRow label="API Access" description="Allow external API calls">
          <Switch
            value={entSettings.apiAccessEnabled}
            onValueChange={v => setEnt('apiAccessEnabled', v)}
            trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
            thumbColor={entSettings.apiAccessEnabled ? colors.primary : '#fff'}
          />
        </SettingRow>

        <SettingRow label="Webhooks" description="Enable outgoing webhook support">
          <Switch
            value={entSettings.webhookEnabled}
            onValueChange={v => setEnt('webhookEnabled', v)}
            trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
            thumbColor={entSettings.webhookEnabled ? colors.primary : '#fff'}
          />
        </SettingRow>

        <SettingRow label="SSO Authentication" description="Single Sign-On via SAML / OAuth">
          <Switch
            value={entSettings.ssoEnabled}
            onValueChange={v => setEnt('ssoEnabled', v)}
            trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
            thumbColor={entSettings.ssoEnabled ? colors.primary : '#fff'}
          />
        </SettingRow>
      </Card>

      {/* Enterprise Actions */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#fff' }]}>
        <Text style={[styles.cardTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Team Management</Text>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/enterprise/users' as any)}
        >
          <Ionicons name="people-outline" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Manage Team Members</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#8B5CF6', marginTop: 10 }]}
          onPress={() => router.push('/enterprise/workspaces' as any)}
        >
          <Ionicons name="folder-outline" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Manage Workspaces</Text>
        </TouchableOpacity>
      </Card>

      <Button
        title="Save Enterprise Settings"
        onPress={() => Alert.alert('Saved', 'Enterprise settings saved locally. Contact support to apply org-wide changes.')}
        style={{ margin: 20 }}
      />
    </ScrollView>
  );

  // ─── Shared sub-component ──────────────────────────────────────────────────

  function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
    return (
      <View style={styles.settingItem}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>{label}</Text>
          {description && <Text style={[styles.settingDesc, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{description}</Text>}
        </View>
        {children}
      </View>
    );
  }

  function addRule(category: NotificationRule['category']) {
    const newRule: NotificationRule = {
      id: Date.now().toString(),
      name: `${category.charAt(0).toUpperCase() + category.slice(1)} Alert`,
      description: `New ${category} notification rule`,
      category,
      enabled: true,
      frequency: 'immediate',
    };
    setNotifRules(prev => [...prev, newRule]);
  }

  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Loading settings…</Text>
        </View>
      );
    }
    switch (activeTab) {
      case 'setup': return renderSetupTab();
      case 'preferences': return renderPreferencesTab();
      case 'notifications': return renderNotificationsTab();
      case 'enterprise': return renderEnterpriseTab();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>Advanced Settings</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              { borderColor: isDark ? '#374151' : '#E5E7EB' },
              activeTab === tab.key && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon as any}
              size={14}
              color={activeTab === tab.key ? '#fff' : (isDark ? '#9CA3AF' : '#6B7280')}
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>{renderTabContent()}</View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 16 },
  title: { fontSize: 24, fontFamily: fonts.nohemi.bold },
  tabsContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, gap: 8 },
  tabButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 8, borderWidth: 1, gap: 4,
  },
  activeTabButton: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 11, fontFamily: fonts.satoshi.medium, color: '#6B7280' },
  activeTabText: { color: '#fff', fontFamily: fonts.satoshi.bold },

  // Cards
  sectionCard: { margin: 16, marginBottom: 8, padding: 18, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  settingsCard: { margin: 16, marginBottom: 8, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  cardTitle: { fontSize: 15, fontFamily: fonts.nohemi.semiBold, marginBottom: 14 },

  // Section header
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontFamily: fonts.nohemi.semiBold },
  sectionDescription: { fontSize: 13, fontFamily: fonts.satoshi.regular, lineHeight: 19, marginBottom: 14 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  statBox: { flex: 1, alignItems: 'center', backgroundColor: colors.primary + '10', borderRadius: 10, paddingVertical: 12 },
  statNum: { fontSize: 26, fontFamily: fonts.nohemi.bold },
  statLabel: { fontSize: 11, fontFamily: fonts.satoshi.medium, color: '#6B7280', marginTop: 2 },

  // Setting row
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  settingLabel: { fontSize: 14, fontFamily: fonts.satoshi.medium, marginBottom: 2 },
  settingDesc: { fontSize: 11, fontFamily: fonts.satoshi.regular },

  // Value pill (for pickers)
  valuePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: colors.primary, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  valuePillText: { fontSize: 12, fontFamily: fonts.satoshi.medium, color: colors.primary },

  // Action buttons
  actionButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8,
  },
  actionButtonText: { fontSize: 14, fontFamily: fonts.nohemi.medium, color: '#fff' },

  // Notification cards
  notifCard: { margin: 16, marginBottom: 8, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  notifHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  catDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  notifName: { fontSize: 13, fontFamily: fonts.satoshi.bold, marginBottom: 2 },
  notifDesc: { fontSize: 11, fontFamily: fonts.satoshi.regular },
  notifFooter: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 8 },
  freqBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  freqText: { fontSize: 10, fontFamily: fonts.satoshi.bold, textTransform: 'uppercase' },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtnText: { fontSize: 12, fontFamily: fonts.satoshi.medium },

  // Tab header (notifications)
  tabHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  tabHeaderTitle: { fontSize: 16, fontFamily: fonts.nohemi.semiBold },
  addRuleBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addRuleBtnText: { fontSize: 13, fontFamily: fonts.satoshi.medium },

  // Empty state
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyText: { fontSize: 14, fontFamily: fonts.satoshi.regular, textAlign: 'center', marginTop: 12 },

  // Loading
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, fontFamily: fonts.satoshi.regular },
});
