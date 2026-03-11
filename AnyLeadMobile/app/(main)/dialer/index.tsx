import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, useColorScheme, TextInput, FlatList, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '../../src/components/common/Card';
import { colors, fonts } from '../../src/theme/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import { ApiService } from '../../src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import * as Linking from 'expo-linking';

interface CallList {
  id: string;
  name: string;
  leads: Array<{
    id: string;
    name: string;
    phone: string;
    status: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    lastCallDate?: string;
    callAttempts: number;
    notes?: string;
  }>;
  filters: {
    status?: string[];
    priority?: string[];
    source?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
  };
  assignedTo?: string;
  isActive: boolean;
  createdAt: string;
}

interface CallScript {
  id: string;
  name: string;
  leadStatus: string;
  script: string;
  keyPoints: string[];
  objections: Array<{
    objection: string;
    response: string;
  }>;
  isActive: boolean;
}

interface CallActivity {
  id: string;
  leadId: string;
  leadName: string;
  phone: string;
  duration?: number;
  status: 'completed' | 'missed' | 'busy' | 'failed';
  recordingUrl?: string;
  transcript?: string;
  notes: string;
  outcome: 'interested' | 'not_interested' | 'follow_up' | 'callback' | 'sale' | 'wrong_number';
  nextFollowUp?: string;
  userId: string;
  timestamp: string;
}

export default function DialerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark');
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [callScript, setCallScript] = useState('');
  const [isDialing, setIsDialing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dialer' | 'lists' | 'scripts' | 'history'>('dialer');
  const [callLists, setCallLists] = useState<CallList[]>([]);
  const [callScripts, setCallScripts] = useState<CallScript[]>([]);
  const [callHistory, setCallHistory] = useState<CallActivity[]>([]);
  const [selectedList, setSelectedList] = useState<CallList | null>(null);
  const [currentLeadIndex, setCurrentLeadIndex] = useState(0);
  const [autoDial, setAutoDial] = useState(false);
  const [callNotes, setCallNotes] = useState('');
  const [callOutcome, setCallOutcome] = useState<string>('');

  const dialerButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#']
  ];

  const tabs = [
    { key: 'dialer', label: 'Dialer', icon: 'call-outline' },
    { key: 'lists', label: 'Lists', icon: 'list-outline' },
    { key: 'scripts', label: 'Scripts', icon: 'document-text-outline' },
    { key: 'history', label: 'History', icon: 'time-outline' }
  ];

  const outcomes = [
    { value: 'interested', label: 'Interested', color: '#10B981' },
    { value: 'not_interested', label: 'Not Interested', color: '#EF4444' },
    { value: 'follow_up', label: 'Follow Up', color: '#F59E0B' },
    { value: 'callback', label: 'Callback', color: '#3B82F6' },
    { value: 'sale', label: 'Sale', color: '#8B5CF6' },
    { value: 'wrong_number', label: 'Wrong Number', color: '#6B7280' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadCallScript();
  }, [selectedLead]);

  const loadData = async () => {
    try {
      await Promise.all([
        loadCallLists(),
        loadCallScripts(),
        loadCallHistory()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadCallLists = async () => {
    // Mock call lists
    const mockLists: CallList[] = [
      {
        id: '1',
        name: 'Today\'s Hot Leads',
        leads: [
          {
            id: '1',
            name: 'Rahul Sharma',
            phone: '+919876543210',
            status: 'new',
            priority: 'high',
            callAttempts: 0,
            notes: 'Interested in CRM solution'
          },
          {
            id: '2',
            name: 'Priya Patel',
            phone: '+919876543211',
            status: 'contacted',
            priority: 'medium',
            callAttempts: 2,
            lastCallDate: new Date(Date.now() - 86400000).toISOString(),
            notes: 'Asked for pricing'
          }
        ],
        filters: {
          priority: ['high', 'medium'],
          status: ['new', 'contacted']
        },
        assignedTo: user?.id,
        isActive: true,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '2',
        name: 'Follow Up Required',
        leads: [
          {
            id: '3',
            name: 'Amit Kumar',
            phone: '+919876543212',
            status: 'follow_up',
            priority: 'high',
            callAttempts: 3,
            lastCallDate: new Date(Date.now() - 172800000).toISOString(),
            notes: 'Promised to call back today'
          }
        ],
        filters: {
          status: ['follow_up']
        },
        isActive: true,
        createdAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
    setCallLists(mockLists);
  };

  const loadCallScripts = async () => {
    // Mock call scripts
    const mockScripts: CallScript[] = [
      {
        id: '1',
        name: 'New Lead Introduction',
        leadStatus: 'new',
        script: 'Hello [Name], this is [Your Name] from [Company]. I\'m calling because you showed interest in our CRM solution. Do you have a few minutes to discuss how we can help your business?',
        keyPoints: ['Introduction', 'Qualification', 'Appointment Setting'],
        objections: [
          {
            objection: 'Not interested',
            response: 'I understand. May I ask what your current process is for managing customer relationships?'
          },
          {
            objection: 'Too busy',
            response: 'I appreciate that. When would be a better time for a quick 5-minute conversation?'
          }
        ],
        isActive: true
      },
      {
        id: '2',
        name: 'Follow Up Call',
        leadStatus: 'follow_up',
        script: 'Hello [Name], this is [Your Name] following up on our previous conversation about [Previous Topic]. Have you had a chance to think about it?',
        keyPoints: ['Reference previous conversation', 'Address concerns', 'Next steps'],
        objections: [
          {
            objection: 'Still thinking',
            response: 'That\'s completely fine. What specific questions can I help answer to make your decision easier?'
          }
        ],
        isActive: true
      }
    ];
    setCallScripts(mockScripts);
  };

  const loadCallHistory = async () => {
    // Mock call history
    const mockHistory: CallActivity[] = [
      {
        id: '1',
        leadId: '1',
        leadName: 'Rahul Sharma',
        phone: '+919876543210',
        duration: 245,
        status: 'completed',
        notes: 'Good conversation, interested in demo',
        outcome: 'interested',
        nextFollowUp: new Date(Date.now() + 86400000).toISOString(),
        userId: user?.id || '1',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '2',
        leadId: '2',
        leadName: 'Priya Patel',
        phone: '+919876543211',
        duration: 180,
        status: 'completed',
        notes: 'Discussed pricing, needs enterprise plan',
        outcome: 'follow_up',
        nextFollowUp: new Date(Date.now() + 172800000).toISOString(),
        userId: user?.id || '1',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ];
    setCallHistory(mockHistory);
  };

  const handleNumberPress = (number: string) => {
    setPhoneNumber(prev => prev + number);
  };

  const handleDelete = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleCall = async (leadPhone?: string) => {
    const phoneToCall = leadPhone || phoneNumber;
    
    if (!phoneToCall.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    try {
      setIsDialing(true);
      
      // Log the call activity
      if (selectedLead) {
        await ApiService.createActivity({
          type: 'call',
          description: `Called ${selectedLead.name} at ${phoneToCall}`,
          lead_id: selectedLead.id,
          user_id: user?.id,
          organization_id: user?.organization_id,
          workspace_id: user?.workspace_id,
        });
      }

      // Make the actual phone call
      const phoneUrl = `tel:${phoneToCall}`;
      const supported = await Linking.canOpenURL(phoneUrl);
      
      if (supported) {
        await Linking.openURL(phoneUrl);
        
        // Navigate to call feedback screen
        router.push({
          pathname: '/dialer/feedback',
          params: { 
            phoneNumber: phoneToCall, 
            leadId: selectedLead?.id,
            leadName: selectedLead?.name 
          }
        } as any);
      } else {
        Alert.alert('Error', 'Phone calls are not supported on this device');
      }
    } catch (error) {
      console.error('Error making call:', error);
      Alert.alert('Error', 'Failed to make call');
    } finally {
      setIsDialing(false);
    }
  };

  const loadCallScript = async () => {
    if (selectedLead) {
      try {
        const script = callScripts.find(cs => cs.leadStatus === selectedLead.status);
        setCallScript(script ? script.script : getDefaultCallScript(selectedLead.status));
      } catch (error) {
        console.error('Error loading call script:', error);
      }
    }
  };

  const getDefaultCallScript = (status: string) => {
    switch (status) {
      case 'new':
        return 'Hello! This is a new lead call script. Introduce yourself and qualify the lead.';
      case 'follow_up':
        return 'Hello! This is a follow-up call. Reference previous conversation and move forward.';
      case 'qualified':
        return 'Hello! This is a qualified lead call. Focus on closing the deal.';
      default:
        return 'Hello! This is a general call script. Adapt based on the conversation.';
    }
  };

  const startAutoDialer = async () => {
    if (!selectedList || selectedList.leads.length === 0) {
      Alert.alert('Error', 'Please select a call list with leads');
      return;
    }

    setAutoDial(true);
    setCurrentLeadIndex(0);
    setSelectedLead(selectedList.leads[0]);
    setPhoneNumber(selectedList.leads[0].phone);
    Alert.alert('Auto Dialer Started', `Calling ${selectedList.leads[0].name}`);
  };

  const nextLead = () => {
    if (selectedList && currentLeadIndex < selectedList.leads.length - 1) {
      const nextIndex = currentLeadIndex + 1;
      setCurrentLeadIndex(nextIndex);
      setSelectedLead(selectedList.leads[nextIndex]);
      setPhoneNumber(selectedList.leads[nextIndex].phone);
      setCallNotes('');
      setCallOutcome('');
      
      if (autoDial) {
        // Auto-dial next lead after a short delay
        setTimeout(() => {
          handleCall(selectedList.leads[nextIndex].phone);
        }, 2000);
      }
    } else {
      Alert.alert('Complete', 'You have reached the end of the call list');
      setAutoDial(false);
    }
  };

  const saveCallFeedback = async () => {
    if (!selectedLead || !callOutcome) {
      Alert.alert('Error', 'Please select a call outcome');
      return;
    }

    try {
      const callActivity: CallActivity = {
        id: Date.now().toString(),
        leadId: selectedLead.id,
        leadName: selectedLead.name,
        phone: selectedLead.phone,
        status: 'completed',
        notes: callNotes,
        outcome: callOutcome as any,
        userId: user?.id || '1',
        timestamp: new Date().toISOString()
      };

      setCallHistory(prev => [callActivity, ...prev]);
      
      // Update lead call attempts
      if (selectedList) {
        const updatedLeads = selectedList.leads.map(lead =>
          lead.id === selectedLead.id
            ? { ...lead, callAttempts: lead.callAttempts + 1, lastCallDate: new Date().toISOString() }
            : lead
        );
        setSelectedList({ ...selectedList, leads: updatedLeads });
        setCallLists(prev => prev.map(list =>
          list.id === selectedList.id ? { ...list, leads: updatedLeads } : list
        ));
      }

      Alert.alert('Success', 'Call feedback saved');
      
      if (autoDial) {
        nextLead();
      } else {
        setCallNotes('');
        setCallOutcome('');
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
      Alert.alert('Error', 'Failed to save feedback');
    }
  };

  const renderDialerTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {selectedLead && (
        <Card style={[styles.leadInfoCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          <View style={styles.leadInfoHeader}>
            <View style={styles.leadInfo}>
              <Text style={[styles.leadName, { color: isDark ? colors.surface : colors.onBackground }]}>
                {selectedLead.name}
              </Text>
              <Text style={[styles.leadPhone, { color: colors.primary }]}>
                {selectedLead.phone}
              </Text>
              <Text style={[styles.leadStatus, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Status: {selectedLead.status} • Attempts: {selectedLead.callAttempts}
              </Text>
            </View>
            <View style={[styles.priorityBadge, { 
              backgroundColor: selectedLead.priority === 'urgent' ? '#DC262620' :
                               selectedLead.priority === 'high' ? '#F59E0B20' :
                               selectedLead.priority === 'medium' ? '#3B82F620' : '#10B98120'
            }]}>
              <Text style={[styles.priorityText, { 
                color: selectedLead.priority === 'urgent' ? '#DC2626' :
                       selectedLead.priority === 'high' ? '#F59E0B' :
                       selectedLead.priority === 'medium' ? '#3B82F6' : '#10B981'
              }]}>
                {selectedLead.priority.toUpperCase()}
              </Text>
            </View>
          </View>

          {selectedLead.notes && (
            <View style={styles.notesContainer}>
              <Text style={[styles.notesLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Notes:
              </Text>
              <Text style={[styles.notesText, { color: isDark ? colors.surface : colors.onBackground }]}>
                {selectedLead.notes}
              </Text>
            </View>
          )}

          {callScript && (
            <View style={styles.scriptContainer}>
              <Text style={[styles.scriptLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Call Script:
              </Text>
              <Text style={[styles.scriptText, { color: isDark ? colors.surface : colors.onBackground }]}>
                {callScript}
              </Text>
            </View>
          )}
        </Card>
      )}

      <Card style={[styles.dialerCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.phoneDisplay}>
          <TextInput
            style={[styles.phoneNumberInput, { 
              color: isDark ? colors.surface : colors.onBackground,
              fontSize: 24 
            }]}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter phone number"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            keyboardType="phone-pad"
            textAlign="center"
          />
        </View>

        <View style={styles.dialerButtons}>
          {dialerButtons.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.dialerRow}>
              {row.map((number) => (
                <TouchableOpacity
                  key={number}
                  style={[styles.dialerButton, { 
                    backgroundColor: isDark ? '#374151' : '#F9FAFB',
                    borderColor: isDark ? '#4B5563' : '#E5E7EB'
                  }]}
                  onPress={() => handleNumberPress(number)}
                >
                  <Text style={[styles.dialerButtonText, { 
                    color: isDark ? colors.surface : colors.onBackground 
                  }]}>
                    {number}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.dialerActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Ionicons name="backspace-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton, { backgroundColor: colors.primary }]}
            onPress={() => handleCall()}
            disabled={isDialing}
          >
            <Ionicons name="call-outline" size={32} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.contactsButton]}
            onPress={() => Alert.alert('Contacts', 'Contact picker will be implemented')}
          >
            <Ionicons name="people-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </Card>

      {(selectedLead || phoneNumber) && (
        <Card style={[styles.feedbackCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          <Text style={[styles.feedbackTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Call Feedback
          </Text>
          
          <TextInput
            style={[styles.notesInput, { 
              backgroundColor: isDark ? '#374151' : '#F9FAFB',
              color: isDark ? colors.surface : colors.onBackground,
              borderColor: isDark ? '#4B5563' : '#E5E7EB'
            }]}
            value={callNotes}
            onChangeText={setCallNotes}
            placeholder="Add call notes..."
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            multiline
            numberOfLines={3}
          />

          <Text style={[styles.outcomeLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Call Outcome:
          </Text>
          <View style={styles.outcomesContainer}>
            {outcomes.map((outcome) => (
              <TouchableOpacity
                key={outcome.value}
                style={[
                  styles.outcomeButton,
                  callOutcome === outcome.value && styles.selectedOutcome,
                  { 
                    backgroundColor: callOutcome === outcome.value ? outcome.color + '20' : (isDark ? '#374151' : '#F9FAFB'),
                    borderColor: callOutcome === outcome.value ? outcome.color : (isDark ? '#4B5563' : '#E5E7EB')
                  }
                ]}
                onPress={() => setCallOutcome(outcome.value)}
              >
                <Text style={[
                  styles.outcomeText,
                  callOutcome === outcome.value && styles.selectedOutcomeText,
                  { color: callOutcome === outcome.value ? outcome.color : (isDark ? colors.surface : colors.onBackground) }
                ]}>
                  {outcome.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.feedbackActions}>
            {selectedList && (
              <Button
                title={autoDial ? "Stop Auto Dial" : "Start Auto Dial"}
                onPress={autoDial ? () => setAutoDial(false) : startAutoDialer}
                style={styles.autoDialButton}
              />
            )}
            <Button
              title="Save Feedback"
              onPress={saveCallFeedback}
              style={styles.saveButton}
            />
            {selectedList && (
              <Button
                title="Next Lead"
                onPress={nextLead}
                style={styles.nextButton}
              />
            )}
          </View>
        </Card>
      )}
    </ScrollView>
  );

  const renderListsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Call Lists ({callLists.length})
        </Text>
        <Button
          title="Create List"
          onPress={() => router.push('/dialer/lists/create' as any)}
          style={styles.createButton}
        />
      </View>

      <FlatList
        data={callLists}
        renderItem={({ item }) => (
          <Card style={[styles.listCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.listHeader}>
              <View style={styles.listInfo}>
                <Text style={[styles.listName, { color: isDark ? colors.surface : colors.onBackground }]}>
                  {item.name}
                </Text>
                <Text style={[styles.listMeta, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  {item.leads.length} leads • Created {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.listActionButton, { backgroundColor: item.isActive ? colors.primary : '#E5E7EB' }]}
                onPress={() => {
                  setSelectedList(item);
                  setActiveTab('dialer');
                }}
              >
                <Text style={[styles.listActionText, { color: item.isActive ? '#FFFFFF' : '#6B7280' }]}>
                  Start Calling
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
                  {item.leads.filter(lead => lead.priority === 'urgent').length}
                </Text>
                <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Urgent</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
                  {item.leads.filter(lead => lead.priority === 'high').length}
                </Text>
                <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>High</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
                  {item.leads.filter(lead => lead.status === 'new').length}
                </Text>
                <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>New</Text>
              </View>
            </View>
          </Card>
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderScriptsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Call Scripts ({callScripts.length})
        </Text>
        <Button
          title="Create Script"
          onPress={() => router.push('/dialer/scripts/create' as any)}
          style={styles.createButton}
        />
      </View>

      <FlatList
        data={callScripts}
        renderItem={({ item }) => (
          <Card style={[styles.scriptCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.scriptHeader}>
              <Text style={[styles.scriptName, { color: isDark ? colors.surface : colors.onBackground }]}>
                {item.name}
              </Text>
              <View style={[styles.statusBadge, { 
                backgroundColor: item.isActive ? '#10B98120' : '#EF444420'
              }]}>
                <Text style={[styles.statusText, { 
                  color: item.isActive ? '#10B981' : '#EF4444'
                }]}>
                  {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                </Text>
              </View>
            </View>
            
            <Text style={[styles.scriptStatus, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              For: {item.leadStatus}
            </Text>
            
            <Text style={[styles.scriptPreview, { color: isDark ? colors.surface : colors.onBackground }]} numberOfLines={3}>
              {item.script}
            </Text>

            <View style={styles.scriptKeyPoints}>
              <Text style={[styles.keyPointsLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Key Points:
              </Text>
              {item.keyPoints.map((point, index) => (
                <Text key={index} style={[styles.keyPoint, { color: isDark ? colors.surface : colors.onBackground }]}>
                  • {point}
                </Text>
              ))}
            </View>
          </Card>
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderHistoryTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Call History ({callHistory.length})
        </Text>
        <Button
          title="Export"
          onPress={() => Alert.alert('Export', 'Export functionality will be implemented')}
          style={styles.exportButton}
        />
      </View>

      <FlatList
        data={callHistory}
        renderItem={({ item }) => (
          <Card style={[styles.historyCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.historyHeader}>
              <View style={styles.historyInfo}>
                <Text style={[styles.historyLeadName, { color: isDark ? colors.surface : colors.onBackground }]}>
                  {item.leadName}
                </Text>
                <Text style={[styles.historyPhone, { color: colors.primary }]}>
                  {item.phone}
                </Text>
                <Text style={[styles.historyTime, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  {new Date(item.timestamp).toLocaleString()}
                  {item.duration && ` • ${Math.floor(item.duration / 60)}m ${item.duration % 60}s`}
                </Text>
              </View>
              <View style={[styles.outcomeBadge, { 
                backgroundColor: outcomes.find(o => o.value === item.outcome)?.color + '20' || '#6B728020'
              }]}>
                <Text style={[styles.outcomeBadgeText, { 
                  color: outcomes.find(o => o.value === item.outcome)?.color || '#6B7280'
                }]}>
                  {item.outcome.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>

            {item.notes && (
              <Text style={[styles.historyNotes, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Notes: {item.notes}
              </Text>
            )}

            {item.nextFollowUp && (
              <Text style={[styles.followUpText, { color: colors.primary }]}>
                Follow up: {new Date(item.nextFollowUp).toLocaleDateString()}
              </Text>
            )}
          </Card>
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dialer':
        return renderDialerTab();
      case 'lists':
        return renderListsTab();
      case 'scripts':
        return renderScriptsTab();
      case 'history':
        return renderHistoryTab();
      default:
        return renderDialerTab();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          1-Click Dialer
        </Text>
        {autoDial && (
          <View style={styles.autoDialIndicator}>
            <Ionicons name="play-circle" size={16} color="#10B981" />
            <Text style={styles.autoDialText}>Auto Dial Active</Text>
          </View>
        )}
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
  autoDialIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B98120',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  autoDialText: {
    fontSize: 12,
    fontFamily: fonts.nohemi.medium,
    color: '#10B981',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
  },
  createButton: {
    paddingHorizontal: 16,
  },
  exportButton: {
    paddingHorizontal: 16,
  },
  leadInfoCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  leadInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leadInfo: {
    flex: 1,
  },
  leadName: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 4,
  },
  leadPhone: {
    fontSize: 16,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 4,
  },
  leadStatus: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: fonts.nohemi.bold,
    textTransform: 'uppercase',
  },
  notesContainer: {
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  scriptContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  scriptLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 4,
  },
  scriptText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  dialerCard: {
    margin: 20,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  phoneDisplay: {
    marginBottom: 20,
  },
  phoneNumberInput: {
    fontFamily: fonts.nohemi.medium,
  },
  dialerButtons: {
    marginBottom: 20,
  },
  dialerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dialerButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dialerButtonText: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
  },
  dialerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  callButton: {
    width: 64,
    height: 64,
  },
  contactsButton: {
    backgroundColor: colors.primary + '10',
  },
  feedbackCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  feedbackTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 12,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 16,
    minHeight: 80,
  },
  outcomeLabel: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 8,
  },
  outcomesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  outcomeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  selectedOutcome: {
    borderWidth: 2,
  },
  outcomeText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  selectedOutcomeText: {
    fontFamily: fonts.nohemi.semiBold,
  },
  feedbackActions: {
    gap: 8,
  },
  autoDialButton: {
    backgroundColor: '#10B981',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  nextButton: {
    backgroundColor: '#3B82F6',
  },
  listCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  listMeta: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  listActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  listActionText: {
    fontSize: 12,
    fontFamily: fonts.nohemi.medium,
  },
  listStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  scriptCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  scriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scriptName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
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
  scriptStatus: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 8,
  },
  scriptPreview: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 12,
  },
  scriptKeyPoints: {
    marginTop: 8,
  },
  keyPointsLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 4,
  },
  keyPoint: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 2,
  },
  historyCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  historyInfo: {
    flex: 1,
  },
  historyLeadName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  historyPhone: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  outcomeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  outcomeBadgeText: {
    fontSize: 10,
    fontFamily: fonts.nohemi.bold,
    textTransform: 'uppercase',
  },
  historyNotes: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 8,
  },
  followUpText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
});
