# Debug Login Request - 500 Error Analysis

## Current Request Flow

### 1st API Call (✅ SUCCESS)
- **URL**: `https://windsr.in/ZyleminiPlusCoreURLAuth/api/Login/AuthLogin`
- **Method**: POST
- **Headers**: LoginId, Password, ClientCode, DeviceId, FcmToken, AppApiVersion
- **Response**: 200 OK
- **Token Received**: ✅ YES (length: 192)

### 2nd API Call (❌ 500 ERROR)
- **Expected URL**: `https://windsr.in/ZyleminiPlusCoreURLAuthWINDSRBV1V4/api/Login/Login`
- **Actual URL (via proxy)**: `http://localhost:3000/ZyleminiPlusCoreURLAuthWINDSRBV1V4/api/Login/Login`
- **Method**: POST
- **Headers Being Sent**:
  ```json
  {
    "LoginId": "13:EM006",
    "Password": "Sapl@2021",
    "ClientCode": "WINDSRBV1",
    "DeviceId": "web_geg73rq2rokbewodb33upp",
    "authheader": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "FcmToken": "web_push_token_placeholder"
  }
  ```
- **Response**: 500 Internal Server Error

## Issues Identified

1. **Proxy Path Rewriting**: The proxy might not be correctly rewriting the path when forwarding to the server
2. **Header Forwarding**: Headers might not be forwarded correctly through the proxy
3. **Request Body**: Sending `null` as body - server might expect empty object `{}` or no body

## Next Steps

1. Add detailed proxy logging to see what's actually being sent to the server
2. Check if headers are being forwarded correctly
3. Verify the request path is correct on the server side
4. Compare with React Native request format


