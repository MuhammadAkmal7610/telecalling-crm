import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '../../../src/components/common/Card';
import { colors, fonts } from '../../../src/theme/theme';
import { useAuth } from '../../../src/contexts/AuthContext';
import { ApiService } from '../../../src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  metrics: {
    leadsConverted: number;
    totalRevenue: number;
    callsMade: number;
    meetingsScheduled: number;
    conversionRate: number;
    activitiesCompleted: number;
  };
  rank: number;
  previousRank: number;
  trend: 'up' | 'down' | 'same';
}

interface TimeRange {
  label: string;
  value: string;
  days: number;
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark');
  
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('leadsConverted');

  const timeRanges: TimeRange[] = [
    { label: 'Today', value: 'today', days: 1 },
    { label: 'This Week', value: 'week', days: 7 },
    { label: 'This Month', value: 'month', days: 30 },
    { label: 'This Quarter', value: 'quarter', days: 90 },
    { label: 'This Year', value: 'year', days: 365 }
  ];

  const metrics = [
    { key: 'leadsConverted', label: 'Leads Converted', icon: 'person-outline', color: '#10B981' },
    { key: 'totalRevenue', label: 'Revenue Generated', icon: 'cash-outline', color: '#3B82F6' },
    { key: 'callsMade', label: 'Calls Made', icon: 'call-outline', color: '#8B5CF6' },
    { key: 'meetingsScheduled', label: 'Meetings', icon: 'calendar-outline', color: '#F59E0B' },
    { key: 'conversionRate', label: 'Conversion Rate', icon: 'trending-up-outline', color: '#EC4899' },
    { key: 'activitiesCompleted', label: 'Activities', icon: 'pulse-outline', color: '#059669' }
  ];

  useEffect(() => {
    loadLeaderboardData();
  }, [selectedTimeRange, selectedMetric]);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      // For now, use mock data. In future, fetch from API
      const mockData: LeaderboardUser[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          avatar: 'SJ',
          role: 'Sales Manager',
          metrics: {
            leadsConverted: 45,
            totalRevenue: 125000,
            callsMade: 280,
            meetingsScheduled: 65,
            conversionRate: 16.1,
            activitiesCompleted: 420
          },
          rank: 1,
          previousRank: 2,
          trend: 'up'
        },
        {
          id: '2',
          name: 'Michael Chen',
          email: 'michael@example.com',
          avatar: 'MC',
          role: 'Sales Executive',
          metrics: {
            leadsConverted: 42,
            totalRevenue: 118000,
            callsMade: 265,
            meetingsScheduled: 58,
            conversionRate: 15.8,
            activitiesCompleted: 395
          },
          rank: 2,
          previousRank: 1,
          trend: 'down'
        },
        {
          id: '3',
          name: 'Emily Davis',
          email: 'emily@example.com',
          avatar: 'ED',
          role: 'Sales Executive',
          metrics: {
            leadsConverted: 38,
            totalRevenue: 95000,
            callsMade: 240,
            meetingsScheduled: 52,
            conversionRate: 15.8,
            activitiesCompleted: 360
          },
          rank: 3,
          previousRank: 4,
          trend: 'up'
        },
        {
          id: '4',
          name: 'James Wilson',
          email: 'james@example.com',
          avatar: 'JW',
          role: 'Sales Representative',
          metrics: {
            leadsConverted: 35,
            totalRevenue: 87000,
            callsMade: 220,
            meetingsScheduled: 48,
            conversionRate: 15.9,
            activitiesCompleted: 340
          },
          rank: 4,
          previousRank: 3,
          trend: 'down'
        },
        {
          id: '5',
          name: 'Lisa Anderson',
          email: 'lisa@example.com',
          avatar: 'LA',
          role: 'Sales Representative',
          metrics: {
            leadsConverted: 32,
            totalRevenue: 78000,
            callsMade: 200,
            meetingsScheduled: 44,
            conversionRate: 16.0,
            activitiesCompleted: 310
          },
          rank: 5,
          previousRank: 5,
          trend: 'same'
        }
      ];
      
      // Sort by selected metric
      const sortedData = [...mockData].sort((a, b) => {
        const aValue = a.metrics[selectedMetric as keyof typeof a.metrics];
        const bValue = b.metrics[selectedMetric as keyof typeof b.metrics];
        return typeof aValue === 'number' && typeof bValue === 'number' ? bValue - aValue : 0;
      });
      
      // Update ranks
      sortedData.forEach((user, index) => {
        user.rank = index + 1;
      });
      
      setLeaderboardData(sortedData);
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
      Alert.alert('Error', 'Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboardData();
    setRefreshing(false);
  };

  const getMetricValue = (user: LeaderboardUser) => {
    const value = user.metrics[selectedMetric as keyof typeof user.metrics];
    if (selectedMetric === 'totalRevenue') {
      return `$${(value as number).toLocaleString()}`;
    } else if (selectedMetric === 'conversionRate') {
      return `${(value as number).toFixed(1)}%`;
    }
    return value.toString();
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return isDark ? '#6B7280' : '#9CA3AF';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'remove';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#10B981';
      case 'down': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardUser; index: number }) => (
    <Card style={[
      styles.leaderboardItem,
      item.rank <= 3 && styles.topPerformer,
      { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }
    ]}>
      <View style={styles.rankContainer}>
        <View style={[styles.rankBadge, { backgroundColor: getRankColor(item.rank) }]}>
          <Text style={[styles.rankText, { color: item.rank <= 3 ? '#FFFFFF' : colors.surface }]}>
            {item.rank}
          </Text>
        </View>
        {item.rank <= 3 && (
          <Ionicons name="trophy" size={16} color={getRankColor(item.rank)} />
        )}
      </View>

      <View style={styles.userInfo}>
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.name) }]}>
          <Text style={[styles.avatarText, { color: '#FFFFFF' }]}>
            {item.avatar}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={[styles.userName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.name}
          </Text>
          <Text style={[styles.userRole, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {item.role}
          </Text>
        </View>
      </View>

      <View style={styles.metricContainer}>
        <Text style={[styles.metricValue, { color: isDark ? colors.surface : colors.onBackground }]}>
          {getMetricValue(item)}
        </Text>
        <Text style={[styles.metricLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          {metrics.find(m => m.key === selectedMetric)?.label}
        </Text>
      </View>

      <View style={styles.trendContainer}>
        <Ionicons 
          name={getTrendIcon(item.trend) as any} 
          size={16} 
          color={getTrendColor(item.trend)} 
        />
        <Text style={[styles.trendText, { color: getTrendColor(item.trend) }]}>
          {item.previousRank}
        </Text>
      </View>
    </Card>
  );

  const getAvatarColor = (name: string) => {
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const renderTopPerformer = () => {
    if (leaderboardData.length === 0) return null;
    const topPerformer = leaderboardData[0];
    const selectedMetricData = metrics.find(m => m.key === selectedMetric);

    return (
      <Card style={styles.topPerformerCard}>
        <View style={styles.topPerformerHeader}>
          <View style={[styles.crownContainer, { backgroundColor: '#FFD70020' }]}>
            <Ionicons name="trophy" size={32} color="#FFD700" />
          </View>
          <View style={styles.topPerformerInfo}>
            <Text style={[styles.topPerformerTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              Top Performer
            </Text>
            <Text style={[styles.topPerformerName, { color: isDark ? colors.surface : colors.onBackground }]}>
              {topPerformer.name}
            </Text>
            <Text style={[styles.topPerformerRole, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {topPerformer.role}
            </Text>
          </View>
        </View>
        
        <View style={styles.topPerformerMetric}>
          <Ionicons 
            name={selectedMetricData?.icon as any} 
            size={24} 
            color={selectedMetricData?.color} 
          />
          <Text style={[styles.topPerformerValue, { color: isDark ? colors.surface : colors.onBackground }]}>
            {getMetricValue(topPerformer)}
          </Text>
          <Text style={[styles.topPerformerMetricLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {selectedMetricData?.label}
          </Text>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Leaderboard
        </Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => Alert.alert('Share', 'Leaderboard sharing will be implemented')}
        >
          <Ionicons name="share-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Top Performer */}
      {renderTopPerformer()}

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

      {/* Metric Selector */}
      <View style={styles.metricContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {metrics.map((metric) => (
            <TouchableOpacity
              key={metric.key}
              style={[
                styles.metricButton,
                selectedMetric === metric.key && styles.selectedMetricButton,
                { borderColor: isDark ? '#374151' : '#E5E7EB' }
              ]}
              onPress={() => setSelectedMetric(metric.key)}
            >
              <Ionicons 
                name={metric.icon as any} 
                size={16} 
                color={selectedMetric === metric.key ? metric.color : (isDark ? '#6B7280' : '#9CA3AF')} 
              />
              <Text style={[
                styles.metricButtonText,
                selectedMetric === metric.key && styles.selectedMetricButtonText
              ]}>
                {metric.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Leaderboard List */}
      <FlatList
        data={leaderboardData}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={{
          refreshing,
          onRefresh,
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="podium-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No leaderboard data available
            </Text>
          </View>
        }
      />
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
  shareButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
  },
  topPerformerCard: {
    margin: 20,
    padding: 20,
  },
  topPerformerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  crownContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  topPerformerInfo: {
    flex: 1,
  },
  topPerformerTitle: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 4,
  },
  topPerformerName: {
    fontSize: 20,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 2,
  },
  topPerformerRole: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  topPerformerMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  topPerformerValue: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
  },
  topPerformerMetricLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  timeRangeContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
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
  metricContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  metricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    gap: 6,
  },
  selectedMetricButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  metricButtonText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    color: '#6B7280',
  },
  selectedMetricButtonText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  topPerformer: {
    borderColor: '#FFD700',
    backgroundColor: '#FFD70005',
  },
  rankContainer: {
    alignItems: 'center',
    width: 50,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  rankText: {
    fontSize: 14,
    fontFamily: fonts.nohemi.bold,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontFamily: fonts.nohemi.bold,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  metricContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  metricValue: {
    fontSize: 16,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    fontFamily: fonts.satoshi.medium,
    textAlign: 'center',
  },
  trendContainer: {
    alignItems: 'center',
    width: 40,
  },
  trendText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fonts.satoshi.medium,
    marginTop: 12,
  },
});
