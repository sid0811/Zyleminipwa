# Proxy Explanation - Why localhost:3000?

## How the Proxy Works

### Development Mode (Current Setup)

1. **Browser makes request to**: `http://localhost:3000/ZyleminiPlusCoreURLAuthWINDSRBV1V4/api/Login/Login`
   - This is what you see in the Network tab
   - The browser thinks it's calling localhost

2. **Vite Dev Server (localhost:3000) intercepts the request**
   - The proxy pattern `'^/ZyleminiPlusCoreURLAuth'` matches the path
   - Vite proxy forwards it to the actual server

3. **Proxy forwards to actual server**: `https://windsr.in/ZyleminiPlusCoreURLAuthWINDSRBV1V4/api/Login/Login`
   - This is what the server actually receives
   - The proxy handles CORS for you

### Why This Setup?

- **CORS Avoidance**: Browsers block direct API calls to different domains
- **Development Convenience**: You can test locally without server-side CORS configuration
- **Production Ready**: In production, the app will call the server directly (no proxy)

## How to Verify Proxy is Working

### Check Terminal Logs

When you make a request, you should see in the **terminal** (where `npm run dev` is running):

```
🔀 [Vite Router] Routing to windsr.in for path: /ZyleminiPlusCoreURLAuthWINDSRBV1V4/api/Login/Login
🔀 [Vite Rewrite] Original path: /ZyleminiPlusCoreURLAuthWINDSRBV1V4/api/Login/Login
🔀 [Proxy] Request Details:
   Original path: /ZyleminiPlusCoreURLAuthWINDSRBV1V4/api/Login/Login
   Target host: windsr.in
   Full target URL: https://windsr.in/ZyleminiPlusCoreURLAuthWINDSRBV1V4/api/Login/Login
   Method: POST
   Headers being forwarded: {...}
✅ [Proxy] Response received:
   Status: 200 (or 500 if error)
```

### If You DON'T See These Logs

If you don't see `🔀 [Proxy]` logs in the terminal, the proxy might not be matching. Check:
1. Is the dev server running? (`npm run dev`)
2. Does the request path start with `/ZyleminiPlusCoreURLAuth`?
3. Is the proxy pattern correct in `vite.config.ts`?

## Production Mode

In production (after `npm run build`), the proxy is NOT used. The app will make direct requests to:
- `https://windsr.in/ZyleminiPlusCoreURLAuthWINDSRBV1V4/api/Login/Login`

This is because:
- Production builds are served from the same domain as the API (or CORS is configured)
- No need for a development proxy

## Current Issue

The 500 error is happening **after** the proxy forwards the request to the server. This means:
- ✅ Proxy is working (request is reaching the server)
- ❌ Server is rejecting the request (500 error)

The fixes we applied should resolve the 500 error by ensuring the request format matches what the server expects.

