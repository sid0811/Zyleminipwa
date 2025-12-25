import createApiClient from './Client';
import {API_ENDPOINTS} from '../constants/APIEndPoints';

export const postNDAConsentData = async (
  UserId: any,
  Latitude: any,
  Longitude: any,
  DateTimeStamp: any,
  AppVersion: any,
  APIVersion: any,
) => {
  const apiClient = await createApiClient();
  const formData = {
    UserId,
    Latitude,
    Longitude,
    DateTimeStamp,
    AppVersion,
    APIVersion,
  };

  const response = await apiClient.post<any>(
    API_ENDPOINTS.NDA_CONSENT_POST,
    formData,
    {
      headers: {
        'Content-Type': 'application/json',
        UserId: UserId,
        Latitude: Latitude,
        Longitude: Longitude,
        DateTimeStamp: DateTimeStamp,
        AppVersion: AppVersion,
        APIVersion: APIVersion,
      },
    },
  );

  
  return response.data;
};


