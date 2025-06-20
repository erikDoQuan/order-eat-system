import type { RefreshTokenResponse } from '@/modules/auth/interfaces/auth.interface';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_ENDPOINTS } from '@/constants/api-endpoint.constant';
import { useAuthState } from '@/modules/auth/states/auth.state';

import { createAxiosInstance } from './http-client';

const axiosClient = createAxiosInstance();

const handleSignOut = async () => {
  useAuthState.getState().signOut();
  useAuthState.getState().reset();

  await axiosClient.post<RefreshTokenResponse>(API_ENDPOINTS.SIGN_OUT);
};

const interceptors = {
  onRequest: async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const headers = config.headers;
    const authState = useAuthState.getState();

    headers.Authorization = `Bearer ${authState.accessToken}`;

    return config;
  },
  onRequestError: (error: AxiosError): Promise<AxiosError> => Promise.reject(error),
  onResponse: (response: AxiosResponse): AxiosResponse => response,
  onResponseError: async (error: AxiosError): Promise<AxiosError> => {
    const originalConfig = error.config as InternalAxiosRequestConfig & { _retry: boolean };
    const shouldCallRefreshToken = error.response && error.response.status === 401 && !originalConfig._retry;

    if (shouldCallRefreshToken) {
      originalConfig._retry = true;
      const authState = useAuthState.getState();

      try {
        const newTokens = await axiosClient.post<RefreshTokenResponse>(API_ENDPOINTS.REFRESH_TOKEN);

        authState.setAccessToken(newTokens.data.data.accessToken);
        originalConfig.headers.Authorization = `Bearer ${newTokens.data.data.accessToken}`;

        return axiosClient(originalConfig);
      } catch (err) {
        handleSignOut();
      }
    }

    return Promise.reject(error);
  },
};

axiosClient.interceptors.request.use(interceptors.onRequest, interceptors.onRequestError);
axiosClient.interceptors.response.use(interceptors.onResponse, interceptors.onResponseError);

export default axiosClient;
