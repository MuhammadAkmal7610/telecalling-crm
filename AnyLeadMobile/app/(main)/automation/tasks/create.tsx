import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
}

export default function CreateTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [assignedTo, setAssignedTo] = useState(user?.id || '1');
  const [assignedToName, setAssignedToName] = useState(user?.name || 'You');
  const [dueDate, setDueDate] = useState<Date>(new Date(Date.now() + 86400000)); // Default to tomorrow
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [showLeadsDropdown, setShowLeadsDropdown] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoadingLeads(true);
      const response = await ApiService.getLeads(user?.workspace_id);
      if (response.data) {
        setLeads(response.data);
        
        // If relatedLeadId is passed in params, auto-select it
        if (params?.relatedLeadId) {
          const lead = response.data.find((l: Lead) => l.id === params.relatedLeadId);
          if (lead) setSelectedLead(lead);
        }
      }
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoadingLeads(false);
    }
  };

  const handleSaveTask = async () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a task title');
      return;
    }

    setSaving(true);
    try {
      const taskData = {
        title,
        description,
        priority,
        assignedTo,
        assignedToName,
        dueDate: dueDate.toISOString(),
        status: 'pending',
        relatedLeadId: selectedLead?.id,
        relatedLeadName: selectedLead?.name,
        createdBy: user?.id || 'user',
        workspace_id: user?.workspace_id,
        organization_id: user?.organization_id,
      };

      // In actual app we save this via API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Log task creation activity
      try {
        await ApiService.createActivity({
          type: 'task_created',
          details: `Task created: "${title}" (Priority: ${priority.toUpperCase()})`,
          lead_id: selectedLead?.id,
          user_id: user?.id,
          organization_id: user?.organization_id,
          workspace_id: user?.workspace_id,
        });
      } catch (activityError) {
        console.error('Error logging activity:', activityError);
      }

      Alert.alert('Success', 'Task created successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleDateConfirm = (date: Date) => {
    setDueDate(date);
    hideDatePicker();
  };

  const priorities: Array<{ value: typeof priority; label: string; color: string }> = [
    { value: 'low', label: 'Low', color: '#10B981' },
    { value: 'medium', label: 'Medium', color: '#3B82F6' },
    { value: 'high', label: 'High', color: '#F59E0B' },
    { value: 'urgent', label: 'Urgent', color: '#EF4444' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.surface : colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Create New Task
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Task Details Card */}
        <Card style={[styles.card, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Task Details
          </Text>

          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Task Title *</Text>
            <TextInput
              style={[styles.input, { 
                borderColor: isDark ? '#4B5563' : '#E5E7EB', 
                color: isDark ? colors.surface : colors.onBackground,
                backgroundColor: isDark ? '#374151' : '#F9FAFB' 
              }]}
              placeholder="e.g. Follow up on demo request"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { 
                borderColor: isDark ? '#4B5563' : '#E5E7EB', 
                color: isDark ? colors.surface : colors.onBackground,
                backgroundColor: isDark ? '#374151' : '#F9FAFB'
              }]}
              placeholder="Provide a detailed task description..."
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </Card>

        {/* Settings Card */}
        <Card style={[styles.card, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Task Settings
          </Text>

          {/* Priority selector */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Priority</Text>
            <View style={styles.priorityGrid}>
              {priorities.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.priorityButton,
                    priority === item.value && { backgroundColor: item.color + '20', borderColor: item.color },
                    { borderColor: isDark ? '#4B5563' : '#E5E7EB' }
                  ]}
                  onPress={() => setPriority(item.value)}
                >
                  <View style={[styles.dot, { backgroundColor: item.color }]} />
                  <Text style={[
                    styles.priorityText, 
                    { color: priority === item.value ? item.color : (isDark ? '#9CA3AF' : '#6B7280') }
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Due Date Picker */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Due Date</Text>
            <TouchableOpacity
              style={[styles.input, styles.dateRow, { 
                borderColor: isDark ? '#4B5563' : '#E5E7EB',
                backgroundColor: isDark ? '#374151' : '#F9FAFB'
              }]}
              onPress={showDatePicker}
            >
              <Text style={{ color: isDark ? colors.surface : colors.onBackground }}>
                {dueDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
              <Ionicons name="calendar" size={20} color={colors.primary} />
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              date={dueDate}
              onConfirm={handleDateConfirm}
              onCancel={hideDatePicker}
              minimumDate={new Date()}
            />
          </View>

          {/* Related Lead Selector */}
          <View style={[styles.inputGroup, { zIndex: 100 }]}>
            <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Related Lead (Optional)</Text>
            <TouchableOpacity
              style={[styles.input, styles.dateRow, { 
                borderColor: isDark ? '#4B5563' : '#E5E7EB',
                backgroundColor: isDark ? '#374151' : '#F9FAFB'
              }]}
              onPress={() => setShowLeadsDropdown(!showLeadsDropdown)}
            >
              {loadingLeads ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={{ color: selectedLead ? (isDark ? colors.surface : colors.onBackground) : (isDark ? '#9CA3AF' : '#6B7280') }}>
                  {selectedLead ? selectedLead.name : 'Select a lead to link'}
                </Text>
              )}
              <Ionicons name={showLeadsDropdown ? "chevron-up" : "chevron-down"} size={20} color={colors.primary} />
            </TouchableOpacity>

            {showLeadsDropdown && leads.length > 0 && (
              <View style={[styles.dropdown, { backgroundColor: isDark ? '#374151' : '#FFFFFF', borderColor: isDark ? '#4B5563' : '#E5E7EB' }]}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedLead(null);
                      setShowLeadsDropdown(false);
                    }}
                  >
                    <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', fontStyle: 'italic' }}>None (Clear Selection)</Text>
                  </TouchableOpacity>
                  {leads.map((lead) => (
                    <TouchableOpacity
                      key={lead.id}
                      style={[
                        styles.dropdownItem,
                        selectedLead?.id === lead.id && { backgroundColor: colors.primary + '15' }
                      ]}
                      onPress={() => {
                        setSelectedLead(lead);
                        setShowLeadsDropdown(false);
                      }}
                    >
                      <View>
                        <Text style={[styles.leadItemName, { color: isDark ? colors.surface : colors.onBackground }]}>
                          {lead.name}
                        </Text>
                        <Text style={styles.leadItemStatus}>{lead.status.toUpperCase()}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </Card>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Create Task"
            onPress={handleSaveTask}
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
    position: 'relative',
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
    minHeight: 100,
  },
  priorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
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
  dropdown: {
    position: 'absolute',
    top: 75,
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 9999,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB15',
  },
  leadItemName: {
    fontSize: 15,
    fontFamily: fonts.satoshi.medium,
  },
  leadItemStatus: {
    fontSize: 11,
    fontFamily: fonts.satoshi.bold,
    color: colors.primary,
    marginTop: 2,
  },
});
