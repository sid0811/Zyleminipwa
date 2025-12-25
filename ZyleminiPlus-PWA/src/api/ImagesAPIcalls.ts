import createApiClient from './Client';
import {API_ENDPOINTS} from '../constants/APIEndPoints';

export const getImageData = async (userId: any, enteredUserName: any) => {
  const apiClient = await createApiClient();
  const response = await apiClient.get<any>(
    `${API_ENDPOINTS.PROFILE_GET_IMAGE}`,
    {
      headers: {
        'Content-Type': 'application/json',
        UserID: userId,
        UserName: enteredUserName,
      },
    },
  );

  return response.data;
};

export const postImageData = async (
  userId: any,
  enteredUserName: any,
  imageFile: any,
) => {
  const apiClient = await createApiClient();
  const formData = {
    UserID: userId,
    UserName: enteredUserName,
    ImageByte: imageFile,
  };

  console.log('UserID and enteredUserName ', userId, enteredUserName);

  const response = await apiClient.post<any>(
    API_ENDPOINTS.PROFILE_POST_IMAGE,
    formData,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  return response.data;
};


