# Proxy Dynamic Domain Fix

## Issue
The proxy was configured for a static path `/ZyleminiPlusCoreURLAuth`, but the actual API URL from login response is dynamic:
- `/ZyleminiPlusCoreURLAuthWINDSRBV1V4` (for windsr.in domain)
- `/ZyleminiPlusCoreURLAuth` (for zyleminiplus.com domain)

## Solution

### 1. Updated Proxy Configuration
The proxy now:
- Matches any path starting with `/ZyleminiPlusCoreURLAuth` (using regex `^/ZyleminiPlusCoreURLAuth`)
- Checks the `x-original-url` header to determine the target domain
- Routes to `windsr.in` if the original URL contains it, otherwise uses `zyleminiplus.com`

### 2. API Client Update
The API client now:
- Stores the original full URL in `x-original-url` header
- Converts full URLs to relative paths for proxy
- Proxy reads the header to determine correct target domain

### 3. Error Handling
- 500 errors now show proper alerts
- Wrong credentials show user-friendly messages
- All API errors are caught and displayed

## How It Works

1. **Login Response** provides: `https://windsr.in/ZyleminiPlusCoreURLAuthWINDSRBV1V4`
2. **API Client** converts to: `/ZyleminiPlusCoreURLAuthWINDSRBV1V4` (relative path)
3. **API Client** stores original URL in `x-original-url` header
4. **Vite Proxy** intercepts request starting with `/ZyleminiPlusCoreURLAuth`
5. **Proxy** checks `x-original-url` header
6. **Proxy** routes to correct domain (`windsr.in` or `zyleminiplus.com`)

## Testing

1. Try login with wrong credentials - should show alert
2. Check browser console for proxy logs
3. Check Network tab - requests should go through proxy
4. 500 errors should show proper error messages

## Notes

- Proxy only works in development mode
- Production builds use full URLs (backend must allow CORS)
- Supports multiple backend domains dynamically


