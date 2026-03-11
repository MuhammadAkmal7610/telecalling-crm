import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, LeadStatusBadge, Button } from '../../../src/components/common/Card';
import { colors, fonts } from '../../../src/theme/theme';
import { ApiService } from '../../../src/services/ApiService';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Lead } from '../../../src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function LeadsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeads = async () => {
    try {
      const { data } = await ApiService.getLeads(user?.workspace_id);
      setLeads(data || []);
    } catch (error) {
      console.error('Error loading leads:', error);
      Alert.alert('Error', 'Failed to load leads');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadLeads();
  };

  const handleDeleteLead = (leadId: string) => {
    Alert.alert(
      'Delete Lead',
      'Are you sure you want to delete this lead?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.deleteLead(leadId);
              loadLeads();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete lead');
            }
          },
        },
      ]
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
        <Text style={[styles.leadSource, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Source: {item.source}
        </Text>
        <Text style={[styles.leadDate, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Leads
        </Text>
        <Button
          title="Add Lead"
          onPress={() => router.push('/leads/create' as any)}
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
              onPress={() => router.push('/leads/create' as any)}
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
  leadCard: {
    marginBottom: 12,
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
  },
  leadSource: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
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
