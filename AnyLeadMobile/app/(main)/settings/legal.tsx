import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { Ionicons } from '@expo/vector-icons';

export default function LegalScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const LegalItem = ({ title, subtitle, onPress, showBorder = true }: { 
    title: string; 
    subtitle: string; 
    onPress: () => void;
    showBorder?: boolean;
  }) => (
    <TouchableOpacity 
      style={[
        styles.legalItem, 
        { borderBottomColor: isDark ? '#374151' : '#E5E7EB' },
        !showBorder && { borderBottomWidth: 0 }
      ]} 
      onPress={onPress}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.legalTitle, { color: isDark ? colors.surface : colors.onBackground }]}>{title}</Text>
        <Text style={[styles.legalSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.surface : colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>Terms & Privacy</Text>
      </View>

      <Card style={styles.legalCard}>
        <LegalItem 
          title="Terms of Service" 
          subtitle="Updated September 20, 2025" 
          onPress={() => {}} 
        />
        <LegalItem 
          title="Privacy Policy" 
          subtitle="How we handle your data" 
          onPress={() => {}} 
        />
        <LegalItem 
          title="Cookie Policy" 
          subtitle="Managing local storage" 
          onPress={() => {}} 
        />
        <LegalItem 
          title="Service Level Agreement" 
          subtitle="Our commitment to uptime" 
          onPress={() => {}} 
          showBorder={false}
        />
      </Card>

      <View style={styles.infoSection}>
        <Text style={[styles.infoText, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
          By using AnyLead, you agree to our Terms of Service and Privacy Policy. These documents outline our commitment to protecting your data and the rules for using our platform.
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
  legalCard: { paddingHorizontal: 16 },
  legalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, borderBottomWidth: StyleSheet.hairlineWidth },
  legalTitle: { fontSize: 16, fontFamily: fonts.satoshi.medium, marginBottom: 4 },
  legalSubtitle: { fontSize: 13, fontFamily: fonts.satoshi.regular },
  infoSection: { marginTop: 24, paddingHorizontal: 10 },
  infoText: { fontSize: 13, fontFamily: fonts.satoshi.regular, textAlign: 'center', lineHeight: 20 },
});
