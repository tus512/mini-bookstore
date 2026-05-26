import {useState, useCallback, useEffect, useRef} from 'react';
import apiClient from '@/lib/apiClient';
import {AxiosRequestConfig} from 'axios';

interface UseDoRequestOptions<TData = any> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  isFetchOnLoad?: boolean;
  initData?: TData;
  params?: Record<string, any>;    // Default query params (GET)
  formParams?: any;                 // Default body params (POST/PUT)
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

interface DoRequestArg {
  params?: Record<string, any>;  // Override query params
  data?: any;                     // Override body
}

export function useDoRequest<TData = any>(options: UseDoRequestOptions<TData>) {
  const {
    url,
    method = 'GET',
    isFetchOnLoad = false,
    initData,
  } = options;

  const [data, setData] = useState<TData | undefined>(initData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Keep options in a ref to prevent infinite rendering loops from inline objects/callbacks
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const doRequest = useCallback(async (arg?: DoRequestArg | any) => {
    try {
      setLoading(true);
      setError(null);

      const currentOptions = optionsRef.current;
      const currentParams = currentOptions.params;
      const currentFormParams = currentOptions.formParams;
      const currentMethod = currentOptions.method || 'GET';

      const config: AxiosRequestConfig = {
        url: currentOptions.url,
        method: currentMethod,
        headers: currentOptions.headers,
      };

      // Determine query params and body from the argument
      if (arg && typeof arg === 'object' && ('params' in arg || 'data' in arg)) {
        // Structured call: doRequest({ params: {...}, data: {...} })
        if (currentMethod === 'GET' || currentMethod === 'DELETE') {
          config.params = {...currentParams, ...arg.params};
        } else {
          config.data = arg.data !== undefined ? arg.data : currentFormParams;
          config.params = arg.params;
        }
      } else {
        // Legacy call: doRequest(body) or doRequest(queryParams)
        if (currentMethod === 'GET' || currentMethod === 'DELETE') {
          config.params = arg !== undefined ? arg : currentParams;
        } else {
          config.data = arg !== undefined ? arg : currentFormParams;
          config.params = currentParams;
        }
      }

      const response = await apiClient.request<TData>(config);

      setData(response.data);
      if (currentOptions.onSuccess) {
        currentOptions.onSuccess(response.data);
      }
      return response.data;
    } catch (err: any) {
      setError(err);
      console.error(`Request to ${url} failed. ${err.message}`);
      if (optionsRef.current.onError) {
        optionsRef.current.onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (isFetchOnLoad) {
      doRequest();
    }
  }, [isFetchOnLoad, doRequest]);

  return {data, loading, error, doRequest};
}
