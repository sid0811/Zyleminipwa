# Content-Length Fix - Final Solution

## Problem

The Network tab shows `content-length: 4`, which means the body is being sent as the string **"null"** (4 characters) instead of being empty.

## Root Cause

When axios receives `null` as the data parameter:
1. Axios tries to serialize it
2. `JSON.stringify(null)` becomes the string `"null"` (4 characters)
3. This gets sent as the request body
4. Server sees `content-length: 4` and rejects it

## Solution

### 1. Use `transformRequest` to Convert Null to Empty String

**Fixed Code:**
```typescript
const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN_EP, null, {
  headers,
  transformRequest: [(data) => {
    // Convert null/undefined to empty string to avoid "null" string being sent
    if (data === null || data === undefined) {
      return '';
    }
    return data;
  }],
});
```

### 2. Proxy Also Handles Empty Body

The proxy in `vite.config.ts` already sets `Content-Length: 0` for empty bodies:
```typescript
if (req.method === 'POST' && (!req.body || req.body === null || req.body === '')) {
  proxyReq.setHeader('Content-Length', '0');
}
```

## Expected Result

After this fix:
- ✅ Request body should be empty (not "null" string)
- ✅ `Content-Length` should be `0` (or not present)
- ✅ Server should accept the request format
- ✅ Either success (200) or a more descriptive error message

## Testing

1. **Restart dev server**: `npm run dev`
2. **Try logging in**
3. **Check Network tab**:
   - `Content-Length` should be `0` (not `4`)
   - Request Payload should show empty (not "null")
4. **Check terminal logs** for proxy forwarding

## Why This Works

- `transformRequest` runs **before** axios serializes the data
- Converting `null` to `''` (empty string) prevents JSON.stringify from creating "null"
- Empty string results in `Content-Length: 0` or no body at all
- Server receives empty body as expected

