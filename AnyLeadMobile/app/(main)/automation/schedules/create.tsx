import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function CreateScheduleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scheduleType, setScheduleType] = useState<'recurring' | 'one_time' | 'triggered'>('recurring');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [actionType, setActionType] = useState<'send_email' | 'create_task' | 'generate_report'>('generate_report');
  
  const [time, setTime] = useState('09:00');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Monday to Friday

  const [saving, setSaving] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const handleSaveSchedule = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter a schedule name');
      return;
    }

    setSaving(true);
    try {
      const scheduleData = {
        name,
        description,
        type: scheduleType,
        frequency: scheduleType === 'recurring' ? frequency : undefined,
        action: {
          type: actionType,
          parameters: actionType === 'generate_report' 
            ? { reportType: 'daily_sales' } 
            : actionType === 'send_email' 
            ? { templateId: 'welcome_template' } 
            : { taskTitle: 'Follow up reminder' }
        },
        timing: {
          startDate: startDate.toISOString(),
          time,
          timezone: 'UTC',
          daysOfWeek: scheduleType === 'recurring' && frequency === 'weekly' ? selectedDays : undefined,
        },
        isActive: true,
        runCount: 0,
        createdBy: user?.id || 'user',
        workspace_id: user?.workspace_id,
        organization_id: user?.organization_id,
      };

      // Simulated saving
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Log schedule creation activity
      try {
        await ApiService.createActivity({
          type: 'schedule_created',
          details: `Schedule created: "${name}" (${scheduleType.toUpperCase()})`,
          user_id: user?.id,
          organization_id: user?.organization_id,
          workspace_id: user?.workspace_id,
        });
      } catch (activityError) {
        console.error('Error logging activity:', activityError);
      }

      Alert.alert('Success', 'Schedule created successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error creating schedule:', error);
      Alert.alert('Error', 'Failed to create schedule');
    } finally {
      setSaving(false);
    }
  };

  const handleDayToggle = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const daysOfWeek = [
    { value: 1, label: 'M' },
    { value: 2, label: 'T' },
    { value: 3, label: 'W' },
    { value: 4, label: 'T' },
    { value: 5, label: 'F' },
    { value: 6, label: 'S' },
    { value: 0, label: 'S' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.surface : colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Create Schedule
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Basic Info */}
        <Card style={[styles.card, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            General Information
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Schedule Name *</Text>
            <TextInput
              style={[styles.input, { 
                borderColor: isDark ? '#4B5563' : '#E5E7EB', 
                color: isDark ? colors.surface : colors.onBackground,
                backgroundColor: isDark ? '#374151' : '#F9FAFB' 
              }]}
              placeholder="e.g. Daily Leads Nurturing"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { 
                borderColor: isDark ? '#4B5563' : '#E5E7EB', 
                color: isDark ? colors.surface : colors.onBackground,
                backgroundColor: isDark ? '#374151' : '#F9FAFB'
              }]}
              placeholder="e.g. Daily automated check to assign task..."
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </Card>

        {/* Schedule Timing Type */}
        <Card style={[styles.card, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Trigger & Timing
          </Text>

          {/* Schedule Type Selector */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Timing Type</Text>
            <View style={styles.typeSelector}>
              {(['recurring', 'one_time', 'triggered'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    scheduleType === type && styles.selectedTypeButton,
                    { borderColor: isDark ? '#4B5563' : '#E5E7EB' }
                  ]}
                  onPress={() => setScheduleType(type)}
                >
                  <Text style={[
                    styles.typeButtonText,
                    scheduleType === type && styles.selectedTypeButtonText
                  ]}>
                    {type.replace('_', ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recurring details */}
          {scheduleType === 'recurring' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Frequency</Text>
                <View style={styles.typeSelector}>
                  {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      style={[
                        styles.typeButton,
                        frequency === freq && styles.selectedTypeButton,
                        { borderColor: isDark ? '#4B5563' : '#E5E7EB' }
                      ]}
                      onPress={() => setFrequency(freq)}
                    >
                      <Text style={[
                        styles.typeButtonText,
                        frequency === freq && styles.selectedTypeButtonText
                      ]}>
                        {freq.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {frequency === 'weekly' && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Days of Week</Text>
                  <View style={styles.daysContainer}>
                    {daysOfWeek.map((day) => {
                      const isSelected = selectedDays.includes(day.value);
                      return (
                        <TouchableOpacity
                          key={day.value}
                          style={[
                            styles.dayCircle,
                            isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                            { borderColor: isDark ? '#4B5563' : '#E5E7EB' }
                          ]}
                          onPress={() => handleDayToggle(day.value)}
                        >
                          <Text style={[styles.dayCircleText, isSelected && { color: '#FFFFFF' }]}>
                            {day.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </>
          )}

          {/* Execution Time Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Preferred Execution Time</Text>
            <TouchableOpacity
              style={[styles.input, styles.dateRow, { 
                borderColor: isDark ? '#4B5563' : '#E5E7EB',
                backgroundColor: isDark ? '#374151' : '#F9FAFB'
              }]}
              onPress={() => setTimePickerVisibility(true)}
            >
              <Text style={{ color: isDark ? colors.surface : colors.onBackground }}>{time}</Text>
              <Ionicons name="time" size={20} color={colors.primary} />
            </TouchableOpacity>
            
            <DateTimePickerModal
              isVisible={isTimePickerVisible}
              mode="time"
              date={new Date()}
              onConfirm={(date) => {
                const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                setTime(formattedTime);
                setTimePickerVisibility(false);
              }}
              onCancel={() => setTimePickerVisibility(false)}
            />
          </View>
        </Card>

        {/* Actions Card */}
        <Card style={[styles.card, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Actions Triggered
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Triggered Action</Text>
            <View style={styles.typeSelector}>
              {(['generate_report', 'send_email', 'create_task'] as const).map((act) => (
                <TouchableOpacity
                  key={act}
                  style={[
                    styles.typeButton,
                    actionType === act && styles.selectedTypeButton,
                    { borderColor: isDark ? '#4B5563' : '#E5E7EB' }
                  ]}
                  onPress={() => setActionType(act)}
                >
                  <Text style={[
                    styles.typeButtonText,
                    actionType === act && styles.selectedTypeButtonText
                  ]}>
                    {act.replace('_', ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Create Schedule"
            onPress={handleSaveSchedule}
            loading={saving}
            style={styles.createBtn}
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
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.nohemi.bold,
  },
  headerSpacer: {
    width: 40,
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
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.satoshi.regular,
    minHeight: 80,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectedTypeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 11,
    fontFamily: fonts.nohemi.bold,
    color: '#6B7280',
  },
  selectedTypeButtonText: {
    color: '#FFFFFF',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleText: {
    fontSize: 13,
    fontFamily: fonts.nohemi.bold,
    color: '#6B7280',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    gap: 12,
  },
  createBtn: {
    backgroundColor: colors.primary,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
});
