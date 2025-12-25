# Header Case Sensitivity Fix

## Problem

The server is **case-sensitive** for headers. Postman works with:
- `LoginId` (capital L, capital I)
- `Password` (capital P)
- `ClientCode` (capital C, capital C)
- `DeviceId` (capital D, capital I)
- `authheader` (all lowercase)
- `FcmToken` (capital F, capital T)

But Node.js HTTP automatically lowercases headers, causing the server to return 404.

## Solution

### Header Case Mapping

The proxy now maps headers to their exact case as used in Postman:

```typescript
const expectedCaseMap: { [key: string]: string } = {
  'loginid': 'LoginId',        // Capital L, capital I
  'password': 'Password',      // Capital P
  'clientcode': 'ClientCode',  // Capital C, capital C
  'deviceid': 'DeviceId',      // Capital D, capital I
  'authheader': 'authheader',  // All lowercase
  'fcmtoken': 'FcmToken',     // Capital F, capital T
  'loguserid': 'LogUserId',   // Capital L, capital U, capital I
};
```

### Implementation

1. **Read original case** from `req.rawHeaders` (before Node.js lowercases them)
2. **Remove all headers** from proxyReq
3. **Re-add headers** with correct case:
   - Custom headers: Use exact case from `expectedCaseMap`
   - Standard headers: Keep lowercase (content-type, accept, etc.)

## Expected Result

After this fix:
- ✅ Headers will have exact case as Postman
- ✅ Server will recognize the request
- ✅ Should get 200 OK (or proper error message, not 404)

## Testing

1. **Restart dev server**: `npm run dev`
2. **Try logging in**
3. **Check terminal logs**: Should see `🔧 [Proxy] Headers restored with proper case`
4. **Expected**: 200 OK response (or "Invalid Login Credentials" if password is wrong)

## Why This Works

- **Node.js HTTP lowercases headers** when receiving requests
- **Server expects specific case** (case-sensitive)
- **Mapping restores correct case** before forwarding to server
- **Matches Postman exactly** which works successfully

