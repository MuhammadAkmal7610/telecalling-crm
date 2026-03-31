import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
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

export default function CreateWorkflowScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState<WorkflowTrigger['type']>('lead_created');
  const [conditions, setConditions] = useState<WorkflowTrigger['conditions']>([]);
  const [actions, setActions] = useState<WorkflowAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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
    },
    { 
      value: 'date_based', 
      label: 'Date Based', 
      description: 'On specific dates or schedules',
      icon: 'calendar-outline' 
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
    },
    { 
      value: 'update_status', 
      label: 'Update Status', 
      description: 'Update lead or task status',
      icon: 'refresh-outline' 
    },
    { 
      value: 'notify_user', 
      label: 'Notify User', 
      description: 'Send notification to user',
      icon: 'notifications-outline' 
    }
  ];

  const addCondition = () => {
    const newCondition = {
      field: '',
      operator: 'equals' as const,
      value: ''
    };
    setConditions([...conditions, newCondition]);
  };

  const updateCondition = (index: number, field: string, value: any) => {
    const updatedConditions = [...conditions];
    updatedConditions[index] = { ...updatedConditions[index], [field]: value };
    setConditions(updatedConditions);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const addAction = () => {
    const newAction: WorkflowAction = {
      type: 'create_task',
      parameters: {}
    };
    setActions([...actions, newAction]);
  };

  const updateAction = (index: number, field: string, value: any) => {
    const updatedActions = [...actions];
    if (field === 'type') {
      updatedActions[index] = { type: value, parameters: {} };
    } else {
      updatedActions[index].parameters[field] = value;
    }
    setActions(updatedActions);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const saveWorkflow = async () => {
    if (!workflowName.trim()) {
      Alert.alert('Error', 'Please enter a workflow name');
      return;
    }

    if (actions.length === 0) {
      Alert.alert('Error', 'Please add at least one action');
      return;
    }

    setLoading(true);
    try {
      // Create workflow object
      const workflow = {
        name: workflowName,
        description: workflowDescription,
        trigger: {
          type: selectedTrigger,
          conditions
        },
        actions,
        isActive: true,
        createdBy: user?.id,
        organizationId: user?.organization_id,
        workspaceId: user?.workspace_id
      };

      // Save to API (mock for now)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success', 'Workflow created successfully', [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]);
    } catch (error) {
      console.error('Error saving workflow:', error);
      Alert.alert('Error', 'Failed to save workflow');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            currentStep >= step && styles.activeStepCircle,
            { backgroundColor: currentStep >= step ? colors.primary : (isDark ? '#374151' : '#E5E7EB') }
          ]}>
            <Text style={[
              styles.stepNumber,
              currentStep >= step && styles.activeStepNumber
            ]}>
              {step}
            </Text>
          </View>
          <Text style={[
            styles.stepLabel,
            currentStep >= step && styles.activeStepLabel
          ]}>
            {step === 1 ? 'Trigger' : step === 2 ? 'Conditions' : 'Actions'}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderTriggerStep = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
        Choose Trigger
      </Text>
      <Text style={[styles.stepDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
        Select what event will start this workflow
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
            <Text style={[styles.triggerDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {trigger.description}
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
  );

  const renderConditionsStep = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
        Set Conditions (Optional)
      </Text>
      <Text style={[styles.stepDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
        Specify when this workflow should run
      </Text>

      {conditions.map((condition, index) => (
        <Card key={index} style={styles.conditionCard}>
          <View style={styles.conditionHeader}>
            <Text style={[styles.conditionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              Condition {index + 1}
            </Text>
            <TouchableOpacity onPress={() => removeCondition(index)}>
              <Ionicons name="close-circle" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.conditionFields}>
            <View style={styles.fieldRow}>
              <Text style={[styles.fieldLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Field
              </Text>
              <TouchableOpacity
                style={[styles.fieldInput, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}
                onPress={() => Alert.alert('Field', 'Field selector will be implemented')}
              >
                <Text style={[styles.fieldValue, { color: isDark ? colors.surface : colors.onBackground }]}>
                  {condition.field || 'Select field'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={isDark ? '#6B7280' : '#9CA3AF'} />
              </TouchableOpacity>
            </View>

            <View style={styles.fieldRow}>
              <Text style={[styles.fieldLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Operator
              </Text>
              <TouchableOpacity
                style={[styles.fieldInput, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}
                onPress={() => Alert.alert('Operator', 'Operator selector will be implemented')}
              >
                <Text style={[styles.fieldValue, { color: isDark ? colors.surface : colors.onBackground }]}>
                  {condition.operator}
                </Text>
                <Ionicons name="chevron-down" size={16} color={isDark ? '#6B7280' : '#9CA3AF'} />
              </TouchableOpacity>
            </View>

            <View style={styles.fieldRow}>
              <Text style={[styles.fieldLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Value
              </Text>
              <TouchableOpacity
                style={[styles.fieldInput, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}
                onPress={() => Alert.alert('Value', 'Value input will be implemented')}
              >
                <Text style={[styles.fieldValue, { color: isDark ? colors.surface : colors.onBackground }]}>
                  {condition.value || 'Enter value'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={addCondition}>
        <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
        <Text style={[styles.addButtonText, { color: colors.primary }]}>
          Add Condition
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderActionsStep = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
        Configure Actions
      </Text>
      <Text style={[styles.stepDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
        What should happen when this workflow runs
      </Text>

      {actions.map((action, index) => (
        <Card key={index} style={styles.actionCard}>
          <View style={styles.actionHeader}>
            <Text style={[styles.actionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              Action {index + 1}
            </Text>
            <TouchableOpacity onPress={() => removeAction(index)}>
              <Ionicons name="close-circle" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <View style={styles.actionFields}>
            <View style={styles.fieldRow}>
              <Text style={[styles.fieldLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Action Type
              </Text>
              <TouchableOpacity
                style={[styles.fieldInput, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}
                onPress={() => {
                  Alert.alert(
                    'Select Action',
                    'Choose an action type',
                    actionTypes.map(action => ({
                      text: action.label,
                      onPress: () => updateAction(index, 'type', action.value)
                    }))
                  );
                }}
              >
                <Text style={[styles.fieldValue, { color: isDark ? colors.surface : colors.onBackground }]}>
                  {actionTypes.find(a => a.value === action.type)?.label || 'Select action'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={isDark ? '#6B7280' : '#9CA3AF'} />
              </TouchableOpacity>
            </View>

            {action.type === 'create_task' && (
              <>
                <View style={styles.fieldRow}>
                  <Text style={[styles.fieldLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    Task Title
                  </Text>
                  <TouchableOpacity
                    style={[styles.fieldInput, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}
                    onPress={() => Alert.alert('Task Title', 'Task title input will be implemented')}
                  >
                    <Text style={[styles.fieldValue, { color: isDark ? colors.surface : colors.onBackground }]}>
                      {action.parameters.title || 'Enter task title'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={[styles.fieldLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    Assign To
                  </Text>
                  <TouchableOpacity
                    style={[styles.fieldInput, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}
                    onPress={() => Alert.alert('Assign To', 'User selector will be implemented')}
                  >
                    <Text style={[styles.fieldValue, { color: isDark ? colors.surface : colors.onBackground }]}>
                      {action.parameters.assignTo || 'Select user'}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color={isDark ? '#6B7280' : '#9CA3AF'} />
                  </TouchableOpacity>
                </View>
              </>
            )}

            {action.type === 'send_email' && (
              <>
                <View style={styles.fieldRow}>
                  <Text style={[styles.fieldLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    Email Template
                  </Text>
                  <TouchableOpacity
                    style={[styles.fieldInput, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}
                    onPress={() => Alert.alert('Template', 'Template selector will be implemented')}
                  >
                    <Text style={[styles.fieldValue, { color: isDark ? colors.surface : colors.onBackground }]}>
                      {action.parameters.template || 'Select template'}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color={isDark ? '#6B7280' : '#9CA3AF'} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Card>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={addAction}>
        <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
        <Text style={[styles.addButtonText, { color: colors.primary }]}>
          Add Action
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderTriggerStep();
      case 2:
        return renderConditionsStep();
      case 3:
        return renderActionsStep();
      default:
        return renderTriggerStep();
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
          Create Workflow
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Workflow Info */}
      <Card style={styles.infoCard}>
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
            Workflow Name
          </Text>
          <View style={[styles.textInput, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
            <Text style={[styles.textInputContent, { color: isDark ? colors.surface : colors.onBackground }]}>
              {workflowName || 'Enter workflow name'}
            </Text>
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
            Description
          </Text>
          <View style={[styles.textArea, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
            <Text style={[styles.textAreaContent, { color: isDark ? colors.surface : colors.onBackground }]}>
              {workflowDescription || 'Describe what this workflow does'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        {currentStep > 1 && (
          <Button
            title="Previous"
            onPress={prevStep}
            variant="secondary"
            style={styles.navButton}
          />
        )}
        <View style={styles.navButtonSpacer} />
        {currentStep < 3 ? (
          <Button
            title="Next"
            onPress={nextStep}
            style={styles.navButton}
          />
        ) : (
          <Button
            title="Create Workflow"
            onPress={saveWorkflow}
            loading={loading}
            style={styles.navButton}
          />
        )}
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
  textInputContent: {
    fontSize: 16,
    fontFamily: fonts.satoshi.regular,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
  },
  textAreaContent: {
    fontSize: 16,
    fontFamily: fonts.satoshi.regular,
    minHeight: 60,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginVertical: 20,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activeStepCircle: {
    backgroundColor: colors.primary,
  },
  stepNumber: {
    fontSize: 14,
    fontFamily: fonts.nohemi.bold,
    color: '#FFFFFF',
  },
  activeStepNumber: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    color: '#6B7280',
    textAlign: 'center',
  },
  activeStepLabel: {
    color: colors.primary,
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
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 20,
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
    marginBottom: 4,
  },
  triggerDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
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
  conditionCard: {
    padding: 16,
    marginBottom: 12,
  },
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  conditionTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
  },
  conditionFields: {
    gap: 12,
  },
  actionCard: {
    padding: 16,
    marginBottom: 12,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
  },
  actionFields: {
    gap: 12,
  },
  fieldRow: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 6,
  },
  fieldInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  fieldValue: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary + '5',
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
  },
  navigationButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  navButton: {
    flex: 1,
  },
  navButtonSpacer: {
    flex: 1,
  },
});
