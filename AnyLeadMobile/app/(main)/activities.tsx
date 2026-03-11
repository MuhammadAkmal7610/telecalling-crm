import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, useColorScheme } from 'react-native';
import { Card } from '../../src/components/common/Card';
import { colors, fonts } from '../../src/theme/theme';
import { ApiService } from '../../src/services/ApiService';
import { useAuth } from '../../src/contexts/AuthContext';
import { Activity } from '../../src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

export default function ActivitiesScreen() {
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadActivities = async () => {
    try {
      const { data } = await ApiService.getActivities(undefined, user?.workspace_id);
      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadActivities();
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'call':
        return 'call-outline';
      case 'email':
        return 'mail-outline';
      case 'sms':
        return 'chatbubble-outline';
      case 'meeting':
        return 'calendar-outline';
      case 'note':
        return 'document-text-outline';
      case 'task':
        return 'checkbox-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'call':
        return '#10B981';
      case 'email':
        return '#3B82F6';
      case 'sms':
        return '#8B5CF6';
      case 'meeting':
        return '#F59E0B';
      case 'note':
        return '#6B7280';
      case 'task':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const renderActivityItem = ({ item }: { item: Activity & { user?: { name: string } } }) => (
    <Card style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <View style={[styles.activityIcon, { backgroundColor: getActivityColor(item.type) }]}>
          <Ionicons 
            name={getActivityIcon(item.type) as any} 
            size={20} 
            color="#FFFFFF" 
          />
        </View>
        <View style={styles.activityInfo}>
          <Text style={[styles.activityType, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
          <Text style={[styles.activityDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {item.description}
          </Text>
          {item.user?.name && (
            <Text style={[styles.activityUser, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              by {item.user.name}
            </Text>
          )}
        </View>
      </View>
      <Text style={[styles.activityTime, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
        {format(new Date(item.created_at), 'MMM dd, yyyy • h:mm a')}
      </Text>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Activities
        </Text>
      </View>

      {/* Activities List */}
      <FlatList
        data={activities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No activities found
            </Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Activities will appear here as you interact with leads and campaigns
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
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  activityCard: {
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityType: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 2,
  },
  activityUser: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    fontStyle: 'italic',
  },
  activityTime: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    textAlign: 'right',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: fonts.nohemi.medium,
    marginTop: 12,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
});
