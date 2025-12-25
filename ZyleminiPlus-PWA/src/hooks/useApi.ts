import {useState} from 'react';
import {writeErrorLog} from '../utility/utils';

type ApiFunction<T> = (...args: any[]) => Promise<T>;

const useApi = <T>(apiFunc: ApiFunction<T>) => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const request = async (...args: any[]) => {
    setLoading(true);
    try {
      const response = await apiFunc(...args);

      setLoading(false);

      setData(response);
      setError(false);
    } catch (error) {
      writeErrorLog('useApi', error);
      setLoading(false);
      setError(true);
    }
  };

  return {data, error, loading, request};
};

export default useApi;

// How to use
// import listingsApi from "../api/ApiCall";

// const getListingsApi = useApi(listingsApi.getGroupsData); // listingsApi.getAttendance works as a apiFunc parameter

// useEffect(() => {
//     getListingsApi.request(1, 2, 3); // 1,2,3 passed as a params or Payload to api call
// }, []);

// getListingsApi.data, getListingsApi.error, getListingsApi.loading
