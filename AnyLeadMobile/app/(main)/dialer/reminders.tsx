import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme, TextInput, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';
import { NotificationService } from '@/src/services/NotificationService';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Reminder {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  scheduledAt: string;
  type: 'call' | 'follow_up' | 'meeting';
  notes: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  notificationId?: string;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
}

type TabType = 'pending' | 'completed' | 'all';

export default function RemindersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [reminderType, setReminderType] = useState<'call' | 'follow_up' | 'meeting'>('call');
  const [reminderNotes, setReminderNotes] = useState('');
  const [reminderDate, setReminderDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadReminders(), loadLeads()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReminders = async () => {
    if (!user?.organization_id) return;
    try {
      const { data, error } = await ApiService.get('/reminders');
      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error loading reminders:', error);
      // Use mock data for demo
      setReminders(getMockReminders());
    }
  };

  const loadLeads = async () => {
    if (!user?.workspace_id) return;
    try {
      const { data, error } = await ApiService.getLeads(user.workspace_id);
      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error loading leads:', error);
      setLeads([]);
    }
  };

  const getMockReminders = (): Reminder[] => [
    {
      id: '1',
      leadId: 'lead1',
      leadName: 'John Smith',
      leadPhone: '+1234567890',
      scheduledAt: new Date(Date.now() + 3600000).toISOString(),
      type: 'call',
      notes: 'Follow up on proposal',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      leadId: 'lead2',
      leadName: 'Sarah Johnson',
      leadPhone: '+0987654321',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      type: 'follow_up',
      notes: 'Check interest level',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      leadId: 'lead3',
      leadName: 'Mike Wilson',
      leadPhone: '+1122334455',
      scheduledAt: new Date(Date.now() - 3600000).toISOString(),
      type: 'meeting',
      notes: 'Product demo scheduled',
      status: 'completed',
      createdAt: new Date().toISOString(),
    },
  ];

  const handleAddReminder = async () => {
    if (!selectedLead) {
      Alert.alert('Error', 'Please select a lead');
      return;
    }

    if (!reminderNotes.trim()) {
      Alert.alert('Error', 'Please add notes for the reminder');
      return;
    }

    try {
      // Schedule the notification
      const notificationId = await NotificationService.scheduleCallReminder({
        leadId: selectedLead.id,
        leadName: selectedLead.name,
        phoneNumber: selectedLead.phone,
        scheduledTime: reminderDate,
        notes: reminderNotes,
      });

      // Save reminder to backend
      const { data, error } = await ApiService.post('/reminders', {
        leadId: selectedLead.id,
        type: reminderType,
        scheduledAt: reminderDate.toISOString(),
        notes: reminderNotes,
        notificationId,
      });

      if (error) throw error;

      Alert.alert('Success', 'Reminder scheduled successfully');
      setShowAddModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error adding reminder:', error);
      Alert.alert('Error', error.message || 'Failed to add reminder');
    }
  };

  const handleCompleteReminder = async (reminderId: string) => {
    try {
      await ApiService.patch(`/reminders/${reminderId}`, { status: 'completed' });
      setReminders(prev => prev.map(r => 
        r.id === reminderId ? { ...r, status: 'completed' as const } : r
      ));
      Alert.alert('Success', 'Reminder marked as completed');
    } catch (error) {
      console.error('Error completing reminder:', error);
    }
  };

  const handleCancelReminder = async (reminderId: string) => {
    try {
      const reminder = reminders.find(r => r.id === reminderId);
      if (reminder?.notificationId) {
        await NotificationService.cancelNotification(reminder.notificationId);
      }
      await ApiService.delete(`/reminders/${reminderId}`);
      setReminders(prev => prev.filter(r => r.id !== reminderId));
      Alert.alert('Success', 'Reminder cancelled');
    } catch (error) {
      console.error('Error cancelling reminder:', error);
    }
  };

  const resetForm = () => {
    setSelectedLead(null);
    setReminderType('call');
    setReminderNotes('');
    setReminderDate(new Date());
  };

  const getFilteredReminders = () => {
    let filtered = reminders;
    
    if (activeTab === 'pending') {
      filtered = filtered.filter(r => r.status === 'pending');
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(r => r.status === 'completed');
    }

    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.leadPhone.includes(searchQuery)
      );
    }

    return filtered.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  };

  const formatReminderTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    if (diff < 0) {
      return 'Overdue';
    } else if (hours > 24) {
      return `${Math.floor(hours / 24)} days`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'call': return 'call-outline';
      case 'follow_up': return 'refresh-outline';
      case 'meeting': return 'calendar-outline';
      default: return 'alarm-outline';
    }
  };

  const getReminderColor = (type: string) => {
    switch (type) {
      case 'call': return '#3B82F6';
      case 'follow_up': return '#10B981';
      case 'meeting': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const renderReminderItem = ({ item }: { item: Reminder }) => (
    <Card style={[
      styles.reminderCard,
      { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' },
      item.status === 'completed' && styles.completedCard
    ]}>
      <View style={styles.reminderHeader}>
        <View style={[styles.reminderIcon, { backgroundColor: getReminderColor(item.type) + '20' }]}>
          <Ionicons name={getReminderIcon(item.type) as any} size={20} color={getReminderColor(item.type)} />
        </View>
        <View style={styles.reminderInfo}>
          <Text style={[styles.reminderLeadName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.leadName}
          </Text>
          <Text style={[styles.reminderPhone, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {item.leadPhone}
          </Text>
        </View>
        <View style={[styles.timeBadge, { backgroundColor: item.status === 'completed' ? '#10B98120' : '#F59E0B20' }]}>
          <Text style={[styles.timeText, { color: item.status === 'completed' ? '#10B981' : '#F59E0B' }]}>
            {item.status === 'completed' ? 'Done' : formatReminderTime(item.scheduledAt)}
          </Text>
        </View>
      </View>

      <Text style={[styles.reminderNotes, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
        {item.notes}
      </Text>

      <View style={styles.reminderFooter}>
        <Text style={[styles.reminderDate, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
          {new Date(item.scheduledAt).toLocaleString()}
        </Text>
        
        {item.status === 'pending' && (
          <View style={styles.reminderActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#10B98120' }]}
              onPress={() => handleCompleteReminder(item.id)}
            >
              <Ionicons name="checkmark" size={16} color="#10B981" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#EF444420' }]}
              onPress={() => handleCancelReminder(item.id)}
            >
              <Ionicons name="close" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Card>
  );

  const renderLeadSelector = () => (
    <View style={styles.leadSelector}>
      <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
        Select Lead
      </Text>
      <TouchableOpacity
        style={[styles.leadSelectButton, { 
          backgroundColor: isDark ? '#374151' : '#F9FAFB',
          borderColor: isDark ? '#4B5563' : '#E5E7EB'
        }]}
        onPress={() => setShowLeadPicker(true)}
      >
        <Text style={[styles.leadSelectText, { color: isDark ? colors.surface : colors.onBackground }]}>
          {selectedLead ? selectedLead.name : 'Choose a lead...'}
        </Text>
        <Ionicons name="chevron-down" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
      </TouchableOpacity>
    </View>
  );

  const renderLeadPicker = () => (
    <Modal
      visible={showLeadPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowLeadPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.leadPickerContent, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          <View style={styles.leadPickerHeader}>
            <Text style={[styles.leadPickerTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              Select Lead
            </Text>
            <TouchableOpacity onPress={() => setShowLeadPicker(false)}>
              <Ionicons name="close" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.searchInput, { 
              backgroundColor: isDark ? '#374151' : '#F9FAFB',
              color: isDark ? colors.surface : colors.onBackground,
              borderColor: isDark ? '#4B5563' : '#E5E7EB'
            }]}
            placeholder="Search leads..."
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <FlatList
            data={leads.filter(l => 
              l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              l.phone.includes(searchQuery)
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.leadOption, { borderBottomColor: isDark ? '#374151' : '#E5E7EB' }]}
                onPress={() => {
                  setSelectedLead(item);
                  setShowLeadPicker(false);
                }}
              >
                <View style={styles.leadOptionInfo}>
                  <Text style={[styles.leadOptionName, { color: isDark ? colors.surface : colors.onBackground }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.leadOptionPhone, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    {item.phone}
                  </Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color={selectedLead?.id === item.id ? colors.primary : 'transparent'} />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>
      </View>
    </Modal>
  );

  const [showLeadPicker, setShowLeadPicker] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Follow-up Reminders
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['pending', 'completed', 'all'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.activeTabButton,
              { borderColor: isDark ? '#374151' : '#E5E7EB' }
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reminders List */}
      <FlatList
        data={getFilteredReminders()}
        renderItem={renderReminderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="alarm-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No reminders found
            </Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              Tap the + button to create a new reminder
            </Text>
          </View>
        }
      />

      {/* Add Reminder Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
                Create Reminder
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {renderLeadSelector()}

              {/* Reminder Type */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Reminder Type
                </Text>
                <View style={styles.typeSelector}>
                  {(['call', 'follow_up', 'meeting'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        reminderType === type && styles.selectedTypeButton,
                        { 
                          backgroundColor: reminderType === type ? getReminderColor(type) + '20' : (isDark ? '#374151' : '#F9FAFB'),
                          borderColor: reminderType === type ? getReminderColor(type) : (isDark ? '#4B5563' : '#E5E7EB')
                        }
                      ]}
                      onPress={() => setReminderType(type)}
                    >
                      <Ionicons 
                        name={getReminderIcon(type) as any} 
                        size={16} 
                        color={reminderType === type ? getReminderColor(type) : (isDark ? '#9CA3AF' : '#6B7280')} 
                      />
                      <Text style={[
                        styles.typeButtonText,
                        reminderType === type && { color: getReminderColor(type) }
                      ]}>
                        {type === 'follow_up' ? 'Follow Up' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date & Time */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Date & Time
                </Text>
                <View style={styles.dateTimeRow}>
                  <TouchableOpacity
                    style={[styles.dateTimeButton, { 
                      backgroundColor: isDark ? '#374151' : '#F9FAFB',
                      borderColor: isDark ? '#4B5563' : '#E5E7EB'
                    }]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                    <Text style={[styles.dateTimeText, { color: isDark ? colors.surface : colors.onBackground }]}>
                      {reminderDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dateTimeButton, { 
                      backgroundColor: isDark ? '#374151' : '#F9FAFB',
                      borderColor: isDark ? '#4B5563' : '#E5E7EB'
                    }]}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Ionicons name="time-outline" size={16} color={colors.primary} />
                    <Text style={[styles.dateTimeText, { color: isDark ? colors.surface : colors.onBackground }]}>
                      {reminderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Notes */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Notes
                </Text>
                <TextInput
                  style={[styles.notesInput, { 
                    backgroundColor: isDark ? '#374151' : '#F9FAFB',
                    color: isDark ? colors.surface : colors.onBackground,
                    borderColor: isDark ? '#4B5563' : '#E5E7EB'
                  }]}
                  placeholder="What should you remember?"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  value={reminderNotes}
                  onChangeText={setReminderNotes}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Date Pickers */}
              {showDatePicker && (
                <DateTimePicker
                  value={reminderDate}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) setReminderDate(date);
                  }}
                />
              )}
              {showTimePicker && (
                <DateTimePicker
                  value={reminderDate}
                  mode="time"
                  display="default"
                  onChange={(event, date) => {
                    setShowTimePicker(false);
                    if (date) {
                      const newDate = new Date(reminderDate);
                      newDate.setHours(date.getHours(), date.getMinutes());
                      setReminderDate(newDate);
                    }
                  }}
                />
              )}

              {/* Actions */}
              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => setShowAddModal(false)}
                  style={styles.cancelButton}
                />
                <Button
                  title="Create Reminder"
                  onPress={handleAddReminder}
                  style={styles.createButton}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {renderLeadPicker()}
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
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontFamily: fonts.nohemi.semiBold,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  reminderCard: {
    marginBottom: 12,
    padding: 16,
  },
  completedCard: {
    opacity: 0.6,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderLeadName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 2,
  },
  reminderPhone: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  timeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 12,
    fontFamily: fonts.nohemi.semiBold,
  },
  reminderNotes: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 12,
    lineHeight: 20,
  },
  reminderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB30',
  },
  reminderDate: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  reminderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: fonts.nohemi.medium,
    marginTop: 12,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '90%',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.nohemi.bold,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 8,
  },
  leadSelector: {
    marginBottom: 20,
  },
  leadSelectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  leadSelectText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  leadPickerContent: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  leadPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  leadPickerTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.bold,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 16,
  },
  leadOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  leadOptionInfo: {
    flex: 1,
  },
  leadOptionName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 2,
  },
  leadOptionPhone: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  selectedTypeButton: {
    borderWidth: 2,
  },
  typeButtonText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    color: '#6B7280',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  dateTimeText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
  createButton: {
    flex: 1,
    backgroundColor: colors.primary,
  },
});