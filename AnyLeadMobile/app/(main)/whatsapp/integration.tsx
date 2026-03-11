import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, ScrollView, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '../../../src/components/common/Card';
import { colors, fonts } from '../../../src/theme/theme';
import { useAuth } from '../../../src/contexts/AuthContext';
import { ApiService } from '../../../src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface WhatsAppMessage {
  id: string;
  messageId: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  profilePic?: string;
  message: string;
  type: 'text' | 'image' | 'video' | 'document' | 'audio' | 'button' | 'list';
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  isBusiness: boolean;
  labels: string[];
  assignedTo?: string;
  assignedToName?: string;
  leadId?: string;
  campaignId?: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: number;
    buttons?: Array<{ id: string; text: string; url?: string }>;
    listOptions?: Array<{ id: string; title: string; description: string }>;
  };
}

interface WhatsAppContact {
  id: string;
  phone: string;
  name?: string;
  profilePic?: string;
  isBusiness: boolean;
  isBlocked: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  labels: string[];
  assignedTo?: string;
  assignedToName?: string;
  leadId?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  notes?: string;
}

interface WhatsAppCampaign {
  id: string;
  name: string;
  type: 'bulk' | 'drip' | 'automation';
  status: 'draft' | 'active' | 'paused' | 'completed';
  template: {
    name: string;
    language: string;
    category: 'marketing' | 'utility' | 'authentication';
    components: Array<{
      type: 'header' | 'body' | 'footer' | 'buttons';
      text?: string;
      format?: 'text' | 'image' | 'video' | 'document';
      buttons?: Array<{ type: 'url' | 'quick_reply'; text: string; url?: string }>;
    }>;
  };
  recipients: Array<{
    phone: string;
    name?: string;
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
    sentAt?: string;
  }>;
  scheduledAt?: string;
  stats: {
    totalSent: number;
    delivered: number;
    read: number;
    failed: number;
    clicked: number;
  };
  createdAt: string;
  createdBy: string;
}

interface WhatsAppAutomation {
  id: string;
  name: string;
  trigger: {
    type: 'keyword' | 'time' | 'incoming_message' | 'lead_status';
    conditions: Record<string, any>;
  };
  actions: Array<{
    type: 'send_message' | 'assign_lead' | 'update_status' | 'add_label';
    parameters: Record<string, any>;
  }>;
  isActive: boolean;
  stats: {
    triggered: number;
    completed: number;
    failed: number;
  };
  createdAt: string;
}

export default function WhatsAppIntegrationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark');
  
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>([]);
  const [automations, setAutomations] = useState<WhatsAppAutomation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts' | 'campaigns' | 'automation'>('chats');
  const [selectedContact, setSelectedContact] = useState<WhatsAppContact | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { key: 'chats', label: 'Chats', icon: 'chatbubble-outline' },
    { key: 'contacts', label: 'Contacts', icon: 'people-outline' },
    { key: 'campaigns', label: 'Campaigns', icon: 'megaphone-outline' },
    { key: 'automation', label: 'Automation', icon: 'settings-outline' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadMessages(),
        loadContacts(),
        loadCampaigns(),
        loadAutomations()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load WhatsApp data');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    // Mock WhatsApp messages
    const mockMessages: WhatsAppMessage[] = [
      {
        id: '1',
        messageId: 'wamid.HBgLOTE1MjEzNDU2NVVBIQF',
        contactId: '1',
        contactName: 'Rahul Sharma',
        contactPhone: '+919876543210',
        message: 'Hi, I\'m interested in your CRM solution. Can you provide more details?',
        type: 'text',
        direction: 'inbound',
        status: 'read',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isBusiness: false,
        labels: ['lead', 'interested'],
        assignedTo: user?.id,
        assignedToName: user?.name,
        leadId: 'lead_1'
      },
      {
        id: '2',
        messageId: 'wamid.HBgLOTE1MjEzNDU2NVVCMQ',
        contactId: '1',
        contactName: 'Rahul Sharma',
        contactPhone: '+919876543210',
        message: 'Hello Rahul! I\'d be happy to help. Our CRM includes lead management, automated follow-ups, WhatsApp integration, and advanced analytics. Would you like to schedule a demo?',
        type: 'text',
        direction: 'outbound',
        status: 'delivered',
        timestamp: new Date(Date.now() - 3000000).toISOString(),
        isBusiness: true,
        labels: ['response'],
        assignedTo: user?.id,
        assignedToName: user?.name,
        leadId: 'lead_1'
      },
      {
        id: '3',
        messageId: 'wamid.HBgLOTE1MjEzNDU2NVVCMg',
        contactId: '2',
        contactName: 'Priya Patel',
        contactPhone: '+919876543211',
        message: 'I need pricing for enterprise plan with 50 users',
        type: 'text',
        direction: 'inbound',
        status: 'read',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        isBusiness: false,
        labels: ['pricing', 'enterprise'],
        assignedTo: user?.id,
        assignedToName: user?.name,
        leadId: 'lead_2'
      }
    ];
    setMessages(mockMessages);
  };

  const loadContacts = async () => {
    // Mock WhatsApp contacts
    const mockContacts: WhatsAppContact[] = [
      {
        id: '1',
        phone: '+919876543210',
        name: 'Rahul Sharma',
        isBusiness: false,
        isBlocked: false,
        lastMessage: 'Hi, I\'m interested in your CRM solution. Can you provide more details?',
        lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
        unreadCount: 1,
        labels: ['lead', 'interested'],
        assignedTo: user?.id,
        assignedToName: user?.name,
        leadId: 'lead_1',
        status: 'contacted',
        priority: 'high',
        tags: ['whatsapp', 'crm', 'demo']
      },
      {
        id: '2',
        phone: '+919876543211',
        name: 'Priya Patel',
        isBusiness: false,
        isBlocked: false,
        lastMessage: 'I need pricing for enterprise plan with 50 users',
        lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
        unreadCount: 0,
        labels: ['pricing', 'enterprise'],
        assignedTo: user?.id,
        assignedToName: user?.name,
        leadId: 'lead_2',
        status: 'qualified',
        priority: 'medium',
        tags: ['whatsapp', 'pricing', 'enterprise']
      }
    ];
    setContacts(mockContacts);
  };

  const loadCampaigns = async () => {
    // Mock WhatsApp campaigns
    const mockCampaigns: WhatsAppCampaign[] = [
      {
        id: '1',
        name: 'Product Launch Campaign',
        type: 'bulk',
        status: 'active',
        template: {
          name: 'product_launch',
          language: 'en',
          category: 'marketing',
          components: [
            {
              type: 'header',
              text: '🚀 Exciting News!',
              format: 'text'
            },
            {
              type: 'body',
              text: 'We\'re thrilled to announce our new CRM features! Click below to learn more.'
            },
            {
              type: 'buttons',
              buttons: [
                { type: 'url', text: 'Learn More', url: 'https://yourcrm.com/features' },
                { type: 'quick_reply', text: 'Schedule Demo' }
              ]
            }
          ]
        },
        recipients: [
          { phone: '+919876543210', status: 'delivered', sentAt: new Date(Date.now() - 3600000).toISOString() },
          { phone: '+919876543211', status: 'read', sentAt: new Date(Date.now() - 7200000).toISOString() }
        ],
        stats: {
          totalSent: 150,
          delivered: 142,
          read: 89,
          failed: 8,
          clicked: 23
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        createdBy: user?.id || '1'
      }
    ];
    setCampaigns(mockCampaigns);
  };

  const loadAutomations = async () => {
    // Mock WhatsApp automations
    const mockAutomations: WhatsAppAutomation[] = [
      {
        id: '1',
        name: 'Auto-Reply to New Leads',
        trigger: {
          type: 'incoming_message',
          conditions: {
            keywords: ['price', 'cost', 'demo', 'trial'],
            isNewContact: true
          }
        },
        actions: [
          {
            type: 'send_message',
            parameters: {
              template: 'auto_reply_lead',
              assignToUser: true
            }
          },
          {
            type: 'add_label',
            parameters: {
              labels: ['auto-replied', 'interested']
            }
          }
        ],
        isActive: true,
        stats: {
          triggered: 45,
          completed: 43,
          failed: 2
        },
        createdAt: new Date(Date.now() - 604800000).toISOString()
      }
    ];
    setAutomations(mockAutomations);
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedContact) return;

    try {
      const newMessage: WhatsAppMessage = {
        id: Date.now().toString(),
        messageId: `wamid.${Date.now()}`,
        contactId: selectedContact.id,
        contactName: selectedContact.name || 'Unknown',
        contactPhone: selectedContact.phone,
        message: messageInput,
        type: 'text',
        direction: 'outbound',
        status: 'sent',
        timestamp: new Date().toISOString(),
        isBusiness: true,
        labels: [],
        assignedTo: user?.id,
        assignedToName: user?.name,
        leadId: selectedContact.leadId
      };

      setMessages(prev => [newMessage, ...prev]);
      setMessageInput('');

      // Update contact's last message
      setContacts(prev => prev.map(contact =>
        contact.id === selectedContact.id
          ? { ...contact, lastMessage: messageInput, lastMessageTime: new Date().toISOString() }
          : contact
      ));

      Alert.alert('Success', 'Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const makeCall = async (contact: WhatsAppContact) => {
    try {
      // Log the call activity
      await ApiService.createActivity({
        type: 'call',
        description: `Called ${contact.name} via WhatsApp integration`,
        lead_id: contact.leadId,
        user_id: user?.id,
        organization_id: user?.organization_id,
        workspace_id: user?.workspace_id,
      });

      // Make the call
      const phoneUrl = `tel:${contact.phone}`;
      const supported = await Linking.canOpenURL(phoneUrl);
      
      if (supported) {
        await Linking.openURL(phoneUrl);
        
        // Navigate to call feedback screen
        router.push({
          pathname: '/dialer/feedback',
          params: { 
            phoneNumber: contact.phone, 
            leadId: contact.leadId,
            leadName: contact.name 
          }
        } as any);
      }
    } catch (error) {
      console.error('Error making call:', error);
      Alert.alert('Error', 'Failed to make call');
    }
  };

  const createLeadFromContact = async (contact: WhatsAppContact) => {
    try {
      Alert.alert('Success', 'Lead created from WhatsApp contact');
    } catch (error) {
      console.error('Error creating lead:', error);
      Alert.alert('Error', 'Failed to create lead');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const renderMessageItem = ({ item }: { item: WhatsAppMessage }) => (
    <TouchableOpacity
      style={[
        styles.messageItem,
        item.direction === 'outbound' ? styles.outboundMessage : styles.inboundMessage,
        { backgroundColor: item.direction === 'outbound' ? colors.primary : (isDark ? '#374151' : '#F3F4F6') }
      ]}
    >
      <View style={styles.messageHeader}>
        <Text style={[
          styles.contactName,
          { color: item.direction === 'outbound' ? '#FFFFFF' : (isDark ? colors.surface : colors.onBackground) }
        ]}>
          {item.contactName}
        </Text>
        <Text style={[
          styles.messageTime,
          { color: item.direction === 'outbound' ? '#E5E7EB' : (isDark ? '#9CA3AF' : '#6B7280') }
        ]}>
          {formatTimestamp(item.timestamp)}
        </Text>
      </View>
      
      <Text style={[
        styles.messageText,
        { color: item.direction === 'outbound' ? '#FFFFFF' : (isDark ? colors.surface : colors.onBackground) }
      ]}>
        {item.message}
      </Text>

      {item.labels.length > 0 && (
        <View style={styles.messageLabels}>
          {item.labels.map((label, index) => (
            <View key={index} style={[styles.label, { backgroundColor: item.direction === 'outbound' ? '#FFFFFF20' : '#00000010' }]}>
              <Text style={[
                styles.labelText,
                { color: item.direction === 'outbound' ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280') }
              ]}>
                {label}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.messageActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => makeCall({
            id: item.contactId,
            phone: item.contactPhone,
            name: item.contactName,
            leadId: item.leadId
          } as WhatsAppContact)}
        >
          <Ionicons name="call-outline" size={16} color={item.direction === 'outbound' ? '#FFFFFF' : colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/leads/${item.leadId}` as any)}
        >
          <Ionicons name="person-outline" size={16} color={item.direction === 'outbound' ? '#FFFFFF' : colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderContactItem = ({ item }: { item: WhatsAppContact }) => (
    <TouchableOpacity
      style={[styles.contactItem, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}
      onPress={() => setSelectedContact(item)}
    >
      <View style={styles.contactInfo}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {item.name ? item.name.charAt(0).toUpperCase() : item.phone.slice(-2)}
          </Text>
        </View>
        <View style={styles.contactDetails}>
          <Text style={[styles.contactName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.name || item.phone}
          </Text>
          <Text style={[
            styles.lastMessage,
            { color: isDark ? '#9CA3AF' : '#6B7280' }
          ]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>
      </View>

      <View style={styles.contactMeta}>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
        <Text style={[styles.lastMessageTime, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          {item.lastMessageTime ? formatTimestamp(item.lastMessageTime) : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderCampaignItem = ({ item }: { item: WhatsAppCampaign }) => (
    <Card style={[styles.campaignCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.campaignHeader}>
        <View style={styles.campaignInfo}>
          <Text style={[styles.campaignName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.name}
          </Text>
          <Text style={[styles.campaignType, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Campaign
          </Text>
        </View>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.status === 'active' ? '#10B98120' : 
                           item.status === 'paused' ? '#F59E0B20' : '#6B728020'
        }]}>
          <Text style={[styles.statusText, { 
            color: item.status === 'active' ? '#10B981' : 
                   item.status === 'paused' ? '#F59E0B' : '#6B7280'
          }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.campaignStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.stats.totalSent}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Sent</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.stats.delivered}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Delivered</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.stats.read}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Read</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.stats.clicked}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Clicked</Text>
        </View>
      </View>

      <View style={styles.campaignActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/whatsapp/campaigns/${item.id}` as any)}
        >
          <Ionicons name="eye-outline" size={16} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/whatsapp/campaigns/${item.id}/edit` as any)}
        >
          <Ionicons name="create-outline" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderChatsTab = () => (
    <View style={styles.tabContent}>
      {selectedContact ? (
        <View style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setSelectedContact(null)}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.chatContactInfo}>
              <Text style={[styles.chatContactName, { color: isDark ? colors.surface : colors.onBackground }]}>
                {selectedContact.name || selectedContact.phone}
              </Text>
              <Text style={[styles.chatContactPhone, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {selectedContact.phone}
              </Text>
            </View>
            <View style={styles.chatActions}>
              <TouchableOpacity
                style={styles.chatActionButton}
                onPress={() => makeCall(selectedContact)}
              >
                <Ionicons name="call-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.chatActionButton}
                onPress={() => createLeadFromContact(selectedContact)}
              >
                <Ionicons name="person-add-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={messages.filter(msg => msg.contactId === selectedContact.id)}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContainer}
          />

          <View style={styles.messageInputContainer}>
            <TextInput
              style={[styles.messageInput, { 
                backgroundColor: isDark ? '#374151' : '#F9FAFB',
                color: isDark ? colors.surface : colors.onBackground,
                borderColor: isDark ? '#4B5563' : '#E5E7EB'
              }]}
              value={messageInput}
              onChangeText={setMessageInput}
              placeholder="Type a message..."
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: colors.primary }]}
              onPress={sendMessage}
              disabled={!messageInput.trim()}
            >
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={contacts}
          renderItem={renderContactItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={{
            refreshing,
            onRefresh,
          }}
          ListHeaderComponent={
            <View style={styles.chatsHeader}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
                WhatsApp Chats ({contacts.length})
              </Text>
              <TouchableOpacity
                style={styles.composeButton}
                onPress={() => setShowCompose(true)}
              >
                <Ionicons name="create-outline" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );

  const renderContactsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          WhatsApp Contacts ({contacts.length})
        </Text>
        <Button
          title="Import Contacts"
          onPress={() => Alert.alert('Import', 'Contact import will be implemented')}
          style={styles.importButton}
        />
      </View>

      <FlatList
        data={contacts}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No WhatsApp contacts
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderCampaignsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          WhatsApp Campaigns ({campaigns.length})
        </Text>
        <Button
          title="Create Campaign"
          onPress={() => router.push('/whatsapp/campaigns/create' as any)}
          style={styles.createButton}
        />
      </View>

      <FlatList
        data={campaigns}
        renderItem={renderCampaignItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="megaphone-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No campaigns created
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderAutomationTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          WhatsApp Automation ({automations.length})
        </Text>
        <Button
          title="Create Automation"
          onPress={() => router.push('/whatsapp/automation/create' as any)}
          style={styles.createButton}
        />
      </View>

      <FlatList
        data={automations}
        renderItem={({ item }) => (
          <Card style={[styles.automationCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.automationHeader}>
              <Text style={[styles.automationName, { color: isDark ? colors.surface : colors.onBackground }]}>
                {item.name}
              </Text>
              <View style={[styles.toggleSwitch, { backgroundColor: item.isActive ? colors.primary : '#E5E7EB' }]}>
                <Text style={[styles.toggleText, { color: item.isActive ? '#FFFFFF' : '#6B7280' }]}>
                  {item.isActive ? 'ON' : 'OFF'}
                </Text>
              </View>
            </View>

            <Text style={[styles.automationTrigger, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Trigger: {item.trigger.type}
            </Text>

            <View style={styles.automationStats}>
              <Text style={[styles.statText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Triggered: {item.stats.triggered}
              </Text>
              <Text style={[styles.statText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Completed: {item.stats.completed}
              </Text>
              <Text style={[styles.statText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Failed: {item.stats.failed}
              </Text>
            </View>
          </Card>
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="settings-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No automations created
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chats':
        return renderChatsTab();
      case 'contacts':
        return renderContactsTab();
      case 'campaigns':
        return renderCampaignsTab();
      case 'automation':
        return renderAutomationTab();
      default:
        return renderChatsTab();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          WhatsApp Integration
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/whatsapp/settings' as any)}
          >
            <Ionicons name="cog-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.activeTabButton,
              { borderColor: isDark ? '#374151' : '#E5E7EB' }
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={16} 
              color={activeTab === tab.key ? colors.primary : (isDark ? '#6B7280' : '#9CA3AF')} 
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {renderTabContent()}
      </View>
    </View>
  );
}

import { Linking } from 'expo-linking';

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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  chatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
  },
  composeButton: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  importButton: {
    paddingHorizontal: 16,
  },
  createButton: {
    paddingHorizontal: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: fonts.nohemi.bold,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  contactMeta: {
    alignItems: 'flex-end',
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 4,
  },
  unreadText: {
    fontSize: 10,
    fontFamily: fonts.nohemi.bold,
    color: '#FFFFFF',
  },
  lastMessageTime: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  chatContactInfo: {
    flex: 1,
    marginLeft: 16,
  },
  chatContactName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 2,
  },
  chatContactPhone: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  chatActions: {
    flexDirection: 'row',
    gap: 12,
  },
  chatActionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.primary + '10',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
  },
  messageItem: {
    marginVertical: 4,
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  inboundMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  outboundMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 10,
    fontFamily: fonts.satoshi.regular,
  },
  messageText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    lineHeight: 18,
  },
  messageLabels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  label: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  labelText: {
    fontSize: 10,
    fontFamily: fonts.satoshi.medium,
  },
  messageActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    padding: 4,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  campaignCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  campaignInfo: {
    flex: 1,
  },
  campaignName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  campaignType: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontFamily: fonts.nohemi.bold,
    textTransform: 'uppercase',
  },
  campaignStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  campaignActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  automationCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  automationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  automationName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
  },
  toggleSwitch: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  toggleText: {
    fontSize: 10,
    fontFamily: fonts.nohemi.bold,
    textTransform: 'uppercase',
  },
  automationTrigger: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 12,
  },
  automationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fonts.satoshi.medium,
    marginTop: 12,
  },
});
