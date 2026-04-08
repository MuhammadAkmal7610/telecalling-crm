import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { Ionicons } from '@expo/vector-icons';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'zh', name: 'Chinese', native: '中文' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [selected, setSelected] = useState('en');

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.surface : colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>Language</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Select Language</Text>
        <Card style={styles.sectionCard}>
          {LANGUAGES.map((lang, index) => (
            <TouchableOpacity 
              key={lang.code}
              style={[
                styles.languageRow, 
                index === LANGUAGES.length - 1 && { borderBottomWidth: 0 }
              ]}
              onPress={() => setSelected(lang.code)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.langName, { color: isDark ? colors.surface : colors.onBackground }]}>{lang.name}</Text>
                <Text style={[styles.langNative, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{lang.native}</Text>
              </View>
              {selected === lang.code && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </Card>
      </View>

      <Text style={[styles.disclaimer, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
        Changing the language will reload the app to apply the new translations throughout the interface.
      </Text>
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
  sectionCard: { paddingHorizontal: 16 },
  languageRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB10' },
  langName: { fontSize: 16, fontFamily: fonts.satoshi.medium, marginBottom: 2 },
  langNative: { fontSize: 13, fontFamily: fonts.satoshi.regular },
  disclaimer: { fontSize: 12, fontFamily: fonts.satoshi.regular, textAlign: 'center', marginTop: 12, paddingHorizontal: 20, lineHeight: 18 },
});
