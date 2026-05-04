import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, LeadStatusBadge, Button } from '@/src/components/common/Card';
import { colors, fonts, spacing } from '@/src/theme/theme';
import { ApiService } from '@/src/services/ApiService';
import { useAuth } from '@/src/contexts/AuthContext';
import { EmptyWorkspaceState } from '@/src/components/common/EmptyWorkspaceState';
import { Lead } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '@/src/contexts/ToastContext';
import { usePopupMessages } from '@/src/hooks/usePopupMessages';

import { LeadCard } from '@/src/components/leads/LeadCard';

export default function LeadsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { showConfirmation, showError, showSuccess } = usePopupMessages();
  const isDark = useColorScheme() === 'dark';
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeads = async () => {
    try {
      const { data, error } = await ApiService.getLeads(user?.workspace_id);
      if (error) throw error;
      setLeads(data || []);
    } catch (error: any) {
      showToast({ message: error.message || 'Failed to load leads', type: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.workspace_id) {
      loadLeads();
    } else {
      setLoading(false);
    }
  }, [user]);

  const onRefresh = () => {
    if (user?.workspace_id) {
      setRefreshing(true);
      loadLeads();
    }
  };

  const handleDeleteLead = (leadId: string) => {
    showConfirmation(
      'Delete Lead',
      'Are you sure you want to delete this lead? This action cannot be undone.',
      async () => {
        try {
          const { error } = await ApiService.deleteLead(leadId);
          if (error) throw error;
          showSuccess('Lead deleted successfully');
          loadLeads();
        } catch (error: any) {
          showError(error.message || 'Failed to delete lead');
        }
      },
      undefined,
      'Delete',
      'Cancel'
    );
  };

  const renderLeadItem = ({ item }: { item: Lead }) => (
    <LeadCard
      lead={item}
      onPress={() => router.push(`/leads/${item.id}` as any)}
      onDelete={() => handleDeleteLead(item.id)}
    />
  );

  if (!loading && (!user || !user.workspace_id)) {
    return <EmptyWorkspaceState />;
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
            Leads
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Manage and track your prospects
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/leads/create?returnTo=leads')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Sub Navigation */}
      <View style={styles.subDashboard}>
        <TouchableOpacity 
          style={[styles.subNavItem, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
          onPress={() => router.push('/leads/advanced')}
        >
          <Ionicons name="search" size={20} color={colors.primary} />
          <Text style={[styles.subNavText, { color: isDark ? '#E2E8F0' : '#475569' }]}>Advanced</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.subNavItem, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
          onPress={() => router.push('/leads/pipeline')}
        >
          <Ionicons name="funnel" size={20} color="#10B981" />
          <Text style={[styles.subNavText, { color: isDark ? '#E2E8F0' : '#475569' }]}>Pipeline</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.subNavItem, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
          onPress={() => router.push('/leads/import-export')}
        >
          <Ionicons name="swap-vertical" size={20} color="#6366F1" />
          <Text style={[styles.subNavText, { color: isDark ? '#E2E8F0' : '#475569' }]}>Sync</Text>
        </TouchableOpacity>
      </View>

      {/* Leads List */}
      <FlatList
        data={leads}
        renderItem={renderLeadItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No leads found
            </Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Start by adding your first lead
            </Text>
            <Button
              title="Add Your First Lead"
              onPress={() => router.push('/leads/create?returnTo=leads')}
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
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.nohemi.bold,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  subDashboard: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: 12,
  },
  subNavItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  subNavText: {
    fontSize: 13,
    fontFamily: fonts.satoshi.bold,
  },
  listContainer: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  leadCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
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
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 2,
  },
  leadCompany: {
    fontSize: 13,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 2,
  },
  leadEmail: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 2,
  },
  leadPhone: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  leadActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    padding: 4,
  },
  leadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB30',
  },
  sourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  leadSource: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    textTransform: 'capitalize',
  },
  leadDate: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
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
