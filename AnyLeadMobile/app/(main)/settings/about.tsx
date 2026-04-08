import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.surface : colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>About</Text>
      </View>

      <View style={styles.logoSection}>
        <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
          <Ionicons name="flash" size={48} color="#fff" />
        </View>
        <Text style={[styles.appName, { color: isDark ? colors.surface : colors.onBackground }]}>AnyLead Mobile</Text>
        <Text style={[styles.versionText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Version 1.0.0 (Build 240407)</Text>
      </View>

      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Developer</Text>
          <Text style={[styles.infoValue, { color: isDark ? colors.surface : colors.onBackground }]}>AnyLead CRM Team</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Release Date</Text>
          <Text style={[styles.infoValue, { color: isDark ? colors.surface : colors.onBackground }]}>April 2024</Text>
        </View>
        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <Text style={[styles.infoLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Environment</Text>
          <Text style={[styles.infoValue, { color: isDark ? colors.surface : colors.onBackground }]}>Production</Text>
        </View>
      </Card>

      <View style={styles.linksSection}>
        <TouchableOpacity style={styles.linkBtn}>
          <Text style={[styles.linkText, { color: colors.primary }]}>Official Website</Text>
          <Ionicons name="open-outline" size={16} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkBtn}>
          <Text style={[styles.linkText, { color: colors.primary }]}>Follow us on Twitter</Text>
          <Ionicons name="logo-twitter" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.copyright, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
          © 2025 AnyLead CRM. All rights reserved.
        </Text>
        <Text style={[styles.credits, { color: isDark ? '#4B5563' : '#D1D5DB' }]}>
          Made with ♥ in San Francisco
        </Text>
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
  logoSection: { alignItems: 'center', marginBottom: 32, marginTop: 12 },
  logoBox: { width: 100, height: 100, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
  appName: { fontSize: 22, fontFamily: fonts.nohemi.bold, marginBottom: 4 },
  versionText: { fontSize: 14, fontFamily: fonts.satoshi.regular },
  infoCard: { paddingHorizontal: 16, marginBottom: 32 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB10' },
  infoLabel: { fontSize: 14, fontFamily: fonts.satoshi.regular },
  infoValue: { fontSize: 14, fontFamily: fonts.satoshi.medium },
  linksSection: { gap: 16, alignItems: 'center', marginBottom: 40 },
  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  linkText: { fontSize: 15, fontFamily: fonts.satoshi.bold },
  footer: { alignItems: 'center', paddingBottom: 20 },
  copyright: { fontSize: 13, fontFamily: fonts.satoshi.regular, marginBottom: 4 },
  credits: { fontSize: 11, fontFamily: fonts.satoshi.medium, textTransform: 'uppercase', letterSpacing: 1 },
});
