# 🚀 WhatsApp & Dialer Integration Setup Guide

## 📋 Complete Setup Checklist

### ✅ **Environment Configuration**

#### **1. Copy Environment File**
```bash
cp .env.example .env
```

#### **2. Required Environment Variables**

**WhatsApp Integration (Choose ONE provider):**

**Option A: Twilio (Recommended)**
```env
EXPO_PUBLIC_WHATSAPP_PROVIDER=twilio
EXPO_PUBLIC_TWILIO_ACCOUNT_SID=your_twilio_account_sid
EXPO_PUBLIC_TWILIO_AUTH_TOKEN=your_twilio_auth_token
EXPO_PUBLIC_TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_number
```

**Option B: Direct WhatsApp Business API**
```env
EXPO_PUBLIC_WHATSAPP_PROVIDER=direct
EXPO_PUBLIC_WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
EXPO_PUBLIC_WHATSAPP_BUSINESS_ACCOUNT_ID=your_whatsapp_business_account_id
EXPO_PUBLIC_WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
```

**Dialer Integration:**
```env
EXPO_PUBLIC_TWILIO_ACCOUNT_SID=your_twilio_account_sid
EXPO_PUBLIC_TWILIO_AUTH_TOKEN=your_twilio_auth_token
EXPO_PUBLIC_TWILIO_VOICE_APPLICATION_SID=your_twilio_voice_app_sid
```

**Webhook Configuration:**
```env
EXPO_PUBLIC_WHATSAPP_WEBHOOK_URL=https://your-server.com/webhooks/whatsapp
EXPO_PUBLIC_WHATSAPP_WEBHOOK_SECRET=your_webhook_secret_key
```

### ✅ **Dependencies Installation**

#### **1. Install New Dependencies**
```bash
npm install
```

#### **2. Key Dependencies Added:**
- `twilio` - WhatsApp and voice API
- `react-native-dotenv` - Environment variables
- `react-native-permissions` - Device permissions
- `@react-native-async-storage/async-storage` - Local storage
- `crypto-js` - Encryption utilities
- `uuid` - Unique ID generation

### ✅ **WhatsApp Setup Steps**

#### **Twilio Setup (Recommended):**

1. **Create Twilio Account**
   - Go to [twilio.com](https://twilio.com)
   - Sign up for a free trial account

2. **Get WhatsApp Business Number**
   - In Twilio console, go to Messaging → Senders → WhatsApp Senders
   - Request a WhatsApp Business number
   - Wait for approval (usually 1-3 business days)

3. **Configure Webhook**
   - Set webhook URL: `https://your-server.com/webhooks/whatsapp`
   - Configure webhook events: `messages`, `message_status`
   - Set webhook verify token

4. **Update Environment Variables**
   - Copy Account SID, Auth Token, and WhatsApp number to `.env`

#### **Direct WhatsApp Business API Setup:**

1. **Create Meta Business Account**
   - Go to [business.facebook.com](https://business.facebook.com)
   - Create a business account

2. **Get WhatsApp Business API Access**
   - Apply for WhatsApp Business API access
   - Create a WhatsApp Business app

3. **Configure Phone Number**
   - Add and verify your phone number
   - Get Phone Number ID and Access Token

4. **Setup Webhook**
   - Configure webhook URL in WhatsApp Business Manager
   - Set up webhook verification

### ✅ **Dialer Setup Steps**

#### **Twilio Voice Setup:**

1. **Purchase Twilio Phone Number**
   - In Twilio console, buy a phone number with voice capabilities
   - Choose a number in your target region

2. **Create TwiML Application**
   - Go to Twilio Console → TwiML → Apps
   - Create a new TwiML app
   - Set voice request URL to your server

3. **Configure Voice Settings**
   - Update Voice Application SID in environment
   - Test with a test call

### ✅ **App Configuration**

#### **1. Update app.json**
The following plugins have been automatically added:
- `react-native-dotenv` - Environment variables
- `expo-contacts` - Contact access
- `expo-barcode-scanner` - QR code scanning

#### **2. Permissions Required**
- **Contacts** - Access phone contacts for calling
- **Phone** - Make phone calls
- **Microphone** - Record calls (optional)
- **Camera** - Scan QR codes (optional)

#### **3. Build Configuration**
```bash
# For development
expo start

# For production build
expo build:android
expo build:ios
```

### ✅ **Testing & Validation**

#### **1. Use Built-in Validation**
- Open app → Settings → Advanced Settings → Setup & Config
- Click "Run Setup Validation"
- Fix any reported issues

#### **2. Test WhatsApp Integration**
- Send a test message from the app
- Verify message delivery in WhatsApp
- Check webhook receives messages

#### **3. Test Dialer Integration**
- Make a test call from the dialer
- Verify call logging works
- Check call history updates

#### **4. Test Permissions**
- Grant all requested permissions
- Test contact access
- Verify phone call functionality

### ✅ **Production Deployment**

#### **1. Security Checklist**
- [ ] Use HTTPS for all webhook URLs
- [ ] Secure webhook with verify token
- [ ] Store secrets securely (not in code)
- [ ] Enable app signing for production

#### **2. Performance Optimization**
- [ ] Enable production mode
- [ ] Optimize app bundle size
- [ ] Test on real devices
- [ ] Monitor API usage limits

#### **3. Compliance**
- [ ] GDPR compliance for EU users
- [ ] WhatsApp Business Policy compliance
- [ ] TCPA compliance for US calls
- [ ] Local regulations compliance

### ✅ **Troubleshooting**

#### **Common Issues:**

**WhatsApp Messages Not Sending:**
- Check API credentials in `.env`
- Verify webhook URL is accessible
- Check phone number is approved
- Review message content policies

**Calls Not Working:**
- Verify Twilio voice credentials
- Check phone number has voice capabilities
- Ensure app has phone permissions
- Test with different numbers

**Environment Variables Not Loading:**
- Restart development server
- Check `.env` file is in project root
- Verify variable names start with `EXPO_PUBLIC_`
- Check app.json configuration

**Permissions Issues:**
- Grant permissions in device settings
- Check manifest permissions
- Reinstall app if needed

#### **Debug Tools:**
- Use Expo development tools
- Check browser console for errors
- Review API logs in provider dashboard
- Test with Postman for API endpoints

### ✅ **Support Resources**

#### **Documentation:**
- [Twilio WhatsApp Docs](https://www.twilio.com/docs/whatsapp)
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)

#### **Community:**
- Twilio Community Forums
- Meta Business Developer Community
- Expo Discord Community

#### **Support:**
- App: Settings → Advanced Settings → Setup & Config → "View Documentation"
- Email: support@your-crm-app.com
- Phone: +1-XXX-XXX-XXXX

---

## 🎯 **Quick Start Summary**

1. **Copy** `.env.example` to `.env`
2. **Fill** in your WhatsApp and dialer credentials
3. **Run** `npm install`
4. **Start** the app with `expo start`
5. **Validate** setup in Settings → Advanced Settings → Setup & Config
6. **Test** WhatsApp and dialer functionality

**Your WhatsApp & Dialer integration is now ready!** 🚀

---

*Last updated: March 2026*
*Version: 1.0.0*
