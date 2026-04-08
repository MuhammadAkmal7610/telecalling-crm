import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, Switch, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  
  const [settings, setSettings] = useState({
    push: true,
    email: true,
    sms: false,
    mentions: true,
    leadAssigned: true,
    weeklyReport: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const SettingRow = ({ 
    label, 
    description, 
    value, 
    onToggle 
  }: { 
    label: string; 
    description: string; 
    value: boolean; 
    onToggle: () => void 
  }) => (
    <View style={styles.settingRow}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>{label}</Text>
        <Text style={[styles.settingDesc, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{description}</Text>
      </View>
      <Switch 
        value={value} 
        onValueChange={onToggle}
        trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
        thumbColor={value ? colors.primary : '#fff'}
      />
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.surface : colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>Notifications</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Notification Channels</Text>
        <Card style={styles.sectionCard}>
          <SettingRow 
            label="Push Notifications" 
            description="Mobile app alerts and notifications" 
            value={settings.push} 
            onToggle={() => toggleSetting('push')} 
          />
          <SettingRow 
            label="Email Notifications" 
            description="Receive daily summaries and alerts by email" 
            value={settings.email} 
            onToggle={() => toggleSetting('email')} 
          />
          <SettingRow 
            label="SMS Notifications" 
            description="Critical alerts via text message" 
            value={settings.sms} 
            onToggle={() => toggleSetting('sms')} 
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Lead Activity</Text>
        <Card style={styles.sectionCard}>
          <SettingRow 
            label="New Lead Assigned" 
            description="When a lead is assigned to you" 
            value={settings.leadAssigned} 
            onToggle={() => toggleSetting('leadAssigned')} 
          />
          <SettingRow 
            label="Mentions" 
            description="When someone mentions you in lead notes" 
            value={settings.mentions} 
            onToggle={() => toggleSetting('mentions')} 
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Reports</Text>
        <Card style={styles.sectionCard}>
          <SettingRow 
            label="Weekly Performance" 
            description="Your weekly team summary report" 
            value={settings.weeklyReport} 
            onToggle={() => toggleSetting('weeklyReport')} 
          />
        </Card>
      </View>

      <Button 
        title="Refresh Notification Status" 
        onPress={() => {}}
        variant="secondary"
        style={styles.refreshButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionCard: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB10',
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  refreshButton: {
    marginTop: 8,
    marginBottom: 40,
  },
});
