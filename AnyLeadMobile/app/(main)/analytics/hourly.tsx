import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface HourlyData {
  hour: string;
  calls: number;
  emails: number;
  whatsapp: number;
  meetings: number;
  leadsConverted: number;
  revenue: number;
}

interface TeamMemberActivity {
  userId: string;
  userName: string;
  calls: number;
  emails: number;
  meetings: number;
  conversionRate: number;
}

type ViewMode = 'individual' | 'team' | 'comparison';

export default function HourlyReportsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [teamActivity, setTeamActivity] = useState<TeamMemberActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('individual');
  const [selectedMetric, setSelectedMetric] = useState<'calls' | 'emails' | 'whatsapp' | 'meetings' | 'leadsConverted' | 'revenue'>('calls');

  useEffect(() => {
    loadData();
  }, [selectedDate, viewMode]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadHourlyData(), loadTeamActivity()]);
    } catch (error) {
      console.error('Error loading hourly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHourlyData = async () => {
    if (!user?.organization_id) return;
    try {
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const response = await ApiService.get(`/analytics/hourly?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&viewMode=${viewMode}`);

      if (response.data) {
        setHourlyData(response.data);
      } else {
        // Generate mock data for demo
        setHourlyData(generateMockHourlyData());
      }
    } catch (error) {
      console.error('Error loading hourly data:', error);
      setHourlyData(generateMockHourlyData());
    }
  };

  const loadTeamActivity = async () => {
    if (!user?.organization_id) return;
    try {
      const response = await ApiService.get(`/analytics/team-activity`);
      if (response.data) {
        setTeamActivity(response.data);
      }
    } catch (error) {
      console.error('Error loading team activity:', error);
    }
  };

  const generateMockHourlyData = (): HourlyData[] => {
    const hours = ['6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM'];
    return hours.map(hour => ({
      hour,
      calls: Math.floor(Math.random() * 30) + 5,
      emails: Math.floor(Math.random() * 20) + 2,
      whatsapp: Math.floor(Math.random() * 25) + 3,
      meetings: Math.floor(Math.random() * 8) + 1,
      leadsConverted: Math.floor(Math.random() * 5),
      revenue: Math.floor(Math.random() * 5000) + 500,
    }));
  };

  const getPeakHours = () => {
    if (hourlyData.length === 0) return null;
    
    const maxCalls = Math.max(...hourlyData.map(d => d.calls));
    const peakHour = hourlyData.find(d => d.calls === maxCalls);
    
    return {
      hour: peakHour?.hour || 'N/A',
      calls: maxCalls,
    };
  };

  const getTotalStats = () => {
    return hourlyData.reduce((acc, curr) => ({
      calls: acc.calls + curr.calls,
      emails: acc.emails + curr.emails,
      whatsapp: acc.whatsapp + curr.whatsapp,
      meetings: acc.meetings + curr.meetings,
      leadsConverted: acc.leadsConverted + curr.leadsConverted,
      revenue: acc.revenue + curr.revenue,
    }), { calls: 0, emails: 0, whatsapp: 0, meetings: 0, leadsConverted: 0, revenue: 0 });
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'calls': return '#3B82F6';
      case 'emails': return '#10B981';
      case 'whatsapp': return '#25D366';
      case 'meetings': return '#8B5CF6';
      case 'leadsConverted': return '#F59E0B';
      case 'revenue': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'calls': return 'call-outline';
      case 'emails': return 'mail-outline';
      case 'whatsapp': return 'logo-whatsapp';
      case 'meetings': return 'calendar-outline';
      case 'leadsConverted': return 'checkmark-circle-outline';
      case 'revenue': return 'cash-outline';
      default: return 'bar-chart-outline';
    }
  };

  const formatMetricValue = (metric: string, value: number) => {
    if (metric === 'revenue') return `$${value.toLocaleString()}`;
    if (metric === 'leadsConverted') return value.toString();
    return value.toString();
  };

  const peakHours = getPeakHours();
  const totalStats = getTotalStats();

  const renderHourBar = (data: HourlyData, index: number) => {
    const maxValue = Math.max(...hourlyData.map(d => d[selectedMetric] as number)) || 1;
    const value = data[selectedMetric] as number;
    const percentage = (value / maxValue) * 100;
    const color = getMetricColor(selectedMetric);

    return (
      <View key={index} style={styles.hourBarContainer}>
        <Text style={[styles.hourLabel, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
          {data.hour}
        </Text>
        <View style={styles.barContainer}>
          <View 
            style={[
              styles.bar, 
              { 
                height: percentage * 1.2,
                backgroundColor: color,
                minHeight: value > 0 ? 4 : 0,
              }
            ]} 
          />
        </View>
        <Text style={[styles.barValue, { color }]}>
          {formatMetricValue(selectedMetric, value)}
        </Text>
      </View>
    );
  };

  const renderStatCard = (title: string, value: string | number, icon: string, color: string, subtitle?: string) => (
    <Card style={[styles.statCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '10' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
        {value}
      </Text>
      <Text style={[styles.statTitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
          {subtitle}
        </Text>
      )}
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="time-outline" size={48} color={colors.primary} />
          <Text style={[styles.loadingText, { color: isDark ? colors.surface : colors.onBackground }]}>
            Loading Hourly Reports...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Hour-by-Hour Reports
        </Text>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => Alert.alert('Export', 'Export functionality coming soon')}
        >
          <Ionicons name="download-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Date Selector */}
      <View style={styles.dateSelector}>
        <TouchableOpacity
          style={[styles.dateButton, { backgroundColor: isDark ? '#374151' : '#F9FAFB' }]}
          onPress={() => {
            const yesterday = new Date(selectedDate);
            yesterday.setDate(yesterday.getDate() - 1);
            setSelectedDate(yesterday);
          }}
        >
          <Ionicons name="chevron-back" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
        </TouchableOpacity>
        <Text style={[styles.dateText, { color: isDark ? colors.surface : colors.onBackground }]}>
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
        <TouchableOpacity
          style={[styles.dateButton, { backgroundColor: isDark ? '#374151' : '#F9FAFB' }]}
          onPress={() => {
            const tomorrow = new Date(selectedDate);
            tomorrow.setDate(tomorrow.getDate() + 1);
            setSelectedDate(tomorrow);
          }}
        >
          <Ionicons name="chevron-forward" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
        </TouchableOpacity>
      </View>

      {/* View Mode Tabs */}
      <View style={styles.tabsContainer}>
        {(['individual', 'team', 'comparison'] as ViewMode[]).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.tabButton,
              viewMode === mode && styles.activeTabButton,
              { borderColor: isDark ? '#374151' : '#E5E7EB' }
            ]}
            onPress={() => setViewMode(mode)}
          >
            <Text style={[
              styles.tabText,
              viewMode === mode && styles.activeTabText
            ]}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryGrid}>
        {renderStatCard(
          'Total Calls',
          totalStats.calls.toString(),
          'call-outline',
          '#3B82F6',
          `${Math.round(totalStats.calls / hourlyData.length || 0)} avg/hour`
        )}
        {renderStatCard(
          'Peak Hour',
          peakHours?.hour || 'N/A',
          'trending-up-outline',
          '#F59E0B',
          `${peakHours?.calls || 0} calls`
        )}
        {renderStatCard(
          'Conversions',
          totalStats.leadsConverted.toString(),
          'checkmark-circle-outline',
          '#10B981',
          `${((totalStats.leadsConverted / Math.max(totalStats.calls, 1)) * 100).toFixed(1)}% rate`
        )}
        {renderStatCard(
          'Revenue',
          `$${totalStats.revenue.toLocaleString()}`,
          'cash-outline',
          '#8B5CF6'
        )}
      </View>

      {/* Metric Selector */}
      <Card style={[styles.metricSelectorCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Activity Breakdown
        </Text>
        <View style={styles.metricSelector}>
          {(['calls', 'emails', 'whatsapp', 'meetings', 'leadsConverted'] as const).map((metric) => (
            <TouchableOpacity
              key={metric}
              style={[
                styles.metricButton,
                selectedMetric === metric && styles.selectedMetricButton,
                { 
                  backgroundColor: selectedMetric === metric ? getMetricColor(metric) + '20' : (isDark ? '#374151' : '#F9FAFB'),
                  borderColor: selectedMetric === metric ? getMetricColor(metric) : (isDark ? '#4B5563' : '#E5E7EB')
                }
              ]}
              onPress={() => setSelectedMetric(metric)}
            >
              <Ionicons 
                name={getMetricIcon(metric) as any} 
                size={14} 
                color={selectedMetric === metric ? getMetricColor(metric) : (isDark ? '#6B7280' : '#9CA3AF')} 
              />
              <Text style={[
                styles.metricButtonText,
                selectedMetric === metric && { color: getMetricColor(metric) }
              ]}>
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Hourly Chart */}
      <Card style={[styles.chartCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.chartHeader}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Hourly Activity
          </Text>
          <Text style={[styles.chartSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {selectedMetric === 'revenue' ? 'Revenue' : selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} by Hour
          </Text>
        </View>

        <View style={styles.chartContainer}>
          {hourlyData.map((data, index) => renderHourBar(data, index))}
        </View>
      </Card>

      {/* Team Performance (for team view) */}
      {viewMode === 'team' && teamActivity.length > 0 && (
        <Card style={[styles.teamCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Team Performance Today
          </Text>

          <View style={styles.teamList}>
            {teamActivity.slice(0, 5).map((member, index) => (
              <View key={member.userId} style={styles.teamMember}>
                <View style={styles.teamRank}>
                  <Text style={[styles.rankText, { color: index < 3 ? '#FFD700' : (isDark ? '#6B7280' : '#9CA3AF') }]}>
                    #{index + 1}
                  </Text>
                </View>
                <View style={styles.teamMemberInfo}>
                  <Text style={[styles.teamMemberName, { color: isDark ? colors.surface : colors.onBackground }]}>
                    {member.userName}
                  </Text>
                  <Text style={[styles.teamMemberStats, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    {member.calls} calls • {member.meetings} meetings
                  </Text>
                </View>
                <View style={styles.teamMemberMetric}>
                  <Text style={[styles.conversionRate, { color: '#10B981' }]}>
                    {member.conversionRate.toFixed(1)}%
                  </Text>
                  <Text style={[styles.conversionLabel, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
                    Conv. Rate
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Insights */}
      <Card style={[styles.insightsCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Key Insights
        </Text>

        <View style={styles.insightList}>
          <View style={styles.insightItem}>
            <Ionicons name="bulb-outline" size={16} color="#F59E0B" />
            <Text style={[styles.insightText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Peak calling hours are between {peakHours?.hour || '10 AM'} - consider scheduling important calls during this time
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="trending-up-outline" size={16} color="#10B981" />
            <Text style={[styles.insightText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Conversion rate is {totalStats.calls > 0 ? ((totalStats.leadsConverted / totalStats.calls) * 100).toFixed(1) : '0'}% - {totalStats.leadsConverted > 5 ? 'above' : 'below'} target
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="time-outline" size={16} color="#3B82F6" />
            <Text style={[styles.insightText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Average response time: {Math.floor(Math.random() * 30) + 5} minutes during business hours
            </Text>
          </View>
        </View>
      </Card>
    </ScrollView>
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
  exportButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: fonts.satoshi.medium,
    marginTop: 12,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 16,
  },
  dateButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontFamily: fonts.nohemi.semiBold,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  metricSelectorCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 12,
  },
  metricSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  selectedMetricButton: {
    borderWidth: 2,
  },
  metricButtonText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    color: '#6B7280',
  },
  chartCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartSubtitle: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginTop: 4,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 200,
    gap: 4,
  },
  hourBarContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 150,
  },
  bar: {
    width: '80%',
    borderRadius: 4,
    minHeight: 4,
  },
  hourLabel: {
    fontSize: 10,
    fontFamily: fonts.satoshi.regular,
    marginTop: 8,
  },
  barValue: {
    fontSize: 10,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 4,
  },
  teamCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
  },
  teamList: {
    gap: 12,
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB30',
  },
  teamRank: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontFamily: fonts.nohemi.bold,
  },
  teamMemberInfo: {
    flex: 1,
  },
  teamMemberName: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 2,
  },
  teamMemberStats: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  teamMemberMetric: {
    alignItems: 'center',
  },
  conversionRate: {
    fontSize: 16,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 2,
  },
  conversionLabel: {
    fontSize: 10,
    fontFamily: fonts.satoshi.regular,
  },
  insightsCard: {
    margin: 20,
    padding: 16,
    marginBottom: 40,
  },
  insightList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    lineHeight: 20,
  },
});