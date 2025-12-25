# CORS Solution - Development Proxy Configuration

## Problem
When the backend server doesn't allow CORS from `localhost:3000`, API requests fail with CORS errors.

## Solution: Vite Development Proxy

Vite's development server can proxy API requests to the backend, avoiding CORS issues entirely.

## Configuration

### 1. Vite Proxy Setup (`vite.config.ts`)

The proxy is already configured to forward requests:

```typescript
server: {
  proxy: {
    '/ZyleminiPlusCoreURLAuth': {
      target: 'https://zyleminiplus.com',
      changeOrigin: true,
      secure: true,
    }
  }
}
```

### 2. API Client Update (`src/api/Client.ts`)

The API client automatically uses relative paths in development to trigger the proxy.

## How It Works

1. **Development Mode**:
   - API requests use relative paths (e.g., `/ZyleminiPlusCoreURLAuth/api/Login/Login`)
   - Vite dev server intercepts these requests
   - Proxy forwards them to the actual backend server
   - Response comes back through the proxy (no CORS issues)

2. **Production Mode**:
   - API requests use full URLs (e.g., `https://zyleminiplus.com/ZyleminiPlusCoreURLAuth/api/Login/Login`)
   - No proxy needed (server should allow CORS for production domain)

## Usage

### Option 1: Automatic (Recommended)
The API client automatically detects development mode and uses the proxy. No changes needed!

### Option 2: Manual Configuration
If you need to use a different backend URL:

1. **Set Environment Variable**:
   ```bash
   # Create .env file
   VITE_API_TARGET=https://your-backend-url.com
   ```

2. **Or Update vite.config.ts**:
   ```typescript
   '/ZyleminiPlusCoreURLAuth': {
     target: 'https://your-backend-url.com', // Change this
     changeOrigin: true,
     secure: true,
   }
   ```

## Testing

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Check browser console - you should see:
   ```
   🔀 Using proxy for API requests: /ZyleminiPlusCoreURLAuth/...
   ```

3. API requests should work without CORS errors!

## Alternative Solutions

### Option A: Browser Extension (Development Only)
Install a CORS browser extension (e.g., "CORS Unblock" or "Allow CORS") - **NOT recommended for production**

### Option B: Backend CORS Configuration (Best for Production)
Ask backend team to add CORS headers:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, authheader
```

### Option C: Standalone Proxy Server
Use a tool like `http-proxy-middleware` or `cors-anywhere` as a separate proxy server.

## Production Considerations

- **Proxy only works in development** (Vite dev server)
- **Production builds** must use full URLs
- **Backend must allow CORS** for your production domain
- Or deploy both frontend and backend on the same domain

## Troubleshooting

### Proxy not working?
1. Check that you're in development mode (`npm run dev`)
2. Verify the proxy path matches your API URLs
3. Check browser Network tab - requests should go to `localhost:3000` not the backend directly
4. Check Vite console for proxy errors

### Still getting CORS errors?
1. Clear browser cache
2. Restart dev server
3. Check that API URLs are using relative paths in development
4. Verify `vite.config.ts` proxy configuration

## Notes

- ✅ Proxy only works in **development** (`npm run dev`)
- ✅ Production builds use **full URLs** (backend must allow CORS)
- ✅ No code changes needed - works automatically
- ✅ Supports multiple backend URLs via environment variables


