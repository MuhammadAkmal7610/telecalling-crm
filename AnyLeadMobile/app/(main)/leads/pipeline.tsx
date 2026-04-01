import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: string;
  assignedTo: string;
  assignedToName: string;
  lastContacted: string;
  nextFollowUp: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface PipelineStage {
  id: string;
  name: string;
  leads: Lead[];
  color: string;
  order: number;
}

export default function LeadPipelineScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPipeline();
  }, []);

  const loadPipeline = async () => {
    try {
      setLoading(true);
      if (!user?.organization_id) return;

      // Get leads and organize them into pipeline stages
      const response = await ApiService.get('/leads');
      const leads = response.data || [];
      
      // Define pipeline stages
      const stages: PipelineStage[] = [
        {
          id: 'fresh',
          name: 'Fresh Leads',
          leads: leads.filter((l: Lead) => l.status.toLowerCase() === 'fresh'),
          color: '#3B82F6',
          order: 1,
        },
        {
          id: 'contacted',
          name: 'Contacted',
          leads: leads.filter((l: Lead) => l.status.toLowerCase() === 'contacted'),
          color: '#F59E0B',
          order: 2,
        },
        {
          id: 'qualified',
          name: 'Qualified',
          leads: leads.filter((l: Lead) => l.status.toLowerCase() === 'qualified'),
          color: '#10B981',
          order: 3,
        },
        {
          id: 'proposal',
          name: 'Proposal Sent',
          leads: leads.filter((l: Lead) => l.status.toLowerCase() === 'proposal'),
          color: '#8B5CF6',
          order: 4,
        },
        {
          id: 'negotiation',
          name: 'Negotiation',
          leads: leads.filter((l: Lead) => l.status.toLowerCase() === 'negotiation'),
          color: '#EF4444',
          order: 5,
        },
        {
          id: 'converted',
          name: 'Converted',
          leads: leads.filter((l: Lead) => l.status.toLowerCase() === 'converted'),
          color: '#22C55E',
          order: 6,
        },
      ];

      setPipeline(stages);
    } catch (error) {
      console.error('Error loading pipeline:', error);
      Alert.alert('Error', 'Failed to load lead pipeline');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPipeline();
    setRefreshing(false);
  };

  const getPriorityColor = (priority: string) => {
    if (!priority) return '#6B7280';
    switch (priority.toLowerCase()) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (!priority) return 'help-circle';
    switch (priority.toLowerCase()) {
      case 'urgent': return 'alert-circle';
      case 'high': return 'warning';
      case 'medium': return 'information-circle';
      case 'low': return 'checkmark-circle';
      default: return 'help-circle';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getEstimatedValue = (lead: Lead) => {
    // Simple estimation based on priority and stage
    const baseValues: Record<string, number> = {
      'urgent': 50000,
      'high': 25000,
      'medium': 10000,
      'low': 5000,
    };
    const priority = (lead.priority || 'medium').toLowerCase();
    return baseValues[priority] || 5000;
  };

  const getTotalPipelineValue = () => {
    return pipeline.reduce((total, stage) => {
      const stageValue = stage.leads.reduce((stageTotal, lead) => {
        return stageTotal + getEstimatedValue(lead);
      }, 0);
      return total + stageValue;
    }, 0);
  };

  const getConversionRate = () => {
    const totalLeads = pipeline.reduce((total, stage) => total + stage.leads.length, 0);
    const convertedLeads = pipeline.find(stage => stage.id === 'converted')?.leads.length || 0;
    return totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="analytics-outline" size={48} color={colors.primary} />
          <Text style={[styles.loadingText, { color: isDark ? colors.surface : colors.onBackground }]}>
            Loading Pipeline...
          </Text>
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
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Lead Pipeline
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Total Value</Text>
            <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
              {formatCurrency(getTotalPipelineValue())}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Conversion Rate</Text>
            <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
              {getConversionRate()}%
            </Text>
          </View>
        </View>
      </View>

      {/* Pipeline Stages */}
      <View style={styles.pipelineContainer}>
        {pipeline.map((stage) => (
          <Card
            key={stage.id}
            style={[
              styles.stageCard,
              { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }
            ]}
          >
            <View style={styles.stageHeader}>
              <View style={[styles.stageIndicator, { backgroundColor: stage.color }]} />
              <Text style={[styles.stageTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
                {stage.name}
              </Text>
              <Text style={[styles.stageCount, { color: stage.color }]}>
                {stage.leads.length}
              </Text>
            </View>

            {stage.leads.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="leaf-outline" size={32} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  No leads in this stage
                </Text>
              </View>
            ) : (
              <View style={styles.leadsList}>
                {stage.leads.map((lead) => (
                  <TouchableOpacity
                    key={lead.id}
                    style={[
                      styles.leadCard,
                      { borderColor: isDark ? '#374151' : '#E5E7EB' }
                    ]}
                    onPress={() => router.push(`/leads/${lead.id}` as any)}
                  >
                    <View style={styles.leadHeader}>
                      <Text style={[styles.leadName, { color: isDark ? colors.surface : colors.onBackground }]}>
                        {lead.name}
                      </Text>
                      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(lead.priority) + '20' }]}>
                        <Ionicons name={getPriorityIcon(lead.priority)} size={12} color={getPriorityColor(lead.priority)} />
                        <Text style={[styles.priorityText, { color: getPriorityColor(lead.priority) }]}>
                          {(lead.priority || 'Medium').toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.leadDetails}>
                      <Text style={[styles.leadInfo, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                        {lead.phone} • {lead.email}
                      </Text>
                      <Text style={[styles.leadInfo, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                        Source: {lead.source} • Assigned: {lead.assignedToName}
                      </Text>
                    </View>

                    <View style={styles.leadFooter}>
                      <Text style={[styles.leadMeta, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                        Last Contacted: {new Date(lead.lastContacted).toLocaleDateString()}
                      </Text>
                      {lead.nextFollowUp && (
                        <Text style={[styles.leadMeta, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                          Next Follow-up: {new Date(lead.nextFollowUp).toLocaleDateString()}
                        </Text>
                      )}
                    </View>

                    <View style={styles.leadActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.primary }]}
                        onPress={() => router.push(`/communication/whatsapp?phone=${lead.phone}&name=${lead.name}` as any)}
                      >
                        <Ionicons name="logo-whatsapp" size={16} color="white" />
                        <Text style={styles.actionText}>WhatsApp</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
                        onPress={() => router.push(`/communication/dialer?phone=${lead.phone}&name=${lead.name}` as any)}
                      >
                        <Ionicons name="call" size={16} color="white" />
                        <Text style={styles.actionText}>Call</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                        onPress={() => router.push(`/leads/${lead.id}/edit` as any)}
                      >
                        <Ionicons name="pencil" size={16} color="white" />
                        <Text style={styles.actionText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>
        ))}
      </View>

      {/* Quick Actions */}
      <Card style={[styles.actionsCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <Text style={[styles.actionsTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Quick Actions
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.quickButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push({
              pathname: '/leads/create',
              params: { returnTo: 'leads/pipeline' }
            } as any)}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text style={styles.quickButtonText}>Add Lead</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickButton, { backgroundColor: '#10B981' }]}
            onPress={() => router.push('/leads/search' as any)}
          >
            <Ionicons name="search" size={24} color="white" />
            <Text style={styles.quickButtonText}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickButton, { backgroundColor: '#F59E0B' }]}
            onPress={() => router.push('/leads/import' as any)}
          >
            <Ionicons name="cloud-upload" size={24} color="white" />
            <Text style={styles.quickButtonText}>Import</Text>
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
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontFamily: fonts.nohemi.bold,
  },
  pipelineContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  stageCard: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stageIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  stageTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
  },
  stageCount: {
    fontSize: 16,
    fontFamily: fonts.nohemi.bold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginTop: 8,
  },
  leadsList: {
    gap: 12,
  },
  leadCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leadName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    flex: 1,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: fonts.nohemi.medium,
    textTransform: 'uppercase',
  },
  leadDetails: {
    gap: 4,
    marginBottom: 8,
  },
  leadInfo: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  leadFooter: {
    gap: 4,
    marginBottom: 12,
  },
  leadMeta: {
    fontSize: 11,
    fontFamily: fonts.satoshi.regular,
  },
  leadActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    fontFamily: fonts.nohemi.medium,
    color: 'white',
  },
  actionsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionsTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  quickButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  quickButtonText: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
    color: 'white',
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
});