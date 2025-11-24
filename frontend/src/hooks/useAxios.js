import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useMemo } from "react";

const useAxios = () => {
  const { getToken } = useAuth();

  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      withCredentials: true,
    });

    // Add request interceptor to include Clerk token
    instance.interceptors.request.use(
      async (config) => {
        try {
          const token = await getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error getting Clerk token:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return instance;
  }, [getToken]);

  return axiosInstance;
};

export default useAxios;