import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, useColorScheme, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button, LeadStatusBadge } from '../../src/components/common/Card';
import { colors, fonts } from '../../src/theme/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import { ApiService } from '../../src/services/ApiService';
import { Lead } from '../../src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

interface PipelineStage {
  id: string;
  name: string;
  status: string;
  color: string;
  leads: Lead[];
}

interface DragItem {
  lead: Lead;
  fromStage: string;
  toStage: string;
}

export default function LeadPipelineScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showStats, setShowStats] = useState(true);

  const defaultStages: Omit<PipelineStage, 'leads'>[] = [
    { id: '1', name: 'New Leads', status: 'new', color: '#10B981' },
    { id: '2', name: 'Contacted', status: 'contacted', color: '#3B82F6' },
    { id: '3', name: 'Qualified', status: 'qualified', color: '#8B5CF6' },
    { id: '4', name: 'Proposal', status: 'proposal', color: '#F59E0B' },
    { id: '5', name: 'Converted', status: 'converted', color: '#059669' },
    { id: '6', name: 'Lost', status: 'lost', color: '#EF4444' }
  ];

  useEffect(() => {
    loadPipelineData();
  }, []);

  const loadPipelineData = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getLeads(user?.workspace_id);
      const allLeads = response.data || [];
      
      // Group leads by status
      const pipelineStages = defaultStages.map(stage => ({
        ...stage,
        leads: allLeads.filter(lead => lead.status === stage.status)
      }));
      
      setStages(pipelineStages);
    } catch (error) {
      console.error('Error loading pipeline data:', error);
      Alert.alert('Error', 'Failed to load pipeline data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPipelineData();
    setRefreshing(false);
  };

  const moveLeadToStage = async (lead: Lead, fromStatus: string, toStatus: string) => {
    try {
      // Update lead status in backend
      await ApiService.updateLead(lead.id, { status: toStatus });
      
      // Update local state
      setStages(prevStages => {
        return prevStages.map(stage => {
          if (stage.status === fromStatus) {
            return {
              ...stage,
              leads: stage.leads.filter(l => l.id !== lead.id)
            };
          } else if (stage.status === toStatus) {
            return {
              ...stage,
              leads: [...stage.leads, { ...lead, status: toStatus }]
            };
          }
          return stage;
        });
      });

      // Log activity
      await ApiService.createActivity({
        type: 'status_change',
        description: `Moved ${lead.name} from ${fromStatus} to ${toStatus}`,
        lead_id: lead.id,
        user_id: user?.id,
        organization_id: user?.organization_id,
        workspace_id: user?.workspace_id
      });

    } catch (error) {
      console.error('Error moving lead:', error);
      Alert.alert('Error', 'Failed to move lead');
      // Revert the change
      await loadPipelineData();
    }
  };

  const handleLeadPress = (lead: Lead) => {
    setSelectedLead(lead);
    router.push(`/leads/${lead.id}` as any);
  };

  const handleLeadLongPress = (lead: Lead) => {
    Alert.alert(
      'Lead Actions',
      `Actions for ${lead.name}`,
      [
        { text: 'View Details', onPress: () => router.push(`/leads/${lead.id}` as any) },
        { text: 'Edit', onPress: () => router.push(`/leads/${lead.id}/edit` as any) },
        { text: 'Call', onPress: () => router.push({ pathname: '/dialer', params: { leadId: lead.id } } as any) },
        { text: 'Message', onPress: () => router.push({ pathname: '/messages/compose', params: { leadId: lead.id } } as any) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderStageHeader = (stage: PipelineStage) => (
    <View style={[styles.stageHeader, { backgroundColor: stage.color + '10' }]}>
      <View style={styles.stageHeaderLeft}>
        <View style={[styles.stageIndicator, { backgroundColor: stage.color }]} />
        <Text style={[styles.stageName, { color: isDark ? colors.surface : colors.onBackground }]}>
          {stage.name}
        </Text>
      </View>
      <View style={styles.stageHeaderRight}>
        <Text style={[styles.leadCount, { color: stage.color }]}>
          {stage.leads.length}
        </Text>
        <TouchableOpacity
          style={styles.addLeadButton}
          onPress={() => router.push(`/leads/create?status=${stage.status}` as any)}
        >
          <Ionicons name="add" size={16} color={stage.color} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLeadCard = (lead: Lead, stage: PipelineStage) => (
    <TouchableOpacity
      key={lead.id}
      style={[styles.leadCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}
      onPress={() => handleLeadPress(lead)}
      onLongPress={() => handleLeadLongPress(lead)}
      delayLongPress={500}
    >
      <View style={styles.leadHeader}>
        <View style={styles.leadInfo}>
          <Text style={[styles.leadName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {lead.name}
          </Text>
          {lead.email && (
            <Text style={[styles.leadEmail, { color: isDark ? '#9CA3AF' : '#6B7280' }]} numberOfLines={1}>
              {lead.email}
            </Text>
          )}
          {lead.phone && (
            <Text style={[styles.leadPhone, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {lead.phone}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.quickActions}
          onPress={() => {
            Alert.alert(
              'Move Lead',
              `Move ${lead.name} to another stage`,
              stages
                .filter(s => s.status !== stage.status)
                .map(s => ({
                  text: s.name,
                  onPress: () => moveLeadToStage(lead, stage.status, s.status)
                }))
            );
          }}
        >
          <Ionicons name="ellipsis-vertical" size={16} color={isDark ? '#6B7280' : '#9CA3AF'} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.leadFooter}>
        <Text style={[styles.createdDate, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
          {new Date(lead.created_at).toLocaleDateString()}
        </Text>
        <View style={styles.leadTags}>
          {lead.source && (
            <View style={[styles.tag, { backgroundColor: stage.color + '20' }]}>
              <Text style={[styles.tagText, { color: stage.color }]}>
                {lead.source}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderStage = (stage: PipelineStage) => (
    <View key={stage.id} style={styles.stage}>
      {renderStageHeader(stage)}
      <ScrollView
        style={styles.leadsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.leadsContent}
      >
        {stage.leads.map(lead => renderLeadCard(lead, stage))}
        {stage.leads.length === 0 && (
          <View style={styles.emptyStage}>
            <Ionicons name="person-outline" size={32} color={isDark ? '#4B5563' : '#9CA3AF'} />
            <Text style={[styles.emptyStageText, { color: isDark ? '#4B5563' : '#9CA3AF' }]}>
              No leads in this stage
            </Text>
            <TouchableOpacity
              style={[styles.addFirstLead, { borderColor: stage.color }]}
              onPress={() => router.push(`/leads/create?status=${stage.status}` as any)}
            >
              <Text style={[styles.addFirstLeadText, { color: stage.color }]}>
                Add Lead
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderPipelineStats = () => {
    const totalLeads = stages.reduce((sum, stage) => sum + stage.leads.length, 0);
    const convertedLeads = stages.find(s => s.status === 'converted')?.leads.length || 0;
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';

    return (
      <Card style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <Text style={[styles.statsTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Pipeline Overview
          </Text>
          <TouchableOpacity onPress={() => setShowStats(!showStats)}>
            <Ionicons
              name={showStats ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={isDark ? '#6B7280' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>
        
        {showStats && (
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {totalLeads}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Total Leads
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>
                {convertedLeads}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Converted
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#8B5CF6' }]}>
                {conversionRate}%
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Conversion Rate
              </Text>
            </View>
          </View>
        )}
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Lead Pipeline
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Ionicons name="refresh" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Button
            title="Add Lead"
            onPress={() => router.push('/leads/create' as any)}
            style={styles.addButton}
          />
        </View>
      </View>

      {/* Pipeline Stats */}
      {renderPipelineStats()}

      {/* Pipeline Stages */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pipelineContainer}
        refreshControl={{
          refreshing,
          onRefresh,
        }}
      >
        {stages.map(renderStage)}
      </ScrollView>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
  },
  addButton: {
    paddingHorizontal: 16,
  },
  statsCard: {
    margin: 20,
    padding: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  pipelineContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  stage: {
    width: 280,
    marginRight: 16,
    backgroundColor: 'transparent',
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  stageHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stageIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
  },
  stageName: {
    fontSize: 14,
    fontFamily: fonts.nohemi.semiBold,
    flex: 1,
  },
  stageHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leadCount: {
    fontSize: 16,
    fontFamily: fonts.nohemi.bold,
  },
  addLeadButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadsContainer: {
    maxHeight: 500,
  },
  leadsContent: {
    paddingBottom: 8,
  },
  leadCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  leadInfo: {
    flex: 1,
  },
  leadName: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  leadEmail: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 2,
  },
  leadPhone: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  quickActions: {
    padding: 4,
  },
  leadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createdDate: {
    fontSize: 10,
    fontFamily: fonts.satoshi.regular,
  },
  leadTags: {
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 10,
    fontFamily: fonts.satoshi.medium,
  },
  emptyStage: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStageText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    marginTop: 8,
    marginBottom: 12,
  },
  addFirstLead: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  addFirstLeadText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
});
