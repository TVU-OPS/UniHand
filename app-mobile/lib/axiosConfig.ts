import axios, { AxiosResponse, AxiosInstance } from "axios";

const axiosConfig = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_API_URL}/api/`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Gửi cookie kèm theo mỗi request hoặc cho phép nhận cookie từ server (phải enable CORS ở server)
});

export default axiosConfig;