import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button } from './Card';
import { colors, fonts } from '@/src/theme/theme';

export function EmptyWorkspaceState() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={[styles.emptyWorkspaceContainer, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      <Ionicons name="business-outline" size={80} color={colors.primary} style={{ marginBottom: 20 }} />
      <Text style={[styles.welcomeText, { color: isDark ? colors.surface : colors.onBackground, textAlign: 'center' }]}>
        No Workspace Selected
      </Text>
      <Text style={[styles.subtitle, { color: isDark ? '#9CA3AF' : '#6B7280', textAlign: 'center', marginHorizontal: 40, marginTop: 10, marginBottom: 30, lineHeight: 22 }]}>
        You are not currently assigned to any active workspace. Please create or select a workspace to view your CRM data.
      </Text>
      <Button
        title="Manage Workspaces"
        onPress={() => router.push('/enterprise/workspaces' as any)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  emptyWorkspaceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
});
