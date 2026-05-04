import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, useColorScheme, TouchableOpacity } from 'react-native';
import { Card } from '@/src/components/common/Card';
import { colors, fonts, shadows } from '@/src/theme/theme';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

export default function NotificationsScreen() {
  const isDark = useColorScheme() === 'dark';
  const { notifications, unreadCount, loading, refreshNotifications, markAsRead, markAllAsRead } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'lead_assigned': return 'person-add';
      case 'follow_up': return 'calendar';
      case 'new_lead': return 'megaphone';
      case 'team_update': return 'people';
      case 'call_reminder': return 'call';
      case 'message': return 'chatbubbles';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'lead_assigned': return '#6366F1';
      case 'follow_up': return '#F59E0B';
      case 'new_lead': return '#10B981';
      case 'team_update': return '#8B5CF6';
      case 'call_reminder': return '#3B82F6';
      case 'message': return '#EC4899';
      default: return colors.primary;
    }
  };

  const renderNotificationItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={() => !item.read && markAsRead(item.id)}
    >
      <Card style={[styles.notificationCard, !item.read && { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.primary + '30' }]}>
        <View style={styles.notificationMain}>
          <View style={[styles.iconCircle, { backgroundColor: getNotificationColor(item.type) + '15' }]}>
            <Ionicons name={getNotificationIcon(item.type) as any} size={22} color={getNotificationColor(item.type)} />
          </View>
          <View style={styles.contentArea}>
            <View style={styles.titleRow}>
              <Text style={[styles.notificationTitle, { color: isDark ? '#F8FAFC' : '#1E293B' }]}>{item.title}</Text>
              {!item.read && <View style={styles.unreadDot} />}
            </View>
            <Text style={[styles.notificationBody, { color: isDark ? '#94A3B8' : '#64748B' }]} numberOfLines={2}>
              {item.message || item.body || ''}
            </Text>
            <Text style={[styles.notificationTime, { color: isDark ? '#475569' : '#94A3B8' }]}>
              {item.created_at || item.timestamp ? 
                format(new Date(item.created_at || item.timestamp), 'MMM dd, h:mm a') : 
                'Just now'}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
      {/* Premium Header */}
      <LinearGradient
        colors={isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#F8FAFC']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerTitle, { color: isDark ? '#F8FAFC' : '#1E293B' }]}>Notifications</Text>
            <Text style={[styles.headerSubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              {unreadCount > 0 ? `You have ${unreadCount} unread messages` : 'You are all caught up'}
            </Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshNotifications} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="notifications-off-outline" size={48} color={isDark ? '#334155' : '#CBD5E1'} />
            </View>
            <Text style={[styles.emptyTitle, { color: isDark ? '#F8FAFC' : '#1E293B' }]}>No Notifications</Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              We'll notify you when something important happens.
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
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...shadows.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: fonts.nohemi.bold,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginTop: 2,
  },
  markAllBtn: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  markAllText: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: fonts.satoshi.bold,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  notificationCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 20,
  },
  notificationMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentArea: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: fonts.satoshi.bold,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  notificationBody: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00000005',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: fonts.satoshi.regular,
    textAlign: 'center',
    marginHorizontal: 40,
    lineHeight: 22,
  },
});
