import createAuthApiClient from './Auth';

export const postAuthApi = async (headers: any) => {
  console.log('🔐 [AuthApiCall] Creating auth API client...');
  const apiClient = await createAuthApiClient();
  
  console.log('🔐 [AuthApiCall] Making POST request to empty path (uses baseURL)');
  console.log('🔐 [AuthApiCall] Headers being sent:', JSON.stringify(headers, null, 2));
  
  const response = await apiClient.post('', null, {
    headers,
  });
  
  console.log('✅ [AuthApiCall] Response received');
  console.log('✅ [AuthApiCall] Status:', response?.status);
  console.log('✅ [AuthApiCall] Response data:', JSON.stringify(response?.data, null, 2));
  
  return response;
};

export default {postAuthApi};

