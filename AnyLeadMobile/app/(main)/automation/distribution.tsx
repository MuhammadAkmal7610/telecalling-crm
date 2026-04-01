import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme, TextInput, Switch, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface DistributionRule {
  id: string;
  name: string;
  description: string;
  priority: number;
  isActive: boolean;
  conditions: {
    field: string;
    operator: 'equals' | 'contains' | 'starts_with' | 'greater_than' | 'less_than';
    value: string;
  }[];
  actions: {
    type: 'assign_to_user' | 'assign_to_team' | 'round_robin';
    targetId?: string;
    targetName?: string;
  };
  stats: {
    totalLeads: number;
    assignedToday: number;
  };
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Team {
  id: string;
  name: string;
  memberCount: number;
}

type AssignmentMethod = 'round_robin' | 'load_balancing' | 'manual';

export default function LeadDistributionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [rules, setRules] = useState<DistributionRule[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [assignmentMethod, setAssignmentMethod] = useState<AssignmentMethod>('round_robin');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadRules(), loadUsers(), loadTeams()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRules = async () => {
    if (!user?.organization_id) return;
    try {
      const { data, error } = await ApiService.get('/automation/distribution-rules');
      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error loading distribution rules:', error);
      setRules(getMockRules());
    }
  };

  const loadUsers = async () => {
    if (!user?.organization_id) return;
    try {
      const { data, error } = await ApiService.get('/users');
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadTeams = async () => {
    if (!user?.organization_id) return;
    try {
      const { data, error } = await ApiService.get('/teams');
      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const getMockRules = (): DistributionRule[] => [
    {
      id: '1',
      name: 'High Priority Leads',
      description: 'Auto-assign high priority leads to senior sales reps',
      priority: 1,
      isActive: true,
      conditions: [{ field: 'priority', operator: 'equals', value: 'high' }],
      actions: { type: 'round_robin' },
      stats: { totalLeads: 150, assignedToday: 12 },
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Website Leads',
      description: 'Assign website leads to available team members',
      priority: 2,
      isActive: true,
      conditions: [{ field: 'source', operator: 'equals', value: 'website' }],
      actions: { type: 'assign_to_team', targetId: 'team1', targetName: 'Sales Team A' },
      stats: { totalLeads: 280, assignedToday: 25 },
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Enterprise Leads',
      description: 'Route enterprise leads to account executives',
      priority: 3,
      isActive: false,
      conditions: [{ field: 'company_size', operator: 'greater_than', value: '100' }],
      actions: { type: 'assign_to_user', targetId: 'user1', targetName: 'John Smith' },
      stats: { totalLeads: 45, assignedToday: 3 },
      createdAt: new Date().toISOString(),
    },
  ];

  const handleCreateRule = async () => {
    if (!newRuleName.trim()) {
      Alert.alert('Error', 'Please enter a rule name');
      return;
    }

    try {
      const newRule: Partial<DistributionRule> = {
        name: newRuleName,
        description: '',
        priority: rules.length + 1,
        isActive: true,
        conditions: [],
        actions: {
          type: assignmentMethod === 'round_robin' ? 'round_robin' : 
                 assignmentMethod === 'load_balancing' ? 'assign_to_team' : 'assign_to_user',
          targetId: assignmentMethod === 'manual' ? selectedUser || undefined : 
                    assignmentMethod === 'load_balancing' ? selectedTeam || undefined : undefined,
          targetName: assignmentMethod === 'manual' ? users.find(u => u.id === selectedUser)?.name :
                      assignmentMethod === 'load_balancing' ? teams.find(t => t.id === selectedTeam)?.name : undefined,
        },
      };

      const { data, error } = await ApiService.post('/automation/distribution-rules', newRule);
      if (error) throw error;

      Alert.alert('Success', 'Distribution rule created');
      setShowAddRule(false);
      setNewRuleName('');
      loadRules();
    } catch (error: any) {
      console.error('Error creating rule:', error);
      Alert.alert('Error', error.message || 'Failed to create rule');
    }
  };

  const toggleRuleStatus = async (ruleId: string, currentStatus: boolean) => {
    try {
      await ApiService.patch(`/automation/distribution-rules/${ruleId}`, {
        isActive: !currentStatus,
      });
      setRules(prev => prev.map(r => 
        r.id === ruleId ? { ...r, isActive: !currentStatus } : r
      ));
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  };

  const deleteRule = async (ruleId: string) => {
    Alert.alert('Delete Rule', 'Are you sure you want to delete this rule?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await ApiService.delete(`/automation/distribution-rules/${ruleId}`);
            setRules(prev => prev.filter(r => r.id !== ruleId));
          } catch (error) {
            console.error('Error deleting rule:', error);
          }
        },
      },
    ]);
  };

  const renderRuleCard = (rule: DistributionRule) => (
    <Card key={rule.id} style={[styles.ruleCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.ruleHeader}>
        <View style={styles.ruleInfo}>
          <Text style={[styles.ruleName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {rule.name}
          </Text>
          <Text style={[styles.ruleDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {rule.description}
          </Text>
        </View>
        <Switch
          value={rule.isActive}
          onValueChange={() => toggleRuleStatus(rule.id, rule.isActive)}
          thumbColor="#FFFFFF"
          trackColor={{ false: '#6B7280', true: colors.primary }}
        />
      </View>

      <View style={styles.ruleConditions}>
        <Text style={[styles.conditionLabel, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
          When: {rule.conditions.map(c => `${c.field} ${c.operator} "${c.value}"`).join(' AND ')}
        </Text>
        <Text style={[styles.actionLabel, { color: colors.primary }]}>
          Then: {rule.actions.type === 'round_robin' ? 'Assign via Round Robin' : 
                 rule.actions.type === 'assign_to_team' ? `Assign to ${rule.actions.targetName}` :
                 `Assign to ${rule.actions.targetName}`}
        </Text>
      </View>

      <View style={styles.ruleStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
            {rule.stats.totalLeads}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            Total Leads
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            {rule.stats.assignedToday}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            Today
          </Text>
        </View>
      </View>

      <View style={styles.ruleActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#3B82F620' }]}
          onPress={() => Alert.alert('Edit', 'Edit functionality coming soon')}
        >
          <Ionicons name="create-outline" size={16} color="#3B82F6" />
          <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#EF444420' }]}
          onPress={() => deleteRule(rule.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
          <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="share-outline" size={48} color={colors.primary} />
          <Text style={[styles.loadingText, { color: isDark ? colors.surface : colors.onBackground }]}>
            Loading Distribution Rules...
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
          Lead Distribution
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddRule(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Assignment Method */}
      <Card style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Default Assignment Method
        </Text>
        <View style={styles.methodSelector}>
          {[
            { key: 'round_robin', label: 'Round Robin', description: 'Distribute leads equally among team members' },
            { key: 'load_balancing', label: 'Load Balancing', description: 'Assign to team with fewest active leads' },
            { key: 'manual', label: 'Manual', description: 'Assign to specific user' },
          ].map((method) => (
            <TouchableOpacity
              key={method.key}
              style={[
                styles.methodOption,
                assignmentMethod === method.key && styles.selectedMethod,
                { backgroundColor: assignmentMethod === method.key ? colors.primary + '10' : (isDark ? '#374151' : '#F9FAFB') }
              ]}
              onPress={() => setAssignmentMethod(method.key as AssignmentMethod)}
            >
              <Ionicons 
                name={method.key === 'round_robin' ? 'shuffle' : method.key === 'load_balancing' ? 'scale' : 'person'} 
                size={20} 
                color={assignmentMethod === method.key ? colors.primary : (isDark ? '#6B7280' : '#9CA3AF')} 
              />
              <View style={styles.methodInfo}>
                <Text style={[
                  styles.methodLabel,
                  assignmentMethod === method.key && { color: colors.primary }
                ]}>
                  {method.label}
                </Text>
                <Text style={styles.methodDescription}>
                  {method.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {assignmentMethod === 'manual' && (
          <View style={styles.userSelector}>
            <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Select User
            </Text>
            <FlatList
              data={users}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.userOption,
                    selectedUser === item.id && styles.selectedUserOption,
                    { backgroundColor: selectedUser === item.id ? colors.primary + '20' : (isDark ? '#374151' : '#F9FAFB') }
                  ]}
                  onPress={() => setSelectedUser(item.id)}
                >
                  <Text style={[
                    styles.userOptionText,
                    selectedUser === item.id && { color: colors.primary }
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
            />
          </View>
        )}

        {assignmentMethod === 'load_balancing' && (
          <View style={styles.teamSelector}>
            <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Select Team
            </Text>
            <FlatList
              data={teams}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.teamOption,
                    selectedTeam === item.id && styles.selectedTeamOption,
                    { backgroundColor: selectedTeam === item.id ? colors.primary + '20' : (isDark ? '#374151' : '#F9FAFB') }
                  ]}
                  onPress={() => setSelectedTeam(item.id)}
                >
                  <Text style={[
                    styles.teamOptionText,
                    selectedTeam === item.id && { color: colors.primary }
                  ]}>
                    {item.name} ({item.memberCount} members)
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
            />
          </View>
        )}
      </Card>

      {/* Rules List */}
      <View style={styles.rulesHeader}>
        <Text style={[styles.rulesTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Distribution Rules ({rules.length})
        </Text>
      </View>

      <FlatList
        data={rules}
        renderItem={({ item }) => renderRuleCard(item)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.rulesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="git-merge-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No distribution rules yet
            </Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              Create rules to automatically assign leads based on conditions
            </Text>
          </View>
        }
      />

      {/* Add Rule Modal */}
      {showAddRule && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              Create Distribution Rule
            </Text>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Rule Name
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isDark ? '#374151' : '#F9FAFB',
                  color: isDark ? colors.surface : colors.onBackground,
                  borderColor: isDark ? '#4B5563' : '#E5E7EB'
                }]}
                placeholder="e.g., High Priority Leads"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                value={newRuleName}
                onChangeText={setNewRuleName}
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowAddRule(false);
                  setNewRuleName('');
                }}
                style={styles.cancelButton}
              />
              <Button
                title="Create Rule"
                onPress={handleCreateRule}
                style={styles.createButton}
              />
            </View>
          </View>
        </View>
      )}
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
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
  sectionCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 12,
  },
  methodSelector: {
    gap: 8,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    borderColor: '#E5E7EB30',
  },
  selectedMethod: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
    color: '#6B7280',
    marginBottom: 2,
  },
  methodDescription: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    color: '#9CA3AF',
  },
  userSelector: {
    marginTop: 16,
  },
  teamSelector: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 8,
    color: '#6B7280',
  },
  userOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    borderColor: '#E5E7EB30',
  },
  selectedUserOption: {
    borderWidth: 2,
  },
  userOptionText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    color: '#6B7280',
  },
  teamOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    borderColor: '#E5E7EB30',
  },
  selectedTeamOption: {
    borderWidth: 2,
  },
  teamOptionText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    color: '#6B7280',
  },
  rulesHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  rulesTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
  },
  rulesList: {
    padding: 20,
    paddingTop: 0,
  },
  ruleCard: {
    marginBottom: 12,
    padding: 16,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ruleInfo: {
    flex: 1,
    marginRight: 12,
  },
  ruleName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 4,
  },
  ruleDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  ruleConditions: {
    marginBottom: 12,
    gap: 4,
  },
  conditionLabel: {
    fontSize: 13,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 13,
    fontFamily: fonts.satoshi.medium,
  },
  ruleStats: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB30',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  ruleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
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
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
  createButton: {
    flex: 1,
    backgroundColor: colors.primary,
  },
});