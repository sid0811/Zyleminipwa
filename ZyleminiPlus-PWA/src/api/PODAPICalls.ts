import createApiClient from './Client';
import {API_ENDPOINTS} from '../constants/APIEndPoints';

export const getPodData = async (
  DistributorId: string,
  FromDate: string,
  ToDate: string,
  Type: number,
  UploadedType: number,
  UniqueKey: string,
) => {
  const Payload1 = {
    DistributorId,
    FromDate,
    ToDate,
    Type,
    UploadedType,
    UniqueKey,
  };
  console.log('\n UniqueKey Payload1 -->', Payload1);

  const apiClient = await createApiClient();
  const response = await apiClient.post<any>(
    API_ENDPOINTS.POD_GET_DATA_POD,
    Payload1,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  return response.data;
};

export const postPodData = async (data: any) => {
  const apiClient = await createApiClient();
  const response = await apiClient.post<any>(
    API_ENDPOINTS.SAVE_POST_DATA_POD,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  return response.data;
};


