# Login Debugging Guide

## What to Check in Browser Console

After deploying, test the login at: **https://obourinstitutes.web.app**

### Step 1: Open Browser Dev Tools

- Press **F12** → Go to **Console** tab
- Clear any old logs
- **Watch for these specific messages:**

### Step 2: Click "تسجيل الدخول بـ Google" Button

Look for **[AuthContext]** log messages:

```
[AuthContext] Bootstrap starting - API URL: https://obour-academic-hub.vercel.app/api/auth/bootstrap
```

**✅ If you see this**: The API URL is being set correctly
**❌ If you see something else or nothing**: API Base URL routing failed

### Step 3: Expected Success Flow

You should see these messages in order:

```
[AuthContext] login clicked - Initiating popup...
[AuthContext] Bootstrap SUCCESS for UID: [USER_UID]
[AuthContext] Claims received: [role] [permissions_count]
[AuthContext] Setting user immediately: [UID] [EMAIL]
```

**✅ If you see all of these**: Login logic is working  
**❌ If you stop at one**: That's where it's failing

### Step 4: Check for Errors

Look for any **red error messages** in console, specifically:

- `Bootstrap failed: ...`
- `Failed to initialize user profile (status: 4xx or 5xx)`
- `Network error`, `CORS error`, `Failed to fetch`
- `Firebase rule denies` or `Permission denied`

### Step 5: Network Tab

- Go to **Network** tab (while repeating login)
- Look for `/api/auth/bootstrap` request
- **✅ Should be**: `200 OK` with returned user data
- **❌ If error**: Click on it to see response body for error details

## Common Issues & Fixes

### Issue: Bootstrap URL is wrong (not pointing to Vercel)

```
[AuthContext] Bootstrap starting - API URL: (empty) or localhost
```

**Fix**: Check `src/lib/config.ts` - ensure Firebase domain is in the detection

### Issue: Bootstrap endpoint returns 401

```
Response: { error: "Authentication failed" }
```

**Cause**: ID Token is invalid or expired  
**Fix**: Clear browser cache, force token refresh with `getIdToken(true)`

### Issue: CORS Error

```
Access to XMLHttpRequest blocked by CORS policy
```

**Cause**: Vercel API not allowing Firebase Hosting domain  
**What we have**: CORS handler in `/src/lib/server/cors.ts`  
**Check**: Is `obourinstitutes.web.app` in allowed origins?

### Issue: Bootstrap returns 500

```
Response: { error: "Failed to initialize user profile" }
```

**Cause**: Firestore write failed (admin SDK error)  
**To debug**:

1. Check Firebase Firestore in Console → Find the document that should be created
2. Check Firebase Function logs for detailed error
3. Verify admin SDK is properly initialized

### Issue: Bootstrap successful but user doesn't appear

```
[AuthContext] Setting user immediately: [UID] [EMAIL]
But page still shows loading or goes back to login
```

**Possible causes**:

1. Listener setup failed silently
2. State not updating properly
3. Router push to /main not working

**To debug**:

- Check if there's an error in the listener: look for `"Error listening to user profile changes"`
- Check if loading state actually changes to false
- Check if user state actually gets set

## Testing /api/health Endpoint

The app now has a diagnostic endpoint:

```
https://obourinstitutes.web.app/api/health
```

Should return:

```json
{
  "timestamp": "ISO timestamp",
  "environment": "production",
  "firebaseProject": "obour-institutes-a607d"
}
```

**✅ If this works**: API routing from Firebase to Vercel is working  
**❌ If 404 or error**: API routing is broken

## What Logs Should Look Like

### Perfect Success (from console):

```
[AuthContext] login clicked - Initiating popup...
[AuthContext] Bootstrap SUCCESS for UID: c9Kx2PqW...
[AuthContext] Claims received: student []
[AuthContext] Setting user immediately: c9Kx2PqW... user@gmail.com
```

→ Page loads `/main` dashboard

### Bootstrap Failure (from console):

```
[AuthContext] Bootstrap starting - API URL: ...
[AuthContext] Bootstrap SUCCESS for UID: ...
Bootstrap failed: Server Error: {"error": "..."}
```

→ Page shows fallback Student Mode (user still logged in but without full profile)

### API Unreachable:

```
[AuthContext] Bootstrap starting - API URL: https://obour-academic-hub.vercel.app/api/auth/bootstrap
Bootstrap failed: Server Error: Failed to fetch
OR
CORS error in network tab
```

→ Page tries fallback, user enters Student Mode

## After Collecting These Logs

Share:

1. The **exact error messages** from console
2. Network tab screenshot showing the `/api/auth/bootstrap` request
3. The response body of that request
4. What page you're on after the login attempt (loading? login again? error?)

This will help us identify exactly where the login is failing.
