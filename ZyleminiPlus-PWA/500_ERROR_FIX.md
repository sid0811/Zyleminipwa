# 500 Error Fix - Login API Call

## Issue Identified

The server was returning a **500 Internal Server Error** for the second login API call (`/api/Login/Login`). 

### Root Cause

From the Network tab analysis:
- **Request URL**: `http://localhost:3000/ZyleminiPlusCoreURLAuthWINDSRBV1V4/api/Login/Login`
- **Request Method**: POST
- **Request Payload**: null (correct)
- **Response**: null (500 error with empty response)
- **Content-Length**: 4 (⚠️ This was the problem!)

The `content-length: 4` indicated that the body was being sent as the **string "null"** (4 characters) instead of being truly empty. Some servers reject POST requests with unexpected body content.

## Fixes Applied

### 1. Fixed Request Body Handling (`LoginAPICalls.ts`)

**Before:**
```typescript
const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN_EP, null, {
  headers,
});
```

**After:**
```typescript
const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN_EP, null, {
  headers,
  transformRequest: [(data) => {
    // Ensure null body is sent as empty string, not "null" string
    if (data === null || data === undefined) {
      return '';
    }
    return data;
  }],
});
```

This ensures that when we send `null`, it's converted to an empty string before being sent, preventing the "null" string from being transmitted.

### 2. Enhanced Proxy Configuration (`vite.config.ts`)

Added better handling for null bodies in the proxy:
- Set `Content-Length: 0` explicitly for POST requests with null/empty body
- Added response body logging to see server error messages
- Enhanced request/response logging

## Testing Steps

1. **Restart the dev server**:
   ```bash
   npm run dev
   ```

2. **Try to login** with your credentials

3. **Check the Network tab**:
   - The request should now have `Content-Length: 0` (or no Content-Length header)
   - The response should either succeed or show a more descriptive error

4. **Check the terminal** (where `npm run dev` is running):
   - You should see `🔀 [Proxy]` logs showing:
     - The exact URL being forwarded
     - All headers being sent
     - The response status and body (if any)

5. **If still getting 500 error**:
   - Check the terminal logs for the proxy response body - it might contain an error message
   - Check the Network tab Response tab - it might show an error message
   - Compare the exact request format with React Native (headers, URL, body)

## Expected Behavior

After the fix:
- ✅ Request body should be truly empty (not "null" string)
- ✅ Content-Length should be 0 or not present
- ✅ Server should accept the request format
- ✅ Either success (200) or a more descriptive error message

## If Issue Persists

If you still get a 500 error after this fix, the issue might be:

1. **Server-side validation**: The server might be validating something else (headers format, token validity, etc.)
2. **Path mismatch**: The exact path format might not match what the server expects
3. **Header format**: Some servers are strict about header names/casing (though HTTP spec says headers are case-insensitive)

**Next steps if still failing:**
- Share the terminal proxy logs (`🔀 [Proxy]` entries)
- Share the Network tab Response tab content (even if empty, check if there's any text)
- Compare with a working React Native request (using a network proxy tool like Charles Proxy or Fiddler)

