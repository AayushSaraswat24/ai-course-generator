import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

type FetchOptions = {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  isFormData?: boolean;
  responseType?: 'json' | 'stream';
};

export async function fetchWithAuth({
  path,
  method = 'POST',
  data,
  isFormData = false,
  responseType = 'json',
}: FetchOptions): Promise<{
  success: any;
  error: any;
  statusCode: number;
}> {
  const axiosConfig: AxiosRequestConfig = {
    method,
    url: path,
    headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
    data: isFormData ? data : JSON.stringify(data),
    responseType: responseType === 'stream' ? 'stream' : 'json',
    withCredentials: true,
  };

  try {
    // First call
    const res: AxiosResponse = await axios(axiosConfig);
    return { success: res.data, error: null, statusCode: res.status };
  } catch (error: any) {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    if (status === 401 && message === 'Session Expired') {
      try {
        const refreshRes = await axios.post('/api/auth/refresh-token', {}, { withCredentials: true });

        if (!refreshRes.data.success) {
          return {
            success: null,
            error: refreshRes.data,
            statusCode: 401,
          };
        }

        // Retry the original request
        const retryRes: AxiosResponse = await axios(axiosConfig);
        return {
          success: retryRes.data,
          error: null,
          statusCode: retryRes.status,
        };
      } catch (retryError: any) {
        return {
          success: null,
          error: retryError?.response?.data || { message: 'Retry failed after refresh' },
          statusCode: retryError?.response?.status || 500,
        };
      }
    }

    return {
      success: null,
      error: error?.response?.data || { message: 'Unknown error' },
      statusCode: status || 500,
    };
  }
}
