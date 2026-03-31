import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, useColorScheme, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '../../../src/components/common/Card';
import { colors, fonts } from '../../../src/theme/theme';
import { useAuth } from '../../../src/contexts/AuthContext';
import { ApiService } from '../../../src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface Transaction {
  id: string;
  type: 'sale' | 'refund' | 'commission' | 'bonus' | 'penalty';
  amount: number;
  description: string;
  leadId?: string;
  leadName?: string;
  customerId?: string;
  customerName?: string;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  paymentMethod?: string;
  reference?: string;
  metadata?: any;
}

interface FilterOptions {
  type: string;
  status: string;
  dateRange: string;
  searchQuery: string;
}

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    status: 'all',
    dateRange: 'all',
    searchQuery: ''
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const transactionTypes = [
    { value: 'all', label: 'All Types', icon: 'receipt-outline', color: '#6B7280' },
    { value: 'sale', label: 'Sales', icon: 'cash-outline', color: '#10B981' },
    { value: 'refund', label: 'Refunds', icon: 'return-down-back-outline', color: '#EF4444' },
    { value: 'commission', label: 'Commissions', icon: 'wallet-outline', color: '#3B82F6' },
    { value: 'bonus', label: 'Bonuses', icon: 'gift-outline', color: '#8B5CF6' },
    { value: 'penalty', label: 'Penalties', icon: 'warning-outline', color: '#F59E0B' }
  ];

  const statusTypes = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      // For now, use mock data. In future, fetch from API
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'sale',
          amount: 5000,
          description: 'Premium Package Sale',
          leadId: 'lead1',
          leadName: 'John Doe',
          customerId: 'cust1',
          customerName: 'Acme Corporation',
          date: new Date().toISOString(),
          status: 'completed',
          paymentMethod: 'Credit Card',
          reference: 'TXN-001'
        },
        {
          id: '2',
          type: 'commission',
          amount: 500,
          description: 'Commission from John Doe sale',
          leadId: 'lead1',
          leadName: 'John Doe',
          date: new Date(Date.now() - 86400000).toISOString(),
          status: 'completed',
          reference: 'COMM-001'
        },
        {
          id: '3',
          type: 'sale',
          amount: 3500,
          description: 'Standard Package Sale',
          leadId: 'lead2',
          leadName: 'Jane Smith',
          customerId: 'cust2',
          customerName: 'Tech Solutions Inc',
          date: new Date(Date.now() - 172800000).toISOString(),
          status: 'pending',
          paymentMethod: 'Bank Transfer',
          reference: 'TXN-002'
        },
        {
          id: '4',
          type: 'refund',
          amount: -1000,
          description: 'Partial refund for Tech Solutions Inc',
          leadId: 'lead2',
          leadName: 'Jane Smith',
          date: new Date(Date.now() - 259200000).toISOString(),
          status: 'completed',
          reference: 'REF-001'
        },
        {
          id: '5',
          type: 'bonus',
          amount: 250,
          description: 'Monthly performance bonus',
          date: new Date(Date.now() - 345600000).toISOString(),
          status: 'completed',
          reference: 'BONUS-001'
        },
        {
          id: '6',
          type: 'sale',
          amount: 7500,
          description: 'Enterprise Package Sale',
          leadId: 'lead3',
          leadName: 'Bob Wilson',
          customerId: 'cust3',
          customerName: 'Global Enterprises',
          date: new Date(Date.now() - 432000000).toISOString(),
          status: 'failed',
          paymentMethod: 'Credit Card',
          reference: 'TXN-003'
        }
      ];
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert('Error', 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = getDateForRange(filters.dateRange);
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= filterDate;
      });
    }

    // Search filter
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchLower) ||
        t.leadName?.toLowerCase().includes(searchLower) ||
        t.customerName?.toLowerCase().includes(searchLower) ||
        t.reference?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredTransactions(filtered);
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
      case 'year':
        const yearAgo = new Date(now);
        yearAgo.setFullYear(now.getFullYear() - 1);
        return yearAgo;
      default:
        return new Date(0);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      status: 'all',
      dateRange: 'all',
      searchQuery: ''
    });
  };

  const viewTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    router.push({
      pathname: '/analytics/transactions/details',
      params: { transactionId: transaction.id }
    } as any);
  };

  const exportTransactions = () => {
    Alert.alert(
      'Export Transactions',
      'Export transactions as CSV or Excel?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'CSV',
          onPress: () => Alert.alert('Success', 'Transactions exported as CSV')
        },
        {
          text: 'Excel',
          onPress: () => Alert.alert('Success', 'Transactions exported as Excel')
        }
      ]
    );
  };

  const getTransactionTypeInfo = (type: string) => {
    return transactionTypes.find(t => t.value === type) || transactionTypes[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      case 'cancelled': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const calculateTotals = () => {
    const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const completed = filteredTransactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
    const pending = filteredTransactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);
    
    return { total, completed, pending };
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const typeInfo = getTransactionTypeInfo(item.type);
    const statusColor = getStatusColor(item.status);
    
    return (
      <TouchableOpacity
        style={[styles.transactionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}
        onPress={() => viewTransactionDetails(item)}
      >
        <View style={styles.transactionHeader}>
          <View style={[styles.typeIcon, { backgroundColor: typeInfo.color + '10' }]}>
            <Ionicons name={typeInfo.icon as any} size={20} color={typeInfo.color} />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={[styles.transactionDescription, { color: isDark ? colors.surface : colors.onBackground }]}>
              {item.description}
            </Text>
            {item.leadName && (
              <Text style={[styles.leadName, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Lead: {item.leadName}
              </Text>
            )}
            {item.customerName && (
              <Text style={[styles.customerName, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Customer: {item.customerName}
              </Text>
            )}
          </View>
          <View style={styles.transactionAmount}>
            <Text style={[
              styles.amount,
              { 
                color: item.amount >= 0 ? '#10B981' : '#EF4444',
                fontSize: item.amount >= 0 ? 16 : 14
              }
            ]}>
              {item.amount >= 0 ? '+' : ''}${Math.abs(item.amount).toLocaleString()}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.transactionFooter}>
          <Text style={[styles.transactionDate, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
          {item.reference && (
            <Text style={[styles.transactionReference, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              Ref: {item.reference}
            </Text>
          )}
          {item.paymentMethod && (
            <Text style={[styles.paymentMethod, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              {item.paymentMethod}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const totals = calculateTotals();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Transaction History
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="filter" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={exportTransactions}
          >
            <Ionicons name="download-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Total Amount
          </Text>
          <Text style={[
            styles.summaryValue,
            { color: totals.total >= 0 ? '#10B981' : '#EF4444' }
          ]}>
            ${Math.abs(totals.total).toLocaleString()}
          </Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Completed
          </Text>
          <Text style={[styles.summaryValue, { color: '#10B981' }]}>
            ${totals.completed.toLocaleString()}
          </Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Pending
          </Text>
          <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
            ${totals.pending.toLocaleString()}
          </Text>
        </Card>
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
            <TouchableOpacity
              style={[styles.filterChip, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}
              onPress={() => {
                // Show type picker
                Alert.alert('Filter', 'Type picker will be implemented');
              }}
            >
              <Text style={[styles.filterChipText, { color: isDark ? colors.surface : colors.onBackground }]}>
                {transactionTypes.find(t => t.value === filters.type)?.label}
              </Text>
              <Ionicons name="chevron-down" size={16} color={isDark ? '#6B7280' : '#9CA3AF'} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterChip, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}
              onPress={() => {
                // Show status picker
                Alert.alert('Filter', 'Status picker will be implemented');
              }}
            >
              <Text style={[styles.filterChipText, { color: isDark ? colors.surface : colors.onBackground }]}>
                {statusTypes.find(t => t.value === filters.status)?.label}
              </Text>
              <Ionicons name="chevron-down" size={16} color={isDark ? '#6B7280' : '#9CA3AF'} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterChip, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}
              onPress={() => {
                // Show date range picker
                Alert.alert('Filter', 'Date range picker will be implemented');
              }}
            >
              <Text style={[styles.filterChipText, { color: isDark ? colors.surface : colors.onBackground }]}>
                {dateRanges.find(t => t.value === filters.dateRange)?.label}
              </Text>
              <Ionicons name="chevron-down" size={16} color={isDark ? '#6B7280' : '#9CA3AF'} />
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No transactions found
            </Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              {filters.type !== 'all' || filters.status !== 'all' || filters.dateRange !== 'all'
                ? 'Try adjusting your filters'
                : 'Transactions will appear here once sales are made'}
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
    gap: 12,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
  },
  exportButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontFamily: fonts.nohemi.bold,
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
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
  },
  clearFilters: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
  },
  filtersGrid: {
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  transactionCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  leadName: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 2,
  },
  customerName: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontFamily: fonts.nohemi.bold,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontFamily: fonts.satoshi.medium,
    textTransform: 'uppercase',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  transactionReference: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  paymentMethod: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fonts.satoshi.medium,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    textAlign: 'center',
  },
});
