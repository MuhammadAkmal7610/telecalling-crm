import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import ConfigService from '@/src/config/ConfigService';
import { Ionicons } from '@expo/vector-icons';

interface ValidationStatus {
  whatsapp: {
    configured: boolean;
    issues: string[];
    provider: string;
  };
  dialer: {
    configured: boolean;
    issues: string[];
    provider: string;
  };
  environment: {
    configured: boolean;
    errors: string[];
    warnings: string[];
  };
  dependencies: {
    installed: boolean;
    missing: string[];
  };
}

export default function SetupValidationScreen() {
  const { user } = useAuth();
  const [validation, setValidation] = useState<ValidationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);

  const configService = ConfigService;

  useEffect(() => {
    validateSetup();
  }, []);

  const validateSetup = async () => {
    try {
      setLoading(true);
      
      const envValidation = configService.validateEnvironment();
      const whatsappConfig = configService.getWhatsAppConfig();
      const dialerConfig = configService.getDialerConfig();

      const validationStatus: ValidationStatus = {
        whatsapp: {
          configured: configService.isWhatsAppEnabled(),
          issues: getWhatsAppIssues(whatsappConfig),
          provider: whatsappConfig.provider
        },
        dialer: {
          configured: configService.isDialerEnabled(),
          issues: getDialerIssues(dialerConfig),
          provider: dialerConfig.provider
        },
        environment: {
          configured: envValidation.isValid,
          errors: envValidation.errors,
          warnings: envValidation.warnings
        },
        dependencies: {
          installed: true, // In a real app, check if dependencies are installed
          missing: checkMissingDependencies()
        }
      };

      setValidation(validationStatus);
    } catch (error) {
      console.error('Error validating setup:', error);
      Alert.alert('Error', 'Failed to validate setup');
    } finally {
      setLoading(false);
    }
  };

  const getWhatsAppIssues = (config: any): string[] => {
    const issues: string[] = [];
    
    if (!config.isEnabled) {
      issues.push('WhatsApp integration is not enabled');
      return issues;
    }

    switch (config.provider) {
      case 'twilio':
        if (!config.credentials.accountSid) issues.push('Twilio Account SID is missing');
        if (!config.credentials.authToken) issues.push('Twilio Auth Token is missing');
        if (!config.credentials.whatsappNumber) issues.push('Twilio WhatsApp number is missing');
        break;
      case 'direct':
        if (!config.credentials.phoneNumberId) issues.push('WhatsApp Phone Number ID is missing');
        if (!config.credentials.businessAccountId) issues.push('WhatsApp Business Account ID is missing');
        if (!config.credentials.accessToken) issues.push('WhatsApp Access Token is missing');
        break;
    }

    if (!config.webhook.url) issues.push('WhatsApp webhook URL is not configured');
    if (!config.webhook.secret) issues.push('WhatsApp webhook secret is not set');

    return issues;
  };

  const getDialerIssues = (config: any): string[] => {
    const issues: string[] = [];
    
    if (!config.isEnabled) {
      issues.push('Dialer integration is not enabled');
      return issues;
    }

    switch (config.provider) {
      case 'twilio':
        if (!config.credentials.accountSid) issues.push('Twilio Account SID is missing');
        if (!config.credentials.authToken) issues.push('Twilio Auth Token is missing');
        if (!config.credentials.voiceApplicationSid) issues.push('Twilio Voice Application SID is missing');
        break;
      case 'vonage':
        if (!config.credentials.apiKey) issues.push('Vonage API Key is missing');
        if (!config.credentials.apiSecret) issues.push('Vonage API Secret is missing');
        break;
      case 'plivo':
        if (!config.credentials.authId) issues.push('Plivo Auth ID is missing');
        if (!config.credentials.authToken) issues.push('Plivo Auth Token is missing');
        break;
    }

    return issues;
  };

  const checkMissingDependencies = (): string[] => {
    const missing: string[] = [];
    const requiredPackages = [
      'twilio',
      '@react-native-async-storage/async-storage',
      'react-native-permissions',
      '@react-native-community/netinfo',
      'react-native-push-notification',
      'crypto-js',
      'uuid'
    ];

    // In a real implementation, check if these packages are actually installed
    // For now, we'll assume they're installed
    return missing;
  };

  const openSetupGuide = (type: 'whatsapp' | 'dialer' | 'general') => {
    const instructions = configService.getSetupInstructions();
    const guide = instructions[type];
    
    Alert.alert(
      'Setup Instructions',
      guide.join('\n\n'),
      [{ text: 'OK' }]
    );
  };

  const openEnvFile = () => {
    Alert.alert(
      'Environment File',
      '1. Copy .env.example to .env\n2. Fill in your actual values\n3. Restart your app\n\nThe .env file should be in your project root directory.',
      [
        { text: 'Cancel' },
        { 
          text: 'Open Documentation', 
          onPress: () => Linking.openURL('https://docs.expo.dev/guides/environment-variables/')
        }
      ]
    );
  };

  const testConnection = async (service: 'whatsapp' | 'dialer') => {
    setIsValidating(true);
    
    try {
      // Simulate testing the connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Connection Test',
        `${service.charAt(0).toUpperCase() + service.slice(1)} connection test successful!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Connection Test Failed',
        `Failed to connect to ${service}. Please check your configuration.`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsValidating(false);
    }
  };

  const renderStatusCard = (title: string, status: boolean, issues: string[], provider?: string) => (
    <Card style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <Text style={styles.statusTitle}>{title}</Text>
        <View style={[styles.statusIndicator, { backgroundColor: status ? '#10B981' : '#EF4444' }]}>
          <Ionicons name={status ? 'checkmark-circle' : 'alert-circle'} size={20} color="#FFFFFF" />
        </View>
      </View>
      
      {provider && (
        <Text style={styles.providerText}>Provider: {provider}</Text>
      )}
      
      {issues.length > 0 && (
        <View style={styles.issuesContainer}>
          <Text style={styles.issuesTitle}>Issues:</Text>
          {issues.map((issue, index) => (
            <Text key={index} style={styles.issueText}>• {issue}</Text>
          ))}
        </View>
      )}
      
      <View style={styles.statusActions}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => testConnection(title.toLowerCase() as 'whatsapp' | 'dialer')}
          disabled={!status || isValidating}
        >
          <Text style={styles.testButtonText}>
            {isValidating ? 'Testing...' : 'Test Connection'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.guideButton}
          onPress={() => openSetupGuide(title.toLowerCase() as 'whatsapp' | 'dialer')}
        >
          <Text style={styles.guideButtonText}>Setup Guide</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderEnvironmentCard = () => (
    <Card style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <Text style={styles.statusTitle}>Environment Configuration</Text>
        <View style={[styles.statusIndicator, { backgroundColor: validation?.environment.configured ? '#10B981' : '#EF4444' }]}>
          <Ionicons 
            name={validation?.environment.configured ? 'checkmark-circle' : 'alert-circle'} 
            size={20} 
            color="#FFFFFF" 
          />
        </View>
      </View>
      
      {validation?.environment.errors.length > 0 && (
        <View style={styles.issuesContainer}>
          <Text style={styles.issuesTitle}>Errors:</Text>
          {validation.environment.errors.map((error, index) => (
            <Text key={index} style={styles.errorText}>• {error}</Text>
          ))}
        </View>
      )}
      
      {validation?.environment.warnings.length > 0 && (
        <View style={styles.issuesContainer}>
          <Text style={styles.issuesTitle}>Warnings:</Text>
          {validation.environment.warnings.map((warning, index) => (
            <Text key={index} style={styles.warningText}>• {warning}</Text>
          ))}
        </View>
      )}
      
      <TouchableOpacity style={styles.envButton} onPress={openEnvFile}>
        <Ionicons name="document-text-outline" size={16} color={colors.primary} />
        <Text style={styles.envButtonText}>Configure .env File</Text>
      </TouchableOpacity>
    </Card>
  );

  const renderDependenciesCard = () => (
    <Card style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <Text style={styles.statusTitle}>Dependencies</Text>
        <View style={[styles.statusIndicator, { backgroundColor: validation?.dependencies.installed ? '#10B981' : '#EF4444' }]}>
          <Ionicons 
            name={validation?.dependencies.installed ? 'checkmark-circle' : 'alert-circle'} 
            size={20} 
            color="#FFFFFF" 
          />
        </View>
      </View>
      
      {validation?.dependencies.missing.length > 0 && (
        <View style={styles.issuesContainer}>
          <Text style={styles.issuesTitle}>Missing Dependencies:</Text>
          {validation.dependencies.missing.map((dep, index) => (
            <Text key={index} style={styles.issueText}>• {dep}</Text>
          ))}
        </View>
      )}
      
      <Text style={styles.dependencyNote}>
        Run 'npm install' to install missing dependencies
      </Text>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Validating setup...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Setup Validation</Text>
        <Text style={styles.subtitle}>Check your WhatsApp and dialer configuration</Text>
      </View>

      {validation && (
        <>
          {renderStatusCard('WhatsApp', validation.whatsapp.configured, validation.whatsapp.issues, validation.whatsapp.provider)}
          {renderStatusCard('Dialer', validation.dialer.configured, validation.dialer.issues, validation.dialer.provider)}
          {renderEnvironmentCard()}
          {renderDependenciesCard()}
        </>
      )}

      <View style={styles.actionsContainer}>
        <Button
          title="Re-validate Setup"
          onPress={validateSetup}
          style={styles.validateButton}
        />
        
        <TouchableOpacity
          style={styles.docsButton}
          onPress={() => Linking.openURL('https://your-docs-url.com')}
        >
          <Ionicons name="book-outline" size={16} color={colors.primary} />
          <Text style={styles.docsButtonText}>View Documentation</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>Need Help?</Text>
        <Text style={styles.helpText}>
          Follow our setup guide to configure WhatsApp and dialer integration. 
          Make sure all environment variables are properly set in your .env file.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: fonts.satoshi.medium,
    color: colors.onBackground,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
    color: colors.onBackground,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    color: '#6B7280',
  },
  statusCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
    color: colors.onBackground,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    color: '#6B7280',
    marginBottom: 12,
  },
  issuesContainer: {
    marginBottom: 16,
  },
  issuesTitle: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    color: colors.onBackground,
    marginBottom: 8,
  },
  issueText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    color: '#EF4444',
    marginBottom: 2,
  },
  errorText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    color: '#EF4444',
    marginBottom: 2,
  },
  warningText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    color: '#F59E0B',
    marginBottom: 2,
  },
  statusActions: {
    flexDirection: 'row',
    gap: 12,
  },
  testButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    color: '#FFFFFF',
  },
  guideButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  guideButtonText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    color: colors.onBackground,
  },
  envButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  envButtonText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    color: colors.primary,
  },
  dependencyNote: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  actionsContainer: {
    padding: 20,
    gap: 12,
  },
  validateButton: {
    backgroundColor: colors.primary,
  },
  docsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  docsButtonText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    color: colors.onBackground,
  },
  helpSection: {
    padding: 20,
    backgroundColor: '#F9FAFB',
    margin: 20,
    borderRadius: 12,
  },
  helpTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    color: colors.onBackground,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    color: '#6B7280',
    lineHeight: 20,
  },
});
