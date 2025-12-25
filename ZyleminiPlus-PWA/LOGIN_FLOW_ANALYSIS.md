# Login Flow Analysis - React Native vs PWA

## Complete Login Flow from React Native

### Step-by-Step Flow

#### 1. User Enters Credentials
**File**: `src/screens/Login/Login.tsx` (RN) / `ZyleminiPlus-PWA/src/screens/Login/Login.tsx` (PWA)
- User enters: `user`, `password`, `SCode` (Security Code)
- Clicks Login button
- Calls `verifyLogin()`

#### 2. verifyLogin() Function
**Location**: Login screen component
- Checks network connectivity
- Gets `deviceID` from `getDeviceID()`
- Gets `FcmToken` from `requestUserPermission()`
- Calls `createTables()` to ensure DB tables exist
- Calls `doAuth()` from `useAuthentication` hook

#### 3. doAuth() Function - Main Authentication Flow
**File**: `src/hooks/useAuthentication.ts`

**API Call Sequence:**

##### **1st API Call: AuthApi.postAuthApi()**
- **File**: `src/api/AuthApiCall.ts`
- **Client**: `createAuthApiClient()` from `src/api/Auth.ts`
- **Base URL**: Static `AUTH_ENDPOINTS.AUTH_URL` = `https://zyleminiplus.com/ZyleminiPlusCoreURLAuth/api/Login/AuthLogin`
- **Headers**: 
  ```javascript
  {
    LoginId: user,
    Password: password,
    ClientCode: SCode,
    DeviceId: deviceID,
    FcmToken: FcmToken,
    AppApiVersion: 'V4'
  }
  ```
- **Purpose**: Initial authentication, gets API URL and version info
- **Response**: 
  - `res.data.Token` - Used in next API call
  - `res.data.ApiURL` - **CRITICAL**: Dynamic backend URL (e.g., `https://windsr.in/ZyleminiPlusCoreURLAuthWINDSRBV1V4`)
  - `res.data.ApiVersion` - API version
  - `res.data.AppendVersion` - Append version

##### **versionChecking() Function**
- **File**: `src/hooks/utilHooks.ts`
- **Action**: 
  - **Sets `BASE_URL` in storage**: `cacheStorage.set(UserPreferenceKeys.BASE_URL, res?.data?.ApiURL)`
  - **Sets Redux state**: `setClientBasedURL(res?.data?.ApiURL)`
  - **Stores API versions** in Redux
- **CRITICAL**: This is where the dynamic backend URL is stored and will be used for all subsequent API calls

##### **2nd API Call: Apis.postAuthLogin()**
- **File**: `src/api/LoginAPICalls.ts`
- **Client**: `createApiClient()` from `src/api/Client.ts`
- **Base URL**: **Dynamic** - Reads from `cacheStorage.getString(UserPreferenceKeys.BASE_URL)` (set in step 1)
- **Endpoint**: `AUTH_ENDPOINTS.LOGIN_EP` = `/api/Login/Login`
- **Full URL**: `{BASE_URL}/api/Login/Login` (e.g., `https://windsr.in/ZyleminiPlusCoreURLAuthWINDSRBV1V4/api/Login/Login`)
- **Headers**:
  ```javascript
  {
    LoginId: user,
    Password: password,
    ClientCode: SCode,
    DeviceId: deviceID,
    authheader: res?.data?.Token, // From 1st API
    FcmToken: FcmToken
  }
  ```
- **Response**: 
  - `takeresp.Token` - JWT token (decoded to get UserId, UserName, etc.)
  - `takeresp.Message` - Status message (4 = OTP required, undefined = success, other = error)

**After 2nd API Success:**
- Decode JWT token to get: `UserId`, `UserName`, `DeviceId`, `AreaId`
- Store in Redux: `setJWTToken`, `setUserId`, `setUserName`, etc.
- Store in cache: `LOGIN_USER_ID`, `LOGIN_USER_JWT_TOKEN`, etc.
- **getUserAccess()** call (not numbered but happens here):
  - Gets user access details, permissions, menu order, etc.

##### **3rd API Call: Apis.postAuthToken()**
- **File**: `src/api/LoginAPICalls.ts`
- **Client**: `createApiClient()` from `src/api/Client.ts` (uses dynamic BASE_URL)
- **Endpoint**: `AUTH_ENDPOINTS.TOKEN_EP` = `/api/Data/TokenData`
- **Headers**: Same as 1st API (`authHeaders` with LoginId, Password, etc.)
- **Response**: `getToken.data.Token` - New token for data fetch

##### **4th API Call: Apis.getAuthData()**
- **File**: `src/api/LoginAPICalls.ts`
- **Client**: `createApiClient()` from `src/api/Client.ts` (uses dynamic BASE_URL)
- **Endpoint**: `AUTH_ENDPOINTS.GETDATA_EP` = `/api/Data/GetData`
- **Headers**:
  ```javascript
  {
    authheader: getToken.data?.Token, // From 3rd API
    AreaId: selectedAreaId
  }
  ```
- **Response**: `getUserData` - Complete user data including:
  - `Settings`, `PCustomer`, `PItem`, `PDistributor`, `Sales`, etc.
  - This is the data inserted into database

**After 4th API Success:**
- Store credentials in Redux: `setEnterUserName`, `setUserPass`, `setEnteredClientCode`
- **insertAllData(getUserData)** - **ONLY if `isLoginScreen === false`**
  - This means: Insert data only for background auth (from Splash screen)
  - **NOT** for login screen (`isLoginScreen === true`)
- Set `setIsSplashShown(false)`, `setIsLogin(true)`
- Navigate to dashboard

---

## PWA Implementation Comparison

### ✅ Correctly Implemented

1. **Login Screen Flow**: ✅ Same as RN
2. **1st API (AuthApi)**: ✅ Uses `Auth.ts` with static AUTH_URL
3. **versionChecking()**: ✅ Sets BASE_URL correctly
4. **2nd API (postAuthLogin)**: ✅ Uses dynamic BASE_URL from storage
5. **3rd API (postAuthToken)**: ✅ Uses dynamic BASE_URL
6. **4th API (getAuthData)**: ✅ Uses dynamic BASE_URL
7. **JWT Decoding**: ✅ Same logic
8. **User Data Storage**: ✅ Same Redux and cache storage

### ⚠️ Differences/Issues Found

#### 1. **insertAllData() Call Logic - CRITICAL DIFFERENCE**

**React Native**:
```typescript
if (isLoginScreen === false) {  // Only for background auth (Splash)
  insertAllData(getUserData);
}
```

**PWA Current**:
```typescript
// Comment says: "But we need data inserted for login screen too"
if (!authBackground && takeresp?.Message !== 4) {
  // Always inserts data (for both login screen and splash)
  insertAllData(getUserData);
}
```

**Analysis**: 
- **RN Logic**: Data is inserted ONLY when `isLoginScreen === false` (background auth from Splash)
- **PWA Logic**: Data is inserted for both cases
- **Question**: Is this intentional? The comment suggests it was changed intentionally, but it differs from RN

#### 2. **API Client Creation**

**React Native Client.ts**:
```typescript
const createApiClient = async () => {
  const clientBaseURL = await cacheStorage.getString(UserPreferenceKeys.BASE_URL);
  // Simple axios.create with baseURL
  return axios.create({
    baseURL: clientBaseURL,
    timeout: 500000,
    headers: { ... }
  });
};
```

**PWA Client.ts**:
```typescript
const createApiClient = async () => {
  const clientBaseURL = await cacheStorage.getString(UserPreferenceKeys.BASE_URL);
  // Additional proxy logic for development
  if (isDevelopment && baseURL) {
    // Converts to relative path for Vite proxy
    baseURL = pathWithQuery; // e.g., "/ZyleminiPlusCoreURLAuthWINDSRBV1V4"
  }
  // Creates axios instance with proxy path
  return axios.create({ baseURL, ... });
  
  // Also has interceptor to add JWT token
  client.interceptors.request.use(...);
};
```

**Analysis**: 
- PWA has additional proxy logic for development (CORS handling)
- PWA has JWT token interceptor (RN doesn't have this in Client.ts, token is added per-request)
- **This is correct** - needed for web CORS

#### 3. **JWT Token Handling**

**React Native**: Token is added manually in each API call's headers
**PWA**: Token is added via axios interceptor in `Client.ts`

**Analysis**: Both approaches work, but PWA's interceptor is cleaner

---

## API Client Binding Flow

### How API Clients Get Created and Bound

#### 1st API - AuthApi
1. `AuthApiCall.ts` calls `createAuthApiClient()` from `Auth.ts`
2. `Auth.ts` uses **static** `AUTH_ENDPOINTS.AUTH_URL`
3. Creates axios instance with static baseURL
4. Makes POST request to `''` (empty path = baseURL only)

#### 2nd, 3rd, 4th APIs - Main APIs
1. `LoginAPICalls.ts` calls `createApiClient()` from `Client.ts`
2. `Client.ts` reads `BASE_URL` from `cacheStorage` (set by `versionChecking()`)
3. **In Development (PWA)**: Converts full URL to relative path for proxy
4. Creates axios instance with dynamic baseURL
5. Makes requests to endpoints like `/api/Login/Login`, `/api/Data/TokenData`, etc.

**Key Point**: The `BASE_URL` is set by the **1st API response** and used by all subsequent APIs.

---

## Current PWA Status

### ✅ Working Correctly
- API client creation flow
- Dynamic BASE_URL handling
- JWT token management
- All 4 API calls are implemented
- Error handling structure

### ⚠️ Needs Verification
- **insertAllData() logic**: PWA inserts data for login screen, RN doesn't
- **Proxy configuration**: Needs to handle dynamic domains (windsr.in vs zyleminiplus.com)
- **Navigation**: PWA uses React Router, RN uses React Navigation

### 🔍 Missing/Incomplete
- `insertAllData()` in PWA is basic - only inserts 6 tables (Settings, PCustomer, PItem, PDistributor, Sales, OnlineParentArea)
- RN version inserts 30+ tables
- Need to verify all data is being inserted correctly

---

## Recommendations

1. **Verify insertAllData() logic**: Confirm if data should be inserted for login screen or only splash
2. **Complete insertAllData()**: Implement all table insertions from RN version
3. **Test API flow**: Verify all 4 APIs work with correct BASE_URL
4. **Proxy configuration**: Ensure proxy handles both zyleminiplus.com and windsr.in domains


