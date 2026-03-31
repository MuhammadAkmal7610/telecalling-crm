import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, useColorScheme, TouchableOpacity, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, LeadStatusBadge, Button } from '@/src/components/common/Card';
import { colors, fonts, spacing, shadows } from '@/src/theme/theme';
import { ApiService } from '@/src/services/ApiService';
import { useAuth } from '@/src/contexts/AuthContext';
import { Lead, Activity } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import CommunicationService from '@/src/services/CommunicationService';

export default function LeadDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      // Since ApiService.getLeads returns all leads, we filter for current id
      // Ideally there should be a getLeadById method
      const { data: allLeads } = await ApiService.getLeads(user?.workspace_id);
      const currentLead = allLeads?.find((l: Lead) => l.id === id);
      
      if (currentLead) {
        setLead(currentLead);
        const { data: leadActivities } = await ApiService.getActivities(id as string, user?.workspace_id);
        setActivities(leadActivities || []);
      } else {
        Alert.alert('Error', 'Lead not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading lead details:', error);
      Alert.alert('Error', 'Failed to load lead details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCall = () => {
    if (lead?.phone) {
      Linking.openURL(`tel:${lead.phone}`);
      logCommunication('call');
    } else {
      Alert.alert('No phone number', 'This lead does not have a phone number.');
    }
  };

  const handleWhatsApp = async () => {
    if (lead?.phone) {
      let phone = lead.phone.replace(/[^0-9]/g, '');
      if (!phone.startsWith('91') && phone.length === 10) {
        phone = '91' + phone;
      }
      
      // We open WhatsApp directly for immediate chat
      Linking.openURL(`whatsapp://send?phone=${phone}`);
      
      // Log the activity via communication service
      await CommunicationService.logCallActivity({
        leadId: lead.id,
        phone: phone,
        status: 'completed',
        notes: `WhatsApp message initiated to ${lead.name}`,
        outcome: 'follow_up'
      });
      
      loadData();
    } else {
      Alert.alert('No phone number', 'This lead does not have a phone number.');
    }
  };

  const handleEmail = () => {
    if (lead?.email) {
      Linking.openURL(`mailto:${lead.email}`);
      logCommunication('email');
    } else {
      Alert.alert('No email', 'This lead does not have an email address.');
    }
  };

  const logCommunication = async (type: string) => {
    try {
      await ApiService.createActivity({
        lead_id: lead?.id,
        type: type as any,
        details: `${type.charAt(0).toUpperCase() + type.slice(1)} to ${lead?.name}`,
        user_id: user?.id,
        organization_id: user?.organization_id,
        workspace_id: user?.workspace_id,
      });
      loadData();
    } catch (error) {
      console.error('Error logging communication:', error);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: isDark ? '#121212' : colors.background }]}>
        <Text style={{ color: isDark ? colors.surface : colors.onBackground }}>Loading lead details...</Text>
      </View>
    );
  }

  if (!lead) return null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header Info */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDark ? colors.surface : colors.onBackground} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push(`/leads/${id}/edit` as any)} style={styles.editButton}>
            <Ionicons name="create-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.titleSection}>
          <Text style={[styles.name, { color: isDark ? colors.surface : colors.onBackground }]}>{lead.name}</Text>
          <LeadStatusBadge status={lead.status} />
        </View>
        
        <Text style={[styles.source, { color: isDark ? colors.darkMuted : colors.muted }]}>
          Added from {lead.source} on {new Date(lead.created_at).toLocaleDateString()}
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionItem} onPress={handleCall}>
          <View style={[styles.actionIcon, { backgroundColor: '#3B82F615' }]}>
            <Ionicons name="call" size={20} color="#3B82F6" />
          </View>
          <Text style={[styles.actionText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem} onPress={handleWhatsApp}>
          <View style={[styles.actionIcon, { backgroundColor: '#10B98115' }]}>
            <Ionicons name="logo-whatsapp" size={20} color="#10B981" />
          </View>
          <Text style={[styles.actionText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>WhatsApp</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem} onPress={handleEmail}>
          <View style={[styles.actionIcon, { backgroundColor: '#8B5CF615' }]}>
            <Ionicons name="mail" size={20} color="#8B5CF6" />
          </View>
          <Text style={[styles.actionText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Email</Text>
        </TouchableOpacity>
      </View>

      {/* Contact Info */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Contact Details</Text>
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color="#6B7280" style={styles.infoIcon} />
            <Text style={[styles.infoValue, { color: isDark ? colors.surface : colors.onBackground }]}>
              {lead.email || 'No email provided'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#6B7280" style={styles.infoIcon} />
            <Text style={[styles.infoValue, { color: isDark ? colors.surface : colors.onBackground }]}>
              {lead.phone || 'No phone provided'}
            </Text>
          </View>
        </Card>
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Recent Activity</Text>
          <TouchableOpacity onPress={() => logCommunication('note')}>
            <Text style={{ color: colors.primary, fontSize: 13, fontFamily: fonts.satoshi.bold }}>Add Note</Text>
          </TouchableOpacity>
        </View>
        <Card>
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <View 
                key={activity.id} 
                style={[
                  styles.activityItem, 
                  index === activities.length - 1 && { borderBottomWidth: 0 }
                ]}
              >
                <View style={[styles.activityIconBox, { backgroundColor: isDark ? colors.darkBorder : '#F1F5F9' }]}>
                  <Ionicons 
                    name={activity.type === 'call' ? 'call' : activity.type === 'whatsapp' ? 'logo-whatsapp' : activity.type === 'email' ? 'mail' : 'document-text'} 
                    size={14} 
                    color={colors.primary} 
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={[styles.activityDesc, { color: isDark ? colors.surface : colors.onBackground }]}>
                    {activity.details}
                  </Text>
                  <Text style={[styles.activityTime, { color: isDark ? colors.darkMuted : colors.muted }]}>
                    {new Date(activity.created_at).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>No recent activity</Text>
          )}
        </Card>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  editButton: {
    padding: 8,
    marginRight: -8,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 26,
    fontFamily: fonts.nohemi.bold,
  },
  source: {
    fontSize: 13,
    fontFamily: fonts.satoshi.regular,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionItem: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoCard: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
    width: 20,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: fonts.satoshi.medium,
  },
  activityItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  activityIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityDesc: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 11,
    fontFamily: fonts.satoshi.regular,
  },
  noData: {
    padding: 24,
    textAlign: 'center',
    color: '#9CA3AF',
    fontFamily: fonts.satoshi.medium,
  },
});
