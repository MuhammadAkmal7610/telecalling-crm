import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, useColorScheme, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Card, Button } from '../../../src/components/common/Card';
import { colors, fonts } from '../../../src/theme/theme';
import { useAuth } from '../../../src/contexts/AuthContext';
import { ApiService } from '../../../src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

interface MessageComposerParams {
  leadId?: string;
  templateId?: string;
  type?: 'sms' | 'whatsapp';
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
}

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  type: 'sms' | 'whatsapp';
  variables: string[];
}

export default function MessageComposerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as MessageComposerParams;
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [messageType, setMessageType] = useState<'sms' | 'whatsapp'>(params.type || 'sms');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [message, setMessage] = useState('');
  const [template, setTemplate] = useState<MessageTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [availableLeads, setAvailableLeads] = useState<Lead[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load leads
      const leadsData = await ApiService.getLeads(user?.workspace_id);
      setAvailableLeads(leadsData.data || []);
      
      // Load template if provided
      if (params.templateId) {
        const templateData = await getMessageTemplate(params.templateId);
        setTemplate(templateData);
        setMessage(templateData.content);
        setMessageType(templateData.type);
      }
      
      // Set lead if provided
      if (params.leadId) {
        const leadData = leadsData.data?.find(lead => lead.id === params.leadId);
        if (leadData) {
          setSelectedLead(leadData);
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getMessageTemplate = async (templateId: string): Promise<MessageTemplate> => {
    // For now, return a mock template. In future, fetch from API
    const templates: MessageTemplate[] = [
      {
        id: '1',
        name: 'Initial Greeting',
        content: 'Hello [Lead Name], this is [Your Name] from [Your Company]. I wanted to reach out regarding your inquiry.',
        type: 'sms',
        variables: ['Lead Name', 'Your Name', 'Your Company']
      }
    ];
    return templates.find(t => t.id === templateId) || templates[0];
  };

  const selectLead = () => {
    router.push('/leads/select?for=message' as any);
  };

  const selectTemplate = () => {
    router.push({
      pathname: '/messages/templates',
      params: { type: messageType, select: true }
    } as any);
  };

  const replaceVariables = (text: string): string => {
    if (!selectedLead) return text;
    
    return text
      .replace(/\[Lead Name\]/g, selectedLead.name)
      .replace(/\[Your Name\]/g, user?.name || 'Your Name')
      .replace(/\[Your Company\]/g, 'Your Company');
  };

  const sendMessage = async () => {
    if (!selectedLead) {
      Alert.alert('Error', 'Please select a lead');
      return;
    }
    
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    setSending(true);
    try {
      const finalMessage = replaceVariables(message);
      
      if (messageType === 'sms') {
        // Send SMS using native SMS app via Linking
        const smsUrl = `sms:${selectedLead.phone}?body=${encodeURIComponent(finalMessage)}`;
        const supported = await Linking.canOpenURL(smsUrl);
        
        if (supported) {
          await Linking.openURL(smsUrl);
          await logMessageActivity('sms', finalMessage);
          Alert.alert('Success', 'SMS app opened with message');
          router.back();
        } else {
          Alert.alert('Error', 'SMS is not available on this device');
        }
      } else {
        // Send WhatsApp
        const whatsappUrl = `https://wa.me/${selectedLead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(finalMessage)}`;
        const supported = await Linking.canOpenURL(whatsappUrl);
        
        if (supported) {
          await Linking.openURL(whatsappUrl);
          await logMessageActivity('whatsapp', finalMessage);
          Alert.alert('Success', 'WhatsApp opened with message');
          router.back();
        } else {
          Alert.alert('Error', 'WhatsApp is not available on this device');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const logMessageActivity = async (type: 'sms' | 'whatsapp', content: string) => {
    try {
      await ApiService.createActivity({
        type: 'message',
        description: `Sent ${type.toUpperCase()} to ${selectedLead?.name}: ${content.substring(0, 100)}...`,
        lead_id: selectedLead?.id,
        user_id: user?.id,
        organization_id: user?.organization_id,
        workspace_id: user?.workspace_id,
        metadata: {
          messageType: type,
          content,
          phoneNumber: selectedLead?.phone
        }
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const renderMessageTypeSelector = () => (
    <View style={styles.typeSelector}>
      <TouchableOpacity
        style={[
          styles.typeButton,
          messageType === 'sms' && styles.selectedTypeButton,
          { borderColor: isDark ? '#374151' : '#E5E7EB' }
        ]}
        onPress={() => setMessageType('sms')}
      >
        <Ionicons 
          name="chatbubble-outline" 
          size={20} 
          color={messageType === 'sms' ? '#FFFFFF' : '#3B82F6'} 
        />
        <Text style={[
          styles.typeButtonText,
          messageType === 'sms' && styles.selectedTypeButtonText
        ]}>
          SMS
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.typeButton,
          messageType === 'whatsapp' && styles.selectedTypeButton,
          { borderColor: isDark ? '#374151' : '#E5E7EB' }
        ]}
        onPress={() => setMessageType('whatsapp')}
      >
        <Ionicons 
          name="logo-whatsapp" 
          size={20} 
          color={messageType === 'whatsapp' ? '#FFFFFF' : '#10B981'} 
        />
        <Text style={[
          styles.typeButtonText,
          messageType === 'whatsapp' && styles.selectedTypeButtonText
        ]}>
          WhatsApp
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Compose Message
        </Text>
      </View>

      {/* Message Type Selector */}
      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Message Type
        </Text>
        {renderMessageTypeSelector()}
      </Card>

      {/* Lead Selection */}
      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Recipient
          </Text>
          <TouchableOpacity onPress={selectLead}>
            <Text style={[styles.changeText, { color: colors.primary }]}>
              {selectedLead ? 'Change' : 'Select'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {selectedLead ? (
          <View style={styles.selectedLead}>
            <Text style={[styles.leadName, { color: isDark ? colors.surface : colors.onBackground }]}>
              {selectedLead.name}
            </Text>
            <Text style={[styles.leadPhone, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {selectedLead.phone}
            </Text>
            <Text style={[styles.leadStatus, { color: colors.primary }]}>
              Status: {selectedLead.status}
            </Text>
          </View>
        ) : (
          <Button
            title="Select Lead"
            onPress={selectLead}
            variant="secondary"
          />
        )}
      </Card>

      {/* Template Selection */}
      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Template
          </Text>
          <TouchableOpacity onPress={selectTemplate}>
            <Text style={[styles.changeText, { color: colors.primary }]}>
              {template ? 'Change' : 'Select'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {template ? (
          <View style={styles.selectedTemplate}>
            <Text style={[styles.templateName, { color: isDark ? colors.surface : colors.onBackground }]}>
              {template.name}
            </Text>
            <Text style={[styles.templateContent, { color: isDark ? '#9CA3AF' : '#6B7280' }]} numberOfLines={2}>
              {template.content}
            </Text>
          </View>
        ) : (
          <Button
            title="Choose Template"
            onPress={selectTemplate}
            variant="secondary"
          />
        )}
      </Card>

      {/* Message Composition */}
      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Message
        </Text>
        <View style={[styles.messageContainer, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
          <TextInput
            style={[styles.messageInput, { color: isDark ? colors.surface : colors.onBackground }]}
            onChangeText={setMessage}
            value={message}
            placeholder="Type your message here..."
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            multiline
            textAlignVertical="top"
          />
          <Text style={[styles.characterCount, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            {message.length}/160 characters (SMS limit)
          </Text>
        </View>
        
        {selectedLead && (
          <View style={styles.previewContainer}>
            <Text style={[styles.previewLabel, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              Preview:
            </Text>
            <Text style={[styles.previewText, { color: isDark ? colors.surface : colors.onBackground }]}>
              {replaceVariables(message)}
            </Text>
          </View>
        )}
      </Card>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title={`Send ${messageType.toUpperCase()}`}
          onPress={sendMessage}
          loading={sending}
          style={styles.sendButton}
        />
        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="secondary"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  changeText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectedTypeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginLeft: 6,
  },
  selectedTypeButtonText: {
    color: '#FFFFFF',
  },
  selectedLead: {
    padding: 12,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
  },
  leadName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  leadPhone: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 2,
  },
  leadStatus: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  selectedTemplate: {
    padding: 12,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
  },
  templateName: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  templateContent: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  messageContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
  },
  messageInput: {
    fontSize: 16,
    fontFamily: fonts.satoshi.regular,
    minHeight: 80,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    textAlign: 'right',
    marginTop: 8,
  },
  previewContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.primary + '5',
    borderRadius: 8,
  },
  previewLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 12,
  },
  sendButton: {
    marginBottom: 8,
  },
});
