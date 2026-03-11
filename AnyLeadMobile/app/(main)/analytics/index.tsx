import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '../../src/components/common/Card';
import { colors, fonts } from '../../src/theme/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import { ApiService } from '../../src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface ReportData {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  totalRevenue: number;
  averageDealSize: number;
  callsMade: number;
  emailsSent: number;
  meetingsScheduled: number;
}

interface TimeRange {
  label: string;
  value: string;
  days: number;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

export default function AnalyticsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark');
  
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'conversion' | 'activity'>('overview');

  const timeRanges: TimeRange[] = [
    { label: 'Today', value: 'today', days: 1 },
    { label: 'This Week', value: 'week', days: 7 },
    { label: 'This Month', value: 'month', days: 30 },
    { label: 'This Quarter', value: 'quarter', days: 90 },
    { label: 'This Year', value: 'year', days: 365 }
  ];

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'grid-outline' },
    { key: 'performance', label: 'Performance', icon: 'trending-up-outline' },
    { key: 'conversion', label: 'Conversion', icon: 'funnel-outline' },
    { key: 'activity', label: 'Activity', icon: 'pulse-outline' }
  ];

  useEffect(() => {
    loadReportData();
  }, [selectedTimeRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      // For now, use mock data. In future, fetch from API
      const mockData: ReportData = {
        totalLeads: Math.floor(Math.random() * 100) + 50,
        convertedLeads: Math.floor(Math.random() * 30) + 10,
        conversionRate: Math.random() * 30 + 10,
        totalRevenue: Math.floor(Math.random() * 50000) + 10000,
        averageDealSize: Math.floor(Math.random() * 5000) + 1000,
        callsMade: Math.floor(Math.random() * 200) + 50,
        emailsSent: Math.floor(Math.random() * 300) + 100,
        meetingsScheduled: Math.floor(Math.random() * 50) + 10
      };
      setReportData(mockData);
    } catch (error) {
      console.error('Error loading report data:', error);
      Alert.alert('Error', 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReportData();
    setRefreshing(false);
  };

  const renderMetricCard = (title: string, value: string | number, subtitle: string, icon: string, color: string, trend?: number) => (
    <Card style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: color + '10' }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        {trend !== undefined && (
          <View style={styles.trendContainer}>
            <Ionicons 
              name={trend >= 0 ? 'trending-up' : 'trending-down'} 
              size={12} 
              color={trend >= 0 ? '#10B981' : '#EF4444'} 
            />
            <Text style={[styles.trendText, { color: trend >= 0 ? '#10B981' : '#EF4444' }]}>
              {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.metricValue, { color: isDark ? colors.surface : colors.onBackground }]}>
        {value}
      </Text>
      <Text style={[styles.metricTitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
        {title}
      </Text>
      <Text style={[styles.metricSubtitle, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
        {subtitle}
      </Text>
    </Card>
  );

  const renderProgressBar = (label: string, value: number, total: number, color: string) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
            {label}
          </Text>
          <Text style={[styles.progressValue, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {value}/{total}
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
          <View 
            style={[styles.progressFill, { 
              width: `${percentage}%`, 
              backgroundColor: color 
            }]} 
          />
        </View>
        <Text style={[styles.progressPercentage, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          {percentage.toFixed(1)}%
        </Text>
      </View>
    );
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        {renderMetricCard(
          'Total Leads',
          reportData?.totalLeads || 0,
          'All time',
          'people-outline',
          colors.primary,
          12.5
        )}
        {renderMetricCard(
          'Converted',
          reportData?.convertedLeads || 0,
          'This period',
          'checkmark-circle-outline',
          '#10B981',
          8.3
        )}
        {renderMetricCard(
          'Revenue',
          `$${(reportData?.totalRevenue || 0).toLocaleString()}`,
          'Total sales',
          'cash-outline',
          '#8B5CF6',
          15.7
        )}
        {renderMetricCard(
          'Conversion Rate',
          `${reportData?.conversionRate.toFixed(1) || 0}%`,
          'Leads to customers',
          'trending-up-outline',
          '#F59E0B',
          -2.1
        )}
      </View>

      {/* Conversion Funnel */}
      <Card style={styles.funnelCard}>
        <Text style={[styles.cardTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Conversion Funnel
        </Text>
        {renderProgressBar('New Leads', 100, 100, '#10B981')}
        {renderProgressBar('Contacted', 75, 100, '#3B82F6')}
        {renderProgressBar('Qualified', 45, 100, '#8B5CF6')}
        {renderProgressBar('Proposal', 25, 100, '#F59E0B')}
        {renderProgressBar('Converted', reportData?.convertedLeads || 0, 100, '#059669')}
      </Card>
    </View>
  );

  const renderPerformanceTab = () => (
    <View style={styles.tabContent}>
      {/* Performance Metrics */}
      <View style={styles.metricsGrid}>
        {renderMetricCard(
          'Calls Made',
          reportData?.callsMade || 0,
          'This period',
          'call-outline',
          '#3B82F6',
          18.2
        )}
        {renderMetricCard(
          'Emails Sent',
          reportData?.emailsSent || 0,
          'This period',
          'mail-outline',
          '#10B981',
          6.5
        )}
        {renderMetricCard(
          'Meetings',
          reportData?.meetingsScheduled || 0,
          'Scheduled',
          'calendar-outline',
          '#8B5CF6',
          12.8
        )}
        {renderMetricCard(
          'Avg Deal Size',
          `$${(reportData?.averageDealSize || 0).toLocaleString()}`,
          'Per customer',
          'pricetag-outline',
          '#F59E0B',
          5.3
        )}
      </View>

      {/* Activity Breakdown */}
      <Card style={styles.activityCard}>
        <Text style={[styles.cardTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Activity Breakdown
        </Text>
        {renderProgressBar('Calls', reportData?.callsMade || 0, (reportData?.callsMade || 0) + (reportData?.emailsSent || 0), '#3B82F6')}
        {renderProgressBar('Emails', reportData?.emailsSent || 0, (reportData?.callsMade || 0) + (reportData?.emailsSent || 0), '#10B981')}
        {renderProgressBar('Meetings', reportData?.meetingsScheduled || 0, (reportData?.callsMade || 0) + (reportData?.emailsSent || 0), '#8B5CF6')}
      </Card>
    </View>
  );

  const renderConversionTab = () => (
    <View style={styles.tabContent}>
      {/* Conversion Metrics */}
      <View style={styles.metricsGrid}>
        {renderMetricCard(
          'Lead to Contact',
          '75%',
          'Conversion rate',
          'person-outline',
          '#3B82F6',
          3.2
        )}
        {renderMetricCard(
          'Contact to Qualified',
          '60%',
          'Conversion rate',
          'star-outline',
          '#8B5CF6',
          -1.5
        )}
        {renderMetricCard(
          'Qualified to Deal',
          '55%',
          'Conversion rate',
          'business-outline',
          '#F59E0B',
          7.8
        )}
        {renderMetricCard(
          'Deal to Closed',
          '80%',
          'Win rate',
          'trophy-outline',
          '#10B981',
          2.1
        )}
      </View>

      {/* Conversion Timeline */}
      <Card style={styles.timelineCard}>
        <Text style={[styles.cardTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Average Conversion Time
        </Text>
        {renderProgressBar('Lead to Contact', '2 days', '7 days', '#3B82F6')}
        {renderProgressBar('Contact to Qualified', '5 days', '14 days', '#8B5CF6')}
        {renderProgressBar('Qualified to Deal', '10 days', '21 days', '#F59E0B')}
        {renderProgressBar('Deal to Closed', '15 days', '30 days', '#10B981')}
      </Card>
    </View>
  );

  const renderActivityTab = () => (
    <View style={styles.tabContent}>
      {/* Activity Metrics */}
      <View style={styles.metricsGrid}>
        {renderMetricCard(
          'Daily Activities',
          '45',
          'Average per day',
          'calendar-outline',
          colors.primary,
          12.5
        )}
        {renderMetricCard(
          'Response Time',
          '2.5 hrs',
          'Average response',
          'time-outline',
          '#10B981',
          -8.3
        )}
        {renderMetricCard(
          'Follow-up Rate',
          '85%',
          'Tasks completed',
          'refresh-outline',
          '#8B5CF6',
          5.7
        )}
        {renderMetricCard(
          'Tasks Created',
          '120',
          'This period',
          'checkbox-outline',
          '#F59E0B',
          15.2
        )}
      </View>

      {/* Activity Heatmap */}
      <Card style={styles.heatmapCard}>
        <Text style={[styles.cardTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Activity Distribution
        </Text>
        <View style={styles.heatmapGrid}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
            <View key={day} style={styles.heatmapColumn}>
              <Text style={[styles.heatmapDay, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {day}
              </Text>
              {[1, 2, 3, 4].map((week) => (
                <View
                  key={week}
                  style={[
                    styles.heatmapCell,
                    { 
                      backgroundColor: Math.random() > 0.5 
                        ? colors.primary + '80' 
                        : isDark ? '#374151' : '#E5E7EB' 
                    }
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </Card>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'performance':
        return renderPerformanceTab();
      case 'conversion':
        return renderConversionTab();
      case 'activity':
        return renderActivityTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={{
        refreshing,
        onRefresh,
      }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Analytics & Reports
        </Text>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => router.push('/analytics/export' as any)}
        >
          <Ionicons name="download-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range.value}
              style={[
                styles.timeRangeButton,
                selectedTimeRange === range.value && styles.selectedTimeRangeButton,
                { borderColor: isDark ? '#374151' : '#E5E7EB' }
              ]}
              onPress={() => setSelectedTimeRange(range.value)}
            >
              <Text style={[
                styles.timeRangeText,
                selectedTimeRange === range.value && styles.selectedTimeRangeText
              ]}>
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
      {renderTabContent()}

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Text style={[styles.cardTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Quick Actions
        </Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary + '10' }]}
            onPress={() => router.push('/analytics/detailed' as any)}
          >
            <Ionicons name="bar-chart-outline" size={20} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>
              Detailed Reports
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#10B98120' }]}
            onPress={() => router.push('/analytics/leaderboard' as any)}
          >
            <Ionicons name="podium-outline" size={20} color="#10B981" />
            <Text style={[styles.actionButtonText, { color: '#10B981' }]}>
              Leaderboard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#8B5CF620' }]}
            onPress={() => router.push('/analytics/transactions' as any)}
          >
            <Ionicons name="receipt-outline" size={20} color="#8B5CF6" />
            <Text style={[styles.actionButtonText, { color: '#8B5CF6' }]}>
              Transactions
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
  },
  exportButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
  },
  timeRangeContainer: {
    marginBottom: 20,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  selectedTimeRangeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeRangeText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    color: '#6B7280',
  },
  selectedTimeRangeText: {
    color: '#FFFFFF',
  },
  tabsContainer: {
    flexDirection: 'row',
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
  tabContent: {
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendText: {
    fontSize: 10,
    fontFamily: fonts.satoshi.medium,
  },
  metricValue: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 2,
  },
  metricSubtitle: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  funnelCard: {
    padding: 16,
  },
  activityCard: {
    padding: 16,
  },
  timelineCard: {
    padding: 16,
  },
  heatmapCard: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
  },
  progressValue: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    textAlign: 'right',
  },
  heatmapGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  heatmapColumn: {
    alignItems: 'center',
    flex: 1,
  },
  heatmapDay: {
    fontSize: 10,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 8,
  },
  heatmapCell: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginBottom: 4,
  },
  actionsCard: {
    padding: 16,
  },
  actionsGrid: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
  },
});
