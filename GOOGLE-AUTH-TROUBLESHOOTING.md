# Google Authentication Troubleshooting Guide

## Error: "The given origin is not allowed for the given client ID"

This error occurs when Google doesn't recognize the origin (domain) of your application. Here's how to fix it:

### Step 1: Identify Your Current Origin

The application is currently running on:
```
http://localhost:3002
```

This is different from the origin you might have configured in Google Cloud Console (which may be http://localhost:3001).

### Step 2: Update Authorized JavaScript Origins in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Sign in with your Google account
3. Select your project
4. Find and edit your OAuth 2.0 Client ID
5. Under "Authorized JavaScript origins", add the following:
   ```
   http://localhost:3002
   ```
   (Keep any existing origins)
6. Click "Save"

> **Note:** It can take up to 5-10 minutes for changes to propagate in Google's systems.

### Step 3: Ensure the Backend Server is Running

The Google Auth endpoint on your backend server must be available. The following environment variables need to be set in your backend's `.env` file:

```
DATABASE_URL=mysql://root:password@localhost:3306/tez_jumush
MYSQL_URL=mysql://root:password@localhost:3306/tez_jumush
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=tez_jumush
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key_here
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3002
GOOGLE_CLIENT_ID=655912811217-9dvofthoehrkkgp547dltgb9qb8tnckr.apps.googleusercontent.com
```

Run your backend server with:
```
cd backend
npm run dev
```

## Additional Troubleshooting

If you're still having issues:

1. **Check Browser Console** for specific error messages
2. Use the debug functionality now added to the GoogleSignIn component
3. Verify that your Client ID is correct in both:
   - `.env` file in your frontend project
   - `.env` file in your backend project
4. Try clearing your browser cache or using incognito mode
5. Check network requests in browser dev tools to see if the request to Google Auth API is being made correctly

## Common Issues

1. **403 Error from Google**: Indicates an issue with your Client ID or authorized origins
2. **404 Error for /auth/google/verify**: Indicates the backend server is running but the endpoint isn't available
3. **Network Error**: Indicates the backend server isn't running or isn't accessible

## Need More Help?

If you're still experiencing issues after following these steps, check Google's official documentation at [https://developers.google.com/identity/gsi/web/guides/overview](https://developers.google.com/identity/gsi/web/guides/overview) 