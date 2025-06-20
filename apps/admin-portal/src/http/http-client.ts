import Axios from 'axios';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const defaultBaseURL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export const createAxiosInstance = (baseURL = defaultBaseURL) => {
  return Axios.create({
    baseURL,
    timeout: 90000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
