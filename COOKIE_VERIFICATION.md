# How to Verify Cookies Are Being Used

## Method 1: Check in Browser Dev Tools (Most Direct)

1. **Open Browser Dev Tools** (F12 or Cmd+Option+I on Mac)
2. Go to the **Application** tab (Chrome/Edge) or **Storage** tab (Firefox)
3. In the left sidebar, expand **Cookies**
4. Click on your domain (e.g., `localhost:4000` or `localhost:8080`)
5. Look for:
   - `access_token` - Should be present after login
   - `refresh_token` - Should be present after login

**Important Notes:**
- If cookies are `httpOnly: true`, you won't see their values in the JavaScript console
- This is actually **GOOD** - it means they're protected from XSS attacks!
- You'll only see the cookie name, domain, path, and expiration

## Method 2: Use the Cookie Status Endpoint

After logging in, open your browser console and run:

```javascript
// Check if cookies are present
fetch('http://localhost:4000/auth/cookie-status', {
  credentials: 'include' // Important: include cookies
})
  .then(res => res.json())
  .then(data => console.log('Cookie Status:', data))
  .catch(err => console.error('Error:', err));
```

Or using the API service (if you're on a page that has it loaded):

```javascript
// If you're in the React app context
import { apiService } from './lib/api';
apiService.checkCookieStatus().then(console.log);
```

## Method 3: Check Network Tab

1. Open **Dev Tools** → **Network** tab
2. Make any authenticated API request (e.g., go to a protected page)
3. Click on the request
4. Go to **Headers** → **Request Headers**
5. Look for `Cookie:` header - it should contain `access_token` and `refresh_token`

## What to Look For

✅ **Cookies are working if:**
- You see `access_token` and `refresh_token` cookies in Dev Tools
- Cookie status endpoint returns `hasAccessTokenCookie: true` and `hasRefreshTokenCookie: true`
- API requests include cookies in the `Cookie:` header
- You stay logged in after refreshing the page

❌ **Cookies are NOT working if:**
- No cookies appear in Dev Tools after login
- Cookie status shows `hasAccessTokenCookie: false`
- You get 401 errors on protected routes
- You get logged out after refreshing

## Important: httpOnly Cookies Are Invisible to JavaScript

Remember: **httpOnly cookies cannot be accessed via `document.cookie`** - this is by design for security! 

If you try:
```javascript
console.log(document.cookie); // Won't show access_token or refresh_token
```

This is **CORRECT** and **SECURE**. The cookies are there, but JavaScript can't read them (which prevents XSS attacks from stealing your tokens).
