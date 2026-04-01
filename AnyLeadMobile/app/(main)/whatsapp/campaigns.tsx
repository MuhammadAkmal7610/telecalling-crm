import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme, FlatList, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

interface WhatsAppCampaign {
  id: string;
  name: string;
  description: string;
  campaign_type: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  created_at: string;
  scheduled_at?: string;
}

interface CampaignStats {
  totalMessages: number;
  sentMessages: number;
  deliveredMessages: number;
  readMessages: number;
  failedMessages: number;
  deliveryRate: number;
  readRate: number;
}

export default function WhatsAppCampaignsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<WhatsAppCampaign | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await ApiService.get('/whatsapp/campaigns');
      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      Alert.alert('Error', 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = () => {
    router.push('/whatsapp/create-campaign');
  };

  const runCampaign = async (campaignId: string) => {
    try {
      const { data, error } = await ApiService.post(`/whatsapp/campaigns/${campaignId}/run`);
      if (error) throw error;
      
      Alert.alert('Success', 'Campaign execution started');
      loadCampaigns();
    } catch (error: any) {
      console.error('Error running campaign:', error);
      Alert.alert('Error', error.message || 'Failed to run campaign');
    }
  };

  const deleteCampaign = async (campaignId: string) => {
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
              await ApiService.delete(`/whatsapp/campaigns/${campaignId}`);
              Alert.alert('Success', 'Campaign deleted successfully');
              loadCampaigns();
            } catch (error: any) {
              console.error('Error deleting campaign:', error);
              Alert.alert('Error', error.message || 'Failed to delete campaign');
            }
          },
        },
      ]
    );
  };

  const viewAnalytics = async (campaign: WhatsAppCampaign) => {
    try {
      const { data, error } = await ApiService.get(`/whatsapp/campaigns/${campaign.id}/analytics`);
      if (error) throw error;
      
      setSelectedCampaign({ ...campaign, ...data });
      setShowAnalytics(true);
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      Alert.alert('Error', error.message || 'Failed to load analytics');
    }
  };

  const getProgressPercentage = (campaign: WhatsAppCampaign) => {
    if (campaign.total_recipients === 0) return 0;
    return Math.round((campaign.sent_count / campaign.total_recipients) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'running': return '#3B82F6';
      case 'scheduled': return '#F59E0B';
      case 'draft': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const renderCampaignCard = ({ item }: { item: WhatsAppCampaign }) => (
    <Card key={item.id} style={[styles.campaignCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.campaignHeader}>
        <View style={styles.campaignInfo}>
          <Text style={[styles.campaignName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.name}
          </Text>
          <Text style={[styles.campaignType, { color: colors.primary }]}>
            {item.campaign_type.toUpperCase()}
          </Text>
          <Text style={[styles.campaignDate, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Created: {format(new Date(item.created_at), 'MMM dd, yyyy')}
            {item.scheduled_at && ` • Scheduled: ${format(new Date(item.scheduled_at), 'MMM dd, yyyy')}`}
          </Text>
        </View>
        <View style={styles.campaignStatus}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
      </View>

      {item.description && (
        <Text style={[styles.campaignDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          {item.description}
        </Text>
      )}

      <View style={styles.campaignStats}>
        <View style={styles.statItem}>
          <Text style={[styles.campaignStatLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Recipients</Text>
          <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.total_recipients}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.campaignStatLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Sent</Text>
          <Text style={[styles.statValue, { color: '#3B82F6' }]}>
            {item.sent_count}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.campaignStatLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Delivered</Text>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            {item.delivered_count}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.campaignStatLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Failed</Text>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>
            {item.failed_count}
          </Text>
        </View>
      </View>

      <View style={styles.campaignProgress}>
        <View style={styles.progressInfo}>
          <Text style={[styles.progressLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Progress: {getProgressPercentage(item)}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${getProgressPercentage(item)}%`,
                backgroundColor: getStatusColor(item.status)
              }
            ]} 
          />
        </View>
      </View>

      <View style={styles.campaignActions}>
        {item.status === 'draft' && (
          <Button
            title="Run Campaign"
            onPress={() => runCampaign(item.id)}
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
          />
        )}
        {item.status === 'completed' && (
          <Button
            title="View Analytics"
            onPress={() => viewAnalytics(item)}
            style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
          />
        )}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
          onPress={() => deleteCampaign(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
          <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="analytics-outline" size={48} color={colors.primary} />
          <Text style={[styles.loadingText, { color: isDark ? colors.surface : colors.onBackground }]}>
            Loading Campaigns...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          WhatsApp Campaigns
        </Text>
        <Button
          title="Create Campaign"
          onPress={createCampaign}
          style={[styles.createButton, { backgroundColor: colors.primary }]}
        />
      </View>

      {/* Stats Summary */}
      <Card style={[styles.statsCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {campaigns.length}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Total Campaigns
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#3B82F6' }]}>
              {campaigns.filter(c => c.status === 'running').length}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Running
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>
              {campaigns.filter(c => c.status === 'completed').length}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Completed
            </Text>
          </View>
        </View>
      </Card>

      {/* Campaigns List */}
      <FlatList
        data={campaigns}
        renderItem={renderCampaignCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.campaignsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="send-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No campaigns yet
            </Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              Create your first WhatsApp campaign to get started
            </Text>
            <Button
              title="Create Your First Campaign"
              onPress={createCampaign}
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
            />
          </View>
        }
      />

      {/* Analytics Modal */}
      <Modal
        visible={showAnalytics}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAnalytics(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
                Campaign Analytics
              </Text>
              <TouchableOpacity onPress={() => setShowAnalytics(false)}>
                <Ionicons name="close-circle" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            {selectedCampaign && (
              <View style={styles.analyticsContent}>
                <Text style={[styles.campaignName, { color: isDark ? colors.surface : colors.onBackground, marginBottom: 16 }]}>
                  {selectedCampaign.name}
                </Text>

                <View style={styles.metricsGrid}>
                  <View style={styles.metricCard}>
                    <Text style={[styles.metricLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      Total Messages
                    </Text>
                    <Text style={[styles.metricValue, { color: isDark ? colors.surface : colors.onBackground }]}>
                      {selectedCampaign.total_recipients}
                    </Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={[styles.metricLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      Delivery Rate
                    </Text>
                    <Text style={[styles.metricValue, { color: '#3B82F6' }]}>
                      {selectedCampaign.delivered_count > 0 ? Math.round((selectedCampaign.delivered_count / selectedCampaign.sent_count) * 100) : 0}%
                    </Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={[styles.metricLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      Read Rate
                    </Text>
                    <Text style={[styles.metricValue, { color: '#10B981' }]}>
                      {selectedCampaign.read_count > 0 ? Math.round((selectedCampaign.read_count / selectedCampaign.delivered_count) * 100) : 0}%
                    </Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={[styles.metricLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      Failed Rate
                    </Text>
                    <Text style={[styles.metricValue, { color: '#EF4444' }]}>
                      {selectedCampaign.failed_count > 0 ? Math.round((selectedCampaign.failed_count / selectedCampaign.total_recipients) * 100) : 0}%
                    </Text>
                  </View>
                </View>

                <View style={styles.detailedStats}>
                  <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground, marginBottom: 12 }]}>
                    Detailed Statistics
                  </Text>
                  <View style={styles.statRow}>
                    <Text style={[styles.statText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Sent:</Text>
                    <Text style={[styles.statValue, { color: '#3B82F6' }]}>{selectedCampaign.sent_count}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={[styles.statText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Delivered:</Text>
                    <Text style={[styles.statValue, { color: '#10B981' }]}>{selectedCampaign.delivered_count}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={[styles.statText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Read:</Text>
                    <Text style={[styles.statValue, { color: '#8B5CF6' }]}>{selectedCampaign.read_count}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={[styles.statText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Failed:</Text>
                    <Text style={[styles.statValue, { color: '#EF4444' }]}>{selectedCampaign.failed_count}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
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
  statsCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F3F4F620',
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  campaignsList: {
    padding: 20,
    paddingTop: 0,
  },
  campaignCard: {
    marginBottom: 12,
    padding: 16,
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
  campaignType: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 4,
  },
  campaignDate: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  campaignStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: fonts.nohemi.medium,
  },
  campaignDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 12,
  },
  campaignStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F620',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  campaignStatLabel: {
    fontSize: 10,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontFamily: fonts.nohemi.bold,
  },
  campaignProgress: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  campaignActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
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
    marginBottom: 20,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.bold,
  },
  analyticsContent: {},
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    backgroundColor: '#F3F4F620',
    borderRadius: 12,
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontFamily: fonts.nohemi.bold,
  },
  detailedStats: {
    padding: 16,
    backgroundColor: '#F3F4F620',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB30',
  },
  statText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
});
