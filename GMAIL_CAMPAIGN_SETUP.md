# Gmail Campaign Automation Setup Guide

## Overview

This guide will help you set up the Gmail Campaign Automation feature in your TaskNova application. This feature allows users to create, manage, and send email campaigns using their Gmail account.

## Prerequisites

1. **Google Cloud Console Project** with Gmail API enabled
2. **Supabase Project** with the new database tables
3. **Environment Variables** configured

## Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

### 1.2 Configure OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add the following Authorized redirect URIs:
   ```
   http://localhost:8081/gmail-callback
   http://localhost:8082/gmail-callback
   http://localhost:8083/gmail-callback
   http://localhost:8084/gmail-callback
   https://your-production-domain.com/gmail-callback
   ```
5. Save and note your Client ID and Client Secret

### 1.3 Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "TaskNova Email Campaigns"
   - User support email: Your email
   - Developer contact information: Your email
4. Add the following scopes:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.compose`
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`

## Step 2: Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key

# Gmail API Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret

# n8n Webhook (for lead generation)
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/user-form
```

## Step 3: Database Setup

The database tables have been automatically created via the migration. The following tables are now available:

- `gmail_credentials` - Stores Gmail OAuth tokens
- `templates` - Email templates
- `contact_lists` - Contact lists
- `contacts` - Individual contacts
- `campaigns` - Email campaigns
- `campaign_sends` - Campaign send tracking

## Step 4: Features Overview

### 4.1 Gmail Integration
- **OAuth 2.0 Authentication**: Secure Gmail account connection
- **Token Management**: Automatic token refresh
- **Email Sending**: Send emails via Gmail API
- **Rate Limiting**: Built-in rate limiting for Gmail API compliance

### 4.2 Campaign Management
- **Campaign Builder**: Create campaigns with rich HTML editor
- **Template System**: Pre-built and custom email templates
- **Contact Lists**: Manage contact lists and subscribers
- **Scheduling**: Schedule campaigns for future delivery
- **Analytics**: Track opens, clicks, and engagement

### 4.3 Personalization
- **Dynamic Content**: Use placeholders like `{{first_name}}`, `{{email}}`
- **Custom Fields**: Support for custom contact fields
- **HTML Templates**: Full HTML email support

## Step 5: Usage Guide

### 5.1 Connecting Gmail Account
1. Navigate to `/gmail-campaigns`
2. Click "Connect Gmail Account" in the settings
3. Complete the OAuth flow
4. Your Gmail account is now connected

### 5.2 Creating a Campaign
1. Go to the Campaigns section
2. Click "Create Campaign"
3. Fill in campaign details:
   - Campaign name
   - Email subject
   - From name and email
   - HTML content
4. Select a contact list
5. Choose a template (optional)
6. Send or schedule the campaign

### 5.3 Managing Templates
1. Go to the Templates section
2. Create new templates with HTML content
3. Use placeholders for personalization
4. Set default templates

### 5.4 Managing Contacts
1. Go to the Contact Lists section
2. Create contact lists
3. Add contacts with custom fields
4. Import contacts from CSV (future feature)

## Step 6: Security Considerations

### 6.1 Token Security
- Tokens are encrypted and stored securely in Supabase
- Automatic token refresh prevents expiration issues
- Users can disconnect their Gmail account at any time

### 6.2 Rate Limiting
- Built-in delays between email sends (100ms)
- Respects Gmail API quotas
- Error handling for rate limit exceeded

### 6.3 Data Privacy
- All data is stored in your Supabase instance
- No data is shared with third parties
- Users control their own contact lists and campaigns

## Step 7: Troubleshooting

### 7.1 Common Issues

**"Gmail account not connected"**
- Check if OAuth credentials are correct
- Verify redirect URIs in Google Cloud Console
- Ensure Gmail API is enabled

**"Failed to send email"**
- Check Gmail API quotas
- Verify sender email is valid
- Check for rate limiting

**"Token expired"**
- Tokens should refresh automatically
- If issues persist, reconnect Gmail account

### 7.2 Debug Mode
Enable debug logging by checking browser console for detailed error messages.

## Step 8: API Limits

### 8.1 Gmail API Limits
- **Daily quota**: 1 billion queries per day
- **Per-user rate limit**: 250 queries per second per user
- **Per-user daily quota**: 1,000,000,000 queries per day per user

### 8.2 Best Practices
- Send emails in batches
- Implement proper error handling
- Monitor API usage
- Respect user preferences

## Step 9: Future Enhancements

Planned features for future releases:
- **Email Analytics**: Detailed open/click tracking
- **A/B Testing**: Test different subject lines and content
- **Automation**: Trigger campaigns based on events
- **Integration**: Connect with other email services
- **Advanced Templates**: Drag-and-drop template builder

## Support

For technical support or questions:
1. Check the troubleshooting section above
2. Review Google Cloud Console documentation
3. Check Supabase documentation for database issues
4. Contact your development team

---

**Note**: This feature requires proper Gmail API setup and user consent. Ensure compliance with Google's terms of service and email marketing regulations in your jurisdiction. 