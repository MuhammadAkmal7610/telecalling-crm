import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, useColorScheme, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button, LeadStatusBadge } from '../../src/components/common/Card';
import { colors, fonts } from '../../src/theme/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import { ApiService } from '../../src/services/ApiService';
import { Lead } from '../../src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

interface LeadFilters {
  search: string;
  status: string;
  source: string;
  dateRange: string;
  assignedTo: string;
}

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export default function AdvancedLeadsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<LeadFilters>({
    search: '',
    status: 'all',
    source: 'all',
    dateRange: 'all',
    assignedTo: 'all'
  });

  const statusOptions: FilterOption[] = [
    { value: 'all', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'converted', label: 'Converted' },
    { value: 'lost', label: 'Lost' }
  ];

  const sourceOptions: FilterOption[] = [
    { value: 'all', label: 'All Sources' },
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'social', label: 'Social Media' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'other', label: 'Other' }
  ];

  const dateRangeOptions: FilterOption[] = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [leads, filters]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getLeads(user?.workspace_id);
      setLeads(response.data || []);
    } catch (error) {
      console.error('Error loading leads:', error);
      Alert.alert('Error', 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...leads];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.phone?.includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(lead => lead.status === filters.status);
    }

    // Source filter
    if (filters.source !== 'all') {
      filtered = filtered.filter(lead => lead.source === filters.source);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = getDateForRange(filters.dateRange);
      filtered = filtered.filter(lead => {
        const leadDate = new Date(lead.created_at);
        return leadDate >= filterDate;
      });
    }

    setFilteredLeads(filtered);
  };

  const getDateForRange = (range: string): Date => {
    const now = new Date();
    switch (range) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return weekAgo;
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return monthAgo;
      case 'quarter':
        const quarterAgo = new Date(now);
        quarterAgo.setMonth(now.getMonth() - 3);
        return quarterAgo;
      default:
        return new Date(0);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeads();
    setRefreshing(false);
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const selectAllLeads = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(lead => lead.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedLeads.length === 0) {
      Alert.alert('Error', 'Please select leads first');
      return;
    }

    Alert.alert(
      `Bulk ${action}`,
      `Are you sure you want to ${action.toLowerCase()} ${selectedLeads.length} lead(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              for (const leadId of selectedLeads) {
                if (action === 'Delete') {
                  await ApiService.deleteLead(leadId);
                } else if (action === 'Convert') {
                  await ApiService.updateLead(leadId, { status: 'converted' });
                } else if (action === 'Assign') {
                  // Navigate to assignment screen
                  router.push({
                    pathname: '/leads/assign',
                    params: { leadIds: selectedLeads.join(',') }
                  } as any);
                  return;
                }
              }
              
              await loadLeads();
              setSelectedLeads([]);
              Alert.alert('Success', `Successfully ${action.toLowerCase()}ed leads`);
            } catch (error) {
              console.error('Error performing bulk action:', error);
              Alert.alert('Error', `Failed to ${action.toLowerCase()} leads`);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      source: 'all',
      dateRange: 'all',
      assignedTo: 'all'
    });
  };

  const renderLeadItem = ({ item }: { item: Lead }) => (
    <Card style={styles.leadCard}>
      <View style={styles.leadHeader}>
        <TouchableOpacity
          style={styles.leadSelection}
          onPress={() => toggleLeadSelection(item.id)}
        >
          <Ionicons
            name={selectedLeads.includes(item.id) ? 'checkbox' : 'square-outline'}
            size={20}
            color={selectedLeads.includes(item.id) ? colors.primary : (isDark ? '#6B7280' : '#9CA3AF')}
          />
        </TouchableOpacity>
        
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
            style={styles.actionButton}
            onPress={() => router.push(`/leads/${item.id}` as any)}
          >
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const renderFilterButton = (options: FilterOption[], value: string, onChange: (value: string) => void, placeholder: string) => (
    <TouchableOpacity
      style={[styles.filterButton, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}
      onPress={() => {
        // TODO: Implement filter picker
        Alert.alert('Filter', `${placeholder} options will be implemented`);
      }}
    >
      <Text style={[styles.filterButtonText, { color: isDark ? colors.surface : colors.onBackground }]}>
        {options.find(opt => opt.value === value)?.label || placeholder}
      </Text>
      <Ionicons name="chevron-down" size={16} color={isDark ? '#6B7280' : '#9CA3AF'} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Advanced Leads
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.filterToggle}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="filter" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Button
            title="Add Lead"
            onPress={() => router.push('/leads/create' as any)}
            style={styles.addButton}
          />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInput, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
          <Ionicons name="search-outline" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
          <TextInput
            style={[styles.searchText, { color: isDark ? colors.surface : colors.onBackground }]}
            placeholder="Search leads..."
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            value={filters.search}
            onChangeText={(text) => setFilters(prev => ({ ...prev, search: text }))}
          />
        </View>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <Card style={styles.filtersPanel}>
          <View style={styles.filtersHeader}>
            <Text style={[styles.filtersTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              Filters
            </Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={[styles.clearFilters, { color: colors.primary }]}>
                Clear All
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.filtersGrid}>
            {renderFilterButton(statusOptions, filters.status, (value) => 
              setFilters(prev => ({ ...prev, status: value })), 'Status')}
            {renderFilterButton(sourceOptions, filters.source, (value) => 
              setFilters(prev => ({ ...prev, source: value })), 'Source')}
            {renderFilterButton(dateRangeOptions, filters.dateRange, (value) => 
              setFilters(prev => ({ ...prev, dateRange: value })), 'Date Range')}
          </View>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <Card style={styles.bulkActionsPanel}>
          <Text style={[styles.selectedCount, { color: isDark ? colors.surface : colors.onBackground }]}>
            {selectedLeads.length} lead(s) selected
          </Text>
          <View style={styles.bulkActions}>
            <TouchableOpacity
              style={[styles.bulkActionButton, { backgroundColor: '#10B981' }]}
              onPress={() => handleBulkAction('Convert')}
            >
              <Text style={styles.bulkActionText}>Convert</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bulkActionButton, { backgroundColor: '#3B82F6' }]}
              onPress={() => handleBulkAction('Assign')}
            >
              <Text style={styles.bulkActionText}>Assign</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bulkActionButton, { backgroundColor: '#EF4444' }]}
              onPress={() => handleBulkAction('Delete')}
            >
              <Text style={styles.bulkActionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {/* Select All */}
      {filteredLeads.length > 0 && (
        <View style={styles.selectAllContainer}>
          <TouchableOpacity
            style={styles.selectAllButton}
            onPress={selectAllLeads}
          >
            <Ionicons
              name={selectedLeads.length === filteredLeads.length ? 'checkbox' : 'square-outline'}
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.selectAllText, { color: isDark ? colors.surface : colors.onBackground }]}>
              {selectedLeads.length === filteredLeads.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.resultCount, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {filteredLeads.length} results
          </Text>
        </View>
      )}

      {/* Leads List */}
      <FlatList
        data={filteredLeads}
        renderItem={renderLeadItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={{
          refreshing,
          onRefresh,
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {filters.search || filters.status !== 'all' || filters.source !== 'all'
                ? 'No leads match your filters'
                : 'No leads found'}
            </Text>
            <Button
              title="Add Your First Lead"
              onPress={() => router.push('/leads/create' as any)}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterToggle: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
  },
  addButton: {
    paddingHorizontal: 16,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchText: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.satoshi.regular,
    marginLeft: 8,
  },
  filtersPanel: {
    margin: 20,
    padding: 16,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filtersTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
  },
  clearFilters: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
  },
  filtersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 120,
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginRight: 4,
  },
  bulkActionsPanel: {
    margin: 20,
    padding: 16,
  },
  selectedCount: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 12,
  },
  bulkActions: {
    flexDirection: 'row',
    gap: 8,
  },
  bulkActionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  bulkActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
  },
  selectAllContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginLeft: 8,
  },
  resultCount: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  leadCard: {
    padding: 16,
    marginBottom: 12,
  },
  leadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leadSelection: {
    marginRight: 12,
  },
  leadInfo: {
    flex: 1,
  },
  leadName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
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
  actionButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fonts.satoshi.medium,
    marginTop: 12,
    marginBottom: 20,
  },
});
