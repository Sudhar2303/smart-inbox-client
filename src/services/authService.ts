import axiosInstance from "../utils/axiosInstance";
import type { LoginPayload, SignupPayload, AuthResponse, checkAuthStatus } from "../types/auth";

const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>("/auth/login", payload);
    return response.data;
  },

  signup: async (payload: SignupPayload): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>("/auth/signup", payload);
    return response.data;
  },

  googleLoginRedirect: (): void => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google/login`;
  },

  checkAuthStatus: async (): Promise<checkAuthStatus> => {
    const response = await axiosInstance.get<checkAuthStatus>("/auth/google/getauthstatus");
    return response.data;
  },

  logout: async (): Promise<{ message: string; error: string | null }> => {
    const response  = await axiosInstance.post("/auth/logout", {});
    return response.data;
  }
};

export default authService;
