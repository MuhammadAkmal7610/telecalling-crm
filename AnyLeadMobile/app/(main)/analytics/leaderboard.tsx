import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, useColorScheme, RefreshControl, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts, shadows } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
  const isDark = useColorScheme() === 'dark';
  
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
      const { data, error } = await ApiService.getAgentPerformance(selectedTimeRange);
      
      if (error) throw error;

      if (data && Array.isArray(data)) {
        const formattedData: LeaderboardUser[] = data.map((agent: any, index: number) => ({
          id: agent.id,
          name: agent.name,
          email: agent.email,
          avatar: agent.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
          role: agent.role || 'Sales Representative',
          metrics: {
            leadsConverted: agent.metrics?.leads?.won || 0,
            totalRevenue: agent.metrics?.revenue?.total || 0,
            callsMade: agent.metrics?.calls?.total || 0,
            meetingsScheduled: agent.metrics?.activities?.meetings || 0,
            conversionRate: agent.metrics?.leads?.conversionRate || 0,
            activitiesCompleted: agent.metrics?.activities?.total || 0,
          },
          rank: index + 1,
          previousRank: index + 1, // Mock trend for now
          trend: 'same'
        }));
        
        setLeaderboardData(formattedData);
      }
    } catch (error: any) {
      console.error('Error loading leaderboard data:', error);
      Alert.alert('Error', error.message || 'Failed to load leaderboard data');
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

      <View style={styles.userMetricContainer}>
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
      <View style={styles.topPerformerContainer}>
        <LinearGradient
          colors={colors.gradientRoyal}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.topPerformerGradient}
        >
          <View style={styles.topPerformerContent}>
            <View style={styles.crownWrapper}>
              <View style={styles.crownCircle}>
                <Ionicons name="trophy" size={40} color="#FFD700" />
              </View>
              <View style={styles.rankOneBadge}>
                <Text style={styles.rankOneText}>1</Text>
              </View>
            </View>
            
            <View style={styles.topUserInfo}>
              <Text style={styles.topPerformerLabel}>TOP PERFORMER</Text>
              <Text style={styles.topPerformerName}>{topPerformer.name}</Text>
              <Text style={styles.topPerformerRole}>{topPerformer.role}</Text>
            </View>

            <View style={styles.topMetricBox}>
              <Text style={styles.topMetricValue}>{getMetricValue(topPerformer)}</Text>
              <Text style={styles.topMetricLabel}>{selectedMetricData?.label}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.primary + '15',
  },
  topPerformerContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  topPerformerGradient: {
    borderRadius: 24,
    padding: 24,
    ...shadows.lg,
  },
  topPerformerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crownWrapper: {
    position: 'relative',
    marginRight: 20,
  },
  crownCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,215,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.5)',
  },
  rankOneBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FFD700',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  rankOneText: {
    color: '#000',
    fontSize: 14,
    fontFamily: fonts.nohemi.bold,
  },
  topUserInfo: {
    flex: 1,
  },
  topPerformerLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontFamily: fonts.satoshi.bold,
    letterSpacing: 1,
    marginBottom: 4,
  },
  topPerformerName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 2,
  },
  topPerformerRole: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: fonts.satoshi.medium,
  },
  topMetricBox: {
    alignItems: 'flex-end',
  },
  topMetricValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
  },
  topMetricLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontFamily: fonts.satoshi.medium,
    textAlign: 'right',
  },
  timeRangeContainer: {
    paddingHorizontal: 20,
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
  userMetricContainer: {
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
