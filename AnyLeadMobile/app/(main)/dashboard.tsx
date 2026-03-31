import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, useColorScheme, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, StatCard, Button } from '@/src/components/common/Card';
import { colors, fonts, spacing, shadows } from '@/src/theme/theme';
import { ApiService } from '@/src/services/ApiService';
import { useAuth } from '@/src/contexts/AuthContext';
import { Activity } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useToast } from '@/src/contexts/ToastContext';

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  convertedLeads: number;
  totalCampaigns: number;
  activeCampaigns: number;
  conversionRate?: number;
  leadSourceBreakdown?: Array<{ name: string; value: number }>;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user, fetchUserProfile } = useAuth();
  const { showToast } = useToast();
  const isDark = useColorScheme() === 'dark';
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    convertedLeads: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      console.log('Fetching stats for workspace:', user?.workspace_id);
      const dashboardStats = await ApiService.getDashboardStats(user?.workspace_id);
      console.log('Received Stats:', JSON.stringify(dashboardStats));
      setStats(dashboardStats);

      const { data: recentActivities } = await ApiService.getActivities(undefined, user?.workspace_id);
      if (recentActivities && Array.isArray(recentActivities)) {
        setActivities(recentActivities.slice(0, 5));
      }
    } catch (error: any) {
      showToast({ message: error.message || 'Failed to load dashboard data', type: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && user.workspace_id && user.workspace_id !== 'null') {
      loadStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const onRefresh = () => {
    if (user?.workspace_id) {
      setRefreshing(true);
      loadStats();
    }
  };

  const getConversionRate = () => {
    const contacted = stats.contactedLeads ?? 0;
    const converted = stats.convertedLeads ?? 0;
    if (contacted === 0) return 0;
    return Math.round((converted / contacted) * 100);
  };

  const getActivityColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'call': return '#3B82F6';
      case 'whatsapp': return '#10B981';
      case 'email': return '#8B5CF6';
      case 'note': return '#6B7280';
      case 'lead_created': return '#10B981';
      case 'status_change': return '#F59E0B';
      default: return colors.primary;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'call': return 'call-outline';
      case 'whatsapp': return 'logo-whatsapp';
      case 'email': return 'mail-outline';
      case 'note': return 'document-text-outline';
      case 'status_change': return 'git-branch-outline';
      default: return 'notifications-outline';
    }
  };

  if (!loading && (!user || !user.workspace_id)) {
    return (
      <View style={[styles.container, styles.emptyWorkspaceContainer, { backgroundColor: isDark ? '#121212' : colors.background }]}>
        <Ionicons name="business-outline" size={80} color={colors.primary} style={{ marginBottom: 20 }} />
        <Text style={[styles.welcomeText, { color: isDark ? colors.surface : colors.onBackground, textAlign: 'center' }]}>
          No Workspace Selected
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#9CA3AF' : '#6B7280', textAlign: 'center', marginHorizontal: 40, marginTop: 10, marginBottom: 30, lineHeight: 22 }]}>
          You are not currently assigned to any active workspace. Please create or select a workspace to view your dashboard analytics and manage leads.
        </Text>
        <Button
          title="Select Workspace"
          onPress={() => router.push('/enterprise/workspaces' as any)}
        />
        
        <TouchableOpacity 
          style={{ marginTop: 15 }}
          onPress={() => loadStats()}
        >
          <Text style={{ color: colors.primary, textAlign: 'center' }}>Try Loading Dashboard Anyway</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 40, padding: 10, backgroundColor: isDark ? '#1F2937' : '#F3F4F6', borderRadius: 8 }}>
          <Text style={{ fontSize: 10, color: isDark ? '#6B7280' : '#9CA3AF', fontFamily: fonts.satoshi.regular }}>
            Debug Info: {JSON.stringify({ userId: user?.id, workspaceId: user?.workspace_id })}
          </Text>
          <TouchableOpacity onPress={() => fetchUserProfile(user?.id || '')}>
             <Text style={{ fontSize: 12, color: colors.primary, marginTop: 5, textAlign: 'center' }}>Force Refresh Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.welcomeText, { color: isDark ? colors.surface : colors.onBackground }]}>
            Welcome back, {user?.name || 'User'}!
          </Text>
          <TouchableOpacity style={styles.profileIcon}>
            <LinearGradient
              colors={colors.gradientPrimary}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <Text style={[styles.subtitle, { color: isDark ? colors.darkMuted : colors.muted }]}>
          Here's your business overview
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActions}>
          <Button
            title="Add Lead"
            onPress={() => router.push('/leads/create' as any)}
            style={styles.quickAction}
          />
          <Button
            title="Campaign"
            onPress={() => router.push('/campaigns' as any)}
            variant="secondary"
            style={styles.quickAction}
          />
          <Button
            title="Email"
            onPress={() => router.push('/email' as any)}
            variant="secondary"
            style={styles.quickAction}
          />
        </View>
      </View>

      {/* Stats Overview */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Overview
        </Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Leads"
            value={stats.totalLeads ?? 0}
            subtitle={`${stats.newLeads ?? 0} new this week`}
            color={colors.primary}
          />
          <StatCard
            title="Contacted"
            value={stats.contactedLeads ?? 0}
            subtitle="This month"
            color={colors.secondary}
          />
          <StatCard
            title="Converted"
            value={stats.convertedLeads ?? 0}
            subtitle={`${getConversionRate()}% rate`}
            color={colors.success}
          />
          <StatCard
            title="Campaigns"
            value={stats.activeCampaigns ?? 0}
            subtitle={`${stats.totalCampaigns ?? 0} total`}
            color="#8B5CF6"
          />
        </View>
      </View>

      {/* Lead Source Distribution */}
      {stats.leadSourceBreakdown && stats.leadSourceBreakdown.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Source Breakdown
          </Text>
          <Card style={styles.sourceCard}>
            {stats.leadSourceBreakdown.map((item, index) => {
              const total = stats.totalLeads ?? 0;
              const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
              const barColors = [colors.primary, colors.secondary, '#8B5CF6', '#F59E0B'];
              return (
                <View key={item.name} style={styles.sourceItem}>
                  <View style={styles.sourceHeader}>
                    <Text style={[styles.sourceName, { color: isDark ? colors.surface : colors.onBackground }]}>{item.name}</Text>
                    <Text style={[styles.sourceValue, { color: isDark ? colors.darkMuted : colors.muted }]}>{item.value} ({percentage}%)</Text>
                  </View>
                  <View style={[styles.sourceBarBg, { backgroundColor: isDark ? colors.darkBorder : '#E2E8F0' }]}>
                    <View 
                      style={[
                        styles.sourceBarFill, 
                        { 
                          width: `${percentage}%`, 
                          backgroundColor: barColors[index % barColors.length]
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

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Recent Activity
          </Text>
          <TouchableOpacity onPress={() => router.push('/activities' as any)}>
            <Text style={{ color: colors.primary, fontSize: 12, fontFamily: fonts.satoshi.bold }}>View More</Text>
          </TouchableOpacity>
        </View>
        <Card>
          {activities.length > 0 ? (
            activities.map(activity => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={[styles.activityIconBox, { backgroundColor: getActivityColor(activity.type) + '15' }]}>
                  <Ionicons name={getActivityIcon(activity.type) as any} size={16} color={getActivityColor(activity.type)} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={[styles.activityText, { color: isDark ? colors.surface : colors.onBackground }]} numberOfLines={1}>
                    {activity.details}
                  </Text>
                  <Text style={[styles.activityTime, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(activity.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', padding: 16, textAlign: 'center', fontFamily: fonts.satoshi.medium }}>
              No recent activity found.
            </Text>
          )}
        </Card>
      </View>

      {/* Performance Metrics */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Performance
        </Text>
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <Text style={[styles.metricLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Conversion Rate
            </Text>
            <Text style={[styles.metricValue, { color: colors.primary }]}>
              {getConversionRate()}%
            </Text>
          </Card>
          <Card style={styles.metricCard}>
            <Text style={[styles.metricLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Active Campaigns
            </Text>
            <Text style={[styles.metricValue, { color: '#8B5CF6' }]}>
              {stats.activeCampaigns}
            </Text>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingTop: 60,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  profileIcon: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.nohemi.bold,
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB10',
  },
  activityIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  sourceCard: {
    padding: 16,
  },
  sourceItem: {
    marginBottom: 16,
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sourceName: {
    fontSize: 14,
    fontFamily: fonts.satoshi.bold,
  },
  sourceValue: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  sourceBarBg: {
    height: 6,
    backgroundColor: '#E5E7EB20',
    borderRadius: 3,
    overflow: 'hidden',
  },
  sourceBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyWorkspaceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontFamily: fonts.nohemi.bold,
  },
});
