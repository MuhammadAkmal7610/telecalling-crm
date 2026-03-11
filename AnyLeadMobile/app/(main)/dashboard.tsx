import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, StatCard, Button } from '../../src/components/common/Card';
import { colors, fonts } from '../../src/theme/theme';
import { ApiService } from '../../src/services/ApiService';
import { useAuth } from '../../src/contexts/AuthContext';

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  convertedLeads: number;
  totalCampaigns: number;
  activeCampaigns: number;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    convertedLeads: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const dashboardStats = await ApiService.getDashboardStats(user?.workspace_id);
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const getConversionRate = () => {
    if (stats.contactedLeads === 0) return 0;
    return Math.round((stats.convertedLeads / stats.contactedLeads) * 100);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.welcomeText, { color: isDark ? colors.surface : colors.onBackground }]}>
          Welcome back, {user?.name || 'User'}!
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
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
            title="Create Campaign"
            onPress={() => router.push('/campaigns/create' as any)}
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
            value={stats.totalLeads}
            subtitle={`${stats.newLeads} new this week`}
          />
          <StatCard
            title="Contacted"
            value={stats.contactedLeads}
            subtitle="This month"
            color="#3B82F6"
          />
          <StatCard
            title="Converted"
            value={stats.convertedLeads}
            subtitle={`${getConversionRate()}% rate`}
            color="#10B981"
          />
          <StatCard
            title="Campaigns"
            value={stats.activeCampaigns}
            subtitle={`${stats.totalCampaigns} total`}
            color="#8B5CF6"
          />
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Recent Activity
        </Text>
        <Card>
          <View style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: colors.primary }]} />
            <View style={styles.activityContent}>
              <Text style={[styles.activityText, { color: isDark ? colors.surface : colors.onBackground }]}>
                New lead added: John Doe
              </Text>
              <Text style={[styles.activityTime, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                2 hours ago
              </Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: '#3B82F6' }]} />
            <View style={styles.activityContent}>
              <Text style={[styles.activityText, { color: isDark ? colors.surface : colors.onBackground }]}>
                Campaign "Summer Outreach" created
              </Text>
              <Text style={[styles.activityTime, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                5 hours ago
              </Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: '#10B981' }]} />
            <View style={styles.activityContent}>
              <Text style={[styles.activityText, { color: isDark ? colors.surface : colors.onBackground }]}>
                Lead converted: Jane Smith
              </Text>
              <Text style={[styles.activityTime, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                1 day ago
              </Text>
            </View>
          </View>
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
    padding: 20,
    paddingTop: 40,
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
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontFamily: fonts.nohemi.bold,
  },
});
