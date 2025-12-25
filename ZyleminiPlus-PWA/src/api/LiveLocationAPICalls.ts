import { API_ENDPOINTS } from "../constants/APIEndPoints";
import { LocationMaster } from "../types/types";
import createApiClient from "./Client";

export const postLivelocation = async (Body: LocationMaster[]) => {
    const apiClient = await createApiClient();
    const Payload = {
        LocationMaster: Body,
    };
  
    const response = await apiClient.post(
      API_ENDPOINTS.LIVE_LOCATION_POST,
      Payload,
    );
  
    return response.data;
  };

  export default {
    postLivelocation
  }


