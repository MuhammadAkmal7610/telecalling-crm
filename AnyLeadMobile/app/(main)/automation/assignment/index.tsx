import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, useColorScheme, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface AssignmentRule {
  id: string;
  name: string;
  description: string;
  priority: number;
  conditions: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_list';
    value: string | string[];
  }[];
  assignmentLogic: {
    type: 'round_robin' | 'least_busy' | 'random' | 'based_on_criteria';
    criteria?: {
      field: string;
      value: string;
    }[];
    fallbackUser?: string;
  };
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  currentLoad: number;
  maxCapacity: number;
  skills: string[];
  regions: string[];
}

export default function AutoAssignmentScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [rules, setRules] = useState<AssignmentRule[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadRules(),
        loadTeamMembers()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadRules = async () => {
    // Mock assignment rules
    const mockRules: AssignmentRule[] = [
      {
        id: '1',
        name: 'Regional Assignment',
        description: 'Assign leads to team members based on their geographic region',
        priority: 1,
        conditions: [
          { field: 'region', operator: 'equals', value: 'north' }
        ],
        assignmentLogic: {
          type: 'based_on_criteria',
          criteria: [
            { field: 'region', value: 'north' }
          ],
          fallbackUser: 'user1'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        usageCount: 45
      },
      {
        id: '2',
        name: 'High Value Leads',
        description: 'Assign high-value leads to senior sales executives',
        priority: 2,
        conditions: [
          { field: 'estimated_value', operator: 'greater_than', value: '10000' },
          { field: 'source', operator: 'in_list', value: ['referral', 'enterprise'] }
        ],
        assignmentLogic: {
          type: 'based_on_criteria',
          criteria: [
            { field: 'role', value: 'senior' },
            { field: 'experience', value: 'expert' }
          ]
        },
        isActive: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        usageCount: 23
      },
      {
        id: '3',
        name: 'Round Robin Distribution',
        description: 'Distribute leads evenly among available team members',
        priority: 3,
        conditions: [],
        assignmentLogic: {
          type: 'round_robin'
        },
        isActive: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        usageCount: 67
      },
      {
        id: '4',
        name: 'Least Busy Assignment',
        description: 'Assign leads to team members with the lowest current workload',
        priority: 4,
        conditions: [
          { field: 'type', operator: 'equals', value: 'inbound' }
        ],
        assignmentLogic: {
          type: 'least_busy'
        },
        isActive: false,
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        usageCount: 12
      }
    ];
    setRules(mockRules);
  };

  const loadTeamMembers = async () => {
    // Mock team members
    const mockTeamMembers: TeamMember[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        role: 'Senior Sales Executive',
        currentLoad: 8,
        maxCapacity: 15,
        skills: ['enterprise', 'negotiation', 'closing'],
        regions: ['north', 'west']
      },
      {
        id: '2',
        name: 'Michael Chen',
        email: 'michael@example.com',
        role: 'Sales Executive',
        currentLoad: 12,
        maxCapacity: 20,
        skills: ['tech', 'SaaS', 'product'],
        regions: ['south', 'east']
      },
      {
        id: '3',
        name: 'Emily Davis',
        email: 'emily@example.com',
        role: 'Sales Executive',
        currentLoad: 6,
        maxCapacity: 18,
        skills: ['retail', 'SMB', 'relationship'],
        regions: ['central', 'west']
      }
    ];
    setTeamMembers(mockTeamMembers);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleRule = async (ruleId: string) => {
    try {
      setRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      ));
      Alert.alert('Success', 'Rule status updated');
    } catch (error) {
      console.error('Error toggling rule:', error);
      Alert.alert('Error', 'Failed to update rule');
    }
  };

  const deleteRule = async (ruleId: string) => {
    Alert.alert(
      'Delete Rule',
      'Are you sure you want to delete this assignment rule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setRules(prev => prev.filter(rule => rule.id !== ruleId));
              Alert.alert('Success', 'Rule deleted');
            } catch (error) {
              console.error('Error deleting rule:', error);
              Alert.alert('Error', 'Failed to delete rule');
            }
          }
        }
      ]
    );
  };

  const testRule = async (rule: AssignmentRule) => {
    Alert.alert(
      'Test Rule',
      `Test "${rule.name}" with sample data?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Test',
          onPress: async () => {
            Alert.alert('Test Result', 'Rule would assign lead to Sarah Johnson (Load: 8/15)');
          }
        }
      ]
    );
  };

  const getAssignmentLogicIcon = (type: string) => {
    switch (type) {
      case 'round_robin': return 'sync-outline';
      case 'least_busy': return 'bar-chart-outline';
      case 'random': return 'shuffle-outline';
      case 'based_on_criteria': return 'funnel-outline';
      default: return 'cog-outline';
    }
  };

  const getLoadPercentage = (current: number, max: number) => {
    return (current / max) * 100;
  };

  const getLoadColor = (percentage: number) => {
    if (percentage >= 80) return '#EF4444';
    if (percentage >= 60) return '#F59E0B';
    return '#10B981';
  };

  const renderRuleItem = ({ item }: { item: AssignmentRule }) => (
    <Card style={[styles.ruleCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.ruleHeader}>
        <View style={styles.ruleInfo}>
          <View style={styles.rulePriority}>
            <Text style={[styles.priorityText, { color: '#FFFFFF' }]}>
              {item.priority}
            </Text>
          </View>
          <View style={styles.ruleDetails}>
            <Text style={[styles.ruleName, { color: isDark ? colors.surface : colors.onBackground }]}>
              {item.name}
            </Text>
            <Text style={[styles.ruleDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {item.description}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: item.isActive ? colors.primary : '#E5E7EB' }]}
          onPress={() => toggleRule(item.id)}
        >
          <Text style={[styles.toggleText, { color: item.isActive ? '#FFFFFF' : '#6B7280' }]}>
            {item.isActive ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.ruleConditions}>
        <Text style={[styles.sectionLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Conditions:
        </Text>
        {item.conditions.length > 0 ? (
          item.conditions.map((condition, index) => (
            <View key={index} style={styles.conditionItem}>
              <Text style={[styles.conditionText, { color: isDark ? colors.surface : colors.onBackground }]}>
                {condition.field} {condition.operator.replace('_', ' ')} {Array.isArray(condition.value) ? condition.value.join(', ') : condition.value}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[styles.noConditions, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            No conditions (applies to all leads)
          </Text>
        )}
      </View>

      <View style={styles.ruleLogic}>
        <View style={styles.logicItem}>
          <Ionicons 
            name={getAssignmentLogicIcon(item.assignmentLogic.type) as any} 
            size={16} 
            color={colors.primary} 
          />
          <Text style={[styles.logicText, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.assignmentLogic.type.replace('_', ' ')}
          </Text>
        </View>
        <Text style={[styles.ruleStats, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
          Used {item.usageCount} times
        </Text>
      </View>

      <View style={styles.ruleActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => testRule(item)}
        >
          <Ionicons name="play-circle-outline" size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Test</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/automation/assignment/${item.id}/edit` as any)}
        >
          <Ionicons name="create-outline" size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => deleteRule(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
          <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderTeamMemberItem = ({ item }: { item: TeamMember }) => {
    const loadPercentage = getLoadPercentage(item.currentLoad, item.maxCapacity);
    const loadColor = getLoadColor(loadPercentage);

    return (
      <Card style={[styles.memberCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.memberHeader}>
          <View style={[styles.memberAvatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: '#FFFFFF' }]}>
              {item.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View style={styles.memberInfo}>
            <Text style={[styles.memberName, { color: isDark ? colors.surface : colors.onBackground }]}>
              {item.name}
            </Text>
            <Text style={[styles.memberRole, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {item.role}
            </Text>
          </View>
          <View style={styles.memberLoad}>
            <Text style={[styles.loadText, { color: loadColor }]}>
              {item.currentLoad}/{item.maxCapacity}
            </Text>
            <Text style={[styles.loadLabel, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              Load
            </Text>
          </View>
        </View>

        <View style={styles.loadBar}>
          <View style={[styles.loadBarBackground, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
            <View 
              style={[styles.loadBarFill, { 
                width: `${loadPercentage}%`, 
                backgroundColor: loadColor 
              }]} 
            />
          </View>
          <Text style={[styles.loadPercentage, { color: loadColor }]}>
            {loadPercentage.toFixed(0)}%
          </Text>
        </View>

        <View style={styles.memberSkills}>
          <Text style={[styles.skillsLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Skills:
          </Text>
          <View style={styles.skillsContainer}>
            {item.skills.slice(0, 3).map((skill, index) => (
              <View key={index} style={[styles.skillBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.skillText, { color: colors.primary }]}>
                  {skill}
                </Text>
              </View>
            ))}
            {item.skills.length > 3 && (
              <Text style={[styles.moreSkills, { color: colors.primary }]}>
                +{item.skills.length - 3}
              </Text>
            )}
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Auto-Assignment Rules
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.statsButton}
            onPress={() => setShowStats(!showStats)}
          >
            <Ionicons name="bar-chart-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Button
            title="Create Rule"
            onPress={() => router.push('/automation/assignment/create' as any)}
            style={styles.createButton}
          />
        </View>
      </View>

      {/* Statistics */}
      {showStats && (
        <Card style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Text style={[styles.statsTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              Assignment Overview
            </Text>
            <TouchableOpacity onPress={() => setShowStats(!showStats)}>
              <Ionicons
                name={showStats ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={isDark ? '#6B7280' : '#9CA3AF'}
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {rules.filter(r => r.isActive).length}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Active Rules
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>
                {teamMembers.length}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Team Members
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                {teamMembers.reduce((sum, m) => sum + m.currentLoad, 0)}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Total Load
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Team Members Load */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Team Workload
        </Text>
        <FlatList
          data={teamMembers}
          renderItem={renderTeamMemberItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.teamListContainer}
        />
      </View>

      {/* Assignment Rules */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Assignment Rules
        </Text>
        <FlatList
          data={rules.sort((a, b) => a.priority - b.priority)}
          renderItem={renderRuleItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.rulesListContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="git-branch-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
              <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                No assignment rules created
              </Text>
              <Text style={[styles.emptySubtext, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
                Create rules to automate lead assignment
              </Text>
            </View>
          }
        />
      </View>
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
  statsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
  },
  createButton: {
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
    fontSize: 16,
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
    fontSize: 20,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  teamListContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  memberCard: {
    width: 280,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontFamily: fonts.nohemi.bold,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  memberLoad: {
    alignItems: 'center',
  },
  loadText: {
    fontSize: 14,
    fontFamily: fonts.nohemi.bold,
  },
  loadLabel: {
    fontSize: 10,
    fontFamily: fonts.satoshi.regular,
  },
  loadBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadBarBackground: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  loadBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  loadPercentage: {
    fontSize: 10,
    fontFamily: fonts.satoshi.medium,
    minWidth: 30,
    textAlign: 'right',
  },
  memberSkills: {
    marginBottom: 4,
  },
  skillsLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 6,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  skillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  skillText: {
    fontSize: 10,
    fontFamily: fonts.satoshi.medium,
  },
  moreSkills: {
    fontSize: 10,
    fontFamily: fonts.satoshi.medium,
  },
  rulesListContainer: {
    paddingHorizontal: 20,
  },
  ruleCard: {
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ruleInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rulePriority: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  priorityText: {
    fontSize: 12,
    fontFamily: fonts.nohemi.bold,
  },
  ruleDetails: {
    flex: 1,
  },
  ruleName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  ruleDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 48,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 12,
    fontFamily: fonts.nohemi.bold,
  },
  ruleConditions: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 6,
  },
  conditionItem: {
    marginBottom: 2,
  },
  conditionText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  noConditions: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    fontStyle: 'italic',
  },
  ruleLogic: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  logicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logicText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  ruleStats: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  ruleActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
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
