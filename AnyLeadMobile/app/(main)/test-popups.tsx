import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { usePopupMessages } from '@/src/hooks/usePopupMessages';

export default function TestPopupsScreen() {
  const router = useRouter();
  const { showSuccess, showError, showWarning, showInfo, showConfirmation, showValidation, showLoading } = usePopupMessages();
  const isDark = useColorScheme() === 'dark';
  const [loading, setLoading] = useState(false);

  const testSuccess = () => {
    showSuccess('This is a success message!', () => {
      console.log('Success popup confirmed');
    });
  };

  const testError = () => {
    showError('This is an error message that will auto-hide after 3 seconds.');
  };

  const testWarning = () => {
    showWarning('This is a warning message with custom duration.', 5000);
  };

  const testInfo = () => {
    showInfo('This is an information message with a longer duration.', 4000);
  };

  const testValidation = () => {
    showValidation('This is a validation error that auto-hides after 2 seconds.');
  };

  const testConfirmation = () => {
    showConfirmation(
      'Test Confirmation',
      'This is a confirmation dialog. Click Confirm to see a success message, or Cancel to see nothing happen.',
      () => {
        showSuccess('You confirmed the action!');
      },
      () => {
        showInfo('You cancelled the action.');
      },
      'Confirm',
      'Cancel'
    );
  };

  const testLoading = () => {
    setLoading(true);
    showLoading('Processing your request...');
    
    // Simulate async operation
    setTimeout(() => {
      setLoading(false);
      showSuccess('Operation completed successfully!');
    }, 3000);
  };

  const testMultiple = () => {
    showInfo('First message...');
    setTimeout(() => showSuccess('Second message!'), 1000);
    setTimeout(() => showWarning('Third message!'), 2000);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Card style={styles.formCard}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Popup System Test
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Test all popup types and functionality
        </Text>

        <View style={styles.buttonGrid}>
          <Button
            title="Success Popup"
            onPress={testSuccess}
            style={styles.button}
          />
          <Button
            title="Error Popup"
            onPress={testError}
            variant="secondary"
            style={styles.button}
          />
          <Button
            title="Warning Popup"
            onPress={testWarning}
            style={styles.button}
          />
          <Button
            title="Info Popup"
            onPress={testInfo}
            variant="secondary"
            style={styles.button}
          />
          <Button
            title="Validation Popup"
            onPress={testValidation}
            style={styles.button}
          />
          <Button
            title="Confirmation Dialog"
            onPress={testConfirmation}
            variant="secondary"
            style={styles.button}
          />
          <Button
            title="Loading Popup"
            onPress={testLoading}
            loading={loading}
            style={styles.button}
          />
          <Button
            title="Multiple Popups"
            onPress={testMultiple}
            variant="secondary"
            style={styles.button}
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={[styles.infoTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Popup Features
          </Text>
          <Text style={[styles.infoText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            ✓ Smooth animations and modern design{'\n'}
            ✓ Haptic feedback for different types{'\n'}
            ✓ Auto-hide for temporary messages{'\n'}
            ✓ Customizable buttons and actions{'\n'}
            ✓ Consistent styling across the app
          </Text>
        </View>

        <Button
          title="Go Back"
          onPress={() => router.back()}
          style={styles.backButton}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  formCard: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    minWidth: '48%',
    marginBottom: 8,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    lineHeight: 20,
  },
  backButton: {
    marginTop: 8,
  },
});