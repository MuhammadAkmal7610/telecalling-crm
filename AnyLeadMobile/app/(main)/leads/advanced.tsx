
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, useColorScheme, TextInput, RefreshControl, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button, LeadStatusBadge } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Lead } from '@/src/lib/supabase';
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

interface UserOption {
  id: string;
  name: string;
  email: string;
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
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterType, setFilterType] = useState<'status' | 'source' | 'dateRange' | 'assignedTo' | null>(null);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [filters, setFilters] = useState<LeadFilters>({
    search: '',
    status: 'all',
    source: 'all',
    dateRange: 'all',
    assignedTo: 'all'
  });

  const statusOptions: FilterOption[] = [
    { value: 'all', label: 'All Status' },
    { value: 'Fresh', label: 'New' },
    { value: 'Active', label: 'Active' },
    { value: 'Interested', label: 'Interested' },
    { value: 'Hot', label: 'Hot' },
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'Won', label: 'Converted' },
    { value: 'Lost', label: 'Lost' },
    { value: 'Cold', label: 'Cold' },
    { value: 'Archive', label: 'Archive' },
    { value: 'Trash', label: 'Trash' }
  ];

  const sourceOptions: FilterOption[] = [
    { value: 'all', label: 'All Sources' },
    { value: 'Facebook', label: 'Facebook' },
    { value: 'Website', label: 'Website' },
    { value: 'WhatsApp', label: 'WhatsApp' },
    { value: 'Referral', label: 'Referral' },
    { value: 'Manual', label: 'Manual' },
    { value: 'Import', label: 'Import' },
    { value: 'IndiaMART', label: 'IndiaMART' },
    { value: 'Justdial', label: 'Justdial' },
    { value: 'Google Ads', label: 'Google Ads' }
  ];

  const dateRangeOptions: FilterOption[] = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  useEffect(() => {
    loadLeads();
    loadUsers();
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

  const loadUsers = async () => {
    try {
      const response = await ApiService.getUsers();
      if (response.data) {
        setUsers(response.data.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email
        })));
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      const queryParams: any = {};
      
      if (filters.search) queryParams.search = filters.search;
      if (filters.status !== 'all') queryParams.status = filters.status;
      if (filters.source !== 'all') queryParams.source = filters.source;
      if (filters.dateRange !== 'all') queryParams.timeRange = filters.dateRange;
      if (filters.assignedTo !== 'all') queryParams.assigneeId = filters.assignedTo;

      const response = await ApiService.get('/leads', queryParams);
      setFilteredLeads(response.data || []);
    } catch (error) {
      console.error('Error applying filters:', error);
      setFilteredLeads([]);
    } finally {
      setLoading(false);
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
                  await ApiService.updateLead(leadId, { status: 'Won' });
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
    // Clear backend filters
    applyFilters();
  };

  const openFilterModal = (type: 'status' | 'source' | 'dateRange' | 'assignedTo') => {
    setFilterType(type);
    setShowFilterModal(true);
  };

  const selectFilterOption = (value: string) => {
    if (filterType === 'status') {
      setFilters(prev => ({ ...prev, status: value }));
    } else if (filterType === 'source') {
      setFilters(prev => ({ ...prev, source: value }));
    } else if (filterType === 'dateRange') {
      setFilters(prev => ({ ...prev, dateRange: value }));
    } else if (filterType === 'assignedTo') {
      setFilters(prev => ({ ...prev, assignedTo: value }));
    }
    setShowFilterModal(false);
    setFilterType(null);
    applyFilters();
  };

  const getSelectedLabel = (type: string, value: string) => {
    if (value === 'all') return type === 'assignedTo' ? 'All Assignees' : `All ${type.charAt(0).toUpperCase() + type.slice(1)}s`;
    
    if (type === 'status') {
      return statusOptions.find(opt => opt.value === value)?.label || value;
    } else if (type === 'source') {
      return sourceOptions.find(opt => opt.value === value)?.label || value;
    } else if (type === 'dateRange') {
      return dateRangeOptions.find(opt => opt.value === value)?.label || value;
    } else if (type === 'assignedTo') {
      const user = users.find(u => u.id === value);
      return user ? user.name : 'Unknown User';
    }
    return value;
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

  const renderFilterButton = (type: 'status' | 'source' | 'dateRange' | 'assignedTo', value: string, options: FilterOption[], placeholder: string) => (
    <TouchableOpacity
      style={[styles.filterButton, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}
      onPress={() => openFilterModal(type)}
    >
      <Text style={[styles.filterButtonText, { color: isDark ? colors.surface : colors.onBackground }]}>
        {getSelectedLabel(type, value)}
      </Text>
      <Ionicons name="chevron-down" size={16} color={isDark ? '#6B7280' : '#9CA3AF'} />
    </TouchableOpacity>
  );

  const renderFilterModal = () => {
    if (!showFilterModal || !filterType) return null;

    let options: FilterOption[] = [];
    if (filterType === 'status') options = statusOptions;
    else if (filterType === 'source') options = sourceOptions;
    else if (filterType === 'dateRange') options = dateRangeOptions;
    else if (filterType === 'assignedTo') {
      options = [
        { value: 'all', label: 'All Assignees' },
        ...users.map(u => ({ value: u.id, label: u.name }))
      ];
    }

    return (
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
                Select {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalList}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    filters[filterType] === option.value && styles.modalOptionSelected
                  ]}
                  onPress={() => selectFilterOption(option.value)}
                >
                  <Text style={[
                    styles.modalOptionText,
                    { color: isDark ? colors.surface : colors.onBackground },
                    filters[filterType] === option.value && { fontFamily: fonts.satoshi.bold }
                  ]}>
                    {option.label}
                  </Text>
                  {filters[filterType] === option.value && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

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
            onPress={() => router.push('/leads/create?returnTo=leads/advanced')}
            style={styles.addButton}
          />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchInput, 
          { 
            borderWidth: filters.search ? 2 : 1,
            borderColor: filters.search ? colors.primary : (isDark ? '#374151' : '#E5E7EB'),
            shadowColor: filters.search ? colors.primary : 'transparent',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: filters.search ? 0.3 : 0,
            shadowRadius: filters.search ? 4 : 0,
            elevation: filters.search ? 2 : 0,
          }
        ]}>
          <Ionicons name="search-outline" size={20} color={filters.search ? colors.primary : (isDark ? '#6B7280' : '#9CA3AF')} />
          <TextInput
            style={[styles.searchText, { color: isDark ? colors.surface : colors.onBackground }]}
            placeholder="Search leads by name, email, or phone..."
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            value={filters.search}
            onChangeText={(text) => setFilters(prev => ({ ...prev, search: text }))}
            onFocus={() => {
              // Add focus styling if needed
            }}
          />
          {filters.search.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={() => setFilters(prev => ({ ...prev, search: '' }))}
            >
              <Ionicons name="close-circle" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          )}
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
            {renderFilterButton('status', filters.status, statusOptions, 'Status')}
            {renderFilterButton('source', filters.source, sourceOptions, 'Source')}
            {renderFilterButton('dateRange', filters.dateRange, dateRangeOptions, 'Date Range')}
            {renderFilterButton('assignedTo', filters.assignedTo, [], 'Assigned To')}
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
                onPress={() => router.push('/leads/create?returnTo=leads/advanced')}
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
  clearSearchButton: {
    padding: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 16,
    padding: 16,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
  },
  modalList: {
    maxHeight: 300,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalOptionSelected: {
    backgroundColor: colors.primary + '10',
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: fonts.satoshi.regular,
  },
});
