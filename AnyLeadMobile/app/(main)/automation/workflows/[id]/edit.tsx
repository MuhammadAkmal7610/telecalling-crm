import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface WorkflowTrigger {
  type: 'lead_created' | 'lead_status_changed' | 'task_completed' | 'date_based';
  conditions: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: string;
  }[];
}

interface WorkflowAction {
  type: 'assign_lead' | 'send_email' | 'create_task' | 'update_status' | 'notify_user';
  parameters: Record<string, any>;
}

export default function EditWorkflowScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState<WorkflowTrigger['type']>('lead_created');
  const [conditions, setConditions] = useState<WorkflowTrigger['conditions']>([]);
  const [actions, setActions] = useState<WorkflowAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    loadWorkflowDetails();
  }, [id]);

  const loadWorkflowDetails = async () => {
    try {
      setLoading(true);
      // Simulate API fetch for workflow details
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockWorkflow = {
        name: id === '1' ? 'New Lead Assignment' : id === '2' ? 'Follow-up Reminder' : 'Welcome Email',
        description: 'Automated workflow execution flow',
        triggerType: (id === '1' ? 'lead_created' : id === '2' ? 'lead_status_changed' : 'task_completed') as any,
        conditions: [] as any[],
        actions: [
          { type: 'assign_lead', parameters: { criteria: 'region' } }
        ] as any[]
      };

      setWorkflowName(mockWorkflow.name);
      setWorkflowDescription(mockWorkflow.description);
      setSelectedTrigger(mockWorkflow.triggerType);
      setConditions(mockWorkflow.conditions);
      setActions(mockWorkflow.actions);
    } catch (error) {
      console.error('Error loading workflow:', error);
      Alert.alert('Error', 'Failed to load workflow details');
    } finally {
      setLoading(false);
    }
  };

  const triggerTypes = [
    { 
      value: 'lead_created', 
      label: 'Lead Created', 
      description: 'When a new lead is added',
      icon: 'person-add-outline' 
    },
    { 
      value: 'lead_status_changed', 
      label: 'Lead Status Changed', 
      description: 'When lead status is updated',
      icon: 'swap-horizontal-outline' 
    },
    { 
      value: 'task_completed', 
      label: 'Task Completed', 
      description: 'When a task is marked complete',
      icon: 'checkbox-outline' 
    }
  ];

  const actionTypes = [
    { 
      value: 'assign_lead', 
      label: 'Assign Lead', 
      description: 'Assign lead to a team member',
      icon: 'person-outline' 
    },
    { 
      value: 'send_email', 
      label: 'Send Email', 
      description: 'Send automated email',
      icon: 'mail-outline' 
    },
    { 
      value: 'create_task', 
      label: 'Create Task', 
      description: 'Create a new task',
      icon: 'add-circle-outline' 
    }
  ];

  const addCondition = () => {
    setConditions([...conditions, { field: '', operator: 'equals', value: '' }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const addAction = () => {
    setActions([...actions, { type: 'create_task', parameters: {} }]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleUpdateWorkflow = async () => {
    if (!workflowName.trim()) {
      Alert.alert('Error', 'Please enter a workflow name');
      return;
    }

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Workflow updated successfully', [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]);
    } catch (error) {
      console.error('Error updating workflow:', error);
      Alert.alert('Error', 'Failed to update workflow');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: isDark ? '#121212' : colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: isDark ? colors.surface : colors.onBackground }]}>
          Loading workflow details...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.surface : colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Edit Workflow
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Workflow Info */}
        <Card style={styles.infoCard}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
              Workflow Name
            </Text>
            <TextInput
              style={[styles.textInput, { 
                borderColor: isDark ? '#374151' : '#E5E7EB',
                color: isDark ? colors.surface : colors.onBackground,
                backgroundColor: isDark ? '#374151' : '#F9FAFB'
              }]}
              value={workflowName}
              onChangeText={setWorkflowName}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
              Description
            </Text>
            <TextInput
              style={[styles.textArea, { 
                borderColor: isDark ? '#374151' : '#E5E7EB',
                color: isDark ? colors.surface : colors.onBackground,
                backgroundColor: isDark ? '#374151' : '#F9FAFB'
              }]}
              multiline
              numberOfLines={3}
              value={workflowDescription}
              onChangeText={setWorkflowDescription}
            />
          </View>
        </Card>

        {/* Step Trigger */}
        <View style={styles.stepContent}>
          <Text style={[styles.stepTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Trigger & Actions
          </Text>

          {triggerTypes.map((trigger) => (
            <TouchableOpacity
              key={trigger.value}
              style={[
                styles.triggerOption,
                selectedTrigger === trigger.value && styles.selectedTriggerOption,
                { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }
              ]}
              onPress={() => setSelectedTrigger(trigger.value as any)}
            >
              <View style={[styles.triggerIcon, { backgroundColor: colors.primary + '10' }]}>
                <Ionicons name={trigger.icon as any} size={24} color={colors.primary} />
              </View>
              <View style={styles.triggerInfo}>
                <Text style={[styles.triggerName, { color: isDark ? colors.surface : colors.onBackground }]}>
                  {trigger.label}
                </Text>
              </View>
              <View style={[
                styles.radioButton,
                selectedTrigger === trigger.value && styles.selectedRadioButton
              ]}>
                {selectedTrigger === trigger.value && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Save Action */}
      <View style={styles.navigationButtons}>
        <Button
          title="Save Changes"
          onPress={handleUpdateWorkflow}
          loading={saving}
          style={styles.navButton}
        />
        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="secondary"
          style={styles.navButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: fonts.satoshi.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.nohemi.bold,
  },
  placeholder: {
    width: 24,
  },
  infoCard: {
    margin: 20,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 16,
  },
  triggerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  selectedTriggerOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '5',
  },
  triggerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  triggerInfo: {
    flex: 1,
  },
  triggerName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadioButton: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  navigationButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  navButton: {
    flex: 1,
  },
});
