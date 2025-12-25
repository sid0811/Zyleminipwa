import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import https from 'https';
import http from 'http';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // Changed to prompt for immediate updates
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'ZyleminiPlus',
        short_name: 'ZyleminiPlus',
        description: 'ZyleminiPlus Progressive Web App',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Force update service worker on every deployment
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/sql\.js\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'sqljs-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    }),
    // Custom plugin to handle case-sensitive headers for Login API
    {
      name: 'case-sensitive-headers-proxy',
      enforce: 'pre', // CRITICAL: Run BEFORE other plugins (including proxy)
      configureServer(server) {
        // CRITICAL: Use unshift to run BEFORE proxy middleware
        // This ensures our custom handler runs first
        const customHandler = async (req: any, res: any, next: any) => {
          // Log ALL requests to this path for debugging
          console.log('🔧 [Custom Proxy] Request received:', req.method, req.url);
          console.log('🔧 [Custom Proxy] Headers:', JSON.stringify(req.headers, null, 2));
          
          // Only handle POST requests to Login endpoint
          if (req.method === 'POST' && req.url?.includes('/api/Login/Login')) {
            console.log('🔧 [Custom Proxy] ✅ MATCHED - Handling Login request');
            console.log('🔧 [Custom Proxy] ✅ Handling Login request with case-sensitive headers');
            console.log('🔧 [Custom Proxy] Request URL:', req.url);
            console.log('🔧 [Custom Proxy] Request method:', req.method);
            
            const target = req.url.includes('WINDSR') || req.url.includes('windsr') 
              ? 'windsr.in' 
              : 'zyleminiplus.com';
            
            // Read request body
            let body = '';
            req.on('data', (chunk) => {
              body += chunk.toString();
            });
            
            req.on('end', () => {
              // Map headers to proper case (matching Postman)
              const headerCaseMap: { [key: string]: string } = {
                'loginid': 'LoginId',
                'password': 'Password',
                'clientcode': 'ClientCode',
                'deviceid': 'DeviceId',
                'authheader': 'authheader',
                'fcmtoken': 'FcmToken',
                'loguserid': 'LogUserId',
              };
              
              // Build headers with proper case
              const headers: { [key: string]: string } = {};
              Object.keys(req.headers).forEach((lowerKey) => {
                const value = req.headers[lowerKey];
                if (value && typeof value === 'string' && !lowerKey.startsWith(':')) {
                  const headerName = headerCaseMap[lowerKey.toLowerCase()] || lowerKey;
                  headers[headerName] = value;
                }
              });
              
              // Set Host header
              headers['Host'] = target;
              
              // Make request with proper header case
              const url = new URL(`https://${target}${req.url}`);
              const options = {
                hostname: url.hostname,
                port: 443,
                path: url.pathname + url.search,
                method: 'POST',
                headers: {
                  ...headers,
                  'Content-Length': body.length || 0,
                },
              };
              
              console.log('🔧 [Custom Proxy] Request options:', JSON.stringify(options, null, 2));
              console.log('🔧 [Custom Proxy] Headers with case:', JSON.stringify(headers, null, 2));
              
              const proxyReq = https.request(options, (proxyRes) => {
                console.log('✅ [Custom Proxy] Response status:', proxyRes.statusCode);
                res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
                proxyRes.pipe(res);
              });
              
              proxyReq.on('error', (err) => {
                console.error('❌ [Custom Proxy] Error:', err);
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
              });
              
              if (body) {
                proxyReq.write(body);
              }
              proxyReq.end();
            });
          } else {
            next();
          }
        };
        
        // CRITICAL: Register middleware to run BEFORE proxy
        // Register with generic route - handler will check for Login endpoint inside
        console.log('🔧 [Custom Proxy] Registering middleware...');
        
        // Register with generic route pattern that matches all /ZyleminiPlusCoreURLAuth requests
        // The handler will check if it's a Login request and handle it, otherwise call next()
        server.middlewares.use('/ZyleminiPlusCoreURLAuth', customHandler);
        console.log('✅ [Custom Proxy] Middleware registered for /ZyleminiPlusCoreURLAuth');
        
        // Also try to ensure it runs before proxy by manipulating stack
        try {
          if (server.middlewares && (server.middlewares as any).stack && Array.isArray((server.middlewares as any).stack)) {
            // Find our middleware and proxy middleware
            const ourIndex = (server.middlewares as any).stack.findIndex((m: any) => 
              m.handle === customHandler
            );
            const proxyIndex = (server.middlewares as any).stack.findIndex((m: any) => 
              m.route && typeof m.route === 'string' && m.route.includes('ZyleminiPlusCoreURLAuth') && m.handle !== customHandler
            );
            
            console.log('🔧 [Custom Proxy] Our middleware index:', ourIndex);
            console.log('🔧 [Custom Proxy] Proxy middleware index:', proxyIndex);
            
            // If proxy is before us, move us before proxy
            if (proxyIndex > -1 && ourIndex > -1 && ourIndex > proxyIndex) {
              const ourMiddleware = (server.middlewares as any).stack[ourIndex];
              (server.middlewares as any).stack.splice(ourIndex, 1);
              (server.middlewares as any).stack.splice(proxyIndex, 0, ourMiddleware);
              console.log('✅ [Custom Proxy] Moved middleware before proxy');
            } else if (ourIndex > -1) {
              // Move to beginning if not already there
              const ourMiddleware = (server.middlewares as any).stack[ourIndex];
              (server.middlewares as any).stack.splice(ourIndex, 1);
              (server.middlewares as any).stack.unshift(ourMiddleware);
              console.log('✅ [Custom Proxy] Moved middleware to beginning of stack');
            }
          }
        } catch (error) {
          console.error('❌ [Custom Proxy] Error manipulating stack:', error);
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react-native': 'react-native-web'
    }
  },
  server: {
    port: 3000,
    open: true,
    // Custom middleware to handle case-sensitive headers
    // This will be added via configureServer hook
    proxy: {
      // Proxy API requests to avoid CORS issues in development
      // Login endpoint now uses direct axios (bypasses proxy) - see LoginAPICalls.ts
      // Matches any path starting with /ZyleminiPlusCoreURLAuth (with any suffix)
      '^/ZyleminiPlusCoreURLAuth': ({
        target: 'https://zyleminiplus.com', // Default, but router will override
        changeOrigin: true,
        secure: true,
        // Bypass proxy for Login endpoint - we'll handle it with case-sensitive headers
        bypass: function(req: any, res: any, options: any) {
          if (req.method === 'POST' && req.url?.includes('/api/Login/Login')) {
            // Return the request path to handle it ourselves
            // This will be handled by custom middleware if we add it back
            // For now, let proxy handle it but we'll fix headers in proxyReq
            return null; // Continue with proxy, but we'll fix headers
          }
          return null;
        },
        // CRITICAL: Use selfHandleResponse to have more control over headers
        selfHandleResponse: false, // Keep false, but we'll handle headers in proxyReq
        // Use router function to dynamically route based on request path
        // Type assertion needed because Vite's ProxyOptions type doesn't include router from http-proxy-middleware
        router: function(req: any) {
          const path = req.url || req.path || '';
          // Check if path contains WINDSR to route to windsr.in
          if (path.includes('WINDSR') || path.includes('windsr')) {
            console.log('🔀 [Vite Router] Routing to windsr.in for path:', path);
            return 'https://windsr.in';
          }
          console.log('🔀 [Vite Router] Routing to zyleminiplus.com for path:', path);
          return 'https://zyleminiplus.com';
        },
        // Rewrite the path - remove the proxy prefix and keep the rest
        rewrite: (path: string) => {
          // path will be like: /ZyleminiPlusCoreURLAuthWINDSRBV1V4/api/Login/Login
          // We need to rewrite it to: /ZyleminiPlusCoreURLAuthWINDSRBV1V4/api/Login/Login
          // Actually, we want to keep it as-is since the full path is needed
          console.log('🔀 [Vite Rewrite] Original path:', path);
          const rewritten = path; // Keep as-is for now
          console.log('🔀 [Vite Rewrite] Rewritten path:', rewritten);
          return rewritten;
        },
        configure: (proxy: any, _options: any) => {
          proxy.on('error', (err: any, _req: any, _res: any) => {
            console.error('❌ [Proxy] Error:', err);
            if (_res && !_res.headersSent) {
              _res.writeHead(500, { 'Content-Type': 'application/json' });
              _res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
            }
          });
        }
      } as any)
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux-persist', 'redux-saga'],
          'ui-vendor': ['@mui/material', '@mui/icons-material', 'react-native-web']
        }
      }
    }
  },
  base: '/',
});

