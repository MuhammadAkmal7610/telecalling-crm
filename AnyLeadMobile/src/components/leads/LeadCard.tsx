import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, LeadStatusBadge } from '../common/Card';
import { colors, fonts, spacing, shadows } from '../../theme/theme';
import { Lead } from '../../lib/supabase';
import { CommunicationService } from '../../services/CommunicationService';

interface LeadCardProps {
  lead: Lead;
  onPress: () => void;
  onDelete?: () => void;
}

export function LeadCard({ lead, onPress, onDelete }: LeadCardProps) {
  const isDark = useColorScheme() === 'dark';
  const communicationService = CommunicationService.getInstance();

  const handleCall = (e: any) => {
    e.stopPropagation();
    if (lead.phone) {
      communicationService.triggerNativeDialer(lead.phone, lead.id, lead.name);
    }
  };

  const handleWhatsApp = (e: any) => {
    e.stopPropagation();
    if (lead.phone) {
      communicationService.triggerWhatsApp(lead.phone, lead.id, lead.name);
    }
  };

  const handleShare = (e: any) => {
    e.stopPropagation();
    // Share logic could be here
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleInfo}>
          <Text style={[styles.name, { color: isDark ? colors.surface : colors.onBackground }]}>
            {lead.name}
          </Text>
          {lead.company && (
            <Text style={[styles.company, { color: isDark ? colors.darkMuted : colors.muted }]}>
              {lead.company}
            </Text>
          )}
        </View>
        <LeadStatusBadge status={lead.status || 'New'} />
      </View>

      <View style={styles.contactInfo}>
        {lead.phone && (
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={14} color={isDark ? colors.darkMuted : colors.muted} />
            <Text style={[styles.infoText, { color: isDark ? colors.darkMuted : colors.muted }]}>
              {lead.phone}
            </Text>
          </View>
        )}
        {lead.email && (
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={14} color={isDark ? colors.darkMuted : colors.muted} />
            <Text style={[styles.infoText, { color: isDark ? colors.darkMuted : colors.muted }]}>
              {lead.email}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.sourceTag}>
          <Ionicons name="funnel-outline" size={12} color={colors.primary} />
          <Text style={styles.sourceText}>{lead.source || 'Direct'}</Text>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#3B82F615' }]} 
            onPress={handleCall}
          >
            <Ionicons name="call" size={18} color="#3B82F6" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#10B98115' }]} 
            onPress={handleWhatsApp}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#10B981" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#F59E0B15' }]} 
            onPress={handleShare}
          >
            <Ionicons name="share-social-outline" size={18} color="#F59E0B" />
          </TouchableOpacity>

          {onDelete && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#EF444415' }]} 
              onPress={(e) => { e.stopPropagation(); onDelete(); }}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 20,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleInfo: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 2,
  },
  company: {
    fontSize: 13,
    fontFamily: fonts.satoshi.medium,
  },
  contactInfo: {
    marginBottom: 12,
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    fontFamily: fonts.satoshi.regular,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB30',
  },
  sourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  sourceText: {
    fontSize: 11,
    fontFamily: fonts.satoshi.bold,
    color: colors.primary,
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
