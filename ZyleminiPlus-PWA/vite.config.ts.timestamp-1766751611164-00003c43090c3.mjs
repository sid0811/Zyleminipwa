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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxaeWxlbWluaVBsdXMyNDEyMjVcXFxcWnlsZW1pbmlQbHVzU291cmNlXFxcXFp5bGVtaW5pUGx1cy1QV0FcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFp5bGVtaW5pUGx1czI0MTIyNVxcXFxaeWxlbWluaVBsdXNTb3VyY2VcXFxcWnlsZW1pbmlQbHVzLVBXQVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovWnlsZW1pbmlQbHVzMjQxMjI1L1p5bGVtaW5pUGx1c1NvdXJjZS9aeWxlbWluaVBsdXMtUFdBL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBodHRwcyBmcm9tICdodHRwcyc7XG5pbXBvcnQgaHR0cCBmcm9tICdodHRwJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICd1cmwnO1xuXG5jb25zdCBfX2Rpcm5hbWUgPSBwYXRoLmRpcm5hbWUoZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpKTtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICAvLyBDUklUSUNBTDogcmVzb2x2ZS1uYXRpdmUtbW9kdWxlcyBtdXN0IGJlIGZpcnN0IHRvIGludGVyY2VwdCByZWFjdC1uYXRpdmUgaW1wb3J0c1xuICAgIC8vIFBsdWdpbiB0byBoYW5kbGUgbmF0aXZlIG1vZHVsZSBpbXBvcnRzXG4gICAge1xuICAgICAgbmFtZTogJ3Jlc29sdmUtbmF0aXZlLW1vZHVsZXMnLFxuICAgICAgZW5mb3JjZTogJ3ByZScsIC8vIFJ1biBiZWZvcmUgb3RoZXIgcGx1Z2luc1xuICAgICAgcmVzb2x2ZUlkKGlkLCBpbXBvcnRlcikge1xuICAgICAgICAvLyBEZWJ1ZyBsb2dnaW5nIGluIGRldmVsb3BtZW50XG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyAmJiBpZC5pbmNsdWRlcygncmVhY3QtbmF0aXZlJykpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgW3Jlc29sdmUtbmF0aXZlLW1vZHVsZXNdIFJlc29sdmluZzogJHtpZH0gZnJvbSAke2ltcG9ydGVyfWApO1xuICAgICAgICB9XG4gICAgICAgIC8vIENSSVRJQ0FMOiBIYW5kbGUgQUxMIHJlYWN0LW5hdGl2ZSBpbXBvcnRzIEJFRk9SRSB0aGV5IHJlYWNoIG5vZGVfbW9kdWxlc1xuICAgICAgICAvLyBUaGlzIHByZXZlbnRzIGVzYnVpbGQgZnJvbSB0cnlpbmcgdG8gcGFyc2UgRmxvdyBzeW50YXggaW4gcmVhY3QtbmF0aXZlIHBhY2thZ2VcbiAgICAgICAgXG4gICAgICAgIC8vIEhhbmRsZSByZWFjdC1uYXRpdmUgYmFzZSBpbXBvcnQgLSBNVVNUIGJlIGZpcnN0XG4gICAgICAgIGlmIChpZCA9PT0gJ3JlYWN0LW5hdGl2ZScpIHtcbiAgICAgICAgICByZXR1cm4gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3V0aWxzL21vY2tzL3JlYWN0LW5hdGl2ZS13ZWItcGF0Y2hlZC50cycpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBIYW5kbGUgc3VicGF0aCBpbXBvcnRzIGZyb20gcmVhY3QtbmF0aXZlXG4gICAgICAgIGlmIChpZC5zdGFydHNXaXRoKCdyZWFjdC1uYXRpdmUvJykpIHtcbiAgICAgICAgICAvLyBIYW5kbGUgY29kZWdlbk5hdGl2ZUNvbXBvbmVudCBzdWJwYXRoXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdMaWJyYXJpZXMvVXRpbGl0aWVzL2NvZGVnZW5OYXRpdmVDb21wb25lbnQnKSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy91dGlscy9tb2Nrcy9jb2RlZ2VuTmF0aXZlQ29tcG9uZW50LnRzJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIEhhbmRsZSBjb2RlZ2VuTmF0aXZlQ29tbWFuZHMgc3VicGF0aFxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnTGlicmFyaWVzL1V0aWxpdGllcy9jb2RlZ2VuTmF0aXZlQ29tbWFuZHMnKSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy91dGlscy9tb2Nrcy9jb2RlZ2VuTmF0aXZlQ29tbWFuZHMudHMnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gSGFuZGxlIFR1cmJvTW9kdWxlUmVnaXN0cnkgc3VicGF0aFxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnTGlicmFyaWVzL1R1cmJvTW9kdWxlL1R1cmJvTW9kdWxlUmVnaXN0cnknKSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy91dGlscy9tb2Nrcy9UdXJib01vZHVsZVJlZ2lzdHJ5LnRzJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIEZvciBvdGhlciBzdWJwYXRocywgdHJ5IHRvIHJlc29sdmUgZnJvbSByZWFjdC1uYXRpdmUtd2ViXG4gICAgICAgICAgLy8gRXh0cmFjdCB0aGUgc3VicGF0aFxuICAgICAgICAgIGNvbnN0IHN1YnBhdGggPSBpZC5yZXBsYWNlKCdyZWFjdC1uYXRpdmUvJywgJycpO1xuICAgICAgICAgIGNvbnN0IHJlYWN0TmF0aXZlV2ViUGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL25vZGVfbW9kdWxlcy9yZWFjdC1uYXRpdmUtd2ViL2Rpc3QnLCBzdWJwYXRoKTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgZmlsZSBleGlzdHMsIGlmIG5vdCwgdHJ5IHdpdGggLmpzIGV4dGVuc2lvblxuICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocmVhY3ROYXRpdmVXZWJQYXRoKSB8fCBmcy5leGlzdHNTeW5jKHJlYWN0TmF0aXZlV2ViUGF0aCArICcuanMnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gZnMuZXhpc3RzU3luYyhyZWFjdE5hdGl2ZVdlYlBhdGgpID8gcmVhY3ROYXRpdmVXZWJQYXRoIDogcmVhY3ROYXRpdmVXZWJQYXRoICsgJy5qcyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy8gRmFsbCB0aHJvdWdoIHRvIHJldHVybiBudWxsXG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIElmIHN1YnBhdGggZG9lc24ndCBleGlzdCBpbiByZWFjdC1uYXRpdmUtd2ViLCByZXR1cm4gdGhlIHBhdGNoZWQgdmVyc2lvblxuICAgICAgICAgIHJldHVybiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvdXRpbHMvbW9ja3MvcmVhY3QtbmF0aXZlLXdlYi1wYXRjaGVkLnRzJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIEhhbmRsZSBjb2RlZ2VuTmF0aXZlQ29tcG9uZW50IChjYXRjaCBhbnkgcmVtYWluaW5nIHBhdHRlcm5zKVxuICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2NvZGVnZW5OYXRpdmVDb21wb25lbnQnKSAmJiBpZC5pbmNsdWRlcygncmVhY3QtbmF0aXZlJykgJiYgIWlkLmluY2x1ZGVzKCdyZWFjdC1uYXRpdmUtd2ViJykpIHtcbiAgICAgICAgICByZXR1cm4gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3V0aWxzL21vY2tzL2NvZGVnZW5OYXRpdmVDb21wb25lbnQudHMnKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gSGFuZGxlIGNvZGVnZW5OYXRpdmVDb21tYW5kcyAoY2F0Y2ggYW55IHJlbWFpbmluZyBwYXR0ZXJucylcbiAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdjb2RlZ2VuTmF0aXZlQ29tbWFuZHMnKSAmJiBpZC5pbmNsdWRlcygncmVhY3QtbmF0aXZlJykgJiYgIWlkLmluY2x1ZGVzKCdyZWFjdC1uYXRpdmUtd2ViJykpIHtcbiAgICAgICAgICByZXR1cm4gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3V0aWxzL21vY2tzL2NvZGVnZW5OYXRpdmVDb21tYW5kcy50cycpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBIYW5kbGUgVHVyYm9Nb2R1bGVSZWdpc3RyeSAoY2F0Y2ggYW55IHJlbWFpbmluZyBwYXR0ZXJucylcbiAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdUdXJib01vZHVsZVJlZ2lzdHJ5JykgJiYgaWQuaW5jbHVkZXMoJ3JlYWN0LW5hdGl2ZScpICYmICFpZC5pbmNsdWRlcygncmVhY3QtbmF0aXZlLXdlYicpKSB7XG4gICAgICAgICAgcmV0dXJuIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy91dGlscy9tb2Nrcy9UdXJib01vZHVsZVJlZ2lzdHJ5LnRzJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIEhhbmRsZSByZWFjdC1uYXRpdmUtcmVhbmltYXRlZCAtIGNhdGNoIGFsbCBpbXBvcnQgcGF0aHNcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGlkID09PSAncmVhY3QtbmF0aXZlLXJlYW5pbWF0ZWQnIHx8IFxuICAgICAgICAgIGlkLnN0YXJ0c1dpdGgoJ3JlYWN0LW5hdGl2ZS1yZWFuaW1hdGVkLycpIHx8XG4gICAgICAgICAgaWQuaW5jbHVkZXMoJ3JlYWN0LW5hdGl2ZS1yZWFuaW1hdGVkL2xpYi9tb2R1bGUnKVxuICAgICAgICApIHtcbiAgICAgICAgICByZXR1cm4gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3V0aWxzL21vY2tzL3JlYWN0LW5hdGl2ZS1yZWFuaW1hdGVkLnRzJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIEV4cGxpY2l0bHkgcmVzb2x2ZSByZWFjdC1uYXRpdmUtd2ViIHRvIGl0cyBlbnRyeSBwb2ludFxuICAgICAgICBpZiAoaWQgPT09ICdyZWFjdC1uYXRpdmUtd2ViJykge1xuICAgICAgICAgIHJldHVybiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9ub2RlX21vZHVsZXMvcmVhY3QtbmF0aXZlLXdlYi9kaXN0L2luZGV4LmpzJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVhY3Qoe1xuICAgICAgLy8gRW5hYmxlIEpTWCBpbiBub2RlX21vZHVsZXMgKHJlYWN0LW5hdGl2ZS1yZWFuaW1hdGVkIGlzIG1vY2tlZCwgbm90IHByb2Nlc3NlZClcbiAgICAgIGluY2x1ZGU6IC9cXC4oanN4fHRzeHxqc3x0cykkLyxcbiAgICAgIGJhYmVsOiB7XG4gICAgICAgIHBsdWdpbnM6IFtdLFxuICAgICAgfSxcbiAgICB9KSxcbiAgICBWaXRlUFdBKHtcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ3Byb21wdCcsIC8vIENoYW5nZWQgdG8gcHJvbXB0IGZvciBpbW1lZGlhdGUgdXBkYXRlc1xuICAgICAgaW5jbHVkZUFzc2V0czogWydmYXZpY29uLmljbycsICdhcHBsZS10b3VjaC1pY29uLnBuZycsICdtYXNrLWljb24uc3ZnJ10sXG4gICAgICBtYW5pZmVzdDoge1xuICAgICAgICBuYW1lOiAnWnlsZW1pbmlQbHVzJyxcbiAgICAgICAgc2hvcnRfbmFtZTogJ1p5bGVtaW5pUGx1cycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnWnlsZW1pbmlQbHVzIFByb2dyZXNzaXZlIFdlYiBBcHAnLFxuICAgICAgICB0aGVtZV9jb2xvcjogJyNmZmZmZmYnLFxuICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnI2ZmZmZmZicsXG4gICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcbiAgICAgICAgb3JpZW50YXRpb246ICdwb3J0cmFpdCcsXG4gICAgICAgIHN0YXJ0X3VybDogJy8nLFxuICAgICAgICBpY29uczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJ3B3YS0xOTJ4MTkyLnBuZycsXG4gICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAncHdhLTUxMng1MTIucG5nJyxcbiAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICAgIHB1cnBvc2U6ICdhbnkgbWFza2FibGUnXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAgd29ya2JveDoge1xuICAgICAgICBnbG9iUGF0dGVybnM6IFsnKiovKi57anMsY3NzLGh0bWwsaWNvLHBuZyxzdmcsd29mZjJ9J10sXG4gICAgICAgIC8vIEZvcmNlIHVwZGF0ZSBzZXJ2aWNlIHdvcmtlciBvbiBldmVyeSBkZXBsb3ltZW50XG4gICAgICAgIHNraXBXYWl0aW5nOiB0cnVlLFxuICAgICAgICBjbGllbnRzQ2xhaW06IHRydWUsXG4gICAgICAgIC8vIFN1cHByZXNzIHdhcm5pbmdzIGluIGRldiBtb2RlXG4gICAgICAgIG1vZGU6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicgPyAncHJvZHVjdGlvbicgOiAnZGV2ZWxvcG1lbnQnLFxuICAgICAgICAvLyBEb24ndCBwcmVjYWNoZSBzb3VyY2UgZmlsZXMgaW4gZGV2IG1vZGVcbiAgICAgICAgbmF2aWdhdGVGYWxsYmFjazogJy9pbmRleC5odG1sJyxcbiAgICAgICAgbmF2aWdhdGVGYWxsYmFja0RlbnlsaXN0OiBbL15cXC9fLywgL1xcL1teLz9dK1xcLlteL10rJC9dLFxuICAgICAgICBydW50aW1lQ2FjaGluZzogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9eaHR0cHM6XFwvXFwvc3FsXFwuanNcXC5vcmdcXC8uKi9pLFxuICAgICAgICAgICAgaGFuZGxlcjogJ0NhY2hlRmlyc3QnLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdzcWxqcy1jYWNoZScsXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcbiAgICAgICAgICAgICAgICBtYXhFbnRyaWVzOiAxMCxcbiAgICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgKiAzNjUgLy8gMSB5ZWFyXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9eaHR0cHM6XFwvXFwvLipcXC4oPzpwbmd8anBnfGpwZWd8c3ZnfGdpZnx3ZWJwKS9pLFxuICAgICAgICAgICAgaGFuZGxlcjogJ0NhY2hlRmlyc3QnLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdpbWFnZXMtY2FjaGUnLFxuICAgICAgICAgICAgICBleHBpcmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgbWF4RW50cmllczogNTAsXG4gICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogMzAgLy8gMzAgZGF5c1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAgZGV2T3B0aW9uczoge1xuICAgICAgICBlbmFibGVkOiBmYWxzZSwgLy8gRGlzYWJsZSBzZXJ2aWNlIHdvcmtlciBpbiBkZXYgbW9kZSB0byBhdm9pZCBpbnRlcmZlcmVuY2VcbiAgICAgICAgdHlwZTogJ21vZHVsZSdcbiAgICAgIH1cbiAgICB9KSxcbiAgICAvLyBDdXN0b20gcGx1Z2luIHRvIGhhbmRsZSBjYXNlLXNlbnNpdGl2ZSBoZWFkZXJzIGZvciBMb2dpbiBBUElcbiAgICB7XG4gICAgICBuYW1lOiAnY2FzZS1zZW5zaXRpdmUtaGVhZGVycy1wcm94eScsXG4gICAgICBlbmZvcmNlOiAncHJlJywgLy8gQ1JJVElDQUw6IFJ1biBCRUZPUkUgb3RoZXIgcGx1Z2lucyAoaW5jbHVkaW5nIHByb3h5KVxuICAgICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgICAvLyBDUklUSUNBTDogVXNlIHVuc2hpZnQgdG8gcnVuIEJFRk9SRSBwcm94eSBtaWRkbGV3YXJlXG4gICAgICAgIC8vIFRoaXMgZW5zdXJlcyBvdXIgY3VzdG9tIGhhbmRsZXIgcnVucyBmaXJzdFxuICAgICAgICBjb25zdCBjdXN0b21IYW5kbGVyID0gYXN5bmMgKHJlcTogYW55LCByZXM6IGFueSwgbmV4dDogYW55KSA9PiB7XG4gICAgICAgICAgLy8gTG9nIEFMTCByZXF1ZXN0cyB0byB0aGlzIHBhdGggZm9yIGRlYnVnZ2luZ1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMjcgW0N1c3RvbSBQcm94eV0gUmVxdWVzdCByZWNlaXZlZDonLCByZXEubWV0aG9kLCByZXEudXJsKTtcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDI3IFtDdXN0b20gUHJveHldIEhlYWRlcnM6JywgSlNPTi5zdHJpbmdpZnkocmVxLmhlYWRlcnMsIG51bGwsIDIpKTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBPbmx5IGhhbmRsZSBQT1NUIHJlcXVlc3RzIHRvIExvZ2luIGVuZHBvaW50XG4gICAgICAgICAgaWYgKHJlcS5tZXRob2QgPT09ICdQT1NUJyAmJiByZXEudXJsPy5pbmNsdWRlcygnL2FwaS9Mb2dpbi9Mb2dpbicpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDI3IFtDdXN0b20gUHJveHldIFx1MjcwNSBNQVRDSEVEIC0gSGFuZGxpbmcgTG9naW4gcmVxdWVzdCcpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQyNyBbQ3VzdG9tIFByb3h5XSBcdTI3MDUgSGFuZGxpbmcgTG9naW4gcmVxdWVzdCB3aXRoIGNhc2Utc2Vuc2l0aXZlIGhlYWRlcnMnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMjcgW0N1c3RvbSBQcm94eV0gUmVxdWVzdCBVUkw6JywgcmVxLnVybCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDI3IFtDdXN0b20gUHJveHldIFJlcXVlc3QgbWV0aG9kOicsIHJlcS5tZXRob2QpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSByZXEudXJsLmluY2x1ZGVzKCdXSU5EU1InKSB8fCByZXEudXJsLmluY2x1ZGVzKCd3aW5kc3InKSBcbiAgICAgICAgICAgICAgPyAnd2luZHNyLmluJyBcbiAgICAgICAgICAgICAgOiAnenlsZW1pbmlwbHVzLmNvbSc7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFJlYWQgcmVxdWVzdCBib2R5XG4gICAgICAgICAgICBsZXQgYm9keSA9ICcnO1xuICAgICAgICAgICAgcmVxLm9uKCdkYXRhJywgKGNodW5rKSA9PiB7XG4gICAgICAgICAgICAgIGJvZHkgKz0gY2h1bmsudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXEub24oJ2VuZCcsICgpID0+IHtcbiAgICAgICAgICAgICAgLy8gTWFwIGhlYWRlcnMgdG8gcHJvcGVyIGNhc2UgKG1hdGNoaW5nIFBvc3RtYW4pXG4gICAgICAgICAgICAgIGNvbnN0IGhlYWRlckNhc2VNYXA6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7XG4gICAgICAgICAgICAgICAgJ2xvZ2luaWQnOiAnTG9naW5JZCcsXG4gICAgICAgICAgICAgICAgJ3Bhc3N3b3JkJzogJ1Bhc3N3b3JkJyxcbiAgICAgICAgICAgICAgICAnY2xpZW50Y29kZSc6ICdDbGllbnRDb2RlJyxcbiAgICAgICAgICAgICAgICAnZGV2aWNlaWQnOiAnRGV2aWNlSWQnLFxuICAgICAgICAgICAgICAgICdhdXRoaGVhZGVyJzogJ2F1dGhoZWFkZXInLFxuICAgICAgICAgICAgICAgICdmY210b2tlbic6ICdGY21Ub2tlbicsXG4gICAgICAgICAgICAgICAgJ2xvZ3VzZXJpZCc6ICdMb2dVc2VySWQnLFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gQnVpbGQgaGVhZGVycyB3aXRoIHByb3BlciBjYXNlXG4gICAgICAgICAgICAgIGNvbnN0IGhlYWRlcnM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcbiAgICAgICAgICAgICAgT2JqZWN0LmtleXMocmVxLmhlYWRlcnMpLmZvckVhY2goKGxvd2VyS2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSByZXEuaGVhZGVyc1tsb3dlcktleV07XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgIWxvd2VyS2V5LnN0YXJ0c1dpdGgoJzonKSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgaGVhZGVyTmFtZSA9IGhlYWRlckNhc2VNYXBbbG93ZXJLZXkudG9Mb3dlckNhc2UoKV0gfHwgbG93ZXJLZXk7XG4gICAgICAgICAgICAgICAgICBoZWFkZXJzW2hlYWRlck5hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIFNldCBIb3N0IGhlYWRlclxuICAgICAgICAgICAgICBoZWFkZXJzWydIb3N0J10gPSB0YXJnZXQ7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBNYWtlIHJlcXVlc3Qgd2l0aCBwcm9wZXIgaGVhZGVyIGNhc2VcbiAgICAgICAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChgaHR0cHM6Ly8ke3RhcmdldH0ke3JlcS51cmx9YCk7XG4gICAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgaG9zdG5hbWU6IHVybC5ob3N0bmFtZSxcbiAgICAgICAgICAgICAgICBwb3J0OiA0NDMsXG4gICAgICAgICAgICAgICAgcGF0aDogdXJsLnBhdGhuYW1lICsgdXJsLnNlYXJjaCxcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAuLi5oZWFkZXJzLFxuICAgICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGggfHwgMCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQyNyBbQ3VzdG9tIFByb3h5XSBSZXF1ZXN0IG9wdGlvbnM6JywgSlNPTi5zdHJpbmdpZnkob3B0aW9ucywgbnVsbCwgMikpO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDI3IFtDdXN0b20gUHJveHldIEhlYWRlcnMgd2l0aCBjYXNlOicsIEpTT04uc3RyaW5naWZ5KGhlYWRlcnMsIG51bGwsIDIpKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIGNvbnN0IHByb3h5UmVxID0gaHR0cHMucmVxdWVzdChvcHRpb25zLCAocHJveHlSZXMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzA1IFtDdXN0b20gUHJveHldIFJlc3BvbnNlIHN0YXR1czonLCBwcm94eVJlcy5zdGF0dXNDb2RlKTtcbiAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKHByb3h5UmVzLnN0YXR1c0NvZGUgfHwgMjAwLCBwcm94eVJlcy5oZWFkZXJzKTtcbiAgICAgICAgICAgICAgICBwcm94eVJlcy5waXBlKHJlcyk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgcHJveHlSZXEub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBbQ3VzdG9tIFByb3h5XSBFcnJvcjonLCBlcnIpO1xuICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcbiAgICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IGVyci5tZXNzYWdlIH0pKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBpZiAoYm9keSkge1xuICAgICAgICAgICAgICAgIHByb3h5UmVxLndyaXRlKGJvZHkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHByb3h5UmVxLmVuZCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyBDUklUSUNBTDogUmVnaXN0ZXIgbWlkZGxld2FyZSB0byBydW4gQkVGT1JFIHByb3h5XG4gICAgICAgIC8vIFJlZ2lzdGVyIHdpdGggZ2VuZXJpYyByb3V0ZSAtIGhhbmRsZXIgd2lsbCBjaGVjayBmb3IgTG9naW4gZW5kcG9pbnQgaW5zaWRlXG4gICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMjcgW0N1c3RvbSBQcm94eV0gUmVnaXN0ZXJpbmcgbWlkZGxld2FyZS4uLicpO1xuICAgICAgICBcbiAgICAgICAgLy8gUmVnaXN0ZXIgd2l0aCBnZW5lcmljIHJvdXRlIHBhdHRlcm4gdGhhdCBtYXRjaGVzIGFsbCAvWnlsZW1pbmlQbHVzQ29yZVVSTEF1dGggcmVxdWVzdHNcbiAgICAgICAgLy8gVGhlIGhhbmRsZXIgd2lsbCBjaGVjayBpZiBpdCdzIGEgTG9naW4gcmVxdWVzdCBhbmQgaGFuZGxlIGl0LCBvdGhlcndpc2UgY2FsbCBuZXh0KClcbiAgICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL1p5bGVtaW5pUGx1c0NvcmVVUkxBdXRoJywgY3VzdG9tSGFuZGxlcik7XG4gICAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgW0N1c3RvbSBQcm94eV0gTWlkZGxld2FyZSByZWdpc3RlcmVkIGZvciAvWnlsZW1pbmlQbHVzQ29yZVVSTEF1dGgnKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEFsc28gdHJ5IHRvIGVuc3VyZSBpdCBydW5zIGJlZm9yZSBwcm94eSBieSBtYW5pcHVsYXRpbmcgc3RhY2tcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoc2VydmVyLm1pZGRsZXdhcmVzICYmIChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjayAmJiBBcnJheS5pc0FycmF5KChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjaykpIHtcbiAgICAgICAgICAgIC8vIEZpbmQgb3VyIG1pZGRsZXdhcmUgYW5kIHByb3h5IG1pZGRsZXdhcmVcbiAgICAgICAgICAgIGNvbnN0IG91ckluZGV4ID0gKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrLmZpbmRJbmRleCgobTogYW55KSA9PiBcbiAgICAgICAgICAgICAgbS5oYW5kbGUgPT09IGN1c3RvbUhhbmRsZXJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCBwcm94eUluZGV4ID0gKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrLmZpbmRJbmRleCgobTogYW55KSA9PiBcbiAgICAgICAgICAgICAgbS5yb3V0ZSAmJiB0eXBlb2YgbS5yb3V0ZSA9PT0gJ3N0cmluZycgJiYgbS5yb3V0ZS5pbmNsdWRlcygnWnlsZW1pbmlQbHVzQ29yZVVSTEF1dGgnKSAmJiBtLmhhbmRsZSAhPT0gY3VzdG9tSGFuZGxlclxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQyNyBbQ3VzdG9tIFByb3h5XSBPdXIgbWlkZGxld2FyZSBpbmRleDonLCBvdXJJbmRleCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDI3IFtDdXN0b20gUHJveHldIFByb3h5IG1pZGRsZXdhcmUgaW5kZXg6JywgcHJveHlJbmRleCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIElmIHByb3h5IGlzIGJlZm9yZSB1cywgbW92ZSB1cyBiZWZvcmUgcHJveHlcbiAgICAgICAgICAgIGlmIChwcm94eUluZGV4ID4gLTEgJiYgb3VySW5kZXggPiAtMSAmJiBvdXJJbmRleCA+IHByb3h5SW5kZXgpIHtcbiAgICAgICAgICAgICAgY29uc3Qgb3VyTWlkZGxld2FyZSA9IChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFja1tvdXJJbmRleF07XG4gICAgICAgICAgICAgIChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjay5zcGxpY2Uob3VySW5kZXgsIDEpO1xuICAgICAgICAgICAgICAoc2VydmVyLm1pZGRsZXdhcmVzIGFzIGFueSkuc3RhY2suc3BsaWNlKHByb3h5SW5kZXgsIDAsIG91ck1pZGRsZXdhcmUpO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzA1IFtDdXN0b20gUHJveHldIE1vdmVkIG1pZGRsZXdhcmUgYmVmb3JlIHByb3h5Jyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG91ckluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgLy8gTW92ZSB0byBiZWdpbm5pbmcgaWYgbm90IGFscmVhZHkgdGhlcmVcbiAgICAgICAgICAgICAgY29uc3Qgb3VyTWlkZGxld2FyZSA9IChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFja1tvdXJJbmRleF07XG4gICAgICAgICAgICAgIChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjay5zcGxpY2Uob3VySW5kZXgsIDEpO1xuICAgICAgICAgICAgICAoc2VydmVyLm1pZGRsZXdhcmVzIGFzIGFueSkuc3RhY2sudW5zaGlmdChvdXJNaWRkbGV3YXJlKTtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBbQ3VzdG9tIFByb3h5XSBNb3ZlZCBtaWRkbGV3YXJlIHRvIGJlZ2lubmluZyBvZiBzdGFjaycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgW0N1c3RvbSBQcm94eV0gRXJyb3IgbWFuaXB1bGF0aW5nIHN0YWNrOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgICAgLy8gT25seSBhbGlhcyByZWFjdC1uYXRpdmUgYmFzZSBpbXBvcnQsIHN1YnBhdGhzIGFyZSBoYW5kbGVkIGJ5IHJlc29sdmUgcGx1Z2luXG4gICAgICAncmVhY3QtbmF0aXZlJCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy91dGlscy9tb2Nrcy9yZWFjdC1uYXRpdmUtd2ViLXBhdGNoZWQudHMnKSxcbiAgICAgIC8vIE1vY2sgbmF0aXZlIG1vZHVsZXMgdGhhdCBkb24ndCBleGlzdCBpbiB3ZWJcbiAgICAgICdyZWFjdC1uYXRpdmUtd2ViL0xpYnJhcmllcy9VdGlsaXRpZXMvY29kZWdlbk5hdGl2ZUNvbXBvbmVudCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy91dGlscy9tb2Nrcy9jb2RlZ2VuTmF0aXZlQ29tcG9uZW50LnRzJyksXG4gICAgICAncmVhY3QtbmF0aXZlL0xpYnJhcmllcy9VdGlsaXRpZXMvY29kZWdlbk5hdGl2ZUNvbXBvbmVudCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy91dGlscy9tb2Nrcy9jb2RlZ2VuTmF0aXZlQ29tcG9uZW50LnRzJyksXG4gICAgICAncmVhY3QtbmF0aXZlLXdlYi9MaWJyYXJpZXMvVXRpbGl0aWVzL2NvZGVnZW5OYXRpdmVDb21tYW5kcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy91dGlscy9tb2Nrcy9jb2RlZ2VuTmF0aXZlQ29tbWFuZHMudHMnKSxcbiAgICAgICdyZWFjdC1uYXRpdmUvTGlicmFyaWVzL1V0aWxpdGllcy9jb2RlZ2VuTmF0aXZlQ29tbWFuZHMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvdXRpbHMvbW9ja3MvY29kZWdlbk5hdGl2ZUNvbW1hbmRzLnRzJyksXG4gICAgICAvLyBNb2NrIFR1cmJvTW9kdWxlUmVnaXN0cnlcbiAgICAgICdyZWFjdC1uYXRpdmUvTGlicmFyaWVzL1R1cmJvTW9kdWxlL1R1cmJvTW9kdWxlUmVnaXN0cnknOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvdXRpbHMvbW9ja3MvVHVyYm9Nb2R1bGVSZWdpc3RyeS50cycpLFxuICAgICAgJ3JlYWN0LW5hdGl2ZS13ZWIvTGlicmFyaWVzL1R1cmJvTW9kdWxlL1R1cmJvTW9kdWxlUmVnaXN0cnknOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvdXRpbHMvbW9ja3MvVHVyYm9Nb2R1bGVSZWdpc3RyeS50cycpLFxuICAgICAgLy8gTW9jayByZWFjdC1uYXRpdmUtcmVhbmltYXRlZCBmb3Igd2ViXG4gICAgICAncmVhY3QtbmF0aXZlLXJlYW5pbWF0ZWQnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvdXRpbHMvbW9ja3MvcmVhY3QtbmF0aXZlLXJlYW5pbWF0ZWQudHMnKSxcbiAgICB9LFxuICAgIC8vIEhhbmRsZSBuYXRpdmUgbW9kdWxlIGltcG9ydHNcbiAgICBjb25kaXRpb25zOiBbJ3dlYicsICdicm93c2VyJywgJ2RlZmF1bHQnXSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogMzAwMCxcbiAgICBvcGVuOiB0cnVlLFxuICAgIC8vIEN1c3RvbSBtaWRkbGV3YXJlIHRvIGhhbmRsZSBjYXNlLXNlbnNpdGl2ZSBoZWFkZXJzXG4gICAgLy8gVGhpcyB3aWxsIGJlIGFkZGVkIHZpYSBjb25maWd1cmVTZXJ2ZXIgaG9va1xuICAgIHByb3h5OiB7XG4gICAgICAvLyBQcm94eSBBUEkgcmVxdWVzdHMgdG8gYXZvaWQgQ09SUyBpc3N1ZXMgaW4gZGV2ZWxvcG1lbnRcbiAgICAgIC8vIExvZ2luIGVuZHBvaW50IG5vdyB1c2VzIGRpcmVjdCBheGlvcyAoYnlwYXNzZXMgcHJveHkpIC0gc2VlIExvZ2luQVBJQ2FsbHMudHNcbiAgICAgIC8vIE1hdGNoZXMgYW55IHBhdGggc3RhcnRpbmcgd2l0aCAvWnlsZW1pbmlQbHVzQ29yZVVSTEF1dGggKHdpdGggYW55IHN1ZmZpeClcbiAgICAgICdeL1p5bGVtaW5pUGx1c0NvcmVVUkxBdXRoJzogKHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly96eWxlbWluaXBsdXMuY29tJywgLy8gRGVmYXVsdCwgYnV0IHJvdXRlciB3aWxsIG92ZXJyaWRlXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgc2VjdXJlOiB0cnVlLFxuICAgICAgICAvLyBCeXBhc3MgcHJveHkgZm9yIExvZ2luIGVuZHBvaW50IC0gd2UnbGwgaGFuZGxlIGl0IHdpdGggY2FzZS1zZW5zaXRpdmUgaGVhZGVyc1xuICAgICAgICBieXBhc3M6IGZ1bmN0aW9uKHJlcTogYW55LCByZXM6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICAgICAgaWYgKHJlcS5tZXRob2QgPT09ICdQT1NUJyAmJiByZXEudXJsPy5pbmNsdWRlcygnL2FwaS9Mb2dpbi9Mb2dpbicpKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm4gdGhlIHJlcXVlc3QgcGF0aCB0byBoYW5kbGUgaXQgb3Vyc2VsdmVzXG4gICAgICAgICAgICAvLyBUaGlzIHdpbGwgYmUgaGFuZGxlZCBieSBjdXN0b20gbWlkZGxld2FyZSBpZiB3ZSBhZGQgaXQgYmFja1xuICAgICAgICAgICAgLy8gRm9yIG5vdywgbGV0IHByb3h5IGhhbmRsZSBpdCBidXQgd2UnbGwgZml4IGhlYWRlcnMgaW4gcHJveHlSZXFcbiAgICAgICAgICAgIHJldHVybiBudWxsOyAvLyBDb250aW51ZSB3aXRoIHByb3h5LCBidXQgd2UnbGwgZml4IGhlYWRlcnNcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIENSSVRJQ0FMOiBVc2Ugc2VsZkhhbmRsZVJlc3BvbnNlIHRvIGhhdmUgbW9yZSBjb250cm9sIG92ZXIgaGVhZGVyc1xuICAgICAgICBzZWxmSGFuZGxlUmVzcG9uc2U6IGZhbHNlLCAvLyBLZWVwIGZhbHNlLCBidXQgd2UnbGwgaGFuZGxlIGhlYWRlcnMgaW4gcHJveHlSZXFcbiAgICAgICAgLy8gVXNlIHJvdXRlciBmdW5jdGlvbiB0byBkeW5hbWljYWxseSByb3V0ZSBiYXNlZCBvbiByZXF1ZXN0IHBhdGhcbiAgICAgICAgLy8gVHlwZSBhc3NlcnRpb24gbmVlZGVkIGJlY2F1c2UgVml0ZSdzIFByb3h5T3B0aW9ucyB0eXBlIGRvZXNuJ3QgaW5jbHVkZSByb3V0ZXIgZnJvbSBodHRwLXByb3h5LW1pZGRsZXdhcmVcbiAgICAgICAgcm91dGVyOiBmdW5jdGlvbihyZXE6IGFueSkge1xuICAgICAgICAgIGNvbnN0IHBhdGggPSByZXEudXJsIHx8IHJlcS5wYXRoIHx8ICcnO1xuICAgICAgICAgIC8vIENoZWNrIGlmIHBhdGggY29udGFpbnMgV0lORFNSIHRvIHJvdXRlIHRvIHdpbmRzci5pblxuICAgICAgICAgIGlmIChwYXRoLmluY2x1ZGVzKCdXSU5EU1InKSB8fCBwYXRoLmluY2x1ZGVzKCd3aW5kc3InKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQwMCBbVml0ZSBSb3V0ZXJdIFJvdXRpbmcgdG8gd2luZHNyLmluIGZvciBwYXRoOicsIHBhdGgpO1xuICAgICAgICAgICAgcmV0dXJuICdodHRwczovL3dpbmRzci5pbic7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMDAgW1ZpdGUgUm91dGVyXSBSb3V0aW5nIHRvIHp5bGVtaW5pcGx1cy5jb20gZm9yIHBhdGg6JywgcGF0aCk7XG4gICAgICAgICAgcmV0dXJuICdodHRwczovL3p5bGVtaW5pcGx1cy5jb20nO1xuICAgICAgICB9LFxuICAgICAgICAvLyBSZXdyaXRlIHRoZSBwYXRoIC0gcmVtb3ZlIHRoZSBwcm94eSBwcmVmaXggYW5kIGtlZXAgdGhlIHJlc3RcbiAgICAgICAgcmV3cml0ZTogKHBhdGg6IHN0cmluZykgPT4ge1xuICAgICAgICAgIC8vIHBhdGggd2lsbCBiZSBsaWtlOiAvWnlsZW1pbmlQbHVzQ29yZVVSTEF1dGhXSU5EU1JCVjFWNC9hcGkvTG9naW4vTG9naW5cbiAgICAgICAgICAvLyBXZSBuZWVkIHRvIHJld3JpdGUgaXQgdG86IC9aeWxlbWluaVBsdXNDb3JlVVJMQXV0aFdJTkRTUkJWMVY0L2FwaS9Mb2dpbi9Mb2dpblxuICAgICAgICAgIC8vIEFjdHVhbGx5LCB3ZSB3YW50IHRvIGtlZXAgaXQgYXMtaXMgc2luY2UgdGhlIGZ1bGwgcGF0aCBpcyBuZWVkZWRcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDAwIFtWaXRlIFJld3JpdGVdIE9yaWdpbmFsIHBhdGg6JywgcGF0aCk7XG4gICAgICAgICAgY29uc3QgcmV3cml0dGVuID0gcGF0aDsgLy8gS2VlcCBhcy1pcyBmb3Igbm93XG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQwMCBbVml0ZSBSZXdyaXRlXSBSZXdyaXR0ZW4gcGF0aDonLCByZXdyaXR0ZW4pO1xuICAgICAgICAgIHJldHVybiByZXdyaXR0ZW47XG4gICAgICAgIH0sXG4gICAgICAgIGNvbmZpZ3VyZTogKHByb3h5OiBhbnksIF9vcHRpb25zOiBhbnkpID0+IHtcbiAgICAgICAgICBwcm94eS5vbignZXJyb3InLCAoZXJyOiBhbnksIF9yZXE6IGFueSwgX3JlczogYW55KSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgW1Byb3h5XSBFcnJvcjonLCBlcnIpO1xuICAgICAgICAgICAgaWYgKF9yZXMgJiYgIV9yZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICAgICAgX3Jlcy53cml0ZUhlYWQoNTAwLCB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSk7XG4gICAgICAgICAgICAgIF9yZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdQcm94eSBlcnJvcicsIG1lc3NhZ2U6IGVyci5tZXNzYWdlIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBhcyBhbnkpXG4gICAgfVxuICB9LFxuICBidWlsZDoge1xuICAgIG91dERpcjogJ2Rpc3QnLFxuICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgJ3JlYWN0LXZlbmRvcic6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICAncmVkdXgtdmVuZG9yJzogWydAcmVkdXhqcy90b29sa2l0JywgJ3JlYWN0LXJlZHV4JywgJ3JlZHV4LXBlcnNpc3QnLCAncmVkdXgtc2FnYSddLFxuICAgICAgICAgICd1aS12ZW5kb3InOiBbJ0BtdWkvbWF0ZXJpYWwnLCAnQG11aS9pY29ucy1tYXRlcmlhbCcsICdyZWFjdC1uYXRpdmUtd2ViJ11cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9ud2Fybih3YXJuaW5nLCB3YXJuKSB7XG4gICAgICAgIC8vIFN1cHByZXNzIHdhcm5pbmdzIGFib3V0IGNvZGVnZW5OYXRpdmVDb21wb25lbnQsIGNvZGVnZW5OYXRpdmVDb21tYW5kcyBhbmQgb3RoZXIgbmF0aXZlIG1vZHVsZXNcbiAgICAgICAgaWYgKFxuICAgICAgICAgICh3YXJuaW5nLmNvZGUgPT09ICdVTlJFU09MVkVEX0lNUE9SVCcgfHwgd2FybmluZy5jb2RlID09PSAnTU9EVUxFX0xFVkVMX0RJUkVDVElWRScpICYmXG4gICAgICAgICAgKCh3YXJuaW5nLmlkPy5pbmNsdWRlcygnY29kZWdlbk5hdGl2ZUNvbXBvbmVudCcpIHx8IHdhcm5pbmcubWVzc2FnZT8uaW5jbHVkZXMoJ2NvZGVnZW5OYXRpdmVDb21wb25lbnQnKSkgfHxcbiAgICAgICAgICAgKHdhcm5pbmcuaWQ/LmluY2x1ZGVzKCdjb2RlZ2VuTmF0aXZlQ29tbWFuZHMnKSB8fCB3YXJuaW5nLm1lc3NhZ2U/LmluY2x1ZGVzKCdjb2RlZ2VuTmF0aXZlQ29tbWFuZHMnKSkgfHxcbiAgICAgICAgICAgKHdhcm5pbmcuaWQ/LmluY2x1ZGVzKCdyZWFjdC1uYXRpdmUtd2ViL0xpYnJhcmllcycpIHx8IHdhcm5pbmcubWVzc2FnZT8uaW5jbHVkZXMoJ3JlYWN0LW5hdGl2ZS13ZWIvTGlicmFyaWVzJykpIHx8XG4gICAgICAgICAgICh3YXJuaW5nLmlkPy5pbmNsdWRlcygncmVhY3QtbmF0aXZlLXJlYW5pbWF0ZWQnKSB8fCB3YXJuaW5nLm1lc3NhZ2U/LmluY2x1ZGVzKCdyZWFjdC1uYXRpdmUtcmVhbmltYXRlZCcpKSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHdhcm4od2FybmluZyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBjb21tb25qc09wdGlvbnM6IHtcbiAgICAgIHRyYW5zZm9ybU1peGVkRXNNb2R1bGVzOiB0cnVlLFxuICAgICAgaW5jbHVkZTogWy9ub2RlX21vZHVsZXMvXVxuICAgIH1cbiAgfSxcbiAgYmFzZTogJy8nLFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ3JlYWN0LW5hdGl2ZS1yZWFuaW1hdGVkJywgJ3JlYWN0LW5hdGl2ZSddLFxuICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICAvLyBFeGNsdWRlIHJlYWN0LW5hdGl2ZS1yZWFuaW1hdGVkIGFuZCByZWFjdC1uYXRpdmUgZnJvbSBlc2J1aWxkIHByb2Nlc3NpbmdcbiAgICAgIGxvYWRlcjoge1xuICAgICAgICAnLmpzJzogJ2pzeCcsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KTtcblxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7QUFBcVcsU0FBUyxvQkFBb0I7QUFDbFksT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUN4QixPQUFPLFVBQVU7QUFDakIsT0FBTyxXQUFXO0FBRWxCLFNBQVMscUJBQXFCO0FBTm1NLElBQU0sMkNBQTJDO0FBUWxSLElBQU0sWUFBWSxLQUFLLFFBQVEsY0FBYyx3Q0FBZSxDQUFDO0FBRzdELElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQTtBQUFBO0FBQUEsSUFHUDtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sU0FBUztBQUFBO0FBQUEsTUFDVCxVQUFVLElBQUksVUFBVTtBQUV0QixZQUFJLFFBQVEsSUFBSSxhQUFhLGlCQUFpQixHQUFHLFNBQVMsY0FBYyxHQUFHO0FBQ3pFLGtCQUFRLElBQUksdUNBQXVDLEVBQUUsU0FBUyxRQUFRLEVBQUU7QUFBQSxRQUMxRTtBQUtBLFlBQUksT0FBTyxnQkFBZ0I7QUFDekIsaUJBQU8sS0FBSyxRQUFRLFdBQVcsK0NBQStDO0FBQUEsUUFDaEY7QUFHQSxZQUFJLEdBQUcsV0FBVyxlQUFlLEdBQUc7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
