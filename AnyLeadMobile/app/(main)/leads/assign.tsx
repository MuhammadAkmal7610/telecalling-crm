import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, useColorScheme, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Card, Button } from '../../../src/components/common/Card';
import { colors, fonts } from '../../../src/theme/theme';
import { useAuth } from '../../../src/contexts/AuthContext';
import { ApiService } from '../../../src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  assigned_leads_count: number;
}

interface AssignmentParams {
  leadIds?: string;
  leadId?: string;
}

export default function LeadAssignmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as AssignmentParams;
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignmentNote, setAssignmentNote] = useState('');
  const [leadIds, setLeadIds] = useState<string[]>([]);

  useEffect(() => {
    parseLeadIds();
    loadUsers();
  }, []);

  const parseLeadIds = () => {
    if (params.leadIds) {
      setLeadIds(params.leadIds.split(','));
    } else if (params.leadId) {
      setLeadIds([params.leadId]);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      // For now, use mock users. In future, implement getWorkspaceUsers in ApiService
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'sales',
          assigned_leads_count: 5
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'manager',
          assigned_leads_count: 3
        },
        {
          id: '3',
          name: 'Bob Wilson',
          email: 'bob@example.com',
          role: 'agent',
          assigned_leads_count: 8
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedUser) {
      Alert.alert('Error', 'Please select a user to assign leads to');
      return;
    }

    if (leadIds.length === 0) {
      Alert.alert('Error', 'No leads to assign');
      return;
    }

    Alert.alert(
      'Confirm Assignment',
      `Assign ${leadIds.length} lead(s) to ${users.find(u => u.id === selectedUser)?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign',
          onPress: async () => {
            await performAssignment();
          }
        }
      ]
    );
  };

  const performAssignment = async () => {
    setAssigning(true);
    try {
      // Assign all leads to the selected user
      for (const leadId of leadIds) {
        await ApiService.updateLead(leadId, {
          // Note: assigned_to field would need to be added to Lead interface
          // For now, we'll just log the assignment activity
        });

        // Log assignment activity
        await ApiService.createActivity({
          type: 'assignment',
          description: `Assigned lead to ${users.find(u => u.id === selectedUser)?.name}`,
          lead_id: leadId,
          user_id: user?.id,
          organization_id: user?.organization_id,
          workspace_id: user?.workspace_id,
          metadata: {
            assigned_to: selectedUser,
            assigned_by: user?.id,
            note: assignmentNote
          }
        });
      }

      Alert.alert('Success', `Successfully assigned ${leadIds.length} lead(s)`);
      router.back();
    } catch (error) {
      console.error('Error assigning leads:', error);
      Alert.alert('Error', 'Failed to assign leads');
    } finally {
      setAssigning(false);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[
        styles.userCard,
        selectedUser === item.id && styles.selectedUserCard,
        { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }
      ]}
      onPress={() => setSelectedUser(item.id)}
    >
      <View style={styles.userHeader}>
        <View style={styles.userAvatar}>
          <Text style={[styles.avatarText, { color: '#FFFFFF' }]}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.name}
          </Text>
          <Text style={[styles.userEmail, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {item.email}
          </Text>
          <View style={styles.userMeta}>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
              <Text style={[styles.roleText, { color: '#FFFFFF' }]}>
                {item.role}
              </Text>
            </View>
            <Text style={[styles.leadCount, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {item.assigned_leads_count} leads
            </Text>
          </View>
        </View>
        <View style={styles.selectionIndicator}>
          <Ionicons
            name={selectedUser === item.id ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color={selectedUser === item.id ? colors.primary : (isDark ? '#6B7280' : '#9CA3AF')}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: '#EF4444',
      manager: '#F59E0B',
      sales: '#3B82F6',
      agent: '#10B981'
    };
    return colors[role.toLowerCase()] || '#6B7280';
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Assign Leads
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          {leadIds.length} lead(s) to assign
        </Text>
      </View>

      {/* Assignment Info */}
      <Card style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.infoTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Assignment Details
          </Text>
        </View>
        <Text style={[styles.infoText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Select a team member to assign these leads to. They will be notified and can start working on them immediately.
        </Text>
      </Card>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInput, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
          <Ionicons name="search-outline" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
          <TextInput
            style={[styles.searchText, { color: isDark ? colors.surface : colors.onBackground }]}
            placeholder="Search team members..."
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Users List */}
      <View style={styles.usersContainer}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Team Members
        </Text>
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
              <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {searchQuery ? 'No team members found' : 'No team members available'}
              </Text>
            </View>
          }
        />
      </View>

      {/* Assignment Note */}
      <Card style={styles.noteCard}>
        <Text style={[styles.noteTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Assignment Note (Optional)
        </Text>
        <View style={[styles.noteInput, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
          <TextInput
            style={[styles.noteText, { color: isDark ? colors.surface : colors.onBackground }]}
            placeholder="Add a note for the assigned user..."
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            value={assignmentNote}
            onChangeText={setAssignmentNote}
            multiline
            textAlignVertical="top"
          />
        </View>
      </Card>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title={`Assign ${leadIds.length} Lead(s)`}
          onPress={handleAssign}
          loading={assigning}
          disabled={!selectedUser || leadIds.length === 0}
          style={styles.assignButton}
        />
        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="secondary"
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
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  infoCard: {
    margin: 20,
    padding: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    lineHeight: 20,
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
  usersContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 16,
  },
  userCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedUserCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '5',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: fonts.nohemi.bold,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roleText: {
    fontSize: 10,
    fontFamily: fonts.satoshi.medium,
  },
  leadCount: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  selectionIndicator: {
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fonts.satoshi.medium,
    marginTop: 12,
  },
  noteCard: {
    margin: 20,
    padding: 16,
  },
  noteTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 12,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
  },
  noteText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    minHeight: 60,
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  assignButton: {
    marginBottom: 8,
  },
});
