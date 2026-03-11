import Constants from 'expo-constants';

export interface WhatsAppConfig {
  provider: 'twilio' | 'messagebird' | 'gupshup' | 'direct';
  credentials: {
    // Twilio
    accountSid?: string;
    authToken?: string;
    whatsappNumber?: string;
    
    // MessageBird
    accessKey?: string;
    whatsappNumber?: string;
    
    // Gupshup
    apiKey?: string;
    appName?: string;
    
    // Direct WhatsApp Business API
    phoneNumberId?: string;
    businessAccountId?: string;
    accessToken?: string;
    webhookVerifyToken?: string;
  };
  webhook: {
    url: string;
    secret: string;
  };
  isEnabled: boolean;
}

export interface DialerConfig {
  provider: 'twilio' | 'vonage' | 'plivo';
  credentials: {
    // Twilio
    accountSid?: string;
    authToken?: string;
    voiceApplicationSid?: string;
    
    // Vonage
    apiKey?: string;
    apiSecret?: string;
    
    // Plivo
    authId?: string;
    authToken?: string;
  };
  isEnabled: boolean;
}

export interface AppConfig {
  app: {
    name: string;
    url: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
  whatsapp: WhatsAppConfig;
  dialer: DialerConfig;
  security: {
    encryptionKey: string;
    jwtSecret: string;
  };
  analytics: {
    enabled: boolean;
    sentryDsn?: string;
  };
  storage: {
    aws: {
      bucket: string;
      accessKeyId: string;
      secretAccessKey: string;
      region: string;
    };
  };
  notifications: {
    firebase: {
      projectId: string;
      serverKey: string;
    };
  };
  email: {
    sendgridApiKey: string;
    from: string;
  };
  socialMedia: {
    facebook: {
      appId: string;
      appSecret: string;
      accessToken: string;
    };
    instagram: {
      accessToken: string;
    };
    linkedin: {
      clientId: string;
      clientSecret: string;
    };
    twitter: {
      apiKey: string;
      apiSecret: string;
      accessToken: string;
      accessTokenSecret: string;
    };
  };
  payment: {
    stripe: {
      publishableKey: string;
    };
    razorpay: {
      keyId: string;
    };
  };
}

class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private loadConfig(): AppConfig {
    const env = Constants.expoConfig?.extra || {};
    
    return {
      app: {
        name: env.EXPO_PUBLIC_APP_NAME || 'AnyLead CRM',
        url: env.EXPO_PUBLIC_APP_URL || 'https://your-crm-app.com',
        version: env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
        environment: (env.EXPO_PUBLIC_ENVIRONMENT as any) || 'development'
      },
      api: {
        baseUrl: env.EXPO_PUBLIC_API_BASE_URL || 'https://your-api-server.com/api',
        timeout: 10000
      },
      whatsapp: {
        provider: (env.EXPO_PUBLIC_WHATSAPP_PROVIDER as any) || 'twilio',
        credentials: {
          // Twilio
          accountSid: env.EXPO_PUBLIC_TWILIO_ACCOUNT_SID,
          authToken: env.EXPO_PUBLIC_TWILIO_AUTH_TOKEN,
          whatsappNumber: env.EXPO_PUBLIC_TWILIO_WHATSAPP_NUMBER,
          
          // MessageBird
          accessKey: env.EXPO_PUBLIC_MESSAGEBIRD_ACCESS_KEY,
          
          // Gupshup
          apiKey: env.EXPO_PUBLIC_GUPSHUP_API_KEY,
          appName: env.EXPO_PUBLIC_GUPSHUP_APP_NAME,
          
          // Direct WhatsApp
          phoneNumberId: env.EXPO_PUBLIC_WHATSAPP_PHONE_NUMBER_ID,
          businessAccountId: env.EXPO_PUBLIC_WHATSAPP_BUSINESS_ACCOUNT_ID,
          accessToken: env.EXPO_PUBLIC_WHATSAPP_ACCESS_TOKEN,
          webhookVerifyToken: env.EXPO_PUBLIC_WHATSAPP_WEBHOOK_VERIFY_TOKEN
        },
        webhook: {
          url: env.EXPO_PUBLIC_WHATSAPP_WEBHOOK_URL || 'https://your-server.com/webhooks/whatsapp',
          secret: env.EXPO_PUBLIC_WHATSAPP_WEBHOOK_SECRET || 'your_webhook_secret_key'
        },
        isEnabled: !!(env.EXPO_PUBLIC_TWILIO_ACCOUNT_SID || env.EXPO_PUBLIC_WHATSAPP_ACCESS_TOKEN)
      },
      dialer: {
        provider: (env.EXPO_PUBLIC_TWILIO_VOICE_APPLICATION_SID ? 'twilio' : 'vonage') as any,
        credentials: {
          // Twilio
          accountSid: env.EXPO_PUBLIC_TWILIO_ACCOUNT_SID,
          authToken: env.EXPO_PUBLIC_TWILIO_AUTH_TOKEN,
          voiceApplicationSid: env.EXPO_PUBLIC_TWILIO_VOICE_APPLICATION_SID,
          
          // Vonage
          apiKey: env.EXPO_PUBLIC_VONAGE_API_KEY,
          apiSecret: env.EXPO_PUBLIC_VONAGE_API_SECRET,
          
          // Plivo
          authId: env.EXPO_PUBLIC_PLIVO_AUTH_ID,
          authToken: env.EXPO_PUBLIC_PLIVO_AUTH_TOKEN
        },
        isEnabled: !!(env.EXPO_PUBLIC_TWILIO_ACCOUNT_SID || env.EXPO_PUBLIC_VONAGE_API_KEY)
      },
      security: {
        encryptionKey: env.EXPO_PUBLIC_ENCRYPTION_KEY || 'default_32_character_encryption_key',
        jwtSecret: env.EXPO_PUBLIC_JWT_SECRET || 'default_jwt_secret_key'
      },
      analytics: {
        enabled: env.EXPO_PUBLIC_ANALYTICS_ENABLED === 'true',
        sentryDsn: env.EXPO_PUBLIC_SENTRY_DSN
      },
      storage: {
        aws: {
          bucket: env.EXPO_PUBLIC_AWS_S3_BUCKET || 'your_s3_bucket_name',
          accessKeyId: env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID || 'your_aws_access_key',
          secretAccessKey: env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY || 'your_aws_secret_key',
          region: env.EXPO_PUBLIC_AWS_REGION || 'us-east-1'
        }
      },
      notifications: {
        firebase: {
          projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'your_firebase_project_id',
          serverKey: env.EXPO_PUBLIC_FIREBASE_SERVER_KEY || 'your_firebase_server_key'
        }
      },
      email: {
        sendgridApiKey: env.EXPO_PUBLIC_SENDGRID_API_KEY || 'your_sendgrid_api_key',
        from: env.EXPO_PUBLIC_EMAIL_FROM || 'noreply@your-crm-app.com'
      },
      socialMedia: {
        facebook: {
          appId: env.EXPO_PUBLIC_FACEBOOK_APP_ID || 'your_facebook_app_id',
          appSecret: env.EXPO_PUBLIC_FACEBOOK_APP_SECRET || 'your_facebook_app_secret',
          accessToken: env.EXPO_PUBLIC_FACEBOOK_ACCESS_TOKEN || 'your_facebook_access_token'
        },
        instagram: {
          accessToken: env.EXPO_PUBLIC_INSTAGRAM_ACCESS_TOKEN || 'your_instagram_access_token'
        },
        linkedin: {
          clientId: env.EXPO_PUBLIC_LINKEDIN_CLIENT_ID || 'your_linkedin_client_id',
          clientSecret: env.EXPO_PUBLIC_LINKEDIN_CLIENT_SECRET || 'your_linkedin_client_secret'
        },
        twitter: {
          apiKey: env.EXPO_PUBLIC_TWITTER_API_KEY || 'your_twitter_api_key',
          apiSecret: env.EXPO_PUBLIC_TWITTER_API_SECRET || 'your_twitter_api_secret',
          accessToken: env.EXPO_PUBLIC_TWITTER_ACCESS_TOKEN || 'your_twitter_access_token',
          accessTokenSecret: env.EXPO_PUBLIC_TWITTER_ACCESS_TOKEN_SECRET || 'your_twitter_access_token_secret'
        }
      },
      payment: {
        stripe: {
          publishableKey: env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'your_stripe_publishable_key'
        },
        razorpay: {
          keyId: env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'your_razorpay_key_id'
        }
      }
    };
  }

  getConfig(): AppConfig {
    return this.config;
  }

  getWhatsAppConfig(): WhatsAppConfig {
    return this.config.whatsapp;
  }

  getDialerConfig(): DialerConfig {
    return this.config.dialer;
  }

  isWhatsAppEnabled(): boolean {
    return this.config.whatsapp.isEnabled && this.validateWhatsAppConfig();
  }

  isDialerEnabled(): boolean {
    return this.config.dialer.isEnabled && this.validateDialerConfig();
  }

  private validateWhatsAppConfig(): boolean {
    const { provider, credentials } = this.config.whatsapp;
    
    switch (provider) {
      case 'twilio':
        return !!(credentials.accountSid && credentials.authToken && credentials.whatsappNumber);
      case 'messagebird':
        return !!(credentials.accessKey && credentials.whatsappNumber);
      case 'gupshup':
        return !!(credentials.apiKey && credentials.appName);
      case 'direct':
        return !!(credentials.phoneNumberId && credentials.businessAccountId && credentials.accessToken);
      default:
        return false;
    }
  }

  private validateDialerConfig(): boolean {
    const { provider, credentials } = this.config.dialer;
    
    switch (provider) {
      case 'twilio':
        return !!(credentials.accountSid && credentials.authToken);
      case 'vonage':
        return !!(credentials.apiKey && credentials.apiSecret);
      case 'plivo':
        return !!(credentials.authId && credentials.authToken);
      default:
        return false;
    }
  }

  getRequiredEnvVars(): {
    whatsapp: string[];
    dialer: string[];
    optional: string[];
  } {
    return {
      whatsapp: [
        'EXPO_PUBLIC_WHATSAPP_PROVIDER',
        'EXPO_PUBLIC_TWILIO_ACCOUNT_SID',
        'EXPO_PUBLIC_TWILIO_AUTH_TOKEN',
        'EXPO_PUBLIC_TWILIO_WHATSAPP_NUMBER',
        'EXPO_PUBLIC_WHATSAPP_WEBHOOK_URL'
      ],
      dialer: [
        'EXPO_PUBLIC_TWILIO_ACCOUNT_SID',
        'EXPO_PUBLIC_TWILIO_AUTH_TOKEN',
        'EXPO_PUBLIC_TWILIO_VOICE_APPLICATION_SID'
      ],
      optional: [
        'EXPO_PUBLIC_SUPABASE_URL',
        'EXPO_PUBLIC_SUPABASE_ANON_KEY',
        'EXPO_PUBLIC_APP_URL',
        'EXPO_PUBLIC_API_BASE_URL',
        'EXPO_PUBLIC_SENTRY_DSN',
        'EXPO_PUBLIC_FIREBASE_PROJECT_ID'
      ]
    };
  }

  validateEnvironment(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const required = this.getRequiredEnvVars();

    // Check required WhatsApp variables
    if (this.config.whatsapp.isEnabled) {
      required.whatsapp.forEach(envVar => {
        if (!Constants.expoConfig?.extra?.[envVar]) {
          errors.push(`Missing required WhatsApp variable: ${envVar}`);
        }
      });
    } else {
      warnings.push('WhatsApp integration is not configured');
    }

    // Check required dialer variables
    if (this.config.dialer.isEnabled) {
      required.dialer.forEach(envVar => {
        if (!Constants.expoConfig?.extra?.[envVar]) {
          errors.push(`Missing required dialer variable: ${envVar}`);
        }
      });
    } else {
      warnings.push('Dialer integration is not configured');
    }

    // Check optional variables
    required.optional.forEach(envVar => {
      if (!Constants.expoConfig?.extra?.[envVar]) {
        warnings.push(`Missing optional variable: ${envVar}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  getSetupInstructions(): {
    whatsapp: string[];
    dialer: string[];
    general: string[];
  } {
    return {
      whatsapp: [
        '1. Choose a WhatsApp Business API Provider (Twilio recommended)',
        '2. Create an account with your chosen provider',
        '3. Get your WhatsApp Business number approved',
        '4. Set up webhook endpoint for receiving messages',
        '5. Configure environment variables with your credentials',
        '6. Test the integration with a test message'
      ],
      dialer: [
        '1. Choose a voice provider (Twilio recommended)',
        '2. Create an account and get your credentials',
        '3. Purchase a phone number for making calls',
        '4. Configure voice application and webhook',
        '5. Set up environment variables',
        '6. Test with a test call'
      ],
      general: [
        '1. Copy .env.example to .env',
        '2. Fill in all required environment variables',
        '3. Run npm install to install new dependencies',
        '4. Restart your development server',
        '5. Test all integrations before going to production'
      ]
    };
  }
}

export default ConfigService.getInstance();
