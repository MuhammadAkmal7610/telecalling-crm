import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme, TextInput, FlatList, RefreshControl } from 'react-native';
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

interface SearchFilters {
  name: string;
  phone: string;
  email: string;
  status: string[];
  priority: string[];
  source: string[];
  assignedTo: string;
  dateRange: {
    start: string;
    end: string;
  };
  hasFollowUp: boolean;
  hasNotes: boolean;
}

export default function LeadSearchScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    phone: '',
    email: '',
    status: [],
    priority: [],
    source: [],
    assignedTo: '',
    dateRange: {
      start: '',
      end: '',
    },
    hasFollowUp: false,
    hasNotes: false,
  });

  const [availableFilters, setAvailableFilters] = useState({
    statuses: ['Fresh', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Converted', 'Lost'],
    priorities: ['Low', 'Medium', 'High', 'Urgent'],
    sources: ['Website', 'Referral', 'Social Media', 'Email Campaign', 'Cold Call', 'Event'],
    assignees: [] as string[],
  });

  useEffect(() => {
    loadAvailableFilters();
  }, []);

  const loadAvailableFilters = async () => {
    try {
      if (!user?.organization_id) return;

      // Get unique values for filters from existing leads
      const response = await ApiService.get('/leads');
      const allLeads = response.data || [];

      // Extract unique sources
      const uniqueSources = [...new Set(allLeads.map((l: Lead) => l.source))];
      
      // Extract unique assignees
      const uniqueAssignees = [...new Set(allLeads.map((l: Lead) => l.assignedToName))];

      setAvailableFilters(prev => ({
        ...prev,
        sources: uniqueSources.length > 0 ? uniqueSources as string[] : prev.sources,
        assignees: uniqueAssignees.length > 0 ? uniqueAssignees as string[] : prev.assignees,
      }));
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const searchLeads = async () => {
    try {
      setSearching(true);
      if (!user?.organization_id) return;

      const response = await ApiService.get('/leads');
      const allLeads = response.data || [];

      // Apply filters
      let filteredLeads = allLeads.filter((lead: Lead) => {
        // Text filters
        if (filters.name && !lead.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
        if (filters.phone && !lead.phone.includes(filters.phone)) return false;
        if (filters.email && !lead.email.toLowerCase().includes(filters.email.toLowerCase())) return false;
        if (filters.assignedTo && !lead.assignedToName.toLowerCase().includes(filters.assignedTo.toLowerCase())) return false;

        // Array filters
        if (filters.status.length > 0 && !filters.status.includes(lead.status)) return false;
        if (filters.priority.length > 0 && !filters.priority.includes(lead.priority)) return false;
        if (filters.source.length > 0 && !filters.source.includes(lead.source)) return false;

        // Boolean filters
        if (filters.hasFollowUp && !lead.nextFollowUp) return false;
        if (filters.hasNotes && !lead.notes) return false;

        // Date range filter
        if (filters.dateRange.start) {
          const leadDate = new Date(lead.createdAt);
          const startDate = new Date(filters.dateRange.start);
          if (leadDate < startDate) return false;
        }
        if (filters.dateRange.end) {
          const leadDate = new Date(lead.createdAt);
          const endDate = new Date(filters.dateRange.end);
          if (leadDate > endDate) return false;
        }

        return true;
      });

      setLeads(filteredLeads);
    } catch (error) {
      console.error('Error searching leads:', error);
      Alert.alert('Error', 'Failed to search leads');
    } finally {
      setSearching(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      phone: '',
      email: '',
      status: [],
      priority: [],
      source: [],
      assignedTo: '',
      dateRange: {
        start: '',
        end: '',
      },
      hasFollowUp: false,
      hasNotes: false,
    });
    setLeads([]);
  };

  const toggleFilter = (category: keyof SearchFilters, value: string) => {
    setFilters(prev => {
      const currentValues = prev[category] as string[];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [category]: currentValues.filter(v => v !== value)
        };
      } else {
        return {
          ...prev,
          [category]: [...currentValues, value]
        };
      }
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await searchLeads();
    setRefreshing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'alert-circle';
      case 'high': return 'warning';
      case 'medium': return 'information-circle';
      case 'low': return 'checkmark-circle';
      default: return 'help-circle';
    }
  };

  const renderLeadItem = ({ item }: { item: Lead }) => (
    <TouchableOpacity
      style={[
        styles.leadCard,
        { borderColor: isDark ? '#374151' : '#E5E7EB' }
      ]}
      onPress={() => router.push(`/leads/${item.id}` as any)}
    >
      <View style={styles.leadHeader}>
        <Text style={[styles.leadName, { color: isDark ? colors.surface : colors.onBackground }]}>
          {item.name}
        </Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
          <Ionicons name={getPriorityIcon(item.priority)} size={12} color={getPriorityColor(item.priority)} />
          <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
            {(item.priority || 'Medium').toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.leadDetails}>
        <Text style={[styles.leadInfo, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          {item.phone} • {item.email}
        </Text>
        <Text style={[styles.leadInfo, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Status: {item.status} • Source: {item.source}
        </Text>
        <Text style={[styles.leadInfo, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Assigned: {item.assignedToName} • Created: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.leadFooter}>
        {item.lastContacted && (
          <Text style={[styles.leadMeta, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Last Contacted: {new Date(item.lastContacted).toLocaleDateString()}
          </Text>
        )}
        {item.nextFollowUp && (
          <Text style={[styles.leadMeta, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Next Follow-up: {new Date(item.nextFollowUp).toLocaleDateString()}
          </Text>
        )}
        {item.notes && (
          <Text style={[styles.leadMeta, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Notes: {item.notes.substring(0, 100)}{item.notes.length > 100 ? '...' : ''}
          </Text>
        )}
      </View>

      <View style={styles.leadActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push(`/communication/whatsapp?phone=${item.phone}&name=${item.name}` as any)}
        >
          <Ionicons name="logo-whatsapp" size={16} color="white" />
          <Text style={styles.actionText}>WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
          onPress={() => router.push(`/communication/dialer?phone=${item.phone}&name=${item.name}` as any)}
        >
          <Ionicons name="call" size={16} color="white" />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#10B981' }]}
          onPress={() => router.push(`/leads/${item.id}/edit` as any)}
        >
          <Ionicons name="pencil" size={16} color="white" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFilterSection = (title: string, options: string[], category: keyof SearchFilters) => (
    <Card style={[styles.filterCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <Text style={[styles.filterTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
        {title}
      </Text>
      <View style={styles.filterOptions}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.filterOption,
              {
                backgroundColor: (filters[category] as string[]).includes(option) 
                  ? colors.primary + '20' 
                  : isDark ? '#374151' : '#F3F4F6',
                borderColor: (filters[category] as string[]).includes(option) 
                  ? colors.primary 
                  : isDark ? '#4B5563' : '#E5E7EB'
              }
            ]}
            onPress={() => toggleFilter(category, option)}
          >
            <Text style={[
              styles.filterOptionText,
              {
                color: (filters[category] as string[]).includes(option) 
                  ? colors.primary 
                  : isDark ? colors.surface : colors.onBackground
              }
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Advanced Lead Search
        </Text>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name={showFilters ? "filter-outline" : "filter"} size={20} color={colors.primary} />
          <Text style={[styles.filterToggleText, { color: colors.primary }]}>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Inputs */}
      <Card style={[styles.searchCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.searchRow}>
          <View style={styles.searchInput}>
            <Ionicons name="search" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <TextInput
              style={[styles.searchTextInput, { color: isDark ? colors.surface : colors.onBackground }]}
              placeholder="Search by name..."
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              value={filters.name}
              onChangeText={(value) => setFilters(prev => ({ ...prev, name: value }))}
            />
          </View>
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: colors.primary }]}
            onPress={searchLeads}
            disabled={searching}
          >
            <Ionicons name="search" size={16} color="white" />
            <Text style={styles.searchButtonText}>
              {searching ? 'Searching...' : 'Search'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchInput}>
            <Ionicons name="call" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <TextInput
              style={[styles.searchTextInput, { color: isDark ? colors.surface : colors.onBackground }]}
              placeholder="Phone number..."
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              value={filters.phone}
              onChangeText={(value) => setFilters(prev => ({ ...prev, phone: value }))}
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.searchInput}>
            <Ionicons name="mail" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <TextInput
              style={[styles.searchTextInput, { color: isDark ? colors.surface : colors.onBackground }]}
              placeholder="Email address..."
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              value={filters.email}
              onChangeText={(value) => setFilters(prev => ({ ...prev, email: value }))}
              keyboardType="email-address"
            />
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchInput}>
            <Ionicons name="person" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <TextInput
              style={[styles.searchTextInput, { color: isDark ? colors.surface : colors.onBackground }]}
              placeholder="Assigned to..."
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              value={filters.assignedTo}
              onChangeText={(value) => setFilters(prev => ({ ...prev, assignedTo: value }))}
            />
          </View>
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: '#EF4444' }]}
            onPress={clearFilters}
          >
            <Ionicons name="trash" size={16} color="white" />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Filters */}
      {showFilters && (
        <ScrollView style={styles.filtersContainer}>
          {renderFilterSection('Status', availableFilters.statuses, 'status')}
          {renderFilterSection('Priority', availableFilters.priorities, 'priority')}
          {renderFilterSection('Source', availableFilters.sources, 'source')}
          
          <Card style={[styles.filterCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <Text style={[styles.filterTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              Additional Filters
            </Text>
            <View style={styles.booleanFilters}>
              <TouchableOpacity
                style={styles.booleanFilter}
                onPress={() => setFilters(prev => ({ ...prev, hasFollowUp: !prev.hasFollowUp }))}
              >
                <Ionicons 
                  name={filters.hasFollowUp ? "checkbox" : "square-outline"} 
                  size={20} 
                  color={filters.hasFollowUp ? colors.primary : isDark ? '#9CA3AF' : '#6B7280'} 
                />
                <Text style={[styles.booleanFilterText, { color: isDark ? colors.surface : colors.onBackground }]}>
                  Has Follow-up
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.booleanFilter}
                onPress={() => setFilters(prev => ({ ...prev, hasNotes: !prev.hasNotes }))}
              >
                <Ionicons 
                  name={filters.hasNotes ? "checkbox" : "square-outline"} 
                  size={20} 
                  color={filters.hasNotes ? colors.primary : isDark ? '#9CA3AF' : '#6B7280'} 
                />
                <Text style={[styles.booleanFilterText, { color: isDark ? colors.surface : colors.onBackground }]}>
                  Has Notes
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </ScrollView>
      )}

      {/* Results */}
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Search Results ({leads.length})
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Ionicons name="refresh" size={16} color={colors.primary} />
          <Text style={[styles.refreshText, { color: colors.primary }]}>
            Refresh
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={leads}
        renderItem={renderLeadItem}
        keyExtractor={(item) => item.id}
        style={styles.resultsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyResults}>
            <Ionicons name="search-outline" size={48} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text style={[styles.emptyResultsText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No leads found. Try adjusting your search criteria.
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
  searchHeader: {
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
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  filterToggleText: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
  },
  searchCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchButtonText: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
    color: 'white',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
    color: 'white',
  },
  filtersContainer: {
    maxHeight: 300,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  filterCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterOptionText: {
    fontSize: 12,
    fontFamily: fonts.nohemi.medium,
  },
  booleanFilters: {
    flexDirection: 'row',
    gap: 16,
  },
  booleanFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  booleanFilterText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultsTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  refreshText: {
    fontSize: 12,
    fontFamily: fonts.nohemi.medium,
  },
  resultsList: {
    flex: 1,
  },
  leadCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
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
  emptyResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyResultsText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginTop: 12,
    textAlign: 'center',
  },
});