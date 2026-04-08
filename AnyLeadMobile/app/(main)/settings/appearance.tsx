import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AppearanceScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const ThemeOption = ({ 
    type, 
    label, 
    icon 
  }: { 
    type: 'light' | 'dark' | 'system'; 
    label: string; 
    icon: string 
  }) => (
    <TouchableOpacity 
      style={[
        styles.themeOption, 
        { borderColor: theme === type ? colors.primary : (isDark ? '#374151' : '#E5E7EB') },
        theme === type && { backgroundColor: colors.primary + '10' }
      ]}
      onPress={() => setTheme(type)}
    >
      <Ionicons 
        name={icon as any} 
        size={24} 
        color={theme === type ? colors.primary : (isDark ? '#9CA3AF' : '#6B7280')} 
      />
      <Text style={[
        styles.themeLabel, 
        { color: theme === type ? colors.primary : (isDark ? colors.surface : colors.onBackground) }
      ]}>
        {label}
      </Text>
      {theme === type && (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={12} color="#fff" />
        </View>
      )}
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
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>Appearance</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Theme</Text>
        <View style={styles.themeGrid}>
          <ThemeOption type="light" label="Light" icon="sunny-outline" />
          <ThemeOption type="dark" label="Dark" icon="moon-outline" />
          <ThemeOption type="system" label="System" icon="phone-portrait-outline" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Accessibility</Text>
        <Card style={styles.sectionCard}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>High Contrast</Text>
              <Text style={[styles.settingDesc, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Improve visibility of text and icons</Text>
            </View>
            <Switch 
              value={highContrast} 
              onValueChange={setHighContrast}
              trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
              thumbColor={highContrast ? colors.primary : '#fff'}
            />
          </View>
          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>Reduce Motion</Text>
              <Text style={[styles.settingDesc, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Minimize system animations and effects</Text>
            </View>
            <Switch 
              value={reduceMotion} 
              onValueChange={setReduceMotion}
              trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
              thumbColor={reduceMotion ? colors.primary : '#fff'}
            />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>App Icon</Text>
        <Card style={styles.sectionCard}>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.iconPreview}>
              <View style={[styles.iconBox, { backgroundColor: colors.primary }]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>Change App Icon</Text>
              <Text style={[styles.settingDesc, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Default (Emerald Teal)</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
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
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontFamily: fonts.nohemi.semiBold, marginBottom: 12, paddingHorizontal: 4 },
  themeGrid: { flexDirection: 'row', gap: 12 },
  themeOption: { flex: 1, alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 2, position: 'relative' },
  themeLabel: { fontSize: 13, fontFamily: fonts.satoshi.medium, marginTop: 8 },
  checkBadge: { position: 'absolute', top: -8, right: -8, backgroundColor: colors.primary, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionCard: { paddingHorizontal: 16, paddingVertical: 8 },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB10' },
  settingLabel: { fontSize: 15, fontFamily: fonts.satoshi.medium, marginBottom: 2 },
  settingDesc: { fontSize: 12, fontFamily: fonts.satoshi.regular },
  iconPreview: { width: 32, height: 32, borderRadius: 8, overflow: 'hidden', marginRight: 12 },
  iconBox: { flex: 1 },
});
