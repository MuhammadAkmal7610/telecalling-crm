# TeleCRM Mobile App

A comprehensive mobile CRM application built with React Native and Expo, designed to replicate the functionality of TeleCRM.in.

## Features

### 🏠 Dashboard
- **Overview Stats**: Total leads, contacted leads, converted leads, active campaigns
- **Quick Actions**: Add leads, create campaigns with one tap
- **Recent Activity**: Track all recent CRM activities
- **Performance Metrics**: Conversion rates and campaign performance

### 👥 Leads Management
- **Lead List**: View all leads with status badges and quick actions
- **Create Lead**: Add new leads with comprehensive form validation
- **Lead Details**: View complete lead information and history
- **Lead Status Tracking**: New, Contacted, Qualified, Converted, Lost
- **Source Tracking**: Manual, Website, Social Media, Referrals

### 📢 Campaign Management
- **Campaign List**: View all campaigns with status and priority indicators
- **Create Campaign**: Set up new campaigns with goals and target audience
- **Campaign Status**: Draft, Active, Paused, Completed
- **Priority Levels**: High, Medium, Low
- **Progress Tracking**: Monitor campaign performance

### 📊 Activity Tracking
- **Real-time Activities**: Track all user interactions
- **Activity Types**: Calls, Emails, SMS, Meetings, Notes, Tasks
- **Activity Timeline**: Chronological view of all activities
- **User Attribution**: See who performed each activity

### ⚙️ Settings & Profile
- **User Profile**: Manage personal information
- **Account Settings**: Notifications, security preferences
- **App Settings**: Appearance, language, data sync
- **Support**: Help center, legal information, about

## Technical Architecture

### 🛠 Technology Stack
- **Framework**: React Native with Expo
- **Navigation**: Expo Router (File-based routing)
- **State Management**: React Context API
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: Custom components with React Native Paper
- **Styling**: StyleSheet with custom theme system
- **Icons**: Expo Vector Icons (Ionicons)
- **Date Handling**: date-fns

### 📁 Project Structure
```
AnyLeadMobile/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Authentication screens
│   ├── (main)/                   # Main app screens
│   │   ├── dashboard.tsx         # Dashboard screen
│   │   ├── leads/                # Lead management
│   │   ├── campaigns/            # Campaign management
│   │   ├── activities.tsx        # Activity tracking
│   │   └── settings.tsx          # Settings screen
│   └── _layout.tsx               # Root layout
├── src/
│   ├── components/common/        # Reusable UI components
│   ├── contexts/                 # React contexts
│   ├── lib/                      # Utilities and configurations
│   ├── services/                 # API services
│   └── theme/                    # Theme and styling
├── assets/                       # Fonts and images
└── package.json                  # Dependencies
```

### 🔧 Key Components

#### API Service (`src/services/ApiService.ts`)
- Centralized API communication with Supabase
- CRUD operations for leads, campaigns, activities
- Dashboard statistics aggregation
- Error handling and data transformation

#### Authentication Context (`src/contexts/AuthContext.tsx`)
- User authentication state management
- Session handling with Supabase Auth
- User profile management
- Sign in, sign up, sign out functionality

#### UI Components (`src/components/common/`)
- **Card**: Reusable card component with press handling
- **StatCard**: Dashboard statistics display
- **LeadStatusBadge**: Color-coded status indicators
- **Button**: Custom button with variants and loading states

#### Theme System (`src/theme/theme.ts`)
- Consistent color palette
- Typography system with custom fonts
- Dark/light theme support
- Responsive design utilities

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Supabase project

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd AnyLeadMobile
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. **Run the app**
```bash
# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

### Database Setup

Ensure your Supabase database has the following tables:
- `users` - User profiles and roles
- `leads` - Lead management
- `campaigns` - Campaign data
- `activities` - Activity tracking
- `workspaces` - Workspace management
- `organizations` - Organization data

## Features Implementation

### Workspace-Based Architecture
- Multi-tenant support with workspace isolation
- Users can only access data within their workspace
- Proper data filtering and security

### Real-time Updates
- Dashboard statistics refresh on data changes
- Activity feed updates in real-time
- Campaign progress tracking

### Security
- JWT-based authentication
- Row-level security (RLS) policies
- Workspace-based data isolation

## UI/UX Features

### 🎨 Design System
- **Colors**: Primary teal (#08A698) with complementary palette
- **Typography**: Nohemi and Satoshi font families
- **Components**: Consistent design language
- **Dark Mode**: Full dark theme support

### 📱 Mobile-First Design
- Touch-friendly interfaces
- Gesture navigation
- Responsive layouts
- Platform-specific interactions

## Development Guidelines

### 📝 Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Component-based architecture

## Deployment

### 📲 App Store Deployment
```bash
# Build for production
expo build:android
expo build:ios

# Submit to stores
expo submit
```

### 🌐 Web Deployment
```bash
# Build for web
expo build:web

# Deploy to hosting
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**TeleCRM Mobile** - Your complete CRM solution on the go! 🚀
