# Quick Debug Steps for 500 Error

## Step 1: Check Terminal Logs

1. **Find the terminal where you ran `npm run dev`**
   - This is separate from your browser
   - Should show: `VITE v5.x.x  ready in xxx ms`

2. **Try to login and watch the terminal**
   - You should see `🔀 [Proxy]` logs appear
   - If you DON'T see these logs, the proxy isn't matching the request

## Step 2: Check Browser Network Tab

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Try to login**
4. **Find the failed request**: `ZyleminiPlusCoreURLAuthWINDSRBV1V4/api/Login/Login`
5. **Click on it and check**:
   - **Request URL**: Should be `/ZyleminiPlusCoreURLAuthWINDSRBV1V4/api/Login/Login`
   - **Request Headers**: Should include `authheader`, `LoginId`, `Password`, etc.
   - **Response**: Check if there's any error message in the response body

## Step 3: Compare with React Native

The request should match React Native exactly:
- **URL**: `{BASE_URL}/api/Login/Login` where BASE_URL = `https://windsr.in/ZyleminiPlusCoreURLAuthWINDSRBV1V4`
- **Method**: POST
- **Body**: `null`
- **Headers**: All custom headers in the headers object

## What to Share

If you're still getting 500 error, share:
1. **Terminal logs** (the `🔀 [Proxy]` entries)
2. **Network tab screenshot** showing:
   - Request Headers
   - Response (even if empty)
3. **Any error message** from the server (if visible)


