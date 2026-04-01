import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme, TextInput, Switch, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface WelcomeMessage {
  id: string;
  name: string;
  message: string;
  trigger: {
    type: 'lead_created' | 'lead_assigned' | 'lead_status_change';
    conditions: {
      field: string;
      operator: 'equals' | 'contains' | 'in';
      value: string | string[];
    }[];
  };
  delay: number; // minutes
  isActive: boolean;
  stats: {
    sent: number;
    delivered: number;
    failed: number;
  };
  createdAt: string;
}

interface Template {
  id: string;
  name: string;
  message: string;
  category: 'welcome' | 'follow_up' | 'promotion' | 'reminder';
}

export default function WelcomeMessagesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [welcomeMessages, setWelcomeMessages] = useState<WelcomeMessage[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMessageName, setNewMessageName] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [delayMinutes, setDelayMinutes] = useState('0');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadWelcomeMessages(), loadTemplates()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWelcomeMessages = async () => {
    if (!user?.organization_id) return;
    try {
      const { data, error } = await ApiService.get('/automation/welcome-messages');
      if (error) throw error;
      setWelcomeMessages(data || []);
    } catch (error) {
      console.error('Error loading welcome messages:', error);
      setWelcomeMessages(getMockWelcomeMessages());
    }
  };

  const loadTemplates = async () => {
    if (!user?.organization_id) return;
    try {
      const { data, error } = await ApiService.get('/whatsapp/templates');
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const getMockWelcomeMessages = (): WelcomeMessage[] => [
    {
      id: '1',
      name: 'New Lead Welcome',
      message: 'Hello {{name}}! 👋 Welcome to {{company}}. Thank you for your interest in our services. A member of our team will contact you shortly.',
      trigger: {
        type: 'lead_created',
        conditions: [{ field: 'source', operator: 'in', value: ['website', 'facebook', 'google'] }],
      },
      delay: 0,
      isActive: true,
      stats: { sent: 1250, delivered: 1180, failed: 15 },
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Assigned Lead Intro',
      message: 'Hi {{name}}! This is {{agent_name}} from {{company}}. I\'ll be your point of contact. Feel free to reach out if you have any questions!',
      trigger: {
        type: 'lead_assigned',
        conditions: [],
      },
      delay: 5,
      isActive: true,
      stats: { sent: 850, delivered: 820, failed: 8 },
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'High Priority Follow-up',
      message: 'Hello {{name}}! We noticed you\'re interested in our premium plans. Our specialist will call you within the next hour.',
      trigger: {
        type: 'lead_created',
        conditions: [{ field: 'priority', operator: 'equals', value: 'high' }],
      },
      delay: 0,
      isActive: false,
      stats: { sent: 120, delivered: 115, failed: 2 },
      createdAt: new Date().toISOString(),
    },
  ];

  const handleCreateMessage = async () => {
    if (!newMessageName.trim()) {
      Alert.alert('Error', 'Please enter a message name');
      return;
    }

    if (!newMessageText.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    try {
      const newMessage: Partial<WelcomeMessage> = {
        name: newMessageName,
        message: newMessageText,
        trigger: {
          type: 'lead_created',
          conditions: [],
        },
        delay: parseInt(delayMinutes) || 0,
        isActive: true,
      };

      const { data, error } = await ApiService.post('/automation/welcome-messages', newMessage);
      if (error) throw error;

      Alert.alert('Success', 'Welcome message created');
      setShowAddModal(false);
      setNewMessageName('');
      setNewMessageText('');
      setDelayMinutes('0');
      loadWelcomeMessages();
    } catch (error: any) {
      console.error('Error creating message:', error);
      Alert.alert('Error', error.message || 'Failed to create message');
    }
  };

  const toggleMessageStatus = async (messageId: string, currentStatus: boolean) => {
    try {
      await ApiService.patch(`/automation/welcome-messages/${messageId}`, {
        isActive: !currentStatus,
      });
      setWelcomeMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, isActive: !currentStatus } : m
      ));
    } catch (error) {
      console.error('Error toggling message:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    Alert.alert('Delete Message', 'Are you sure you want to delete this welcome message?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await ApiService.delete(`/automation/welcome-messages/${messageId}`);
            setWelcomeMessages(prev => prev.filter(m => m.id !== messageId));
          } catch (error) {
            console.error('Error deleting message:', error);
          }
        },
      },
    ]);
  };

  const useTemplate = (template: Template) => {
    setNewMessageText(template.message);
    setSelectedTemplate(template.id);
  };

  const getTriggerDescription = (trigger: WelcomeMessage['trigger']) => {
    switch (trigger.type) {
      case 'lead_created':
        return 'When a new lead is created';
      case 'lead_assigned':
        return 'When a lead is assigned';
      case 'lead_status_change':
        return 'When lead status changes';
      default:
        return 'Unknown trigger';
    }
  };

  const renderWelcomeMessageCard = (message: WelcomeMessage) => (
    <Card key={message.id} style={[styles.messageCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.messageHeader}>
        <View style={styles.messageInfo}>
          <Text style={[styles.messageName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {message.name}
          </Text>
          <Text style={[styles.triggerText, { color: colors.primary }]}>
            {getTriggerDescription(message.trigger)}
          </Text>
        </View>
        <Switch
          value={message.isActive}
          onValueChange={() => toggleMessageStatus(message.id, message.isActive)}
          thumbColor="#FFFFFF"
          trackColor={{ false: '#6B7280', true: colors.primary }}
        />
      </View>

      <View style={styles.messagePreview}>
        <Text style={[styles.previewLabel, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
          Message Preview:
        </Text>
        <Text style={[styles.messageText, { color: isDark ? colors.surface : colors.onBackground }]}>
          {message.message.length > 100 ? message.message.substring(0, 100) + '...' : message.message}
        </Text>
      </View>

      <View style={styles.messageFooter}>
        <View style={styles.delayInfo}>
          <Ionicons name="time-outline" size={14} color={isDark ? '#6B7280' : '#9CA3AF'} />
          <Text style={[styles.delayText, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            {message.delay === 0 ? 'Instant' : `Delay: ${message.delay} min`}
          </Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {message.stats.delivered}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              Delivered
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>
              {message.stats.failed}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              Failed
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.messageActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#3B82F620' }]}
          onPress={() => Alert.alert('Edit', 'Edit functionality coming soon')}
        >
          <Ionicons name="create-outline" size={16} color="#3B82F6" />
          <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#EF444420' }]}
          onPress={() => deleteMessage(message.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
          <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="paper-plane-outline" size={48} color={colors.primary} />
          <Text style={[styles.loadingText, { color: isDark ? colors.surface : colors.onBackground }]}>
            Loading Welcome Messages...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Welcome Messages
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <Card style={[styles.infoCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
        <Text style={[styles.infoText, { color: isDark ? colors.surface : colors.onBackground }]}>
          Automatically send welcome messages to leads when they are created or assigned. Use variables like {'{{name}}'}, {'{{company}}'}, {'{{agent_name}}'} to personalize messages.
        </Text>
      </Card>

      {/* Templates Quick Access */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Quick Templates
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templatesScroll}>
        {templates.map(template => (
          <TouchableOpacity
            key={template.id}
            style={[styles.templateCard, { backgroundColor: isDark ? '#374151' : '#F9FAFB' }]}
            onPress={() => useTemplate(template)}
          >
            <Text style={[styles.templateName, { color: isDark ? colors.surface : colors.onBackground }]}>
              {template.name}
            </Text>
            <Text style={[styles.templateCategory, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {template.category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Welcome Messages List */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Active Messages ({welcomeMessages.filter(m => m.isActive).length})
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.messagesList}>
        {welcomeMessages.map(message => renderWelcomeMessageCard(message))}
        
        {welcomeMessages.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No welcome messages yet
            </Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              Create your first automated welcome message
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Message Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              Create Welcome Message
            </Text>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Message Name
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isDark ? '#374151' : '#F9FAFB',
                  color: isDark ? colors.surface : colors.onBackground,
                  borderColor: isDark ? '#4B5563' : '#E5E7EB'
                }]}
                placeholder="e.g., New Lead Welcome"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                value={newMessageName}
                onChangeText={setNewMessageName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Message (use {'{{name}}'}, {'{{company}}'}, etc.)
              </Text>
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: isDark ? '#374151' : '#F9FAFB',
                  color: isDark ? colors.surface : colors.onBackground,
                  borderColor: isDark ? '#4B5563' : '#E5E7EB'
                }]}
                placeholder="Hello {{name}}! Welcome to {{company}}..."
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                value={newMessageText}
                onChangeText={setNewMessageText}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Delay (minutes before sending)
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isDark ? '#374151' : '#F9FAFB',
                  color: isDark ? colors.surface : colors.onBackground,
                  borderColor: isDark ? '#4B5563' : '#E5E7EB'
                }]}
                placeholder="0"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                value={delayMinutes}
                onChangeText={setDelayMinutes}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowAddModal(false);
                  setNewMessageName('');
                  setNewMessageText('');
                  setDelayMinutes('0');
                }}
                style={styles.cancelButton}
              />
              <Button
                title="Create"
                onPress={handleCreateMessage}
                style={styles.createButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  infoCard: {
    margin: 20,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    lineHeight: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
  },
  templatesScroll: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  templateCard: {
    padding: 12,
    borderRadius: 10,
    marginRight: 8,
    minWidth: 120,
  },
  templateName: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  templateCategory: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    textTransform: 'capitalize',
  },
  messagesList: {
    padding: 20,
    paddingTop: 0,
  },
  messageCard: {
    marginBottom: 12,
    padding: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  messageInfo: {
    flex: 1,
    marginRight: 12,
  },
  messageName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 4,
  },
  triggerText: {
    fontSize: 13,
    fontFamily: fonts.satoshi.medium,
  },
  messagePreview: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F3F4F620',
    borderRadius: 8,
  },
  previewLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB30',
  },
  delayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  delayText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: fonts.satoshi.regular,
  },
  messageActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 16,
  },
  formGroup: {
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
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    minHeight: 100,
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