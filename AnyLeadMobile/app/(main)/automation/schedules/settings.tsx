import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme, Switch, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ScheduleSettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';

  const [timezone, setTimezone] = useState('UTC');
  const [retryEnabled, setRetryEnabled] = useState(true);
  const [maxRetries, setMaxRetries] = useState('3');
  const [retentionDays, setRetentionDays] = useState('30');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Simulate save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Schedule settings saved successfully', [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]);
    } catch (error) {
      console.error('Error saving schedule settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.surface : colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Schedule Settings
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Core Settings */}
        <Card style={[styles.card, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            General Preferences
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Default Timezone</Text>
            <TextInput
              style={[styles.input, { 
                borderColor: isDark ? '#4B5563' : '#E5E7EB', 
                color: isDark ? colors.surface : colors.onBackground,
                backgroundColor: isDark ? '#374151' : '#F9FAFB' 
              }]}
              value={timezone}
              onChangeText={setTimezone}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Execution Log Retention (Days)</Text>
            <TextInput
              style={[styles.input, { 
                borderColor: isDark ? '#4B5563' : '#E5E7EB', 
                color: isDark ? colors.surface : colors.onBackground,
                backgroundColor: isDark ? '#374151' : '#F9FAFB' 
              }]}
              keyboardType="number-pad"
              value={retentionDays}
              onChangeText={setRetentionDays}
            />
          </View>
        </Card>

        {/* Failure & Retries */}
        <Card style={[styles.card, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Failure & Retry Policy
          </Text>

          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <Text style={[styles.switchLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                Retry Failed Schedules
              </Text>
              <Text style={styles.switchSubtitle}>Automatically retry once network is stable</Text>
            </View>
            <Switch
              value={retryEnabled}
              onValueChange={setRetryEnabled}
              thumbColor="#FFFFFF"
              trackColor={{ false: '#6B7280', true: colors.primary }}
            />
          </View>

          {retryEnabled && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Maximum Retry Attempts</Text>
              <TextInput
                style={[styles.input, { 
                  borderColor: isDark ? '#4B5563' : '#E5E7EB', 
                  color: isDark ? colors.surface : colors.onBackground,
                  backgroundColor: isDark ? '#374151' : '#F9FAFB' 
                }]}
                keyboardType="number-pad"
                value={maxRetries}
                onChangeText={setMaxRetries}
              />
            </View>
          )}
        </Card>

        {/* Alerts Settings */}
        <Card style={[styles.card, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Notifications & Alerts
          </Text>

          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <Text style={[styles.switchLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                Email on Failure
              </Text>
              <Text style={styles.switchSubtitle}>Notify admins when schedule execution fails</Text>
            </View>
            <Switch
              value={emailAlerts}
              onValueChange={setEmailAlerts}
              thumbColor="#FFFFFF"
              trackColor={{ false: '#6B7280', true: colors.primary }}
            />
          </View>
        </Card>

        {/* Save button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Save Settings"
            onPress={handleSaveSettings}
            loading={saving}
            style={styles.saveBtn}
          />
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="secondary"
            style={styles.cancelBtn}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 15,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.nohemi.bold,
  },
  placeholder: {
    width: 24,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.satoshi.regular,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 12,
  },
  switchLabel: {
    fontSize: 15,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 4,
  },
  switchSubtitle: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    color: '#6B7280',
  },
  buttonContainer: {
    gap: 12,
  },
  saveBtn: {
    backgroundColor: colors.primary,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
});
