import {API_ENDPOINTS} from '../constants/APIEndPoints';
import createApiClient from './Client';

interface userId {
  UserId: string;
}

export const OutletPerformaceReportAPI = async (data: any) => {
  const apiClient = await createApiClient();
  const response = await apiClient.post(API_ENDPOINTS.OUTLET_PERFORM, data);

  return response.data?.OutletPerformanceReport;
};

export const VisitBasedAPI = async (headers: any) => {
  const apiClient = await createApiClient();
  const response = await apiClient.post(API_ENDPOINTS.VISIT_BASED, null, {
    headers,
  });

  return response.data?.VisitBaseLatLongDetails;
};

export const BrandWiseAPI = async (data: any) => {
  const apiClient = await createApiClient();
  const response = await apiClient.post(API_ENDPOINTS.BRAND_WISE_SALE, data);

  return response.data;
};

export const LiveLocationBasedAPI = async (headers: any) => {
  const apiClient = await createApiClient();
  const response = await apiClient.post(API_ENDPOINTS.LOCATION_BASED, null, {
    headers,
  });

  return response.data?.LocationBaseLatLongDetails;
};

export const DistStatusAPI = async (data: any) => {
  const apiClient = await createApiClient();
  const response = await apiClient.post(API_ENDPOINTS.DIST_DATA_STATUS, data);

  return response.data;
};

export const TarVsAchiAPI = async (data: any) => {
  const apiClient = await createApiClient();
  const response = await apiClient.post(
    API_ENDPOINTS.TARGET_VS_ACHI_REP_EP,
    data,
  );

  return response.data;
};

export default {
  OutletPerformaceReportAPI,
  VisitBasedAPI,
  BrandWiseAPI,
  DistStatusAPI,
  TarVsAchiAPI,
  LiveLocationBasedAPI
};
