import {API_ENDPOINTS} from '../constants/APIEndPoints';
import createApiClient from './Client';

interface userId {
  UserId: string;
  UOM: string;
}

type TeamActivityReportParams = {
  ParentUserID?: string;
  Date: string;
  CommandType: string;
  UserID?: string;
  CollectionType?: string;
};

export const dashGraph = async (data: userId) => {
  const apiClient = await createApiClient();
  const response = await apiClient.get(API_ENDPOINTS.DASHGRAPH, {
    params: data,
  });
  return response.data;
};

export const childExecutiveList = async (headers: any) => {
  const apiClient = await createApiClient();
  const response = await apiClient.post(
    API_ENDPOINTS.EXECUTIVE_LIST,
    null,
    {
      headers,
    },
  );
  return response.data;
};

export const userPerformanceReport = async (
  UserID: string,
  CommandType: string,
  UOM: string,
  distID?: string,
  Brand?: string,
  fromDate?: string,
  toDate?: string,
) => {
  const Payload = {
    UserProfileReport: [
      {
        UserID,
        CommandType,
        CustomerId: '',
        DistributorId: distID || '0',
        Brand: Brand?.length ? Brand : '',
        UOM: UOM || '',
        FromDate: fromDate || '',
        ToDate: toDate || '',
      },
    ],
  };

  const apiClient = await createApiClient();
  const response = await apiClient.post<any>(
    API_ENDPOINTS.DASHBOARD_USER_PERF,
    Payload,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  return response.data;
};

export const getTeamPerfomanceSummary = async (
  ParentUserID: string,
  Date: string,
  CommandType: number,
) => {
  const headers = {
    ParentUserID,
    Date,
    CommandType,
  };

  const apiClient = await createApiClient();
  const response = await apiClient.get(
    API_ENDPOINTS.TEAM_SUMMARY_REP,
    {
      headers,
    },
  );
  return response.data;
};

export const getTeamActivityReport = async ({
  ParentUserID,
  Date,
  CommandType,
  UserID = '0',
  CollectionType,
}: TeamActivityReportParams) => {
  const headers = {
    ParentUserID,
    Date,
    CommandType,
    UserID,
    CollectionType,
  };

  const apiClient = await createApiClient();
  const response = await apiClient.get(
    API_ENDPOINTS.TEAM_ACTIVITY_REP,
    {
      headers,
    },
  );
  return response.data;
};

export default {
  dashGraph,
  childExecutiveList,
  userPerformanceReport,
  getTeamPerfomanceSummary,
  getTeamActivityReport,
};


