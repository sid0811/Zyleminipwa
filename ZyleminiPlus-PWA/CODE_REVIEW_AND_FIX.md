# Code Review and Potential Fixes

## Key Differences Found

### React Native Client.ts (Simple)
```typescript
const createApiClient = async () => {
  const clientBaseURL = await cacheStorage.getString(UserPreferenceKeys.BASE_URL);
  const userId = await cacheStorage.getString(UserPreferenceKeys.LOGIN_USER_ID);
  return axios.create({
    baseURL: clientBaseURL,
    timeout: 500000,
    headers: {
      'Content-Type': 'application/json',
      LogUserId: userId ? userId : '',
    },
  });
};
```
- ✅ No interceptors
- ✅ No proxy logic
- ✅ Simple and direct

### PWA Client.ts (Complex)
- ❌ Has interceptors that modify headers
- ❌ Has proxy logic
- ❌ Re-reads BASE_URL in interceptor
- ❌ Adds x-original-url header

## Potential Issues

1. **Header Modification**: Interceptor might be modifying headers incorrectly
2. **Header Order**: Server might be sensitive to header order
3. **Content-Type**: Might need to be removed for null body requests
4. **transformRequest**: Might be interfering with axios default behavior

## Potential Solutions to Try

### Solution 1: Remove Content-Type for null body
Some servers reject POST with null body if Content-Type is application/json

### Solution 2: Simplify interceptor
Only add x-original-url, don't modify other headers

### Solution 3: Try without transformRequest
Let axios handle null naturally, but ensure Content-Length is 0

### Solution 4: Check if server expects different header format
Maybe headers need to be in query params? Or different case?

