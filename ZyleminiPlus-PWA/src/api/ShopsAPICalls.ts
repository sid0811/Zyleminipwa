import createApiClient from './Client';
import {API_ENDPOINTS} from '../constants/APIEndPoints';
import {ShopsGelocationBody} from '../types/types';

export const postShopGeolocation = async (Body: ShopsGelocationBody[]) => {
  const apiClient = await createApiClient();
  const geolocationDetail = {
    GeoLocationData: Body,
  };

  const response = await apiClient.post(
    API_ENDPOINTS.SHOP_GEOLOCATION_POST,
    geolocationDetail,
  );

  return response.data;
};

export const custProfileData = async (data: any) => {
  const apiClient = await createApiClient();
  const response = await apiClient.post(
    API_ENDPOINTS.CUST_PROFILE_REPORT,
    data,
  );

  return response.data;
};

export default {
  custProfileData,
  postShopGeolocation,
};


