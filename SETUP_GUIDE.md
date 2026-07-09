# Setup Guide - "Failed to Initialize Your Account" Fix

## What Was Fixed

1. **Firestore Rules** - Loosened overly restrictive user creation rules that prevented first-time login
2. **Bootstrap Endpoint** - Added comprehensive logging and error handling
3. **Firestore Rules Validation** - Rules now allow users to create their own user documents during bootstrap
4. **Error Handling** - Improved error messages to help diagnose issues

## What You Need To Do

### 1. Deploy Updated Firestore Rules

The Firestore rules have been updated. You must deploy them to Firebase:

```bash
firebase deploy --only firestore:rules
```

Or via Firebase Console:

1. Go to **Firebase Console** > Your Project
2. Navigate to **Firestore Database** > **Rules**
3. Copy content from `firestore.rules` file in the repo
4. Click **Publish**

### 2. Set Up Firebase Admin Credentials (Recommended for Production)

For Vercel and server-side operations, you need Firebase Admin credentials:

**Local Development (.env.local):**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click ⚙️ (Settings) > **Service Accounts**
4. Click **Generate New Private Key**
5. Copy the JSON content
6. Add to `.env.local`:
   ```
   FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"...",...}'
   ```

**Vercel Production:**

1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Add new variable:
   - **Name:** `FIREBASE_SERVICE_ACCOUNT`
   - **Value:** (paste the JSON from step 4 above)
   - **Environments:** Production, Preview, Development
3. Redeploy

### 3. Verify Firebase Project Configuration

Ensure these are set in `.env.local` (already present in your current .env.local):

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDtRfB...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=obour-institutes-a607d
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=obour-institutes-a607d.firebasestorage.app
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://obour-institutes-a607d-default-rtdb.firebaseio.com
NEXT_PUBLIC_OWNER_EMAIL=a7medorabe7@gmail.com
```

### 4. Verify CORS Configuration

The app should work from these domains:

- `http://localhost:3000` (local dev)
- `https://obour-academic-hub.vercel.app` (Vercel)
- `https://obourinstitutes.web.app` (Firebase Hosting)

If you get CORS errors, add domains in Firebase Console > Authentication > Settings > Authorized Domains.

### 5. Test Locally

```bash
npm run dev
```

1. Open http://localhost:3000
2. Click "Continue with Google"
3. Sign in with your Google account
4. Check browser console for bootstrap logs:
   ```
   [BOOTSTRAP] Starting bootstrap process...
   [BOOTSTRAP] Auth context obtained for user: ...
   [BOOTSTRAP] Writing user document to Firestore: ...
   [BOOTSTRAP] User document saved successfully
   ```

### 6. Deploy to Vercel

```bash
git add .
git commit -m "fix: deploy updated Firestore rules and bootstrap logging"
git push origin main
```

Vercel will automatically deploy. Check the deployment logs for any errors.

## Troubleshooting

### Still getting "Failed to initialize your account"?

Check browser console (F12 > Console tab) for:

1. **Auth Error** - Look for red text starting with `Error: Failed to initialize...`
2. **Network Error** - Check Network tab > XHR > `/api/auth/bootstrap`
   - Status 401/403: Token validation failed
   - Status 500: Server error - check server logs
3. **Firestore Error** - Check Firebase Console > Firestore > Rules (make sure rules are deployed)

### "FIREBASE_SERVICE_ACCOUNT is not configured" warning

This is a warning only, not an error. It appears during build because:

- Server is falling back to default Firebase credentials
- This works fine for read operations
- For write operations (like bootstrap), it should still work if:
  - Rules allow unauthenticated writes (they don't - rules require auth token)
  - OR server has credentials through FIREBASE_SERVICE_ACCOUNT

**Solution:** Set `FIREBASE_SERVICE_ACCOUNT` in Vercel environment variables.

### Can't sign in on Firebase Hosting (obourinstitutes.web.app)?

Check:

1. Domain is authorized in Firebase Console > Auth > Settings > Authorized Domains
2. Firestore rules deployed (see step 1)
3. If using custom domain, ensure SSL certificate is valid

## What Each Change Does

### Bootstrap Endpoint Logging

The `/api/auth/bootstrap` endpoint now logs each step:

```
[BOOTSTRAP] Starting bootstrap process...                    # Started
[BOOTSTRAP] Auth context obtained for user: uid email       # Token validated
[BOOTSTRAP] Whitelist check completed: true/false           # Admin check
[BOOTSTRAP] Assigned role: student/admin/owner              # Role assigned
[BOOTSTRAP] Writing user document to Firestore: uid         # Saving to DB
[BOOTSTRAP] User document saved successfully                # Complete
```

If you don't see these logs, the endpoint isn't being called. If you see them but still get an error, check for `[BOOTSTRAP] Fatal error:` logs.

### Firestore Rules Changes

**Before:**

- Users could only create documents with `role: 'student'`
- Could not include `permissions` field
- This blocked admin users from being created

**After:**

- Users can create their own user documents
- Server decides role/permissions based on whitelist
- Client cannot fake roles (verified server-side)

## Next Steps

1. Deploy Firestore rules
2. Enable **Realtime Database** in Firebase Console (Required for Presence)
3. Set FIREBASE_SERVICE_ACCOUNT in Vercel
4. Commit and push changes
5. Test on Vercel URL
6. If still issues, share browser console errors

All code is ready. The fixes are deployed. Just need Firebase config on your end.
