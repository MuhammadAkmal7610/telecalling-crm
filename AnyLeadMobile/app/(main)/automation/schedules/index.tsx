import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '../../../src/components/common/Card';
import { colors, fonts } from '../../../src/theme/theme';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface Schedule {
  id: string;
  name: string;
  description: string;
  type: 'recurring' | 'one_time' | 'triggered';
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  action: {
    type: 'send_email' | 'create_task' | 'generate_report' | 'notify_team' | 'cleanup_data';
    parameters: Record<string, any>;
  };
  timing: {
    startDate: string;
    endDate?: string;
    time: string;
    timezone: string;
    daysOfWeek?: number[];
    dayOfMonth?: number;
  };
  isActive: boolean;
  nextRun: string;
  lastRun?: string;
  runCount: number;
  createdBy: string;
  createdAt: string;
}

interface ScheduledActivity {
  id: string;
  title: string;
  description: string;
  scheduledTime: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  scheduleId: string;
  scheduleName: string;
  result?: any;
  error?: string;
}

export default function SchedulingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [upcomingActivities, setUpcomingActivities] = useState<ScheduledActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedules' | 'activities' | 'calendar'>('schedules');

  const tabs = [
    { key: 'schedules', label: 'Schedules', icon: 'time-outline' },
    { key: 'activities', label: 'Activities', icon: 'list-outline' },
    { key: 'calendar', label: 'Calendar', icon: 'calendar-outline' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSchedules(),
        loadUpcomingActivities()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    // Mock schedules data
    const mockSchedules: Schedule[] = [
      {
        id: '1',
        name: 'Daily Sales Report',
        description: 'Generate and email daily sales performance report',
        type: 'recurring',
        frequency: 'daily',
        action: {
          type: 'generate_report',
          parameters: { reportType: 'daily_sales', recipients: ['manager@company.com'] }
        },
        timing: {
          startDate: new Date().toISOString(),
          time: '09:00',
          timezone: 'UTC',
          daysOfWeek: [1, 2, 3, 4, 5] // Monday to Friday
        },
        isActive: true,
        nextRun: new Date(Date.now() + 3600000).toISOString(),
        runCount: 45,
        createdBy: user?.id || '1',
        createdAt: new Date(Date.now() - 2592000000).toISOString()
      },
      {
        id: '2',
        name: 'Weekly Follow-up Reminders',
        description: 'Create follow-up tasks for leads not contacted in 7 days',
        type: 'recurring',
        frequency: 'weekly',
        action: {
          type: 'create_task',
          parameters: { title: 'Follow up with lead', priority: 'medium' }
        },
        timing: {
          startDate: new Date().toISOString(),
          time: '10:00',
          timezone: 'UTC',
          daysOfWeek: [1] // Monday
        },
        isActive: true,
        nextRun: new Date(Date.now() + 86400000 * 3).toISOString(),
        runCount: 12,
        createdBy: user?.id || '1',
        createdAt: new Date(Date.now() - 5184000000).toISOString()
      },
      {
        id: '3',
        name: 'Monthly Cleanup',
        description: 'Clean up old activities and archive completed tasks',
        type: 'recurring',
        frequency: 'monthly',
        action: {
          type: 'cleanup_data',
          parameters: { retentionDays: 90 }
        },
        timing: {
          startDate: new Date().toISOString(),
          time: '02:00',
          timezone: 'UTC',
          dayOfMonth: 1
        },
        isActive: false,
        nextRun: new Date(Date.now() + 86400000 * 15).toISOString(),
        runCount: 3,
        createdBy: user?.id || '1',
        createdAt: new Date(Date.now() - 7776000000).toISOString()
      },
      {
        id: '4',
        name: 'Lead Nurturing Campaign',
        description: 'Send nurturing emails to new leads over 30 days',
        type: 'triggered',
        action: {
          type: 'send_email',
          parameters: { campaignId: 'nurture_30_days' }
        },
        timing: {
          startDate: new Date().toISOString(),
          time: '00:00',
          timezone: 'UTC'
        },
        isActive: true,
        nextRun: new Date(Date.now() + 1800000).toISOString(),
        runCount: 67,
        createdBy: user?.id || '1',
        createdAt: new Date(Date.now() - 10368000000).toISOString()
      }
    ];
    setSchedules(mockSchedules);
  };

  const loadUpcomingActivities = async () => {
    // Mock upcoming activities
    const mockActivities: ScheduledActivity[] = [
      {
        id: '1',
        title: 'Generate Daily Sales Report',
        description: 'Create report for yesterday\'s sales performance',
        scheduledTime: new Date(Date.now() + 3600000).toISOString(),
        status: 'pending',
        scheduleId: '1',
        scheduleName: 'Daily Sales Report'
      },
      {
        id: '2',
        title: 'Send Follow-up Reminders',
        description: 'Create tasks for 5 leads needing follow-up',
        scheduledTime: new Date(Date.now() + 7200000).toISOString(),
        status: 'pending',
        scheduleId: '2',
        scheduleName: 'Weekly Follow-up Reminders'
      },
      {
        id: '3',
        title: 'Lead Nurturing Email',
        description: 'Send day 3 nurturing email to new leads',
        scheduledTime: new Date(Date.now() + 1800000).toISOString(),
        status: 'running',
        scheduleId: '4',
        scheduleName: 'Lead Nurturing Campaign'
      },
      {
        id: '4',
        title: 'Weekly Performance Report',
        description: 'Generate and send weekly performance summary',
        scheduledTime: new Date(Date.now() - 3600000).toISOString(),
        status: 'completed',
        scheduleId: '1',
        scheduleName: 'Daily Sales Report',
        result: { emailsSent: 5, reportGenerated: true }
      }
    ];
    setUpcomingActivities(mockActivities);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleSchedule = async (scheduleId: string) => {
    try {
      setSchedules(prev => prev.map(schedule => 
        schedule.id === scheduleId ? { ...schedule, isActive: !schedule.isActive } : schedule
      ));
      Alert.alert('Success', 'Schedule status updated');
    } catch (error) {
      console.error('Error toggling schedule:', error);
      Alert.alert('Error', 'Failed to update schedule');
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setSchedules(prev => prev.filter(s => s.id !== scheduleId));
              Alert.alert('Success', 'Schedule deleted');
            } catch (error) {
              console.error('Error deleting schedule:', error);
              Alert.alert('Error', 'Failed to delete schedule');
            }
          }
        }
      ]
    );
  };

  const runScheduleNow = async (schedule: Schedule) => {
    Alert.alert(
      'Run Schedule Now',
      `Execute "${schedule.name}" immediately?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Run',
          onPress: async () => {
            Alert.alert('Success', 'Schedule executed successfully');
          }
        }
      ]
    );
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'send_email': return 'mail-outline';
      case 'create_task': return 'add-circle-outline';
      case 'generate_report': return 'bar-chart-outline';
      case 'notify_team': return 'notifications-outline';
      case 'cleanup_data': return 'trash-outline';
      default: return 'cog-outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'running': return '#3B82F6';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      case 'cancelled': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getFrequencyDisplay = (frequency?: string) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'yearly': return 'Yearly';
      default: return 'One-time';
    }
  };

  const renderScheduleItem = ({ item }: { item: Schedule }) => (
    <Card style={[styles.scheduleCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.scheduleHeader}>
        <View style={styles.scheduleInfo}>
          <Text style={[styles.scheduleName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.name}
          </Text>
          <Text style={[styles.scheduleDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {item.description}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: item.isActive ? colors.primary : '#E5E7EB' }]}
          onPress={() => toggleSchedule(item.id)}
        >
          <Text style={[styles.toggleText, { color: item.isActive ? '#FFFFFF' : '#6B7280' }]}>
            {item.isActive ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.scheduleDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={colors.primary} />
          <Text style={[styles.detailText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {getFrequencyDisplay(item.frequency)} at {item.timing.time}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name={getActionIcon(item.action.type) as any} size={16} color={colors.primary} />
          <Text style={[styles.detailText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {item.action.type.replace('_', ' ')}
          </Text>
        </View>
      </View>

      <View style={styles.scheduleStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Next Run
          </Text>
          <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
            {new Date(item.nextRun).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Runs
          </Text>
          <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.runCount}
          </Text>
        </View>
      </View>

      <View style={styles.scheduleActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => runScheduleNow(item)}
        >
          <Ionicons name="play-circle-outline" size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Run Now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/automation/schedules/${item.id}/edit` as any)}
        >
          <Ionicons name="create-outline" size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => deleteSchedule(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
          <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderActivityItem = ({ item }: { item: ScheduledActivity }) => {
    const statusColor = getStatusColor(item.status);
    
    return (
      <Card style={[styles.activityCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.activityHeader}>
          <View style={styles.activityInfo}>
            <Text style={[styles.activityTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              {item.title}
            </Text>
            <Text style={[styles.activityDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {item.description}
            </Text>
            <Text style={[styles.activitySchedule, { color: colors.primary }]}>
              {item.scheduleName}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.activityFooter}>
          <Text style={[styles.activityTime, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {new Date(item.scheduledTime).toLocaleString()}
          </Text>
          {item.status === 'failed' && item.error && (
            <Text style={[styles.activityError, { color: '#EF4444' }]}>
              Error: {item.error}
            </Text>
          )}
        </View>
      </Card>
    );
  };

  const renderCalendarTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.calendarCard}>
        <Text style={[styles.calendarTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Calendar View
        </Text>
        <Text style={[styles.calendarDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Calendar view will be implemented with a full calendar component showing scheduled activities
        </Text>
        <View style={styles.calendarPlaceholder}>
          <Ionicons name="calendar-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
          <Text style={[styles.placeholderText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Calendar View Coming Soon
          </Text>
        </View>
      </Card>
    </View>
  );

  const renderSchedulesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Active Schedules
        </Text>
        <Button
          title="Create Schedule"
          onPress={() => router.push('/automation/schedules/create' as any)}
          style={styles.createButton}
        />
      </View>
      
      <FlatList
        data={schedules}
        renderItem={renderScheduleItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No schedules created
            </Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              Create your first automated schedule
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderActivitiesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Scheduled Activities
        </Text>
      </View>
      
      <FlatList
        data={upcomingActivities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="list-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No scheduled activities
            </Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              Activities will appear here when schedules run
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'schedules':
        return renderSchedulesTab();
      case 'activities':
        return renderActivitiesTab();
      case 'calendar':
        return renderCalendarTab();
      default:
        return renderSchedulesTab();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Scheduling System
        </Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/automation/schedules/settings' as any)}
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
  scheduleCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  scheduleDescription: {
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
  scheduleDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    marginLeft: 6,
  },
  scheduleStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
  },
  scheduleActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  activityCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 4,
  },
  activitySchedule: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontFamily: fonts.satoshi.bold,
    textTransform: 'uppercase',
  },
  activityFooter: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  activityTime: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  activityError: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    marginTop: 4,
  },
  calendarCard: {
    margin: 20,
    padding: 20,
    alignItems: 'center',
  },
  calendarTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 8,
  },
  calendarDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    textAlign: 'center',
    marginBottom: 20,
  },
  calendarPlaceholder: {
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: fonts.satoshi.medium,
    marginTop: 12,
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
