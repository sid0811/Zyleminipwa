# Header Case Sensitivity - Final Solution Needed

## Problem

- ✅ Postman works with headers: `LoginId`, `Password`, `ClientCode`, `DeviceId`, `FcmToken`
- ❌ PWA sends headers as: `loginid`, `password`, `clientcode`, `deviceid`, `fcmtoken` (lowercase)
- ❌ Server is case-sensitive and returns 404 for lowercase headers
- ❌ `_headerNames` approach doesn't work with http-proxy-middleware

## Why `_headerNames` Doesn't Work

Node.js HTTP module automatically lowercases headers when using `setHeader()`. The `_headerNames` property is supposed to preserve case, but:
1. http-proxy-middleware might be using its own HTTP client
2. `_headerNames` might be reset after we set it
3. The proxy might write headers before our code runs

## Possible Solutions

### Option 1: Custom Vite Middleware (Recommended)
Create a custom middleware that handles the request directly, bypassing http-proxy-middleware's header handling.

### Option 2: Use Different Proxy Library
Switch to a proxy library that supports case-sensitive headers (e.g., `http-proxy` directly).

### Option 3: Custom HTTP Agent
Create a custom HTTP agent that preserves header case.

### Option 4: Direct Request (Not Recommended)
Make requests directly from client (but then CORS issues return).

## Next Steps

Since `_headerNames` isn't working, we need to implement one of the above solutions. The most practical would be Option 1 (custom middleware) or Option 2 (different proxy library).

Would you like me to implement Option 1 (custom Vite middleware) to handle this request directly with proper header case?

