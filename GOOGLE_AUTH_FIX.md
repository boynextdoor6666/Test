# Fixing Google Auth Issues

## The Problem

You've encountered errors related to Google Authentication:

```
The given origin is not allowed for the given client ID.
```

This error occurs because Google restricts which domains/origins can use your OAuth client ID for security reasons. During development, you're using a local development server (like `localhost:5173`), but your current Google client ID is not configured to work with your local domain.

## Solution 1: Use Development Mode (Recommended for Local Development)

We've added a development-friendly Google Sign-In component that works without making actual calls to Google's servers. When `import.meta.env.DEV` is true (in development mode), the app will use this component instead.

**You don't need to do anything for this to work.** Just continue using the app in development mode, and you'll be able to "sign in" with demo accounts.

## Solution 2: Configure Google OAuth for Your Local Environment

If you want to test real Google authentication in development, follow these steps:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to "APIs & Services" > "Credentials"
4. Find the OAuth 2.0 Client ID you're using or create a new one
5. Edit the client ID and add your local development URL to "Authorized JavaScript origins":
   - Add `http://localhost:5173` (or whatever port your Vite dev server uses)
   - You can also add `http://127.0.0.1:5173` as an alternative

6. Save your changes

7. Update your `.env` file with your client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=your_client_id_here
   ```

8. Restart your development server

## Solution 3: Use a Temporary Test Client ID

For quick testing, you can create a new Google OAuth client ID specifically for local development:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project called "Local Development"
3. Set up OAuth consent screen (can be "External" and "Testing")
4. Create a new OAuth client ID for "Web application"
5. Add `http://localhost:5173` to authorized origins
6. Use this client ID in your `.env` file

## Debugging Tips

If you continue to have issues:

1. Check browser console for specific error messages
2. Verify that your client ID is correctly set in `.env`
3. Make sure the authorized origins in Google Cloud Console exactly match your local development URL (including protocol and port)
4. Clear your browser cookies and local storage
5. Try using Incognito/Private browsing mode

## Production Considerations

When deploying to production:

1. Make sure your production domain is added to the authorized origins in Google Cloud Console
2. Set the correct `VITE_GOOGLE_CLIENT_ID` in your production environment variables
3. Consider using a different client ID for production vs. development

## Need More Help?

If you're still experiencing issues, check out:

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Websites](https://developers.google.com/identity/sign-in/web/sign-in)
