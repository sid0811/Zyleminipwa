# Debug Guide - How to See Proxy Logs

## Where to Find Proxy Logs

The proxy logs (`🔀 [Proxy]`) appear in the **Vite dev server terminal**, NOT in the browser console.

### Steps to See Proxy Logs:

1. **Find the Terminal Running Vite**
   - Look for the terminal window where you ran `npm run dev`
   - This is usually a separate terminal/command prompt window
   - It should show something like: `VITE v5.x.x  ready in xxx ms`

2. **Check Terminal Output**
   - When you try to login, you should see logs like:
     ```
     🔀 [Vite Router] Routing to windsr.in for path: /ZyleminiPlusCoreURLAuthWINDSRBV1V4/api/Login/Login
     🔀 [Vite Rewrite] Original path: /ZyleminiPlusCoreURLAuthWINDSRBV1V4/api/Login/Login
     🔀 [Proxy] Request Details:
        Original path: ...
        Target host: windsr.in
        Full target URL: https://windsr.in/ZyleminiPlusCoreURLAuthWINDSRBV1V4/api/Login/Login
        Headers being forwarded: ...
     ✅ [Proxy] Response received:
        Status: 500
     ```

3. **If You Don't See Terminal Logs**
   - Make sure the Vite dev server is running
   - Restart the dev server: Stop (Ctrl+C) and run `npm run dev` again
   - The logs should appear immediately when you try to login

## Browser DevTools Network Tab

You can also use the browser's Network tab to see the actual request:

1. **Open DevTools**
   - Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Go to the **Network** tab

2. **Try to Login**
   - Enter credentials and click login
   - Look for the request: `ZyleminiPlusCoreURLAuthWINDSRBV1V4/api/Login/Login`

3. **Inspect the Request**
   - Click on the request
   - Check:
     - **Headers** tab: See all request headers
     - **Payload** tab: See request body
     - **Response** tab: See server response (even if 500 error)
     - **Preview** tab: See formatted response

4. **Check Response Details**
   - Even if status is 500, the Response tab might show error details
   - Look for any error message from the server

## Enable Vite Debug Mode

To see more detailed Vite logs, you can enable debug mode:

1. **Set Environment Variable**
   ```bash
   # Windows PowerShell
   $env:DEBUG="vite:*"
   npm run dev
   
   # Windows CMD
   set DEBUG=vite:*
   npm run dev
   
   # Linux/Mac
   DEBUG=vite:* npm run dev
   ```

2. **Or Add to package.json**
   - Modify the `dev` script to include debug flag

## What to Look For

### In Terminal (Vite Server):
- `🔀 [Proxy]` logs showing what's being forwarded
- The exact URL being sent to the server
- All headers being forwarded
- Server response status

### In Browser Network Tab:
- Request URL (should be relative: `/ZyleminiPlusCoreURLAuthWINDSRBV1V4/api/Login/Login`)
- Request Headers (should include `authheader`, `LoginId`, `Password`, etc.)
- Response Status (500)
- Response Body (might contain error details)

## Common Issues

1. **No Proxy Logs in Terminal**
   - Restart Vite dev server
   - Check if proxy config is correct in `vite.config.ts`

2. **500 Error with Empty Response**
   - Check server-side logs if you have access
   - Verify request format matches React Native exactly
   - Check if server expects different headers or body format


