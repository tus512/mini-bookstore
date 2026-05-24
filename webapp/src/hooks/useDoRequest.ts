import { useState, useCallback, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { AxiosRequestConfig } from 'axios';

interface UseDoRequestOptions<TData = any, TVariables = any> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  isFetchOnLoad?: boolean;
  initData?: TData;
  formParams?: TVariables; // Default parameters/body
  onSuccess?: (data: TData, variables?: TVariables) => void;
  onError?: (error: Error, variables?: TVariables) => void;
}

export function useDoRequest<TData = any, TVariables = any>(options: UseDoRequestOptions<TData, TVariables>) {
  const {
    url,
    method = 'GET', // Default to GET
    headers,
    isFetchOnLoad = false,
    initData,
    formParams,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<TData | undefined>(initData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const doRequest = useCallback(async (params?: TVariables) => {
    try {
      setLoading(true);
      setError(null);
      
      const requestData = params !== undefined ? params : formParams;
      
      const config: AxiosRequestConfig = {
        url,
        method,
        headers,
      };

      // Assign to data or params depending on HTTP method
      if (method === 'GET' || method === 'DELETE') {
        config.params = requestData;
      } else {
        config.data = requestData;
      }

      const response = await apiClient.request<TData>(config);
      
      setData(response.data);
      if (onSuccess) {
        onSuccess(response.data, requestData);
      }
      return response.data;
    } catch (err: any) {
      setError(err);
      console.error(`Request to ${url} failed. ${err.message}`);
      if (onError) {
        onError(err, params !== undefined ? params : formParams);
      }
    } finally {
      setLoading(false);
    }
  }, [url, method, headers, formParams, onSuccess, onError]);

  // Execute on mount if flag is set
  useEffect(() => {
    if (isFetchOnLoad) {
      doRequest();
    }
  }, [isFetchOnLoad, doRequest]);

  return {
    data,
    loading,
    error,
    doRequest,
  };
}
