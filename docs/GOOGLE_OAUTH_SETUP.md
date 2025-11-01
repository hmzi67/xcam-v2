# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the XCam application.

## Prerequisites

- A Google account
- Access to the Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter a project name (e.g., "XCam Auth")
5. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" as the user type (or "Internal" if you have a Google Workspace)
3. Click "Create"
4. Fill in the required information:
   - **App name**: XCam
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes"
7. Add the following scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
8. Click "Save and Continue"
9. Add test users if needed (for development)
10. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Enter a name (e.g., "XCam Web Client")
5. Add **Authorized JavaScript origins**:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
6. Add **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
7. Click "Create"
8. Copy the **Client ID** and **Client Secret**

## Step 5: Configure Environment Variables

1. Create a `.env` file in the root of your project (if it doesn't exist)
2. Add the following variables:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"
```

3. To generate a secure `NEXTAUTH_SECRET`, run:
   ```bash
   openssl rand -base64 32
   ```

## Step 6: Update for Production

When deploying to production:

1. Go back to the Google Cloud Console
2. Update the OAuth credentials with your production URLs
3. Update your `.env` file with production values:
   - `NEXTAUTH_URL` should be your production domain
   - Keep the same `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

## Testing

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to the login or signup page
3. Click "Continue with Google"
4. You should be redirected to Google's OAuth consent screen
5. After authorizing, you'll be redirected back to your application

## Troubleshooting

### "redirect_uri_mismatch" Error

- Make sure the redirect URI in Google Cloud Console exactly matches the one being used
- Check for trailing slashes and http vs https
- The redirect URI should be: `http://localhost:3000/api/auth/callback/google`

### "invalid_client" Error

- Double-check your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the `.env` file
- Make sure there are no extra spaces or quotes

### "Access blocked: This app's request is invalid"

- Make sure you've configured the OAuth consent screen
- Add your email as a test user if the app is not published

### User is not being created in the database

- Check your database connection
- Review the server logs for any Prisma errors
- Make sure the `Profile` table exists in your database

## Security Notes

- Never commit your `.env` file to version control
- Use different OAuth credentials for development and production
- Regularly rotate your `NEXTAUTH_SECRET`
- Keep your `GOOGLE_CLIENT_SECRET` secure

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
