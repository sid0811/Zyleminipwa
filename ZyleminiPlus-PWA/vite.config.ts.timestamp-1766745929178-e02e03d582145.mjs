var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

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
          const subpath = id.replace("react-native/", "");
          const reactNativeWebPath = path.resolve(__dirname, "./node_modules/react-native-web/dist", subpath);
          try {
            const fs = __require("fs");
            if (fs.existsSync(reactNativeWebPath) || fs.existsSync(reactNativeWebPath + ".js")) {
              return fs.existsSync(reactNativeWebPath) ? reactNativeWebPath : reactNativeWebPath + ".js";
            }
          } catch (e) {
          }
          return path.resolve(__dirname, "./src/utils/mocks/react-native-web-patched.ts");
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
        type: "module",
        disableDevLogs: true
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxaeWxlbWluaVBsdXMyNDEyMjVcXFxcWnlsZW1pbmlQbHVzU291cmNlXFxcXFp5bGVtaW5pUGx1cy1QV0FcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFp5bGVtaW5pUGx1czI0MTIyNVxcXFxaeWxlbWluaVBsdXNTb3VyY2VcXFxcWnlsZW1pbmlQbHVzLVBXQVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovWnlsZW1pbmlQbHVzMjQxMjI1L1p5bGVtaW5pUGx1c1NvdXJjZS9aeWxlbWluaVBsdXMtUFdBL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBodHRwcyBmcm9tICdodHRwcyc7XG5pbXBvcnQgaHR0cCBmcm9tICdodHRwJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICd1cmwnO1xuXG5jb25zdCBfX2Rpcm5hbWUgPSBwYXRoLmRpcm5hbWUoZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpKTtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICAvLyBDUklUSUNBTDogcmVzb2x2ZS1uYXRpdmUtbW9kdWxlcyBtdXN0IGJlIGZpcnN0IHRvIGludGVyY2VwdCByZWFjdC1uYXRpdmUgaW1wb3J0c1xuICAgIC8vIFBsdWdpbiB0byBoYW5kbGUgbmF0aXZlIG1vZHVsZSBpbXBvcnRzXG4gICAge1xuICAgICAgbmFtZTogJ3Jlc29sdmUtbmF0aXZlLW1vZHVsZXMnLFxuICAgICAgZW5mb3JjZTogJ3ByZScsIC8vIFJ1biBiZWZvcmUgb3RoZXIgcGx1Z2luc1xuICAgICAgcmVzb2x2ZUlkKGlkLCBpbXBvcnRlcikge1xuICAgICAgICAvLyBEZWJ1ZyBsb2dnaW5nIGluIGRldmVsb3BtZW50XG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyAmJiBpZC5pbmNsdWRlcygncmVhY3QtbmF0aXZlJykpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgW3Jlc29sdmUtbmF0aXZlLW1vZHVsZXNdIFJlc29sdmluZzogJHtpZH0gZnJvbSAke2ltcG9ydGVyfWApO1xuICAgICAgICB9XG4gICAgICAgIC8vIENSSVRJQ0FMOiBIYW5kbGUgQUxMIHJlYWN0LW5hdGl2ZSBpbXBvcnRzIEJFRk9SRSB0aGV5IHJlYWNoIG5vZGVfbW9kdWxlc1xuICAgICAgICAvLyBUaGlzIHByZXZlbnRzIGVzYnVpbGQgZnJvbSB0cnlpbmcgdG8gcGFyc2UgRmxvdyBzeW50YXggaW4gcmVhY3QtbmF0aXZlIHBhY2thZ2VcbiAgICAgICAgXG4gICAgICAgIC8vIEhhbmRsZSByZWFjdC1uYXRpdmUgYmFzZSBpbXBvcnQgLSBNVVNUIGJlIGZpcnN0XG4gICAgICAgIGlmIChpZCA9PT0gJ3JlYWN0LW5hdGl2ZScpIHtcbiAgICAgICAgICByZXR1cm4gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3V0aWxzL21vY2tzL3JlYWN0LW5hdGl2ZS13ZWItcGF0Y2hlZC50cycpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBIYW5kbGUgc3VicGF0aCBpbXBvcnRzIGZyb20gcmVhY3QtbmF0aXZlXG4gICAgICAgIGlmIChpZC5zdGFydHNXaXRoKCdyZWFjdC1uYXRpdmUvJykpIHtcbiAgICAgICAgICAvLyBIYW5kbGUgY29kZWdlbk5hdGl2ZUNvbXBvbmVudCBzdWJwYXRoXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdMaWJyYXJpZXMvVXRpbGl0aWVzL2NvZGVnZW5OYXRpdmVDb21wb25lbnQnKSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy91dGlscy9tb2Nrcy9jb2RlZ2VuTmF0aXZlQ29tcG9uZW50LnRzJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIEhhbmRsZSBjb2RlZ2VuTmF0aXZlQ29tbWFuZHMgc3VicGF0aFxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnTGlicmFyaWVzL1V0aWxpdGllcy9jb2RlZ2VuTmF0aXZlQ29tbWFuZHMnKSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy91dGlscy9tb2Nrcy9jb2RlZ2VuTmF0aXZlQ29tbWFuZHMudHMnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gSGFuZGxlIFR1cmJvTW9kdWxlUmVnaXN0cnkgc3VicGF0aFxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnTGlicmFyaWVzL1R1cmJvTW9kdWxlL1R1cmJvTW9kdWxlUmVnaXN0cnknKSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy91dGlscy9tb2Nrcy9UdXJib01vZHVsZVJlZ2lzdHJ5LnRzJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIEZvciBvdGhlciBzdWJwYXRocywgdHJ5IHRvIHJlc29sdmUgZnJvbSByZWFjdC1uYXRpdmUtd2ViXG4gICAgICAgICAgLy8gRXh0cmFjdCB0aGUgc3VicGF0aFxuICAgICAgICAgIGNvbnN0IHN1YnBhdGggPSBpZC5yZXBsYWNlKCdyZWFjdC1uYXRpdmUvJywgJycpO1xuICAgICAgICAgIGNvbnN0IHJlYWN0TmF0aXZlV2ViUGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL25vZGVfbW9kdWxlcy9yZWFjdC1uYXRpdmUtd2ViL2Rpc3QnLCBzdWJwYXRoKTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgZmlsZSBleGlzdHMsIGlmIG5vdCwgdHJ5IHdpdGggLmpzIGV4dGVuc2lvblxuICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocmVhY3ROYXRpdmVXZWJQYXRoKSB8fCBmcy5leGlzdHNTeW5jKHJlYWN0TmF0aXZlV2ViUGF0aCArICcuanMnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gZnMuZXhpc3RzU3luYyhyZWFjdE5hdGl2ZVdlYlBhdGgpID8gcmVhY3ROYXRpdmVXZWJQYXRoIDogcmVhY3ROYXRpdmVXZWJQYXRoICsgJy5qcyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy8gRmFsbCB0aHJvdWdoIHRvIHJldHVybiBudWxsXG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIElmIHN1YnBhdGggZG9lc24ndCBleGlzdCBpbiByZWFjdC1uYXRpdmUtd2ViLCByZXR1cm4gdGhlIHBhdGNoZWQgdmVyc2lvblxuICAgICAgICAgIHJldHVybiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvdXRpbHMvbW9ja3MvcmVhY3QtbmF0aXZlLXdlYi1wYXRjaGVkLnRzJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIEhhbmRsZSBjb2RlZ2VuTmF0aXZlQ29tcG9uZW50IChjYXRjaCBhbnkgcmVtYWluaW5nIHBhdHRlcm5zKVxuICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2NvZGVnZW5OYXRpdmVDb21wb25lbnQnKSAmJiBpZC5pbmNsdWRlcygncmVhY3QtbmF0aXZlJykgJiYgIWlkLmluY2x1ZGVzKCdyZWFjdC1uYXRpdmUtd2ViJykpIHtcbiAgICAgICAgICByZXR1cm4gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3V0aWxzL21vY2tzL2NvZGVnZW5OYXRpdmVDb21wb25lbnQudHMnKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gSGFuZGxlIGNvZGVnZW5OYXRpdmVDb21tYW5kcyAoY2F0Y2ggYW55IHJlbWFpbmluZyBwYXR0ZXJucylcbiAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdjb2RlZ2VuTmF0aXZlQ29tbWFuZHMnKSAmJiBpZC5pbmNsdWRlcygncmVhY3QtbmF0aXZlJykgJiYgIWlkLmluY2x1ZGVzKCdyZWFjdC1uYXRpdmUtd2ViJykpIHtcbiAgICAgICAgICByZXR1cm4gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3V0aWxzL21vY2tzL2NvZGVnZW5OYXRpdmVDb21tYW5kcy50cycpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBIYW5kbGUgVHVyYm9Nb2R1bGVSZWdpc3RyeSAoY2F0Y2ggYW55IHJlbWFpbmluZyBwYXR0ZXJucylcbiAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdUdXJib01vZHVsZVJlZ2lzdHJ5JykgJiYgaWQuaW5jbHVkZXMoJ3JlYWN0LW5hdGl2ZScpICYmICFpZC5pbmNsdWRlcygncmVhY3QtbmF0aXZlLXdlYicpKSB7XG4gICAgICAgICAgcmV0dXJuIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy91dGlscy9tb2Nrcy9UdXJib01vZHVsZVJlZ2lzdHJ5LnRzJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIEhhbmRsZSByZWFjdC1uYXRpdmUtcmVhbmltYXRlZCAtIGNhdGNoIGFsbCBpbXBvcnQgcGF0aHNcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGlkID09PSAncmVhY3QtbmF0aXZlLXJlYW5pbWF0ZWQnIHx8IFxuICAgICAgICAgIGlkLnN0YXJ0c1dpdGgoJ3JlYWN0LW5hdGl2ZS1yZWFuaW1hdGVkLycpIHx8XG4gICAgICAgICAgaWQuaW5jbHVkZXMoJ3JlYWN0LW5hdGl2ZS1yZWFuaW1hdGVkL2xpYi9tb2R1bGUnKVxuICAgICAgICApIHtcbiAgICAgICAgICByZXR1cm4gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3V0aWxzL21vY2tzL3JlYWN0LW5hdGl2ZS1yZWFuaW1hdGVkLnRzJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIEV4cGxpY2l0bHkgcmVzb2x2ZSByZWFjdC1uYXRpdmUtd2ViIHRvIGl0cyBlbnRyeSBwb2ludFxuICAgICAgICBpZiAoaWQgPT09ICdyZWFjdC1uYXRpdmUtd2ViJykge1xuICAgICAgICAgIHJldHVybiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9ub2RlX21vZHVsZXMvcmVhY3QtbmF0aXZlLXdlYi9kaXN0L2luZGV4LmpzJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVhY3Qoe1xuICAgICAgLy8gRW5hYmxlIEpTWCBpbiBub2RlX21vZHVsZXMgKHJlYWN0LW5hdGl2ZS1yZWFuaW1hdGVkIGlzIG1vY2tlZCwgbm90IHByb2Nlc3NlZClcbiAgICAgIGluY2x1ZGU6IC9cXC4oanN4fHRzeHxqc3x0cykkLyxcbiAgICAgIGJhYmVsOiB7XG4gICAgICAgIHBsdWdpbnM6IFtdLFxuICAgICAgfSxcbiAgICB9KSxcbiAgICBWaXRlUFdBKHtcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ3Byb21wdCcsIC8vIENoYW5nZWQgdG8gcHJvbXB0IGZvciBpbW1lZGlhdGUgdXBkYXRlc1xuICAgICAgaW5jbHVkZUFzc2V0czogWydmYXZpY29uLmljbycsICdhcHBsZS10b3VjaC1pY29uLnBuZycsICdtYXNrLWljb24uc3ZnJ10sXG4gICAgICBtYW5pZmVzdDoge1xuICAgICAgICBuYW1lOiAnWnlsZW1pbmlQbHVzJyxcbiAgICAgICAgc2hvcnRfbmFtZTogJ1p5bGVtaW5pUGx1cycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnWnlsZW1pbmlQbHVzIFByb2dyZXNzaXZlIFdlYiBBcHAnLFxuICAgICAgICB0aGVtZV9jb2xvcjogJyNmZmZmZmYnLFxuICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnI2ZmZmZmZicsXG4gICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcbiAgICAgICAgb3JpZW50YXRpb246ICdwb3J0cmFpdCcsXG4gICAgICAgIHN0YXJ0X3VybDogJy8nLFxuICAgICAgICBpY29uczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJ3B3YS0xOTJ4MTkyLnBuZycsXG4gICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAncHdhLTUxMng1MTIucG5nJyxcbiAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICAgIHB1cnBvc2U6ICdhbnkgbWFza2FibGUnXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAgd29ya2JveDoge1xuICAgICAgICBnbG9iUGF0dGVybnM6IFsnKiovKi57anMsY3NzLGh0bWwsaWNvLHBuZyxzdmcsd29mZjJ9J10sXG4gICAgICAgIC8vIEZvcmNlIHVwZGF0ZSBzZXJ2aWNlIHdvcmtlciBvbiBldmVyeSBkZXBsb3ltZW50XG4gICAgICAgIHNraXBXYWl0aW5nOiB0cnVlLFxuICAgICAgICBjbGllbnRzQ2xhaW06IHRydWUsXG4gICAgICAgIC8vIFN1cHByZXNzIHdhcm5pbmdzIGluIGRldiBtb2RlXG4gICAgICAgIG1vZGU6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicgPyAncHJvZHVjdGlvbicgOiAnZGV2ZWxvcG1lbnQnLFxuICAgICAgICAvLyBEb24ndCBwcmVjYWNoZSBzb3VyY2UgZmlsZXMgaW4gZGV2IG1vZGVcbiAgICAgICAgbmF2aWdhdGVGYWxsYmFjazogJy9pbmRleC5odG1sJyxcbiAgICAgICAgbmF2aWdhdGVGYWxsYmFja0RlbnlsaXN0OiBbL15cXC9fLywgL1xcL1teLz9dK1xcLlteL10rJC9dLFxuICAgICAgICBydW50aW1lQ2FjaGluZzogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9eaHR0cHM6XFwvXFwvc3FsXFwuanNcXC5vcmdcXC8uKi9pLFxuICAgICAgICAgICAgaGFuZGxlcjogJ0NhY2hlRmlyc3QnLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdzcWxqcy1jYWNoZScsXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcbiAgICAgICAgICAgICAgICBtYXhFbnRyaWVzOiAxMCxcbiAgICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgKiAzNjUgLy8gMSB5ZWFyXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9eaHR0cHM6XFwvXFwvLipcXC4oPzpwbmd8anBnfGpwZWd8c3ZnfGdpZnx3ZWJwKS9pLFxuICAgICAgICAgICAgaGFuZGxlcjogJ0NhY2hlRmlyc3QnLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdpbWFnZXMtY2FjaGUnLFxuICAgICAgICAgICAgICBleHBpcmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgbWF4RW50cmllczogNTAsXG4gICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogMzAgLy8gMzAgZGF5c1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAgZGV2T3B0aW9uczoge1xuICAgICAgICBlbmFibGVkOiBmYWxzZSwgLy8gRGlzYWJsZSBzZXJ2aWNlIHdvcmtlciBpbiBkZXYgbW9kZSB0byBhdm9pZCBpbnRlcmZlcmVuY2VcbiAgICAgICAgdHlwZTogJ21vZHVsZScsXG4gICAgICAgIGRpc2FibGVEZXZMb2dzOiB0cnVlXG4gICAgICB9XG4gICAgfSksXG4gICAgLy8gQ3VzdG9tIHBsdWdpbiB0byBoYW5kbGUgY2FzZS1zZW5zaXRpdmUgaGVhZGVycyBmb3IgTG9naW4gQVBJXG4gICAge1xuICAgICAgbmFtZTogJ2Nhc2Utc2Vuc2l0aXZlLWhlYWRlcnMtcHJveHknLFxuICAgICAgZW5mb3JjZTogJ3ByZScsIC8vIENSSVRJQ0FMOiBSdW4gQkVGT1JFIG90aGVyIHBsdWdpbnMgKGluY2x1ZGluZyBwcm94eSlcbiAgICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgICAgLy8gQ1JJVElDQUw6IFVzZSB1bnNoaWZ0IHRvIHJ1biBCRUZPUkUgcHJveHkgbWlkZGxld2FyZVxuICAgICAgICAvLyBUaGlzIGVuc3VyZXMgb3VyIGN1c3RvbSBoYW5kbGVyIHJ1bnMgZmlyc3RcbiAgICAgICAgY29uc3QgY3VzdG9tSGFuZGxlciA9IGFzeW5jIChyZXE6IGFueSwgcmVzOiBhbnksIG5leHQ6IGFueSkgPT4ge1xuICAgICAgICAgIC8vIExvZyBBTEwgcmVxdWVzdHMgdG8gdGhpcyBwYXRoIGZvciBkZWJ1Z2dpbmdcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDI3IFtDdXN0b20gUHJveHldIFJlcXVlc3QgcmVjZWl2ZWQ6JywgcmVxLm1ldGhvZCwgcmVxLnVybCk7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQyNyBbQ3VzdG9tIFByb3h5XSBIZWFkZXJzOicsIEpTT04uc3RyaW5naWZ5KHJlcS5oZWFkZXJzLCBudWxsLCAyKSk7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gT25seSBoYW5kbGUgUE9TVCByZXF1ZXN0cyB0byBMb2dpbiBlbmRwb2ludFxuICAgICAgICAgIGlmIChyZXEubWV0aG9kID09PSAnUE9TVCcgJiYgcmVxLnVybD8uaW5jbHVkZXMoJy9hcGkvTG9naW4vTG9naW4nKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQyNyBbQ3VzdG9tIFByb3h5XSBcdTI3MDUgTUFUQ0hFRCAtIEhhbmRsaW5nIExvZ2luIHJlcXVlc3QnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMjcgW0N1c3RvbSBQcm94eV0gXHUyNzA1IEhhbmRsaW5nIExvZ2luIHJlcXVlc3Qgd2l0aCBjYXNlLXNlbnNpdGl2ZSBoZWFkZXJzJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDI3IFtDdXN0b20gUHJveHldIFJlcXVlc3QgVVJMOicsIHJlcS51cmwpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQyNyBbQ3VzdG9tIFByb3h5XSBSZXF1ZXN0IG1ldGhvZDonLCByZXEubWV0aG9kKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gcmVxLnVybC5pbmNsdWRlcygnV0lORFNSJykgfHwgcmVxLnVybC5pbmNsdWRlcygnd2luZHNyJykgXG4gICAgICAgICAgICAgID8gJ3dpbmRzci5pbicgXG4gICAgICAgICAgICAgIDogJ3p5bGVtaW5pcGx1cy5jb20nO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBSZWFkIHJlcXVlc3QgYm9keVxuICAgICAgICAgICAgbGV0IGJvZHkgPSAnJztcbiAgICAgICAgICAgIHJlcS5vbignZGF0YScsIChjaHVuaykgPT4ge1xuICAgICAgICAgICAgICBib2R5ICs9IGNodW5rLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmVxLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIC8vIE1hcCBoZWFkZXJzIHRvIHByb3BlciBjYXNlIChtYXRjaGluZyBQb3N0bWFuKVxuICAgICAgICAgICAgICBjb25zdCBoZWFkZXJDYXNlTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge1xuICAgICAgICAgICAgICAgICdsb2dpbmlkJzogJ0xvZ2luSWQnLFxuICAgICAgICAgICAgICAgICdwYXNzd29yZCc6ICdQYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgJ2NsaWVudGNvZGUnOiAnQ2xpZW50Q29kZScsXG4gICAgICAgICAgICAgICAgJ2RldmljZWlkJzogJ0RldmljZUlkJyxcbiAgICAgICAgICAgICAgICAnYXV0aGhlYWRlcic6ICdhdXRoaGVhZGVyJyxcbiAgICAgICAgICAgICAgICAnZmNtdG9rZW4nOiAnRmNtVG9rZW4nLFxuICAgICAgICAgICAgICAgICdsb2d1c2VyaWQnOiAnTG9nVXNlcklkJyxcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIEJ1aWxkIGhlYWRlcnMgd2l0aCBwcm9wZXIgY2FzZVxuICAgICAgICAgICAgICBjb25zdCBoZWFkZXJzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge307XG4gICAgICAgICAgICAgIE9iamVjdC5rZXlzKHJlcS5oZWFkZXJzKS5mb3JFYWNoKChsb3dlcktleSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcmVxLmhlYWRlcnNbbG93ZXJLZXldO1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmICFsb3dlcktleS5zdGFydHNXaXRoKCc6JykpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGhlYWRlck5hbWUgPSBoZWFkZXJDYXNlTWFwW2xvd2VyS2V5LnRvTG93ZXJDYXNlKCldIHx8IGxvd2VyS2V5O1xuICAgICAgICAgICAgICAgICAgaGVhZGVyc1toZWFkZXJOYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBTZXQgSG9zdCBoZWFkZXJcbiAgICAgICAgICAgICAgaGVhZGVyc1snSG9zdCddID0gdGFyZ2V0O1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gTWFrZSByZXF1ZXN0IHdpdGggcHJvcGVyIGhlYWRlciBjYXNlXG4gICAgICAgICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwoYGh0dHBzOi8vJHt0YXJnZXR9JHtyZXEudXJsfWApO1xuICAgICAgICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIGhvc3RuYW1lOiB1cmwuaG9zdG5hbWUsXG4gICAgICAgICAgICAgICAgcG9ydDogNDQzLFxuICAgICAgICAgICAgICAgIHBhdGg6IHVybC5wYXRobmFtZSArIHVybC5zZWFyY2gsXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgLi4uaGVhZGVycyxcbiAgICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoIHx8IDAsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMjcgW0N1c3RvbSBQcm94eV0gUmVxdWVzdCBvcHRpb25zOicsIEpTT04uc3RyaW5naWZ5KG9wdGlvbnMsIG51bGwsIDIpKTtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQyNyBbQ3VzdG9tIFByb3h5XSBIZWFkZXJzIHdpdGggY2FzZTonLCBKU09OLnN0cmluZ2lmeShoZWFkZXJzLCBudWxsLCAyKSk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBjb25zdCBwcm94eVJlcSA9IGh0dHBzLnJlcXVlc3Qob3B0aW9ucywgKHByb3h5UmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBbQ3VzdG9tIFByb3h5XSBSZXNwb25zZSBzdGF0dXM6JywgcHJveHlSZXMuc3RhdHVzQ29kZSk7XG4gICAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZChwcm94eVJlcy5zdGF0dXNDb2RlIHx8IDIwMCwgcHJveHlSZXMuaGVhZGVycyk7XG4gICAgICAgICAgICAgICAgcHJveHlSZXMucGlwZShyZXMpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHByb3h5UmVxLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgW0N1c3RvbSBQcm94eV0gRXJyb3I6JywgZXJyKTtcbiAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKDUwMCk7XG4gICAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBlcnIubWVzc2FnZSB9KSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgaWYgKGJvZHkpIHtcbiAgICAgICAgICAgICAgICBwcm94eVJlcS53cml0ZShib2R5KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBwcm94eVJlcS5lbmQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLy8gQ1JJVElDQUw6IFJlZ2lzdGVyIG1pZGRsZXdhcmUgdG8gcnVuIEJFRk9SRSBwcm94eVxuICAgICAgICAvLyBSZWdpc3RlciB3aXRoIGdlbmVyaWMgcm91dGUgLSBoYW5kbGVyIHdpbGwgY2hlY2sgZm9yIExvZ2luIGVuZHBvaW50IGluc2lkZVxuICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDI3IFtDdXN0b20gUHJveHldIFJlZ2lzdGVyaW5nIG1pZGRsZXdhcmUuLi4nKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFJlZ2lzdGVyIHdpdGggZ2VuZXJpYyByb3V0ZSBwYXR0ZXJuIHRoYXQgbWF0Y2hlcyBhbGwgL1p5bGVtaW5pUGx1c0NvcmVVUkxBdXRoIHJlcXVlc3RzXG4gICAgICAgIC8vIFRoZSBoYW5kbGVyIHdpbGwgY2hlY2sgaWYgaXQncyBhIExvZ2luIHJlcXVlc3QgYW5kIGhhbmRsZSBpdCwgb3RoZXJ3aXNlIGNhbGwgbmV4dCgpXG4gICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9aeWxlbWluaVBsdXNDb3JlVVJMQXV0aCcsIGN1c3RvbUhhbmRsZXIpO1xuICAgICAgICBjb25zb2xlLmxvZygnXHUyNzA1IFtDdXN0b20gUHJveHldIE1pZGRsZXdhcmUgcmVnaXN0ZXJlZCBmb3IgL1p5bGVtaW5pUGx1c0NvcmVVUkxBdXRoJyk7XG4gICAgICAgIFxuICAgICAgICAvLyBBbHNvIHRyeSB0byBlbnN1cmUgaXQgcnVucyBiZWZvcmUgcHJveHkgYnkgbWFuaXB1bGF0aW5nIHN0YWNrXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKHNlcnZlci5taWRkbGV3YXJlcyAmJiAoc2VydmVyLm1pZGRsZXdhcmVzIGFzIGFueSkuc3RhY2sgJiYgQXJyYXkuaXNBcnJheSgoc2VydmVyLm1pZGRsZXdhcmVzIGFzIGFueSkuc3RhY2spKSB7XG4gICAgICAgICAgICAvLyBGaW5kIG91ciBtaWRkbGV3YXJlIGFuZCBwcm94eSBtaWRkbGV3YXJlXG4gICAgICAgICAgICBjb25zdCBvdXJJbmRleCA9IChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjay5maW5kSW5kZXgoKG06IGFueSkgPT4gXG4gICAgICAgICAgICAgIG0uaGFuZGxlID09PSBjdXN0b21IYW5kbGVyXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgcHJveHlJbmRleCA9IChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjay5maW5kSW5kZXgoKG06IGFueSkgPT4gXG4gICAgICAgICAgICAgIG0ucm91dGUgJiYgdHlwZW9mIG0ucm91dGUgPT09ICdzdHJpbmcnICYmIG0ucm91dGUuaW5jbHVkZXMoJ1p5bGVtaW5pUGx1c0NvcmVVUkxBdXRoJykgJiYgbS5oYW5kbGUgIT09IGN1c3RvbUhhbmRsZXJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMjcgW0N1c3RvbSBQcm94eV0gT3VyIG1pZGRsZXdhcmUgaW5kZXg6Jywgb3VySW5kZXgpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQyNyBbQ3VzdG9tIFByb3h5XSBQcm94eSBtaWRkbGV3YXJlIGluZGV4OicsIHByb3h5SW5kZXgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBJZiBwcm94eSBpcyBiZWZvcmUgdXMsIG1vdmUgdXMgYmVmb3JlIHByb3h5XG4gICAgICAgICAgICBpZiAocHJveHlJbmRleCA+IC0xICYmIG91ckluZGV4ID4gLTEgJiYgb3VySW5kZXggPiBwcm94eUluZGV4KSB7XG4gICAgICAgICAgICAgIGNvbnN0IG91ck1pZGRsZXdhcmUgPSAoc2VydmVyLm1pZGRsZXdhcmVzIGFzIGFueSkuc3RhY2tbb3VySW5kZXhdO1xuICAgICAgICAgICAgICAoc2VydmVyLm1pZGRsZXdhcmVzIGFzIGFueSkuc3RhY2suc3BsaWNlKG91ckluZGV4LCAxKTtcbiAgICAgICAgICAgICAgKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrLnNwbGljZShwcm94eUluZGV4LCAwLCBvdXJNaWRkbGV3YXJlKTtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBbQ3VzdG9tIFByb3h5XSBNb3ZlZCBtaWRkbGV3YXJlIGJlZm9yZSBwcm94eScpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvdXJJbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgIC8vIE1vdmUgdG8gYmVnaW5uaW5nIGlmIG5vdCBhbHJlYWR5IHRoZXJlXG4gICAgICAgICAgICAgIGNvbnN0IG91ck1pZGRsZXdhcmUgPSAoc2VydmVyLm1pZGRsZXdhcmVzIGFzIGFueSkuc3RhY2tbb3VySW5kZXhdO1xuICAgICAgICAgICAgICAoc2VydmVyLm1pZGRsZXdhcmVzIGFzIGFueSkuc3RhY2suc3BsaWNlKG91ckluZGV4LCAxKTtcbiAgICAgICAgICAgICAgKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrLnVuc2hpZnQob3VyTWlkZGxld2FyZSk7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgW0N1c3RvbSBQcm94eV0gTW92ZWQgbWlkZGxld2FyZSB0byBiZWdpbm5pbmcgb2Ygc3RhY2snKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIFtDdXN0b20gUHJveHldIEVycm9yIG1hbmlwdWxhdGluZyBzdGFjazonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIF0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICAgIC8vIE9ubHkgYWxpYXMgcmVhY3QtbmF0aXZlIGJhc2UgaW1wb3J0LCBzdWJwYXRocyBhcmUgaGFuZGxlZCBieSByZXNvbHZlIHBsdWdpblxuICAgICAgJ3JlYWN0LW5hdGl2ZSQnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvdXRpbHMvbW9ja3MvcmVhY3QtbmF0aXZlLXdlYi1wYXRjaGVkLnRzJyksXG4gICAgICAvLyBNb2NrIG5hdGl2ZSBtb2R1bGVzIHRoYXQgZG9uJ3QgZXhpc3QgaW4gd2ViXG4gICAgICAncmVhY3QtbmF0aXZlLXdlYi9MaWJyYXJpZXMvVXRpbGl0aWVzL2NvZGVnZW5OYXRpdmVDb21wb25lbnQnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvdXRpbHMvbW9ja3MvY29kZWdlbk5hdGl2ZUNvbXBvbmVudC50cycpLFxuICAgICAgJ3JlYWN0LW5hdGl2ZS9MaWJyYXJpZXMvVXRpbGl0aWVzL2NvZGVnZW5OYXRpdmVDb21wb25lbnQnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvdXRpbHMvbW9ja3MvY29kZWdlbk5hdGl2ZUNvbXBvbmVudC50cycpLFxuICAgICAgJ3JlYWN0LW5hdGl2ZS13ZWIvTGlicmFyaWVzL1V0aWxpdGllcy9jb2RlZ2VuTmF0aXZlQ29tbWFuZHMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvdXRpbHMvbW9ja3MvY29kZWdlbk5hdGl2ZUNvbW1hbmRzLnRzJyksXG4gICAgICAncmVhY3QtbmF0aXZlL0xpYnJhcmllcy9VdGlsaXRpZXMvY29kZWdlbk5hdGl2ZUNvbW1hbmRzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3V0aWxzL21vY2tzL2NvZGVnZW5OYXRpdmVDb21tYW5kcy50cycpLFxuICAgICAgLy8gTW9jayBUdXJib01vZHVsZVJlZ2lzdHJ5XG4gICAgICAncmVhY3QtbmF0aXZlL0xpYnJhcmllcy9UdXJib01vZHVsZS9UdXJib01vZHVsZVJlZ2lzdHJ5JzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3V0aWxzL21vY2tzL1R1cmJvTW9kdWxlUmVnaXN0cnkudHMnKSxcbiAgICAgICdyZWFjdC1uYXRpdmUtd2ViL0xpYnJhcmllcy9UdXJib01vZHVsZS9UdXJib01vZHVsZVJlZ2lzdHJ5JzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3V0aWxzL21vY2tzL1R1cmJvTW9kdWxlUmVnaXN0cnkudHMnKSxcbiAgICAgIC8vIE1vY2sgcmVhY3QtbmF0aXZlLXJlYW5pbWF0ZWQgZm9yIHdlYlxuICAgICAgJ3JlYWN0LW5hdGl2ZS1yZWFuaW1hdGVkJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3V0aWxzL21vY2tzL3JlYWN0LW5hdGl2ZS1yZWFuaW1hdGVkLnRzJyksXG4gICAgfSxcbiAgICAvLyBIYW5kbGUgbmF0aXZlIG1vZHVsZSBpbXBvcnRzXG4gICAgY29uZGl0aW9uczogWyd3ZWInLCAnYnJvd3NlcicsICdkZWZhdWx0J10sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDMwMDAsXG4gICAgb3BlbjogdHJ1ZSxcbiAgICAvLyBDdXN0b20gbWlkZGxld2FyZSB0byBoYW5kbGUgY2FzZS1zZW5zaXRpdmUgaGVhZGVyc1xuICAgIC8vIFRoaXMgd2lsbCBiZSBhZGRlZCB2aWEgY29uZmlndXJlU2VydmVyIGhvb2tcbiAgICBwcm94eToge1xuICAgICAgLy8gUHJveHkgQVBJIHJlcXVlc3RzIHRvIGF2b2lkIENPUlMgaXNzdWVzIGluIGRldmVsb3BtZW50XG4gICAgICAvLyBMb2dpbiBlbmRwb2ludCBub3cgdXNlcyBkaXJlY3QgYXhpb3MgKGJ5cGFzc2VzIHByb3h5KSAtIHNlZSBMb2dpbkFQSUNhbGxzLnRzXG4gICAgICAvLyBNYXRjaGVzIGFueSBwYXRoIHN0YXJ0aW5nIHdpdGggL1p5bGVtaW5pUGx1c0NvcmVVUkxBdXRoICh3aXRoIGFueSBzdWZmaXgpXG4gICAgICAnXi9aeWxlbWluaVBsdXNDb3JlVVJMQXV0aCc6ICh7XG4gICAgICAgIHRhcmdldDogJ2h0dHBzOi8venlsZW1pbmlwbHVzLmNvbScsIC8vIERlZmF1bHQsIGJ1dCByb3V0ZXIgd2lsbCBvdmVycmlkZVxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHNlY3VyZTogdHJ1ZSxcbiAgICAgICAgLy8gQnlwYXNzIHByb3h5IGZvciBMb2dpbiBlbmRwb2ludCAtIHdlJ2xsIGhhbmRsZSBpdCB3aXRoIGNhc2Utc2Vuc2l0aXZlIGhlYWRlcnNcbiAgICAgICAgYnlwYXNzOiBmdW5jdGlvbihyZXE6IGFueSwgcmVzOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgICAgIGlmIChyZXEubWV0aG9kID09PSAnUE9TVCcgJiYgcmVxLnVybD8uaW5jbHVkZXMoJy9hcGkvTG9naW4vTG9naW4nKSkge1xuICAgICAgICAgICAgLy8gUmV0dXJuIHRoZSByZXF1ZXN0IHBhdGggdG8gaGFuZGxlIGl0IG91cnNlbHZlc1xuICAgICAgICAgICAgLy8gVGhpcyB3aWxsIGJlIGhhbmRsZWQgYnkgY3VzdG9tIG1pZGRsZXdhcmUgaWYgd2UgYWRkIGl0IGJhY2tcbiAgICAgICAgICAgIC8vIEZvciBub3csIGxldCBwcm94eSBoYW5kbGUgaXQgYnV0IHdlJ2xsIGZpeCBoZWFkZXJzIGluIHByb3h5UmVxXG4gICAgICAgICAgICByZXR1cm4gbnVsbDsgLy8gQ29udGludWUgd2l0aCBwcm94eSwgYnV0IHdlJ2xsIGZpeCBoZWFkZXJzXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuICAgICAgICAvLyBDUklUSUNBTDogVXNlIHNlbGZIYW5kbGVSZXNwb25zZSB0byBoYXZlIG1vcmUgY29udHJvbCBvdmVyIGhlYWRlcnNcbiAgICAgICAgc2VsZkhhbmRsZVJlc3BvbnNlOiBmYWxzZSwgLy8gS2VlcCBmYWxzZSwgYnV0IHdlJ2xsIGhhbmRsZSBoZWFkZXJzIGluIHByb3h5UmVxXG4gICAgICAgIC8vIFVzZSByb3V0ZXIgZnVuY3Rpb24gdG8gZHluYW1pY2FsbHkgcm91dGUgYmFzZWQgb24gcmVxdWVzdCBwYXRoXG4gICAgICAgIC8vIFR5cGUgYXNzZXJ0aW9uIG5lZWRlZCBiZWNhdXNlIFZpdGUncyBQcm94eU9wdGlvbnMgdHlwZSBkb2Vzbid0IGluY2x1ZGUgcm91dGVyIGZyb20gaHR0cC1wcm94eS1taWRkbGV3YXJlXG4gICAgICAgIHJvdXRlcjogZnVuY3Rpb24ocmVxOiBhbnkpIHtcbiAgICAgICAgICBjb25zdCBwYXRoID0gcmVxLnVybCB8fCByZXEucGF0aCB8fCAnJztcbiAgICAgICAgICAvLyBDaGVjayBpZiBwYXRoIGNvbnRhaW5zIFdJTkRTUiB0byByb3V0ZSB0byB3aW5kc3IuaW5cbiAgICAgICAgICBpZiAocGF0aC5pbmNsdWRlcygnV0lORFNSJykgfHwgcGF0aC5pbmNsdWRlcygnd2luZHNyJykpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMDAgW1ZpdGUgUm91dGVyXSBSb3V0aW5nIHRvIHdpbmRzci5pbiBmb3IgcGF0aDonLCBwYXRoKTtcbiAgICAgICAgICAgIHJldHVybiAnaHR0cHM6Ly93aW5kc3IuaW4nO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDAwIFtWaXRlIFJvdXRlcl0gUm91dGluZyB0byB6eWxlbWluaXBsdXMuY29tIGZvciBwYXRoOicsIHBhdGgpO1xuICAgICAgICAgIHJldHVybiAnaHR0cHM6Ly96eWxlbWluaXBsdXMuY29tJztcbiAgICAgICAgfSxcbiAgICAgICAgLy8gUmV3cml0ZSB0aGUgcGF0aCAtIHJlbW92ZSB0aGUgcHJveHkgcHJlZml4IGFuZCBrZWVwIHRoZSByZXN0XG4gICAgICAgIHJld3JpdGU6IChwYXRoOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAvLyBwYXRoIHdpbGwgYmUgbGlrZTogL1p5bGVtaW5pUGx1c0NvcmVVUkxBdXRoV0lORFNSQlYxVjQvYXBpL0xvZ2luL0xvZ2luXG4gICAgICAgICAgLy8gV2UgbmVlZCB0byByZXdyaXRlIGl0IHRvOiAvWnlsZW1pbmlQbHVzQ29yZVVSTEF1dGhXSU5EU1JCVjFWNC9hcGkvTG9naW4vTG9naW5cbiAgICAgICAgICAvLyBBY3R1YWxseSwgd2Ugd2FudCB0byBrZWVwIGl0IGFzLWlzIHNpbmNlIHRoZSBmdWxsIHBhdGggaXMgbmVlZGVkXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQwMCBbVml0ZSBSZXdyaXRlXSBPcmlnaW5hbCBwYXRoOicsIHBhdGgpO1xuICAgICAgICAgIGNvbnN0IHJld3JpdHRlbiA9IHBhdGg7IC8vIEtlZXAgYXMtaXMgZm9yIG5vd1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMDAgW1ZpdGUgUmV3cml0ZV0gUmV3cml0dGVuIHBhdGg6JywgcmV3cml0dGVuKTtcbiAgICAgICAgICByZXR1cm4gcmV3cml0dGVuO1xuICAgICAgICB9LFxuICAgICAgICBjb25maWd1cmU6IChwcm94eTogYW55LCBfb3B0aW9uczogYW55KSA9PiB7XG4gICAgICAgICAgcHJveHkub24oJ2Vycm9yJywgKGVycjogYW55LCBfcmVxOiBhbnksIF9yZXM6IGFueSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIFtQcm94eV0gRXJyb3I6JywgZXJyKTtcbiAgICAgICAgICAgIGlmIChfcmVzICYmICFfcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgICAgIF9yZXMud3JpdGVIZWFkKDUwMCwgeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0pO1xuICAgICAgICAgICAgICBfcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnUHJveHkgZXJyb3InLCBtZXNzYWdlOiBlcnIubWVzc2FnZSB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gYXMgYW55KVxuICAgIH1cbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBvdXREaXI6ICdkaXN0JyxcbiAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgICdyZWFjdC12ZW5kb3InOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXG4gICAgICAgICAgJ3JlZHV4LXZlbmRvcic6IFsnQHJlZHV4anMvdG9vbGtpdCcsICdyZWFjdC1yZWR1eCcsICdyZWR1eC1wZXJzaXN0JywgJ3JlZHV4LXNhZ2EnXSxcbiAgICAgICAgICAndWktdmVuZG9yJzogWydAbXVpL21hdGVyaWFsJywgJ0BtdWkvaWNvbnMtbWF0ZXJpYWwnLCAncmVhY3QtbmF0aXZlLXdlYiddXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvbndhcm4od2FybmluZywgd2Fybikge1xuICAgICAgICAvLyBTdXBwcmVzcyB3YXJuaW5ncyBhYm91dCBjb2RlZ2VuTmF0aXZlQ29tcG9uZW50LCBjb2RlZ2VuTmF0aXZlQ29tbWFuZHMgYW5kIG90aGVyIG5hdGl2ZSBtb2R1bGVzXG4gICAgICAgIGlmIChcbiAgICAgICAgICAod2FybmluZy5jb2RlID09PSAnVU5SRVNPTFZFRF9JTVBPUlQnIHx8IHdhcm5pbmcuY29kZSA9PT0gJ01PRFVMRV9MRVZFTF9ESVJFQ1RJVkUnKSAmJlxuICAgICAgICAgICgod2FybmluZy5pZD8uaW5jbHVkZXMoJ2NvZGVnZW5OYXRpdmVDb21wb25lbnQnKSB8fCB3YXJuaW5nLm1lc3NhZ2U/LmluY2x1ZGVzKCdjb2RlZ2VuTmF0aXZlQ29tcG9uZW50JykpIHx8XG4gICAgICAgICAgICh3YXJuaW5nLmlkPy5pbmNsdWRlcygnY29kZWdlbk5hdGl2ZUNvbW1hbmRzJykgfHwgd2FybmluZy5tZXNzYWdlPy5pbmNsdWRlcygnY29kZWdlbk5hdGl2ZUNvbW1hbmRzJykpIHx8XG4gICAgICAgICAgICh3YXJuaW5nLmlkPy5pbmNsdWRlcygncmVhY3QtbmF0aXZlLXdlYi9MaWJyYXJpZXMnKSB8fCB3YXJuaW5nLm1lc3NhZ2U/LmluY2x1ZGVzKCdyZWFjdC1uYXRpdmUtd2ViL0xpYnJhcmllcycpKSB8fFxuICAgICAgICAgICAod2FybmluZy5pZD8uaW5jbHVkZXMoJ3JlYWN0LW5hdGl2ZS1yZWFuaW1hdGVkJykgfHwgd2FybmluZy5tZXNzYWdlPy5pbmNsdWRlcygncmVhY3QtbmF0aXZlLXJlYW5pbWF0ZWQnKSkpXG4gICAgICAgICkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB3YXJuKHdhcm5pbmcpO1xuICAgICAgfVxuICAgIH0sXG4gICAgY29tbW9uanNPcHRpb25zOiB7XG4gICAgICB0cmFuc2Zvcm1NaXhlZEVzTW9kdWxlczogdHJ1ZSxcbiAgICAgIGluY2x1ZGU6IFsvbm9kZV9tb2R1bGVzL11cbiAgICB9XG4gIH0sXG4gIGJhc2U6ICcvJyxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogWydyZWFjdC1uYXRpdmUtcmVhbmltYXRlZCcsICdyZWFjdC1uYXRpdmUnXSxcbiAgICBlc2J1aWxkT3B0aW9uczoge1xuICAgICAgLy8gRXhjbHVkZSByZWFjdC1uYXRpdmUtcmVhbmltYXRlZCBhbmQgcmVhY3QtbmF0aXZlIGZyb20gZXNidWlsZCBwcm9jZXNzaW5nXG4gICAgICBsb2FkZXI6IHtcbiAgICAgICAgJy5qcyc6ICdqc3gnLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufSk7XG5cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7O0FBQXFXLFNBQVMsb0JBQW9CO0FBQ2xZLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFDeEIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sV0FBVztBQUVsQixTQUFTLHFCQUFxQjtBQU5tTSxJQUFNLDJDQUEyQztBQVFsUixJQUFNLFlBQVksS0FBSyxRQUFRLGNBQWMsd0NBQWUsQ0FBQztBQUc3RCxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUE7QUFBQTtBQUFBLElBR1A7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLFNBQVM7QUFBQTtBQUFBLE1BQ1QsVUFBVSxJQUFJLFVBQVU7QUFFdEIsWUFBSSxRQUFRLElBQUksYUFBYSxpQkFBaUIsR0FBRyxTQUFTLGNBQWMsR0FBRztBQUN6RSxrQkFBUSxJQUFJLHVDQUF1QyxFQUFFLFNBQVMsUUFBUSxFQUFFO0FBQUEsUUFDMUU7QUFLQSxZQUFJLE9BQU8sZ0JBQWdCO0FBQ3pCLGlCQUFPLEtBQUssUUFBUSxXQUFXLCtDQUErQztBQUFBLFFBQ2hG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
