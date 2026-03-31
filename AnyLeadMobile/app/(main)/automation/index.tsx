import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'lead_created' | 'lead_status_changed' | 'task_completed' | 'date_based';
    conditions: any[];
  };
  actions: {
    type: 'assign_lead' | 'send_email' | 'create_task' | 'update_status' | 'notify_user';
    parameters: any;
  }[];
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  relatedLeadId?: string;
  relatedLeadName?: string;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
}

export default function AutomationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'workflows' | 'tasks' | 'schedules'>('workflows');

  const tabs = [
    { key: 'workflows', label: 'Workflows', icon: 'git-branch-outline' },
    { key: 'tasks', label: 'Tasks', icon: 'checkbox-outline' },
    { key: 'schedules', label: 'Schedules', icon: 'calendar-outline' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadWorkflows(),
        loadTasks()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflows = async () => {
    // Mock workflows data
    const mockWorkflows: Workflow[] = [
      {
        id: '1',
        name: 'New Lead Assignment',
        description: 'Automatically assign new leads to sales team based on region',
        trigger: {
          type: 'lead_created',
          conditions: []
        },
        actions: [
          {
            type: 'assign_lead',
            parameters: { userId: 'auto', criteria: 'region' }
          }
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        triggerCount: 45
      },
      {
        id: '2',
        name: 'Follow-up Reminder',
        description: 'Create follow-up task when lead status changes to contacted',
        trigger: {
          type: 'lead_status_changed',
          conditions: [{ field: 'status', operator: 'equals', value: 'contacted' }]
        },
        actions: [
          {
            type: 'create_task',
            parameters: { title: 'Follow up with lead', dueInDays: 2 }
          }
        ],
        isActive: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        triggerCount: 23
      },
      {
        id: '3',
        name: 'Welcome Email',
        description: 'Send welcome email when lead is converted',
        trigger: {
          type: 'lead_status_changed',
          conditions: [{ field: 'status', operator: 'equals', value: 'converted' }]
        },
        actions: [
          {
            type: 'send_email',
            parameters: { template: 'welcome_email' }
          }
        ],
        isActive: false,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        triggerCount: 12
      }
    ];
    setWorkflows(mockWorkflows);
  };

  const loadTasks = async () => {
    // Mock tasks data
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Follow up with John Doe',
        description: 'John showed interest in premium package, need to schedule demo',
        assignedTo: user?.id || '1',
        assignedToName: user?.name || 'You',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        priority: 'high',
        status: 'pending',
        relatedLeadId: 'lead1',
        relatedLeadName: 'John Doe',
        createdBy: 'system',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Send proposal to Tech Solutions',
        description: 'Prepare and send detailed proposal for enterprise package',
        assignedTo: user?.id || '1',
        assignedToName: user?.name || 'You',
        dueDate: new Date(Date.now() + 172800000).toISOString(),
        priority: 'medium',
        status: 'in_progress',
        relatedLeadId: 'lead2',
        relatedLeadName: 'Tech Solutions',
        createdBy: 'user',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '3',
        title: 'Monthly report preparation',
        description: 'Prepare monthly sales performance report',
        assignedTo: user?.id || '1',
        assignedToName: user?.name || 'You',
        dueDate: new Date(Date.now() + 604800000).toISOString(),
        priority: 'low',
        status: 'pending',
        createdBy: 'system',
        createdAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
    setTasks(mockTasks);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleWorkflow = async (workflowId: string) => {
    try {
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId ? { ...w, isActive: !w.isActive } : w
      ));
      Alert.alert('Success', 'Workflow status updated');
    } catch (error) {
      console.error('Error toggling workflow:', error);
      Alert.alert('Error', 'Failed to update workflow');
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    Alert.alert(
      'Delete Workflow',
      'Are you sure you want to delete this workflow?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setWorkflows(prev => prev.filter(w => w.id !== workflowId));
              Alert.alert('Success', 'Workflow deleted');
            } catch (error) {
              console.error('Error deleting workflow:', error);
              Alert.alert('Error', 'Failed to delete workflow');
            }
          }
        }
      ]
    );
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { 
          ...t, 
          status, 
          completedAt: status === 'completed' ? new Date().toISOString() : undefined 
        } : t
      ));
      Alert.alert('Success', 'Task status updated');
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'lead_created': return 'person-add-outline';
      case 'lead_status_changed': return 'swap-horizontal-outline';
      case 'task_completed': return 'checkbox-outline';
      case 'date_based': return 'calendar-outline';
      default: return 'flash-outline';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'assign_lead': return 'person-outline';
      case 'send_email': return 'mail-outline';
      case 'create_task': return 'add-circle-outline';
      case 'update_status': return 'refresh-outline';
      case 'notify_user': return 'notifications-outline';
      default: return 'cog-outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#DC2626';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in_progress': return '#3B82F6';
      case 'cancelled': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const renderWorkflowItem = ({ item }: { item: Workflow }) => (
    <Card style={[styles.workflowCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.workflowHeader}>
        <View style={styles.workflowInfo}>
          <Text style={[styles.workflowName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.name}
          </Text>
          <Text style={[styles.workflowDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {item.description}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: item.isActive ? colors.primary : '#E5E7EB' }]}
          onPress={() => toggleWorkflow(item.id)}
        >
          <Text style={[styles.toggleText, { color: item.isActive ? '#FFFFFF' : '#6B7280' }]}>
            {item.isActive ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.workflowTrigger}>
        <Ionicons 
          name={getTriggerIcon(item.trigger.type) as any} 
          size={16} 
          color={colors.primary} 
        />
        <Text style={[styles.triggerText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Trigger: {item.trigger.type.replace('_', ' ')}
        </Text>
      </View>

      <View style={styles.workflowActions}>
        {item.actions.slice(0, 2).map((action, index) => (
          <View key={index} style={styles.actionItem}>
            <Ionicons 
              name={getActionIcon(action.type) as any} 
              size={14} 
              color={isDark ? '#9CA3AF' : '#6B7280'} 
            />
            <Text style={[styles.actionText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {action.type.replace('_', ' ')}
            </Text>
          </View>
        ))}
        {item.actions.length > 2 && (
          <Text style={[styles.moreActionsText, { color: colors.primary }]}>
            +{item.actions.length - 2} more
          </Text>
        )}
      </View>

      <View style={styles.workflowFooter}>
        <Text style={[styles.workflowStats, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
          Triggered {item.triggerCount} times
        </Text>
        <View style={styles.workflowActionsButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/automation/workflows/${item.id}/edit` as any)}
          >
            <Ionicons name="create-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteWorkflow(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const renderTaskItem = ({ item }: { item: Task }) => (
    <Card style={[styles.taskCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Text style={[styles.taskTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.title}
          </Text>
          <Text style={[styles.taskDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {item.description}
          </Text>
          {item.relatedLeadName && (
            <Text style={[styles.relatedLead, { color: colors.primary }]}>
              Lead: {item.relatedLeadName}
            </Text>
          )}
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
          <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
            {(item.priority || 'Medium').toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.taskFooter}>
        <View style={styles.taskMeta}>
          <View style={styles.taskMetaItem}>
            <Ionicons name="calendar-outline" size={14} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.taskMetaText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Due {new Date(item.dueDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.taskMetaItem}>
            <Ionicons name="person-outline" size={14} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.taskMetaText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {item.assignedToName}
            </Text>
          </View>
        </View>
        
        <View style={styles.taskStatus}>
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: getStatusColor(item.status) + '20' }]}
            onPress={() => {
              const statuses: Task['status'][] = ['pending', 'in_progress', 'completed'];
              const currentIndex = statuses.indexOf(item.status);
              const nextStatus = statuses[(currentIndex + 1) % statuses.length];
              updateTaskStatus(item.id, nextStatus);
            }}
          >
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const renderWorkflowsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Active Workflows
        </Text>
        <Button
          title="Create Workflow"
          onPress={() => router.push('/automation/workflows/create' as any)}
          style={styles.createButton}
        />
      </View>
      
      <FlatList
        data={workflows}
        renderItem={renderWorkflowItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="git-branch-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No workflows created
            </Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              Create your first automation workflow
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderTasksTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          My Tasks
        </Text>
        <Button
          title="Create Task"
          onPress={() => router.push('/automation/tasks/create' as any)}
          style={styles.createButton}
        />
      </View>
      
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkbox-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No tasks assigned
            </Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              Your tasks will appear here
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderSchedulesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Scheduled Activities
        </Text>
        <Button
          title="Create Schedule"
          onPress={() => router.push('/automation/schedules/create' as any)}
          style={styles.createButton}
        />
      </View>
      
      <View style={styles.emptyState}>
        <Ionicons name="calendar-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
        <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          No schedules created
        </Text>
        <Text style={[styles.emptySubtext, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
          Schedule recurring activities and reminders
        </Text>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'workflows':
        return renderWorkflowsTab();
      case 'tasks':
        return renderTasksTab();
      case 'schedules':
        return renderSchedulesTab();
      default:
        return renderWorkflowsTab();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Automation & Workflows
        </Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/automation/settings' as any)}
        >
          <Ionicons name="cog-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
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
  workflowCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  workflowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workflowInfo: {
    flex: 1,
  },
  workflowName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  workflowDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 48,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 12,
    fontFamily: fonts.nohemi.bold,
  },
  workflowTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  triggerText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    marginLeft: 6,
  },
  workflowActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  moreActionsText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  workflowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  workflowStats: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  workflowActionsButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  taskCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 4,
  },
  relatedLead: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: fonts.nohemi.bold,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskMeta: {
    flex: 1,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  taskMetaText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  taskStatus: {
    marginLeft: 12,
  },
  statusButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontFamily: fonts.nohemi.medium,
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fonts.satoshi.medium,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    textAlign: 'center',
  },
});
