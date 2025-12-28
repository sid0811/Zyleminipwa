// vite.config.ts
import { defineConfig } from "file:///D:/ZyleminiPlus241225/ZyleminiPlusSource/ZyleminiPlus-PWA/node_modules/vite/dist/node/index.js";
import react from "file:///D:/ZyleminiPlus241225/ZyleminiPlusSource/ZyleminiPlus-PWA/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///D:/ZyleminiPlus241225/ZyleminiPlusSource/ZyleminiPlus-PWA/node_modules/vite-plugin-pwa/dist/index.js";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";
var __vite_injected_original_import_meta_url = "file:///D:/ZyleminiPlus241225/ZyleminiPlusSource/ZyleminiPlus-PWA/vite.config.ts";
var __dirname = path.dirname(fileURLToPath(__vite_injected_original_import_meta_url));
var vite_config_default = defineConfig({
  plugins: [
    // CRITICAL: resolve-native-modules must be first to intercept react-native imports
    // Plugin to handle native module imports
    {
      name: "resolve-native-modules",
      enforce: "pre",
      // Run before other plugins
      resolveId(id, importer) {
        if (process.env.NODE_ENV === "development" && id.includes("react-native")) {
          console.log(`[resolve-native-modules] Resolving: ${id} from ${importer}`);
        }
        if (id === "react-native") {
          return path.resolve(__dirname, "./src/utils/mocks/react-native-web-patched.ts");
        }
        if (id.startsWith("react-native/")) {
          if (id.includes("Libraries/Utilities/codegenNativeComponent")) {
            return path.resolve(__dirname, "./src/utils/mocks/codegenNativeComponent.ts");
          }
          if (id.includes("Libraries/Utilities/codegenNativeCommands")) {
            return path.resolve(__dirname, "./src/utils/mocks/codegenNativeCommands.ts");
          }
          if (id.includes("Libraries/TurboModule/TurboModuleRegistry")) {
            return path.resolve(__dirname, "./src/utils/mocks/TurboModuleRegistry.ts");
          }
          return null;
        }
        if (id.includes("codegenNativeComponent") && id.includes("react-native") && !id.includes("react-native-web")) {
          return path.resolve(__dirname, "./src/utils/mocks/codegenNativeComponent.ts");
        }
        if (id.includes("codegenNativeCommands") && id.includes("react-native") && !id.includes("react-native-web")) {
          return path.resolve(__dirname, "./src/utils/mocks/codegenNativeCommands.ts");
        }
        if (id.includes("TurboModuleRegistry") && id.includes("react-native") && !id.includes("react-native-web")) {
          return path.resolve(__dirname, "./src/utils/mocks/TurboModuleRegistry.ts");
        }
        if (id === "react-native-reanimated" || id.startsWith("react-native-reanimated/") || id.includes("react-native-reanimated/lib/module")) {
          return path.resolve(__dirname, "./src/utils/mocks/react-native-reanimated.ts");
        }
        if (id === "react-native-web") {
          return path.resolve(__dirname, "./node_modules/react-native-web/dist/index.js");
        }
        return null;
      }
    },
    react({
      // Enable JSX in node_modules (react-native-reanimated is mocked, not processed)
      include: /\.(jsx|tsx|js|ts)$/,
      babel: {
        plugins: []
      }
    }),
    VitePWA({
      registerType: "prompt",
      // Changed to prompt for immediate updates
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "ZyleminiPlus",
        short_name: "ZyleminiPlus",
        description: "ZyleminiPlus Progressive Web App",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Force update service worker on every deployment
        skipWaiting: true,
        clientsClaim: true,
        // Suppress warnings in dev mode
        mode: process.env.NODE_ENV === "production" ? "production" : "development",
        // Don't precache source files in dev mode
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/sql\.js\.org\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "sqljs-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
                // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30
                // 30 days
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false,
        // Disable service worker in dev mode to avoid interference
        type: "module"
      }
    }),
    // Custom plugin to handle case-sensitive headers for Login API
    {
      name: "case-sensitive-headers-proxy",
      enforce: "pre",
      // CRITICAL: Run BEFORE other plugins (including proxy)
      configureServer(server) {
        const customHandler = async (req, res, next) => {
          console.log("\u{1F527} [Custom Proxy] Request received:", req.method, req.url);
          console.log("\u{1F527} [Custom Proxy] Headers:", JSON.stringify(req.headers, null, 2));
          if (req.method === "POST" && req.url?.includes("/api/Login/Login")) {
            console.log("\u{1F527} [Custom Proxy] \u2705 MATCHED - Handling Login request");
            console.log("\u{1F527} [Custom Proxy] \u2705 Handling Login request with case-sensitive headers");
            console.log("\u{1F527} [Custom Proxy] Request URL:", req.url);
            console.log("\u{1F527} [Custom Proxy] Request method:", req.method);
            const target = req.url.includes("WINDSR") || req.url.includes("windsr") ? "windsr.in" : "zyleminiplus.com";
            let body = "";
            req.on("data", (chunk) => {
              body += chunk.toString();
            });
            req.on("end", () => {
              const headerCaseMap = {
                "loginid": "LoginId",
                "password": "Password",
                "clientcode": "ClientCode",
                "deviceid": "DeviceId",
                "authheader": "authheader",
                "fcmtoken": "FcmToken",
                "loguserid": "LogUserId"
              };
              const headers = {};
              Object.keys(req.headers).forEach((lowerKey) => {
                const value = req.headers[lowerKey];
                if (value && typeof value === "string" && !lowerKey.startsWith(":")) {
                  const headerName = headerCaseMap[lowerKey.toLowerCase()] || lowerKey;
                  headers[headerName] = value;
                }
              });
              headers["Host"] = target;
              const url = new URL(`https://${target}${req.url}`);
              const options = {
                hostname: url.hostname,
                port: 443,
                path: url.pathname + url.search,
                method: "POST",
                headers: {
                  ...headers,
                  "Content-Length": body.length || 0
                }
              };
              console.log("\u{1F527} [Custom Proxy] Request options:", JSON.stringify(options, null, 2));
              console.log("\u{1F527} [Custom Proxy] Headers with case:", JSON.stringify(headers, null, 2));
              const proxyReq = https.request(options, (proxyRes) => {
                console.log("\u2705 [Custom Proxy] Response status:", proxyRes.statusCode);
                res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
                proxyRes.pipe(res);
              });
              proxyReq.on("error", (err) => {
                console.error("\u274C [Custom Proxy] Error:", err);
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
        console.log("\u{1F527} [Custom Proxy] Registering middleware...");
        server.middlewares.use("/ZyleminiPlusCoreURLAuth", customHandler);
        console.log("\u2705 [Custom Proxy] Middleware registered for /ZyleminiPlusCoreURLAuth");
        try {
          if (server.middlewares && server.middlewares.stack && Array.isArray(server.middlewares.stack)) {
            const ourIndex = server.middlewares.stack.findIndex(
              (m) => m.handle === customHandler
            );
            const proxyIndex = server.middlewares.stack.findIndex(
              (m) => m.route && typeof m.route === "string" && m.route.includes("ZyleminiPlusCoreURLAuth") && m.handle !== customHandler
            );
            console.log("\u{1F527} [Custom Proxy] Our middleware index:", ourIndex);
            console.log("\u{1F527} [Custom Proxy] Proxy middleware index:", proxyIndex);
            if (proxyIndex > -1 && ourIndex > -1 && ourIndex > proxyIndex) {
              const ourMiddleware = server.middlewares.stack[ourIndex];
              server.middlewares.stack.splice(ourIndex, 1);
              server.middlewares.stack.splice(proxyIndex, 0, ourMiddleware);
              console.log("\u2705 [Custom Proxy] Moved middleware before proxy");
            } else if (ourIndex > -1) {
              const ourMiddleware = server.middlewares.stack[ourIndex];
              server.middlewares.stack.splice(ourIndex, 1);
              server.middlewares.stack.unshift(ourMiddleware);
              console.log("\u2705 [Custom Proxy] Moved middleware to beginning of stack");
            }
          }
        } catch (error) {
          console.error("\u274C [Custom Proxy] Error manipulating stack:", error);
        }
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Only alias react-native base import, subpaths are handled by resolve plugin
      "react-native$": path.resolve(__dirname, "./src/utils/mocks/react-native-web-patched.ts"),
      // Mock native modules that don't exist in web
      "react-native-web/Libraries/Utilities/codegenNativeComponent": path.resolve(__dirname, "./src/utils/mocks/codegenNativeComponent.ts"),
      "react-native/Libraries/Utilities/codegenNativeComponent": path.resolve(__dirname, "./src/utils/mocks/codegenNativeComponent.ts"),
      "react-native-web/Libraries/Utilities/codegenNativeCommands": path.resolve(__dirname, "./src/utils/mocks/codegenNativeCommands.ts"),
      "react-native/Libraries/Utilities/codegenNativeCommands": path.resolve(__dirname, "./src/utils/mocks/codegenNativeCommands.ts"),
      // Mock TurboModuleRegistry
      "react-native/Libraries/TurboModule/TurboModuleRegistry": path.resolve(__dirname, "./src/utils/mocks/TurboModuleRegistry.ts"),
      "react-native-web/Libraries/TurboModule/TurboModuleRegistry": path.resolve(__dirname, "./src/utils/mocks/TurboModuleRegistry.ts"),
      // Mock react-native-reanimated for web
      "react-native-reanimated": path.resolve(__dirname, "./src/utils/mocks/react-native-reanimated.ts")
    },
    // Handle native module imports
    conditions: ["web", "browser", "default"]
  },
  server: {
    port: 3e3,
    open: true,
    // Custom middleware to handle case-sensitive headers
    // This will be added via configureServer hook
    proxy: {
      // Proxy API requests to avoid CORS issues in development
      // Login endpoint now uses direct axios (bypasses proxy) - see LoginAPICalls.ts
      // Matches any path starting with /ZyleminiPlusCoreURLAuth (with any suffix)
      "^/ZyleminiPlusCoreURLAuth": {
        target: "https://zyleminiplus.com",
        // Default, but router will override
        changeOrigin: true,
        secure: true,
        // Bypass proxy for Login endpoint - we'll handle it with case-sensitive headers
        bypass: function(req, res, options) {
          if (req.method === "POST" && req.url?.includes("/api/Login/Login")) {
            return null;
          }
          return null;
        },
        // CRITICAL: Use selfHandleResponse to have more control over headers
        selfHandleResponse: false,
        // Keep false, but we'll handle headers in proxyReq
        // Use router function to dynamically route based on request path
        // Type assertion needed because Vite's ProxyOptions type doesn't include router from http-proxy-middleware
        router: function(req) {
          const path2 = req.url || req.path || "";
          if (path2.includes("WINDSR") || path2.includes("windsr")) {
            console.log("\u{1F500} [Vite Router] Routing to windsr.in for path:", path2);
            return "https://windsr.in";
          }
          console.log("\u{1F500} [Vite Router] Routing to zyleminiplus.com for path:", path2);
          return "https://zyleminiplus.com";
        },
        // Rewrite the path - remove the proxy prefix and keep the rest
        rewrite: (path2) => {
          console.log("\u{1F500} [Vite Rewrite] Original path:", path2);
          const rewritten = path2;
          console.log("\u{1F500} [Vite Rewrite] Rewritten path:", rewritten);
          return rewritten;
        },
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.error("\u274C [Proxy] Error:", err);
            if (_res && !_res.headersSent) {
              _res.writeHead(500, { "Content-Type": "application/json" });
              _res.end(JSON.stringify({ error: "Proxy error", message: err.message }));
            }
          });
        }
      }
    }
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "redux-vendor": ["@reduxjs/toolkit", "react-redux", "redux-persist", "redux-saga"],
          "ui-vendor": ["@mui/material", "@mui/icons-material", "react-native-web"]
        }
      },
      onwarn(warning, warn) {
        if ((warning.code === "UNRESOLVED_IMPORT" || warning.code === "MODULE_LEVEL_DIRECTIVE") && (warning.id?.includes("codegenNativeComponent") || warning.message?.includes("codegenNativeComponent") || (warning.id?.includes("codegenNativeCommands") || warning.message?.includes("codegenNativeCommands")) || (warning.id?.includes("react-native-web/Libraries") || warning.message?.includes("react-native-web/Libraries")) || (warning.id?.includes("react-native-reanimated") || warning.message?.includes("react-native-reanimated")))) {
          return;
        }
        warn(warning);
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/]
    }
  },
  base: "/",
  optimizeDeps: {
    exclude: ["react-native-reanimated", "react-native"],
    esbuildOptions: {
      // Exclude react-native-reanimated and react-native from esbuild processing
      loader: {
        ".js": "jsx"
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxaeWxlbWluaVBsdXMyNDEyMjVcXFxcWnlsZW1pbmlQbHVzU291cmNlXFxcXFp5bGVtaW5pUGx1cy1QV0FcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFp5bGVtaW5pUGx1czI0MTIyNVxcXFxaeWxlbWluaVBsdXNTb3VyY2VcXFxcWnlsZW1pbmlQbHVzLVBXQVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovWnlsZW1pbmlQbHVzMjQxMjI1L1p5bGVtaW5pUGx1c1NvdXJjZS9aeWxlbWluaVBsdXMtUFdBL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBodHRwcyBmcm9tICdodHRwcyc7XG5pbXBvcnQgaHR0cCBmcm9tICdodHRwJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICd1cmwnO1xuXG5jb25zdCBfX2Rpcm5hbWUgPSBwYXRoLmRpcm5hbWUoZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpKTtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICAvLyBDUklUSUNBTDogcmVzb2x2ZS1uYXRpdmUtbW9kdWxlcyBtdXN0IGJlIGZpcnN0IHRvIGludGVyY2VwdCByZWFjdC1uYXRpdmUgaW1wb3J0c1xuICAgIC8vIFBsdWdpbiB0byBoYW5kbGUgbmF0aXZlIG1vZHVsZSBpbXBvcnRzXG4gICAge1xuICAgICAgbmFtZTogJ3Jlc29sdmUtbmF0aXZlLW1vZHVsZXMnLFxuICAgICAgZW5mb3JjZTogJ3ByZScsIC8vIFJ1biBiZWZvcmUgb3RoZXIgcGx1Z2luc1xuICAgICAgcmVzb2x2ZUlkKGlkLCBpbXBvcnRlcikge1xuICAgICAgICAvLyBEZWJ1ZyBsb2dnaW5nIGluIGRldmVsb3BtZW50XG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyAmJiBpZC5pbmNsdWRlcygncmVhY3QtbmF0aXZlJykpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgW3Jlc29sdmUtbmF0aXZlLW1vZHVsZXNdIFJlc29sdmluZzogJHtpZH0gZnJvbSAke2ltcG9ydGVyfWApO1xuICAgICAgICB9XG4gICAgICAgIC8vIENSSVRJQ0FMOiBIYW5kbGUgQUxMIHJlYWN0LW5hdGl2ZSBpbXBvcnRzIEJFRk9SRSB0aGV5IHJlYWNoIG5vZGVfbW9kdWxlc1xuICAgICAgICAvLyBUaGlzIHByZXZlbnRzIGVzYnVpbGQgZnJvbSB0cnlpbmcgdG8gcGFyc2UgRmxvdyBzeW50YXggaW4gcmVhY3QtbmF0aXZlIHBhY2thZ2VcbiAgICAgICAgXG4gICAgICAgIC8vIEhhbmRsZSByZWFjdC1uYXRpdmUgYmFzZSBpbXBvcnQgLSBNVVNUIGJlIGZpcnN0XG4gICAgICAgIGlmIChpZCA9PT0gJ3JlYWN0LW5hdGl2ZScpIHtcbiAgICAgICAgICByZXR1cm4gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3V0aWxzL21vY2tzL3JlYWN0LW5hdGl2ZS13ZWItcGF0Y2hlZC50cycpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBIYW5kbGUgc3VicGF0aCBpbXBvcnRzIGZyb20gcmVhY3QtbmF0aXZlXG4gICAgICAgIGlmIChpZC5zdGFydHNXaXRoKCdyZWFjdC1uYXRpdmUvJykpIHtcbiAgICAgICAgICAvLyBIYW5kbGUgY29kZWdlbk5hdGl2ZUNvbXBvbmVudCBzdWJwYXRoXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdMaWJyYXJpZXMvVXRpbGl0aWVzL2NvZGVnZW5OYXRpdmVDb21wb25lbnQnKSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy91dGlscy9tb2Nrcy9jb2RlZ2VuTmF0aXZlQ29tcG9uZW50LnRzJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIEhhbmRsZSBjb2RlZ2VuTmF0aXZlQ29tbWFuZHMgc3VicGF0aFxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnTGlicmFyaWVzL1V0aWxpdGllcy9jb2RlZ2VuTmF0aXZlQ29tbWFuZHMnKSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy91dGlscy9tb2Nrcy9jb2RlZ2VuTmF0aXZlQ29tbWFuZHMudHMnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gSGFuZGxlIFR1cmJvTW9kdWxlUmVnaXN0cnkgc3VicGF0aFxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnTGlicmFyaWVzL1R1cmJvTW9kdWxlL1R1cmJvTW9kdWxlUmVnaXN0cnknKSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy91dGlscy9tb2Nrcy9UdXJib01vZHVsZVJlZ2lzdHJ5LnRzJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIEZvciBvdGhlciBzdWJwYXRocywgbGV0IFZpdGUgaGFuZGxlIHJlc29sdXRpb24gbmF0dXJhbGx5XG4gICAgICAgICAgLy8gRG9uJ3QgZG8gZmlsZSBzeXN0ZW0gY2hlY2tzIGhlcmUgYXMgdGhleSBjYW4gY2F1c2UgaGFuZ3NcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gSGFuZGxlIGNvZGVnZW5OYXRpdmVDb21wb25lbnQgKGNhdGNoIGFueSByZW1haW5pbmcgcGF0dGVybnMpXG4gICAgICAgIGlmIChpZC5pbmNsdWRlcygnY29kZWdlbk5hdGl2ZUNvbXBvbmVudCcpICYmIGlkLmluY2x1ZGVzKCdyZWFjdC1uYXRpdmUnKSAmJiAhaWQuaW5jbHVkZXMoJ3JlYWN0LW5hdGl2ZS13ZWInKSkge1xuICAgICAgICAgIHJldHVybiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvdXRpbHMvbW9ja3MvY29kZWdlbk5hdGl2ZUNvbXBvbmVudC50cycpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBIYW5kbGUgY29kZWdlbk5hdGl2ZUNvbW1hbmRzIChjYXRjaCBhbnkgcmVtYWluaW5nIHBhdHRlcm5zKVxuICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2NvZGVnZW5OYXRpdmVDb21tYW5kcycpICYmIGlkLmluY2x1ZGVzKCdyZWFjdC1uYXRpdmUnKSAmJiAhaWQuaW5jbHVkZXMoJ3JlYWN0LW5hdGl2ZS13ZWInKSkge1xuICAgICAgICAgIHJldHVybiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvdXRpbHMvbW9ja3MvY29kZWdlbk5hdGl2ZUNvbW1hbmRzLnRzJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIEhhbmRsZSBUdXJib01vZHVsZVJlZ2lzdHJ5IChjYXRjaCBhbnkgcmVtYWluaW5nIHBhdHRlcm5zKVxuICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ1R1cmJvTW9kdWxlUmVnaXN0cnknKSAmJiBpZC5pbmNsdWRlcygncmVhY3QtbmF0aXZlJykgJiYgIWlkLmluY2x1ZGVzKCdyZWFjdC1uYXRpdmUtd2ViJykpIHtcbiAgICAgICAgICByZXR1cm4gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3V0aWxzL21vY2tzL1R1cmJvTW9kdWxlUmVnaXN0cnkudHMnKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gSGFuZGxlIHJlYWN0LW5hdGl2ZS1yZWFuaW1hdGVkIC0gY2F0Y2ggYWxsIGltcG9ydCBwYXRoc1xuICAgICAgICBpZiAoXG4gICAgICAgICAgaWQgPT09ICdyZWFjdC1uYXRpdmUtcmVhbmltYXRlZCcgfHwgXG4gICAgICAgICAgaWQuc3RhcnRzV2l0aCgncmVhY3QtbmF0aXZlLXJlYW5pbWF0ZWQvJykgfHxcbiAgICAgICAgICBpZC5pbmNsdWRlcygncmVhY3QtbmF0aXZlLXJlYW5pbWF0ZWQvbGliL21vZHVsZScpXG4gICAgICAgICkge1xuICAgICAgICAgIHJldHVybiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvdXRpbHMvbW9ja3MvcmVhY3QtbmF0aXZlLXJlYW5pbWF0ZWQudHMnKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gRXhwbGljaXRseSByZXNvbHZlIHJlYWN0LW5hdGl2ZS13ZWIgdG8gaXRzIGVudHJ5IHBvaW50XG4gICAgICAgIGlmIChpZCA9PT0gJ3JlYWN0LW5hdGl2ZS13ZWInKSB7XG4gICAgICAgICAgcmV0dXJuIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL25vZGVfbW9kdWxlcy9yZWFjdC1uYXRpdmUtd2ViL2Rpc3QvaW5kZXguanMnKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfSxcbiAgICByZWFjdCh7XG4gICAgICAvLyBFbmFibGUgSlNYIGluIG5vZGVfbW9kdWxlcyAocmVhY3QtbmF0aXZlLXJlYW5pbWF0ZWQgaXMgbW9ja2VkLCBub3QgcHJvY2Vzc2VkKVxuICAgICAgaW5jbHVkZTogL1xcLihqc3h8dHN4fGpzfHRzKSQvLFxuICAgICAgYmFiZWw6IHtcbiAgICAgICAgcGx1Z2luczogW10sXG4gICAgICB9LFxuICAgIH0pLFxuICAgIFZpdGVQV0Eoe1xuICAgICAgcmVnaXN0ZXJUeXBlOiAncHJvbXB0JywgLy8gQ2hhbmdlZCB0byBwcm9tcHQgZm9yIGltbWVkaWF0ZSB1cGRhdGVzXG4gICAgICBpbmNsdWRlQXNzZXRzOiBbJ2Zhdmljb24uaWNvJywgJ2FwcGxlLXRvdWNoLWljb24ucG5nJywgJ21hc2staWNvbi5zdmcnXSxcbiAgICAgIG1hbmlmZXN0OiB7XG4gICAgICAgIG5hbWU6ICdaeWxlbWluaVBsdXMnLFxuICAgICAgICBzaG9ydF9uYW1lOiAnWnlsZW1pbmlQbHVzJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdaeWxlbWluaVBsdXMgUHJvZ3Jlc3NpdmUgV2ViIEFwcCcsXG4gICAgICAgIHRoZW1lX2NvbG9yOiAnI2ZmZmZmZicsXG4gICAgICAgIGJhY2tncm91bmRfY29sb3I6ICcjZmZmZmZmJyxcbiAgICAgICAgZGlzcGxheTogJ3N0YW5kYWxvbmUnLFxuICAgICAgICBvcmllbnRhdGlvbjogJ3BvcnRyYWl0JyxcbiAgICAgICAgc3RhcnRfdXJsOiAnLycsXG4gICAgICAgIGljb25zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAncHdhLTE5MngxOTIucG5nJyxcbiAgICAgICAgICAgIHNpemVzOiAnMTkyeDE5MicsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICAgIHB1cnBvc2U6ICdhbnkgbWFza2FibGUnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICdwd2EtNTEyeDUxMi5wbmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgICAgcHVycG9zZTogJ2FueSBtYXNrYWJsZSdcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB3b3JrYm94OiB7XG4gICAgICAgIGdsb2JQYXR0ZXJuczogWycqKi8qLntqcyxjc3MsaHRtbCxpY28scG5nLHN2Zyx3b2ZmMn0nXSxcbiAgICAgICAgLy8gRm9yY2UgdXBkYXRlIHNlcnZpY2Ugd29ya2VyIG9uIGV2ZXJ5IGRlcGxveW1lbnRcbiAgICAgICAgc2tpcFdhaXRpbmc6IHRydWUsXG4gICAgICAgIGNsaWVudHNDbGFpbTogdHJ1ZSxcbiAgICAgICAgLy8gU3VwcHJlc3Mgd2FybmluZ3MgaW4gZGV2IG1vZGVcbiAgICAgICAgbW9kZTogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyA/ICdwcm9kdWN0aW9uJyA6ICdkZXZlbG9wbWVudCcsXG4gICAgICAgIC8vIERvbid0IHByZWNhY2hlIHNvdXJjZSBmaWxlcyBpbiBkZXYgbW9kZVxuICAgICAgICBuYXZpZ2F0ZUZhbGxiYWNrOiAnL2luZGV4Lmh0bWwnLFxuICAgICAgICBuYXZpZ2F0ZUZhbGxiYWNrRGVueWxpc3Q6IFsvXlxcL18vLCAvXFwvW14vP10rXFwuW14vXSskL10sXG4gICAgICAgIHJ1bnRpbWVDYWNoaW5nOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9zcWxcXC5qc1xcLm9yZ1xcLy4qL2ksXG4gICAgICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXG4gICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ3NxbGpzLWNhY2hlJyxcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xuICAgICAgICAgICAgICAgIG1heEVudHJpZXM6IDEwLFxuICAgICAgICAgICAgICAgIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCAqIDM2NSAvLyAxIHllYXJcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC8uKlxcLig/OnBuZ3xqcGd8anBlZ3xzdmd8Z2lmfHdlYnApL2ksXG4gICAgICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXG4gICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ2ltYWdlcy1jYWNoZScsXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcbiAgICAgICAgICAgICAgICBtYXhFbnRyaWVzOiA1MCxcbiAgICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgKiAzMCAvLyAzMCBkYXlzXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICBkZXZPcHRpb25zOiB7XG4gICAgICAgIGVuYWJsZWQ6IGZhbHNlLCAvLyBEaXNhYmxlIHNlcnZpY2Ugd29ya2VyIGluIGRldiBtb2RlIHRvIGF2b2lkIGludGVyZmVyZW5jZVxuICAgICAgICB0eXBlOiAnbW9kdWxlJ1xuICAgICAgfVxuICAgIH0pLFxuICAgIC8vIEN1c3RvbSBwbHVnaW4gdG8gaGFuZGxlIGNhc2Utc2Vuc2l0aXZlIGhlYWRlcnMgZm9yIExvZ2luIEFQSVxuICAgIHtcbiAgICAgIG5hbWU6ICdjYXNlLXNlbnNpdGl2ZS1oZWFkZXJzLXByb3h5JyxcbiAgICAgIGVuZm9yY2U6ICdwcmUnLCAvLyBDUklUSUNBTDogUnVuIEJFRk9SRSBvdGhlciBwbHVnaW5zIChpbmNsdWRpbmcgcHJveHkpXG4gICAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICAgIC8vIENSSVRJQ0FMOiBVc2UgdW5zaGlmdCB0byBydW4gQkVGT1JFIHByb3h5IG1pZGRsZXdhcmVcbiAgICAgICAgLy8gVGhpcyBlbnN1cmVzIG91ciBjdXN0b20gaGFuZGxlciBydW5zIGZpcnN0XG4gICAgICAgIGNvbnN0IGN1c3RvbUhhbmRsZXIgPSBhc3luYyAocmVxOiBhbnksIHJlczogYW55LCBuZXh0OiBhbnkpID0+IHtcbiAgICAgICAgICAvLyBMb2cgQUxMIHJlcXVlc3RzIHRvIHRoaXMgcGF0aCBmb3IgZGVidWdnaW5nXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQyNyBbQ3VzdG9tIFByb3h5XSBSZXF1ZXN0IHJlY2VpdmVkOicsIHJlcS5tZXRob2QsIHJlcS51cmwpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMjcgW0N1c3RvbSBQcm94eV0gSGVhZGVyczonLCBKU09OLnN0cmluZ2lmeShyZXEuaGVhZGVycywgbnVsbCwgMikpO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIE9ubHkgaGFuZGxlIFBPU1QgcmVxdWVzdHMgdG8gTG9naW4gZW5kcG9pbnRcbiAgICAgICAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ1BPU1QnICYmIHJlcS51cmw/LmluY2x1ZGVzKCcvYXBpL0xvZ2luL0xvZ2luJykpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMjcgW0N1c3RvbSBQcm94eV0gXHUyNzA1IE1BVENIRUQgLSBIYW5kbGluZyBMb2dpbiByZXF1ZXN0Jyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDI3IFtDdXN0b20gUHJveHldIFx1MjcwNSBIYW5kbGluZyBMb2dpbiByZXF1ZXN0IHdpdGggY2FzZS1zZW5zaXRpdmUgaGVhZGVycycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQyNyBbQ3VzdG9tIFByb3h5XSBSZXF1ZXN0IFVSTDonLCByZXEudXJsKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMjcgW0N1c3RvbSBQcm94eV0gUmVxdWVzdCBtZXRob2Q6JywgcmVxLm1ldGhvZCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IHJlcS51cmwuaW5jbHVkZXMoJ1dJTkRTUicpIHx8IHJlcS51cmwuaW5jbHVkZXMoJ3dpbmRzcicpIFxuICAgICAgICAgICAgICA/ICd3aW5kc3IuaW4nIFxuICAgICAgICAgICAgICA6ICd6eWxlbWluaXBsdXMuY29tJztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gUmVhZCByZXF1ZXN0IGJvZHlcbiAgICAgICAgICAgIGxldCBib2R5ID0gJyc7XG4gICAgICAgICAgICByZXEub24oJ2RhdGEnLCAoY2h1bmspID0+IHtcbiAgICAgICAgICAgICAgYm9keSArPSBjaHVuay50b1N0cmluZygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJlcS5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICAgICAgICAvLyBNYXAgaGVhZGVycyB0byBwcm9wZXIgY2FzZSAobWF0Y2hpbmcgUG9zdG1hbilcbiAgICAgICAgICAgICAgY29uc3QgaGVhZGVyQ2FzZU1hcDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHtcbiAgICAgICAgICAgICAgICAnbG9naW5pZCc6ICdMb2dpbklkJyxcbiAgICAgICAgICAgICAgICAncGFzc3dvcmQnOiAnUGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgICdjbGllbnRjb2RlJzogJ0NsaWVudENvZGUnLFxuICAgICAgICAgICAgICAgICdkZXZpY2VpZCc6ICdEZXZpY2VJZCcsXG4gICAgICAgICAgICAgICAgJ2F1dGhoZWFkZXInOiAnYXV0aGhlYWRlcicsXG4gICAgICAgICAgICAgICAgJ2ZjbXRva2VuJzogJ0ZjbVRva2VuJyxcbiAgICAgICAgICAgICAgICAnbG9ndXNlcmlkJzogJ0xvZ1VzZXJJZCcsXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBCdWlsZCBoZWFkZXJzIHdpdGggcHJvcGVyIGNhc2VcbiAgICAgICAgICAgICAgY29uc3QgaGVhZGVyczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xuICAgICAgICAgICAgICBPYmplY3Qua2V5cyhyZXEuaGVhZGVycykuZm9yRWFjaCgobG93ZXJLZXkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHJlcS5oZWFkZXJzW2xvd2VyS2V5XTtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiAhbG93ZXJLZXkuc3RhcnRzV2l0aCgnOicpKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBoZWFkZXJOYW1lID0gaGVhZGVyQ2FzZU1hcFtsb3dlcktleS50b0xvd2VyQ2FzZSgpXSB8fCBsb3dlcktleTtcbiAgICAgICAgICAgICAgICAgIGhlYWRlcnNbaGVhZGVyTmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gU2V0IEhvc3QgaGVhZGVyXG4gICAgICAgICAgICAgIGhlYWRlcnNbJ0hvc3QnXSA9IHRhcmdldDtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIE1ha2UgcmVxdWVzdCB3aXRoIHByb3BlciBoZWFkZXIgY2FzZVxuICAgICAgICAgICAgICBjb25zdCB1cmwgPSBuZXcgVVJMKGBodHRwczovLyR7dGFyZ2V0fSR7cmVxLnVybH1gKTtcbiAgICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBob3N0bmFtZTogdXJsLmhvc3RuYW1lLFxuICAgICAgICAgICAgICAgIHBvcnQ6IDQ0MyxcbiAgICAgICAgICAgICAgICBwYXRoOiB1cmwucGF0aG5hbWUgKyB1cmwuc2VhcmNoLFxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgIC4uLmhlYWRlcnMsXG4gICAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCB8fCAwLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDI3IFtDdXN0b20gUHJveHldIFJlcXVlc3Qgb3B0aW9uczonLCBKU09OLnN0cmluZ2lmeShvcHRpb25zLCBudWxsLCAyKSk7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMjcgW0N1c3RvbSBQcm94eV0gSGVhZGVycyB3aXRoIGNhc2U6JywgSlNPTi5zdHJpbmdpZnkoaGVhZGVycywgbnVsbCwgMikpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgY29uc3QgcHJveHlSZXEgPSBodHRwcy5yZXF1ZXN0KG9wdGlvbnMsIChwcm94eVJlcykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgW0N1c3RvbSBQcm94eV0gUmVzcG9uc2Ugc3RhdHVzOicsIHByb3h5UmVzLnN0YXR1c0NvZGUpO1xuICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQocHJveHlSZXMuc3RhdHVzQ29kZSB8fCAyMDAsIHByb3h5UmVzLmhlYWRlcnMpO1xuICAgICAgICAgICAgICAgIHByb3h5UmVzLnBpcGUocmVzKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBwcm94eVJlcS5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIFtDdXN0b20gUHJveHldIEVycm9yOicsIGVycik7XG4gICAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDApO1xuICAgICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogZXJyLm1lc3NhZ2UgfSkpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIGlmIChib2R5KSB7XG4gICAgICAgICAgICAgICAgcHJveHlSZXEud3JpdGUoYm9keSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcHJveHlSZXEuZW5kKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8vIENSSVRJQ0FMOiBSZWdpc3RlciBtaWRkbGV3YXJlIHRvIHJ1biBCRUZPUkUgcHJveHlcbiAgICAgICAgLy8gUmVnaXN0ZXIgd2l0aCBnZW5lcmljIHJvdXRlIC0gaGFuZGxlciB3aWxsIGNoZWNrIGZvciBMb2dpbiBlbmRwb2ludCBpbnNpZGVcbiAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQyNyBbQ3VzdG9tIFByb3h5XSBSZWdpc3RlcmluZyBtaWRkbGV3YXJlLi4uJyk7XG4gICAgICAgIFxuICAgICAgICAvLyBSZWdpc3RlciB3aXRoIGdlbmVyaWMgcm91dGUgcGF0dGVybiB0aGF0IG1hdGNoZXMgYWxsIC9aeWxlbWluaVBsdXNDb3JlVVJMQXV0aCByZXF1ZXN0c1xuICAgICAgICAvLyBUaGUgaGFuZGxlciB3aWxsIGNoZWNrIGlmIGl0J3MgYSBMb2dpbiByZXF1ZXN0IGFuZCBoYW5kbGUgaXQsIG90aGVyd2lzZSBjYWxsIG5leHQoKVxuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvWnlsZW1pbmlQbHVzQ29yZVVSTEF1dGgnLCBjdXN0b21IYW5kbGVyKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBbQ3VzdG9tIFByb3h5XSBNaWRkbGV3YXJlIHJlZ2lzdGVyZWQgZm9yIC9aeWxlbWluaVBsdXNDb3JlVVJMQXV0aCcpO1xuICAgICAgICBcbiAgICAgICAgLy8gQWxzbyB0cnkgdG8gZW5zdXJlIGl0IHJ1bnMgYmVmb3JlIHByb3h5IGJ5IG1hbmlwdWxhdGluZyBzdGFja1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChzZXJ2ZXIubWlkZGxld2FyZXMgJiYgKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrICYmIEFycmF5LmlzQXJyYXkoKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrKSkge1xuICAgICAgICAgICAgLy8gRmluZCBvdXIgbWlkZGxld2FyZSBhbmQgcHJveHkgbWlkZGxld2FyZVxuICAgICAgICAgICAgY29uc3Qgb3VySW5kZXggPSAoc2VydmVyLm1pZGRsZXdhcmVzIGFzIGFueSkuc3RhY2suZmluZEluZGV4KChtOiBhbnkpID0+IFxuICAgICAgICAgICAgICBtLmhhbmRsZSA9PT0gY3VzdG9tSGFuZGxlclxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IHByb3h5SW5kZXggPSAoc2VydmVyLm1pZGRsZXdhcmVzIGFzIGFueSkuc3RhY2suZmluZEluZGV4KChtOiBhbnkpID0+IFxuICAgICAgICAgICAgICBtLnJvdXRlICYmIHR5cGVvZiBtLnJvdXRlID09PSAnc3RyaW5nJyAmJiBtLnJvdXRlLmluY2x1ZGVzKCdaeWxlbWluaVBsdXNDb3JlVVJMQXV0aCcpICYmIG0uaGFuZGxlICE9PSBjdXN0b21IYW5kbGVyXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDI3IFtDdXN0b20gUHJveHldIE91ciBtaWRkbGV3YXJlIGluZGV4OicsIG91ckluZGV4KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMjcgW0N1c3RvbSBQcm94eV0gUHJveHkgbWlkZGxld2FyZSBpbmRleDonLCBwcm94eUluZGV4KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gSWYgcHJveHkgaXMgYmVmb3JlIHVzLCBtb3ZlIHVzIGJlZm9yZSBwcm94eVxuICAgICAgICAgICAgaWYgKHByb3h5SW5kZXggPiAtMSAmJiBvdXJJbmRleCA+IC0xICYmIG91ckluZGV4ID4gcHJveHlJbmRleCkge1xuICAgICAgICAgICAgICBjb25zdCBvdXJNaWRkbGV3YXJlID0gKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrW291ckluZGV4XTtcbiAgICAgICAgICAgICAgKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrLnNwbGljZShvdXJJbmRleCwgMSk7XG4gICAgICAgICAgICAgIChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjay5zcGxpY2UocHJveHlJbmRleCwgMCwgb3VyTWlkZGxld2FyZSk7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgW0N1c3RvbSBQcm94eV0gTW92ZWQgbWlkZGxld2FyZSBiZWZvcmUgcHJveHknKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3VySW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAvLyBNb3ZlIHRvIGJlZ2lubmluZyBpZiBub3QgYWxyZWFkeSB0aGVyZVxuICAgICAgICAgICAgICBjb25zdCBvdXJNaWRkbGV3YXJlID0gKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrW291ckluZGV4XTtcbiAgICAgICAgICAgICAgKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrLnNwbGljZShvdXJJbmRleCwgMSk7XG4gICAgICAgICAgICAgIChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjay51bnNoaWZ0KG91ck1pZGRsZXdhcmUpO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzA1IFtDdXN0b20gUHJveHldIE1vdmVkIG1pZGRsZXdhcmUgdG8gYmVnaW5uaW5nIG9mIHN0YWNrJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBbQ3VzdG9tIFByb3h5XSBFcnJvciBtYW5pcHVsYXRpbmcgc3RhY2s6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICBdLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gICAgICAvLyBPbmx5IGFsaWFzIHJlYWN0LW5hdGl2ZSBiYXNlIGltcG9ydCwgc3VicGF0aHMgYXJlIGhhbmRsZWQgYnkgcmVzb2x2ZSBwbHVnaW5cbiAgICAgICdyZWFjdC1uYXRpdmUkJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3V0aWxzL21vY2tzL3JlYWN0LW5hdGl2ZS13ZWItcGF0Y2hlZC50cycpLFxuICAgICAgLy8gTW9jayBuYXRpdmUgbW9kdWxlcyB0aGF0IGRvbid0IGV4aXN0IGluIHdlYlxuICAgICAgJ3JlYWN0LW5hdGl2ZS13ZWIvTGlicmFyaWVzL1V0aWxpdGllcy9jb2RlZ2VuTmF0aXZlQ29tcG9uZW50JzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3V0aWxzL21vY2tzL2NvZGVnZW5OYXRpdmVDb21wb25lbnQudHMnKSxcbiAgICAgICdyZWFjdC1uYXRpdmUvTGlicmFyaWVzL1V0aWxpdGllcy9jb2RlZ2VuTmF0aXZlQ29tcG9uZW50JzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3V0aWxzL21vY2tzL2NvZGVnZW5OYXRpdmVDb21wb25lbnQudHMnKSxcbiAgICAgICdyZWFjdC1uYXRpdmUtd2ViL0xpYnJhcmllcy9VdGlsaXRpZXMvY29kZWdlbk5hdGl2ZUNvbW1hbmRzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3V0aWxzL21vY2tzL2NvZGVnZW5OYXRpdmVDb21tYW5kcy50cycpLFxuICAgICAgJ3JlYWN0LW5hdGl2ZS9MaWJyYXJpZXMvVXRpbGl0aWVzL2NvZGVnZW5OYXRpdmVDb21tYW5kcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy91dGlscy9tb2Nrcy9jb2RlZ2VuTmF0aXZlQ29tbWFuZHMudHMnKSxcbiAgICAgIC8vIE1vY2sgVHVyYm9Nb2R1bGVSZWdpc3RyeVxuICAgICAgJ3JlYWN0LW5hdGl2ZS9MaWJyYXJpZXMvVHVyYm9Nb2R1bGUvVHVyYm9Nb2R1bGVSZWdpc3RyeSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy91dGlscy9tb2Nrcy9UdXJib01vZHVsZVJlZ2lzdHJ5LnRzJyksXG4gICAgICAncmVhY3QtbmF0aXZlLXdlYi9MaWJyYXJpZXMvVHVyYm9Nb2R1bGUvVHVyYm9Nb2R1bGVSZWdpc3RyeSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy91dGlscy9tb2Nrcy9UdXJib01vZHVsZVJlZ2lzdHJ5LnRzJyksXG4gICAgICAvLyBNb2NrIHJlYWN0LW5hdGl2ZS1yZWFuaW1hdGVkIGZvciB3ZWJcbiAgICAgICdyZWFjdC1uYXRpdmUtcmVhbmltYXRlZCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy91dGlscy9tb2Nrcy9yZWFjdC1uYXRpdmUtcmVhbmltYXRlZC50cycpLFxuICAgIH0sXG4gICAgLy8gSGFuZGxlIG5hdGl2ZSBtb2R1bGUgaW1wb3J0c1xuICAgIGNvbmRpdGlvbnM6IFsnd2ViJywgJ2Jyb3dzZXInLCAnZGVmYXVsdCddLFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAwLFxuICAgIG9wZW46IHRydWUsXG4gICAgLy8gQ3VzdG9tIG1pZGRsZXdhcmUgdG8gaGFuZGxlIGNhc2Utc2Vuc2l0aXZlIGhlYWRlcnNcbiAgICAvLyBUaGlzIHdpbGwgYmUgYWRkZWQgdmlhIGNvbmZpZ3VyZVNlcnZlciBob29rXG4gICAgcHJveHk6IHtcbiAgICAgIC8vIFByb3h5IEFQSSByZXF1ZXN0cyB0byBhdm9pZCBDT1JTIGlzc3VlcyBpbiBkZXZlbG9wbWVudFxuICAgICAgLy8gTG9naW4gZW5kcG9pbnQgbm93IHVzZXMgZGlyZWN0IGF4aW9zIChieXBhc3NlcyBwcm94eSkgLSBzZWUgTG9naW5BUElDYWxscy50c1xuICAgICAgLy8gTWF0Y2hlcyBhbnkgcGF0aCBzdGFydGluZyB3aXRoIC9aeWxlbWluaVBsdXNDb3JlVVJMQXV0aCAod2l0aCBhbnkgc3VmZml4KVxuICAgICAgJ14vWnlsZW1pbmlQbHVzQ29yZVVSTEF1dGgnOiAoe1xuICAgICAgICB0YXJnZXQ6ICdodHRwczovL3p5bGVtaW5pcGx1cy5jb20nLCAvLyBEZWZhdWx0LCBidXQgcm91dGVyIHdpbGwgb3ZlcnJpZGVcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICBzZWN1cmU6IHRydWUsXG4gICAgICAgIC8vIEJ5cGFzcyBwcm94eSBmb3IgTG9naW4gZW5kcG9pbnQgLSB3ZSdsbCBoYW5kbGUgaXQgd2l0aCBjYXNlLXNlbnNpdGl2ZSBoZWFkZXJzXG4gICAgICAgIGJ5cGFzczogZnVuY3Rpb24ocmVxOiBhbnksIHJlczogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgICAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ1BPU1QnICYmIHJlcS51cmw/LmluY2x1ZGVzKCcvYXBpL0xvZ2luL0xvZ2luJykpIHtcbiAgICAgICAgICAgIC8vIFJldHVybiB0aGUgcmVxdWVzdCBwYXRoIHRvIGhhbmRsZSBpdCBvdXJzZWx2ZXNcbiAgICAgICAgICAgIC8vIFRoaXMgd2lsbCBiZSBoYW5kbGVkIGJ5IGN1c3RvbSBtaWRkbGV3YXJlIGlmIHdlIGFkZCBpdCBiYWNrXG4gICAgICAgICAgICAvLyBGb3Igbm93LCBsZXQgcHJveHkgaGFuZGxlIGl0IGJ1dCB3ZSdsbCBmaXggaGVhZGVycyBpbiBwcm94eVJlcVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7IC8vIENvbnRpbnVlIHdpdGggcHJveHksIGJ1dCB3ZSdsbCBmaXggaGVhZGVyc1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gQ1JJVElDQUw6IFVzZSBzZWxmSGFuZGxlUmVzcG9uc2UgdG8gaGF2ZSBtb3JlIGNvbnRyb2wgb3ZlciBoZWFkZXJzXG4gICAgICAgIHNlbGZIYW5kbGVSZXNwb25zZTogZmFsc2UsIC8vIEtlZXAgZmFsc2UsIGJ1dCB3ZSdsbCBoYW5kbGUgaGVhZGVycyBpbiBwcm94eVJlcVxuICAgICAgICAvLyBVc2Ugcm91dGVyIGZ1bmN0aW9uIHRvIGR5bmFtaWNhbGx5IHJvdXRlIGJhc2VkIG9uIHJlcXVlc3QgcGF0aFxuICAgICAgICAvLyBUeXBlIGFzc2VydGlvbiBuZWVkZWQgYmVjYXVzZSBWaXRlJ3MgUHJveHlPcHRpb25zIHR5cGUgZG9lc24ndCBpbmNsdWRlIHJvdXRlciBmcm9tIGh0dHAtcHJveHktbWlkZGxld2FyZVxuICAgICAgICByb3V0ZXI6IGZ1bmN0aW9uKHJlcTogYW55KSB7XG4gICAgICAgICAgY29uc3QgcGF0aCA9IHJlcS51cmwgfHwgcmVxLnBhdGggfHwgJyc7XG4gICAgICAgICAgLy8gQ2hlY2sgaWYgcGF0aCBjb250YWlucyBXSU5EU1IgdG8gcm91dGUgdG8gd2luZHNyLmluXG4gICAgICAgICAgaWYgKHBhdGguaW5jbHVkZXMoJ1dJTkRTUicpIHx8IHBhdGguaW5jbHVkZXMoJ3dpbmRzcicpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDAwIFtWaXRlIFJvdXRlcl0gUm91dGluZyB0byB3aW5kc3IuaW4gZm9yIHBhdGg6JywgcGF0aCk7XG4gICAgICAgICAgICByZXR1cm4gJ2h0dHBzOi8vd2luZHNyLmluJztcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQwMCBbVml0ZSBSb3V0ZXJdIFJvdXRpbmcgdG8genlsZW1pbmlwbHVzLmNvbSBmb3IgcGF0aDonLCBwYXRoKTtcbiAgICAgICAgICByZXR1cm4gJ2h0dHBzOi8venlsZW1pbmlwbHVzLmNvbSc7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIFJld3JpdGUgdGhlIHBhdGggLSByZW1vdmUgdGhlIHByb3h5IHByZWZpeCBhbmQga2VlcCB0aGUgcmVzdFxuICAgICAgICByZXdyaXRlOiAocGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgLy8gcGF0aCB3aWxsIGJlIGxpa2U6IC9aeWxlbWluaVBsdXNDb3JlVVJMQXV0aFdJTkRTUkJWMVY0L2FwaS9Mb2dpbi9Mb2dpblxuICAgICAgICAgIC8vIFdlIG5lZWQgdG8gcmV3cml0ZSBpdCB0bzogL1p5bGVtaW5pUGx1c0NvcmVVUkxBdXRoV0lORFNSQlYxVjQvYXBpL0xvZ2luL0xvZ2luXG4gICAgICAgICAgLy8gQWN0dWFsbHksIHdlIHdhbnQgdG8ga2VlcCBpdCBhcy1pcyBzaW5jZSB0aGUgZnVsbCBwYXRoIGlzIG5lZWRlZFxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMDAgW1ZpdGUgUmV3cml0ZV0gT3JpZ2luYWwgcGF0aDonLCBwYXRoKTtcbiAgICAgICAgICBjb25zdCByZXdyaXR0ZW4gPSBwYXRoOyAvLyBLZWVwIGFzLWlzIGZvciBub3dcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDAwIFtWaXRlIFJld3JpdGVdIFJld3JpdHRlbiBwYXRoOicsIHJld3JpdHRlbik7XG4gICAgICAgICAgcmV0dXJuIHJld3JpdHRlbjtcbiAgICAgICAgfSxcbiAgICAgICAgY29uZmlndXJlOiAocHJveHk6IGFueSwgX29wdGlvbnM6IGFueSkgPT4ge1xuICAgICAgICAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnI6IGFueSwgX3JlcTogYW55LCBfcmVzOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBbUHJveHldIEVycm9yOicsIGVycik7XG4gICAgICAgICAgICBpZiAoX3JlcyAmJiAhX3Jlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICAgICAgICBfcmVzLndyaXRlSGVhZCg1MDAsIHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9KTtcbiAgICAgICAgICAgICAgX3Jlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ1Byb3h5IGVycm9yJywgbWVzc2FnZTogZXJyLm1lc3NhZ2UgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGFzIGFueSlcbiAgICB9XG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgc291cmNlbWFwOiB0cnVlLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAncmVhY3QtdmVuZG9yJzogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbSddLFxuICAgICAgICAgICdyZWR1eC12ZW5kb3InOiBbJ0ByZWR1eGpzL3Rvb2xraXQnLCAncmVhY3QtcmVkdXgnLCAncmVkdXgtcGVyc2lzdCcsICdyZWR1eC1zYWdhJ10sXG4gICAgICAgICAgJ3VpLXZlbmRvcic6IFsnQG11aS9tYXRlcmlhbCcsICdAbXVpL2ljb25zLW1hdGVyaWFsJywgJ3JlYWN0LW5hdGl2ZS13ZWInXVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb253YXJuKHdhcm5pbmcsIHdhcm4pIHtcbiAgICAgICAgLy8gU3VwcHJlc3Mgd2FybmluZ3MgYWJvdXQgY29kZWdlbk5hdGl2ZUNvbXBvbmVudCwgY29kZWdlbk5hdGl2ZUNvbW1hbmRzIGFuZCBvdGhlciBuYXRpdmUgbW9kdWxlc1xuICAgICAgICBpZiAoXG4gICAgICAgICAgKHdhcm5pbmcuY29kZSA9PT0gJ1VOUkVTT0xWRURfSU1QT1JUJyB8fCB3YXJuaW5nLmNvZGUgPT09ICdNT0RVTEVfTEVWRUxfRElSRUNUSVZFJykgJiZcbiAgICAgICAgICAoKHdhcm5pbmcuaWQ/LmluY2x1ZGVzKCdjb2RlZ2VuTmF0aXZlQ29tcG9uZW50JykgfHwgd2FybmluZy5tZXNzYWdlPy5pbmNsdWRlcygnY29kZWdlbk5hdGl2ZUNvbXBvbmVudCcpKSB8fFxuICAgICAgICAgICAod2FybmluZy5pZD8uaW5jbHVkZXMoJ2NvZGVnZW5OYXRpdmVDb21tYW5kcycpIHx8IHdhcm5pbmcubWVzc2FnZT8uaW5jbHVkZXMoJ2NvZGVnZW5OYXRpdmVDb21tYW5kcycpKSB8fFxuICAgICAgICAgICAod2FybmluZy5pZD8uaW5jbHVkZXMoJ3JlYWN0LW5hdGl2ZS13ZWIvTGlicmFyaWVzJykgfHwgd2FybmluZy5tZXNzYWdlPy5pbmNsdWRlcygncmVhY3QtbmF0aXZlLXdlYi9MaWJyYXJpZXMnKSkgfHxcbiAgICAgICAgICAgKHdhcm5pbmcuaWQ/LmluY2x1ZGVzKCdyZWFjdC1uYXRpdmUtcmVhbmltYXRlZCcpIHx8IHdhcm5pbmcubWVzc2FnZT8uaW5jbHVkZXMoJ3JlYWN0LW5hdGl2ZS1yZWFuaW1hdGVkJykpKVxuICAgICAgICApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgd2Fybih3YXJuaW5nKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbW1vbmpzT3B0aW9uczoge1xuICAgICAgdHJhbnNmb3JtTWl4ZWRFc01vZHVsZXM6IHRydWUsXG4gICAgICBpbmNsdWRlOiBbL25vZGVfbW9kdWxlcy9dXG4gICAgfVxuICB9LFxuICBiYXNlOiAnLycsXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsncmVhY3QtbmF0aXZlLXJlYW5pbWF0ZWQnLCAncmVhY3QtbmF0aXZlJ10sXG4gICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgIC8vIEV4Y2x1ZGUgcmVhY3QtbmF0aXZlLXJlYW5pbWF0ZWQgYW5kIHJlYWN0LW5hdGl2ZSBmcm9tIGVzYnVpbGQgcHJvY2Vzc2luZ1xuICAgICAgbG9hZGVyOiB7XG4gICAgICAgICcuanMnOiAnanN4JyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pO1xuXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXFXLFNBQVMsb0JBQW9CO0FBQ2xZLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFDeEIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sV0FBVztBQUVsQixTQUFTLHFCQUFxQjtBQU5tTSxJQUFNLDJDQUEyQztBQVFsUixJQUFNLFlBQVksS0FBSyxRQUFRLGNBQWMsd0NBQWUsQ0FBQztBQUc3RCxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUE7QUFBQTtBQUFBLElBR1A7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLFNBQVM7QUFBQTtBQUFBLE1BQ1QsVUFBVSxJQUFJLFVBQVU7QUFFdEIsWUFBSSxRQUFRLElBQUksYUFBYSxpQkFB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
