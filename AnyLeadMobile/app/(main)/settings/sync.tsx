import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { Ionicons } from '@expo/vector-icons';

export default function SyncScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('2 minutes ago');

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSync('Just now');
    }, 2000);
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.surface : colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>Data & Sync</Text>
      </View>

      <Card style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={[styles.statusDot, { backgroundColor: syncing ? colors.warning : '#10B981' }]} />
          <Text style={[styles.statusTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            {syncing ? 'Synchronizing...' : 'Up to Date'}
          </Text>
        </View>
        <Text style={[styles.lastSync, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Last synced: {lastSync}</Text>
        
        <Button 
          title={syncing ? 'Syncing...' : 'Sync Now'} 
          onPress={handleSync} 
          loading={syncing}
          variant={syncing ? 'secondary' : 'primary'}
          style={styles.syncBtn}
        />
      </Card>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Statistics</Text>
        <Card style={styles.infoCard}>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Leads Cached</Text>
            <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>1,248</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Pending Uploads</Text>
            <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>0</Text>
          </View>
          <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Storage Used</Text>
            <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>12.4 MB</Text>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Options</Text>
        <Card style={styles.infoCard}>
          <TouchableOpacity style={styles.optionBtn}>
            <Text style={[styles.optionText, { color: isDark ? colors.surface : colors.onBackground }]}>Clear Cache</Text>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingTop: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backButton: { marginRight: 16 },
  title: { fontSize: 24, fontFamily: fonts.nohemi.bold },
  statusCard: { padding: 20, alignItems: 'center', marginBottom: 24 },
  statusHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  statusTitle: { fontSize: 18, fontFamily: fonts.nohemi.semiBold },
  lastSync: { fontSize: 14, fontFamily: fonts.satoshi.regular, marginBottom: 20 },
  syncBtn: { width: '100%' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontFamily: fonts.nohemi.semiBold, marginBottom: 12, paddingHorizontal: 4 },
  infoCard: { paddingHorizontal: 16 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB10' },
  statLabel: { fontSize: 14, fontFamily: fonts.satoshi.regular },
  statValue: { fontSize: 14, fontFamily: fonts.satoshi.bold },
  optionBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  optionText: { fontSize: 15, fontFamily: fonts.satoshi.medium },
});
