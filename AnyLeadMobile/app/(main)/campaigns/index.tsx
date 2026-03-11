import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '../../../src/components/common/Card';
import { colors, fonts } from '../../../src/theme/theme';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Campaign } from '../../../src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../../../src/services/ApiService';
export default function CampaignsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCampaigns = async () => {
    try {
      const { data } = await ApiService.getCampaigns(user?.workspace_id);
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      Alert.alert('Error', 'Failed to load campaigns');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCampaigns();
  };

  const handleDeleteCampaign = (campaignId: string) => {
    Alert.alert(
      'Delete Campaign',
      'Are you sure you want to delete this campaign?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Note: You'll need to implement deleteCampaign in ApiService
              // await ApiService.deleteCampaign(campaignId);
              loadCampaigns();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete campaign');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#10B981';
      case 'draft':
        return '#F59E0B';
      case 'completed':
        return '#3B82F6';
      case 'paused':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const renderCampaignItem = ({ item }: { item: Campaign }) => (
    <Card
      style={styles.campaignCard}
      onPress={() => router.push(`/campaigns/${item.id}` as any)}
    >
      <View style={styles.campaignHeader}>
        <View style={styles.campaignInfo}>
          <Text style={[styles.campaignName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.name}
          </Text>
          {item.description && (
            <Text style={[styles.campaignDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {item.description}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteCampaign(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.campaignBadges}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Text style={styles.badgeText}>{item.priority}</Text>
        </View>
      </View>

      <View style={styles.campaignFooter}>
        <Text style={[styles.campaignDate, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Created: {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <Text style={[styles.campaignProgress, { color: colors.primary }]}>
          Progress: {item.progress || 0}%
        </Text>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Campaigns
        </Text>
        <Button
          title="Create Campaign"
          onPress={() => router.push('/campaigns/create' as any)}
        />
      </View>

      {/* Campaigns List */}
      <FlatList
        data={campaigns}
        renderItem={renderCampaignItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No campaigns found
            </Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Start by creating your first campaign
            </Text>
            <Button
              title="Create Your First Campaign"
              onPress={() => router.push('/campaigns/create' as any)}
              style={styles.emptyButton}
            />
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
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  campaignCard: {
    marginBottom: 12,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  campaignInfo: {
    flex: 1,
  },
  campaignName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 4,
  },
  campaignDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 8,
  },
  deleteButton: {
    padding: 4,
  },
  campaignBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: fonts.satoshi.medium,
    textTransform: 'uppercase',
  },
  campaignFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  campaignDate: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  campaignProgress: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyButton: {
    paddingHorizontal: 24,
  },
});
