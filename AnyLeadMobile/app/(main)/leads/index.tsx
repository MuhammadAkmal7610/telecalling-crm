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
    <Card
      style={styles.leadCard}
      onPress={() => router.push(`/leads/${item.id}` as any)}
    >
      <View style={styles.leadHeader}>
        <View style={styles.leadInfo}>
          <Text style={[styles.leadName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.name}
          </Text>
          {item.company && (
            <Text style={[styles.leadCompany, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {item.company}
            </Text>
          )}
          {item.email && (
            <Text style={[styles.leadEmail, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {item.email}
            </Text>
          )}
          {item.phone && (
            <Text style={[styles.leadPhone, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {item.phone}
            </Text>
          )}
        </View>
        <View style={styles.leadActions}>
          <LeadStatusBadge status={item.status} />
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteLead(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.leadFooter}>
        <View style={styles.sourceTag}>
          <Ionicons name="funnel-outline" size={12} color={isDark ? colors.darkMuted : colors.muted} />
          <Text style={[styles.leadSource, { color: isDark ? colors.darkMuted : colors.muted }]}>
            {item.source}
          </Text>
        </View>
        <Text style={[styles.leadDate, { color: isDark ? colors.darkMuted : colors.muted }]}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </Card>
  );

  if (!loading && (!user || !user.workspace_id)) {
    return <EmptyWorkspaceState />;
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Leads
        </Text>
        <Button
          title="Add Lead"
          onPress={() => router.push('/leads/create?returnTo=leads')}
        />
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
    padding: spacing.lg,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.nohemi.bold,
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
