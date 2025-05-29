/**
 * Debug Utility for Google Authentication
 * 
 * This file contains utility functions to help diagnose Google Auth issues.
 * You can import and use these functions in your components.
 */

/**
 * Logs information about the current origin and Google Auth configuration
 */
export const logAuthDebugInfo = () => {
  console.log('Current origin:', window.location.origin);
  
  // Check if we're running in development mode
  const isDev = import.meta.env.DEV || 
                window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1';
  
  console.log('Environment:', isDev ? 'Development' : 'Production');
  console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID || 'Not found');
  
  // Check if the port is non-standard
  if (window.location.port && window.location.port !== '80' && window.location.port !== '443') {
    console.log('Non-standard port detected:', window.location.port);
    console.log('Make sure this port is included in your authorized JavaScript origins');
  }
};

/**
 * Tests the API connection to the Google Auth endpoint
 */
export const testGoogleAuthAPI = async () => {
  try {
    const response = await fetch('/api/auth/google/verify', { 
      method: 'HEAD',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('Google Auth API test result:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    return response.ok;
  } catch (error) {
    console.error('Google Auth API test failed:', error.message);
    return false;
  }
};

export default {
  logAuthDebugInfo,
  testGoogleAuthAPI
}; 