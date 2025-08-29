# TaskNova Lead Generator

A powerful AI-driven lead generation platform that helps businesses find and connect with their ideal customers.

## 🚀 Features

### Global Location Support
- **Fixed Major Countries**: India, United States, United Kingdom, Australia, United Arab Emirates (Dubai), Canada
- **Additional Major Markets**: Germany, Singapore, Japan, Brazil, France, Netherlands

### Persistent 7-Day Trial Timer
- **Cross-Session Persistence**: Timer continues counting down even when the app is closed
- **Local Storage**: Uses browser localStorage to maintain timer state across sessions
- **Real-time Updates**: Live countdown display with days, hours, minutes, and seconds
- **Automatic Expiration**: Handles trial expiration gracefully with user notifications

### Lead Generation Features
- **Precision Targeting**: Advanced algorithms to find your ideal customers
- **Smart Lead Discovery**: Automatically discover and verify high-quality leads
- **Rich Data Export**: Export leads in CSV/JSON format with detailed contact information
- **Data Quality Assurance**: Verified contact information with high accuracy rates

## 🛠️ Technical Implementation

### Timer System
- **Custom Hook**: `useTrialTimer` manages timer state and persistence
- **Reusable Component**: `TrialCountdown` displays timer across the application
- **Utility Functions**: Timer utilities for testing and management
- **Local Storage**: Persistent timer state across browser sessions

### Location Management
- **Organized Categories**: Locations grouped by region for easy selection
- **Comprehensive Coverage**: 100+ countries and regions worldwide
- **Gulf Countries**: Special focus on Middle Eastern markets
- **Global Reach**: Support for major business markets worldwide

## 🎯 Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Start development server**: `npm run dev`
4. **Access the application**: Open `http://localhost:5173`

## 📦 Package Structure

```
src/
├── components/
│   ├── ui/
│   │   └── trial-countdown.tsx    # Reusable timer component
│   └── payment/
│       └── SimplePaymentModal.tsx # Payment modal with timer
├── hooks/
│   └── use-trial-timer.ts         # Custom timer hook
├── utils/
│   └── timer-utils.ts             # Timer utility functions
└── pages/
    ├── HomePage.tsx               # Homepage with timer display
    └── LeadGenerationPage.tsx     # Main lead generation with locations
```

## 🔧 Configuration

### Environment Variables
- `VITE_RAZORPAY_KEY_ID`: Razorpay payment gateway key
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

## 🎁 Trial System

The application includes a 7-day trial system with the following features:
- **Automatic Timer**: Starts when user first visits
- **Persistent Countdown**: Continues across browser sessions
- **Visual Display**: Real-time countdown on multiple pages
- **Expiration Handling**: Graceful handling when trial expires

## 🌍 Global Reach

With support for 12 major countries, the platform serves:
- **Fixed Major Markets**: India, United States, United Kingdom, Australia, United Arab Emirates (Dubai), Canada
- **Additional Major Markets**: Germany, Singapore, Japan, Brazil, France, Netherlands

## 📞 Support

For support and questions, please contact us at [support@tasknova.io](mailto:support@tasknova.io)