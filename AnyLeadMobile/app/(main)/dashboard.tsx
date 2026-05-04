import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, useColorScheme, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Card, StatCard, Button } from '@/src/components/common/Card';
import { colors, fonts, spacing, shadows } from '@/src/theme/theme';
import { ApiService } from '@/src/services/ApiService';
import { useAuth } from '@/src/contexts/AuthContext';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { Activity } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useToast } from '@/src/contexts/ToastContext';

const { width } = Dimensions.get('window');

interface DashboardData {
  metrics: {
    leads: {
      total: number;
      new: number;
      won: number;
      lost: number;
      conversion_rate: number;
      by_source: Record<string, number>;
    };
    calls: {
      total: number;
      outbound: number;
      inbound: number;
      missed: number;
      duration: number;
    };
    whatsapp: {
      sent: number;
      received: number;
    };
    revenue: {
      total: number;
      target: number;
    };
  };
  topPerformers: any[];
  funnel: any[];
}

export default function DashboardScreen() {
  const router = useRouter();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { user } = useAuth();
  const { unreadCount, refreshNotifications } = useNotifications();
  const { showToast } = useToast();
  const isDark = useColorScheme() === 'dark';
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('week');

  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  const loadData = async (range = timeRange) => {
    try {
      const [analyticsRes, funnelRes, tasksRes, activitiesRes] = await Promise.all([
        ApiService.getDashboardData(range),
        ApiService.getConversionFunnel(range),
        ApiService.getTasks({ status: 'Pending', limit: 3 }),
        ApiService.getActivities(undefined, user?.workspace_id),
        refreshNotifications()
      ]);

      if (analyticsRes.data) {
        // Adjust for backend structure mismatch if needed
        const raw = analyticsRes.data;
        const formatted: DashboardData = {
          metrics: raw.metrics,
          topPerformers: raw.topPerformers?.agents || [],
          funnel: [] // Will be set from funnelRes
        };
        
        if (funnelRes.data && funnelRes.data.funnel) {
          formatted.funnel = Object.entries(funnelRes.data.funnel).map(([name, count]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            count: count as number
          }));
        }

        setData(formatted);
      }

      if (tasksRes.data) {
        setTasks(tasksRes.data);
      }

      if (activitiesRes && activitiesRes.data) {
        setActivities(activitiesRes.data.slice(0, 5));
      }
    } catch (error: any) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.workspace_id) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user?.workspace_id, timeRange]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [user?.workspace_id, timeRange]);

  const renderSectionHeader = (title: string, onAction?: () => void, actionLabel = 'View All') => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionHeading, { color: isDark ? '#F8FAFC' : '#1E293B' }]}>{title}</Text>
      {onAction && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.viewAll}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderTaskAlerts = () => {
    const overdueCount = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length;
    if (overdueCount === 0) return null;

    return (
      <TouchableOpacity 
        style={styles.alertBanner}
        onPress={() => router.push('/automation/schedules' as any)}
      >
        <LinearGradient
          colors={['#EF4444', '#DC2626']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.alertGradient}
        >
          <Ionicons name="warning" size={20} color="#FFF" />
          <Text style={styles.alertText}>{overdueCount} tasks are overdue! Take action now.</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderFunnelChart = () => {
    if (!data?.funnel || data.funnel.length === 0) return null;

    return (
      <View style={styles.sectionArea}>
        {renderSectionHeader('Lead Journey')}
        <Card style={styles.funnelCard}>
          {data.funnel.map((stage: any, index: number) => {
            const widthPct = 100 - (index * 15); // Simple funnel shape
            return (
              <View key={stage.name} style={styles.funnelStageRow}>
                <View style={styles.funnelLabelCol}>
                  <Text style={[styles.funnelStageName, { color: isDark ? '#CBD5E1' : '#475569' }]}>{stage.name}</Text>
                </View>
                <View style={styles.funnelBarCol}>
                  <View style={[styles.funnelBarContainer, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                    <LinearGradient
                      colors={[colors.primary, colors.secondary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.funnelBarFill, { width: `${widthPct}%` }]}
                    />
                  </View>
                  <Text style={[styles.funnelCount, { color: isDark ? '#E2E8F0' : '#1E293B' }]}>{stage.count}</Text>
                </View>
              </View>
            );
          })}
        </Card>
      </View>
    );
  };

  const renderLeaderboard = () => {
    if (!data?.topPerformers || data.topPerformers.length === 0) return null;

    return (
      <View style={styles.sectionArea}>
        {renderSectionHeader('Team Leaderboard', () => router.push('/analytics/leaderboard' as any))}
        <Card style={styles.leaderboardCard}>
          {data.topPerformers.slice(0, 3).map((performer: any, index: number) => (
            <View key={performer.id} style={styles.leaderboardRow}>
              <View style={styles.performerInfo}>
                <View style={[styles.rankCircle, { backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32' }]}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <Text style={[styles.performerName, { color: isDark ? '#F8FAFC' : '#1E293B' }]}>{performer.name}</Text>
              </View>
              <View style={styles.performerMetrics}>
                <Text style={[styles.performerValue, { color: colors.primary }]}>{performer.metrics?.leads?.won || 0}</Text>
                <Text style={[styles.performerLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Closed</Text>
              </View>
            </View>
          ))}
        </Card>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
        <Text style={{ color: colors.primary }}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
      {/* Header with Role & TimeRange */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            onPress={() => navigation.openDrawer()}
            style={styles.headerIcon}
          >
            <Ionicons name="menu" size={28} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={[styles.welcomeText, { color: isDark ? '#F8FAFC' : '#1E293B' }]}>
              {user?.name?.split(' ')[0] || 'Member'}'s Dashboard
            </Text>
            <Text style={[styles.roleBadgeText, { color: colors.primary }]}>
              {isAdmin ? 'Admin View' : 'Sales Representative'}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => router.push('/notifications' as any)}
              style={styles.actionIconBtn}
            >
              <Ionicons name="notifications-outline" size={24} color={isDark ? '#FFF' : '#000'} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/settings/profile' as any)}
              style={styles.profileBtn}
            >
              <LinearGradient colors={colors.gradientPrimary} style={styles.miniAvatar}>
                <Text style={styles.miniAvatarText}>{user?.name?.charAt(0) || 'U'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeRangePicker}>
          {['day', 'week', 'month'].map(range => (
            <TouchableOpacity 
              key={range} 
              onPress={() => setTimeRange(range)}
              style={[styles.rangeBtn, timeRange === range && styles.activeRangeBtn]}
            >
              <Text style={[styles.rangeBtnText, timeRange === range && styles.activeRangeBtnText]}>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {renderTaskAlerts()}

        {/* Core Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              title="New Leads"
              value={data?.metrics.leads.new || 0}
              subtitle="Target: 50"
              gradient={['#6366F1', '#4F46E5']}
            />
            <StatCard
              title="Calls"
              value={data?.metrics.calls.total || 0}
              subtitle={`${data?.metrics.calls.missed || 0} missed`}
              gradient={['#3B82F6', '#2563EB']}
            />
          </View>
          <View style={[styles.statsRow, { marginTop: 12 }]}>
            <StatCard
              title="WhatsApp"
              value={data?.metrics.whatsapp.sent || 0}
              subtitle="Sent messages"
              gradient={['#10B981', '#059669']}
            />
            <StatCard
              title="Revenue"
              value={data?.metrics.revenue.total_value ? `$${data.metrics.revenue.total_value.toLocaleString()}` : '$0'}
              subtitle="Closed sales"
              gradient={['#F59E0B', '#D97706']}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionArea}>
          {renderSectionHeader('Quick Actions')}
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/leads/create')}>
              <LinearGradient colors={['#EEF2FF', '#E0E7FF']} style={styles.actionIconBg}>
                <Ionicons name="person-add" size={24} color="#4F46E5" />
              </LinearGradient>
              <Text style={[styles.actionLabel, { color: isDark ? '#E2E8F0' : '#1E293B' }]}>Add Lead</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/dialer')}>
              <LinearGradient colors={['#EFF6FF', '#DBEAFE']} style={styles.actionIconBg}>
                <Ionicons name="call" size={24} color="#2563EB" />
              </LinearGradient>
              <Text style={[styles.actionLabel, { color: isDark ? '#E2E8F0' : '#1E293B' }]}>Dialer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/messages')}>
              <LinearGradient colors={['#ECFDF5', '#D1FAE5']} style={styles.actionIconBg}>
                <Ionicons name="chatbubble" size={24} color="#059669" />
              </LinearGradient>
              <Text style={[styles.actionLabel, { color: isDark ? '#E2E8F0' : '#1E293B' }]}>Messages</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/automation/index')}>
              <LinearGradient colors={['#FFFBEB', '#FEF3C7']} style={styles.actionIconBg}>
                <Ionicons name="flash" size={24} color="#D97706" />
              </LinearGradient>
              <Text style={[styles.actionLabel, { color: isDark ? '#E2E8F0' : '#1E293B' }]}>Auto</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Leaderboard for Everyone (Motivation) */}
        {renderLeaderboard()}

        {/* Lead Journey Funnel */}
        {renderFunnelChart()}

        {/* Lead Source Breakdown */}
        {data?.metrics.leads.by_source && Object.keys(data.metrics.leads.by_source).length > 0 && (
          <View style={styles.sectionArea}>
            {renderSectionHeader('Leads by Source')}
            <Card style={styles.sourceCard}>
              {Object.entries(data.metrics.leads.by_source).map(([source, count], index) => {
                const total = data.metrics.leads.total || 1;
                const percentage = Math.round(((count as number) / total) * 100);
                const colorsList = ['#6366F1', '#10B981', '#3B82F6', '#F59E0B', '#EC4899'];
                
                return (
                  <View key={source} style={styles.sourceRow}>
                    <View style={styles.sourceHeader}>
                      <Text style={[styles.sourceName, { color: isDark ? '#E2E8F0' : '#1E293B' }]}>
                        {source === '70' ? 'WhatsApp' : source.charAt(0).toUpperCase() + source.slice(1)}
                      </Text>
                      <Text style={[styles.sourcePercentage, { color: colors.primary }]}>{percentage}%</Text>
                    </View>
                    <View style={styles.sourceBarBackground}>
                      <View 
                        style={[
                          styles.sourceBarFill, 
                          { 
                            width: `${percentage}%`, 
                            backgroundColor: colorsList[index % colorsList.length] 
                          }
                        ]} 
                      />
                    </View>
                  </View>
                );
              })}
            </Card>
          </View>
        )}

        {/* Pending Tasks */}
        <View style={styles.sectionArea}>
          {renderSectionHeader('Upcoming Tasks', () => router.push('/automation/schedules' as any))}
          <Card style={styles.taskCard}>
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <View key={task.id} style={[styles.taskRow, index !== tasks.length - 1 && styles.borderBottom]}>
                  <View style={styles.taskIcon}>
                    <Ionicons 
                      name={task.priority === 'high' ? 'alert-circle' : 'calendar'} 
                      size={20} 
                      color={task.priority === 'high' ? '#EF4444' : colors.primary} 
                    />
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, { color: isDark ? '#F8FAFC' : '#1E293B' }]} numberOfLines={1}>{task.title}</Text>
                    <Text style={[styles.taskDue, { color: new Date(task.dueDate) < new Date() ? '#EF4444' : '#94A3B8' }]}>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => showToast('Task completion coming soon', 'info')}>
                    <Ionicons name="checkbox-outline" size={24} color="#CBD5E1" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyTasks}>
                <Text style={{ color: '#94A3B8' }}>All caught up! No pending tasks.</Text>
              </View>
            )}
          </Card>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionArea}>
          {renderSectionHeader('Recent Performance')}
          <Card style={styles.activityCard}>
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <View key={activity.id} style={[styles.activityRow, index !== activities.length -1 && styles.borderBottom]}>
                  <View style={styles.activityIcon}>
                    <Ionicons name={activity.type === 'call' ? 'call' : activity.type === 'whatsapp' ? 'logo-whatsapp' : 'mail'} size={16} color={colors.primary} />
                  </View>
                  <View style={styles.activityText}>
                    <Text style={[styles.activityDetails, { color: isDark ? '#E2E8F0' : '#475569' }]} numberOfLines={1}>{activity.details}</Text>
                    <Text style={styles.activityTime}>{new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No recent activities</Text>
            )}
          </Card>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...shadows.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: 15,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconBtn: {
    position: 'relative',
    padding: 5,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 8,
    fontFamily: fonts.satoshi.bold,
  },
  profileBtn: {
    overflow: 'hidden',
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: fonts.nohemi.bold,
  },
  welcomeText: {
    fontSize: 18,
    fontFamily: fonts.nohemi.bold,
  },
  roleBadgeText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.bold,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerIcon: {
    padding: 8,
  },
  timeRangePicker: {
    marginTop: 15,
    flexDirection: 'row',
  },
  rangeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#F1F5F9',
  },
  activeRangeBtn: {
    backgroundColor: colors.primary,
  },
  rangeBtnText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.bold,
    color: '#64748B',
  },
  activeRangeBtnText: {
    color: '#FFF',
  },
  scrollContent: {
    padding: 20,
  },
  alertBanner: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  alertGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  alertText: {
    color: '#FFF',
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.satoshi.bold,
  },
  statsGrid: {
    marginBottom: 25,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionArea: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
  },
  viewAll: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: fonts.satoshi.bold,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    alignItems: 'center',
    width: (width - 60) / 4,
  },
  actionIconBg: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...shadows.sm,
  },
  actionLabel: {
    fontSize: 11,
    fontFamily: fonts.satoshi.bold,
  },
  funnelCard: {
    padding: 15,
  },
  funnelStageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  funnelLabelCol: {
    width: 90,
  },
  funnelStageName: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  funnelBarCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  funnelBarContainer: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  funnelBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  funnelCount: {
    width: 30,
    fontSize: 12,
    fontFamily: fonts.nohemi.bold,
    textAlign: 'right',
  },
  leaderboardCard: {
    padding: 15,
  },
  leaderboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  performerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: fonts.nohemi.bold,
  },
  performerName: {
    fontSize: 14,
    fontFamily: fonts.satoshi.bold,
  },
  performerMetrics: {
    alignItems: 'flex-end',
  },
  performerValue: {
    fontSize: 14,
    fontFamily: fonts.nohemi.bold,
  },
  performerLabel: {
    fontSize: 10,
    fontFamily: fonts.satoshi.medium,
  },
  taskCard: {
    padding: 0,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontFamily: fonts.satoshi.bold,
    marginBottom: 2,
  },
  taskDue: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  emptyTasks: {
    padding: 20,
    alignItems: 'center',
  },
  activityCard: {
    padding: 0,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  activityText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityDetails: {
    fontSize: 13,
    fontFamily: fonts.satoshi.medium,
    flex: 1,
    marginRight: 10,
  },
  activityTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: fonts.satoshi.regular,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  emptyText: {
    padding: 20,
    textAlign: 'center',
    color: '#94A3B8',
  },
  sourceCard: {
    padding: 15,
  },
  sourceRow: {
    marginBottom: 15,
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sourceName: {
    fontSize: 12,
    fontFamily: fonts.satoshi.bold,
  },
  sourcePercentage: {
    fontSize: 12,
    fontFamily: fonts.nohemi.bold,
  },
  sourceBarBackground: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  sourceBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
