import axiosInstance from "../utils/axiosInstance";
import type { User} from '../types/user'

export const userService = {
  getCurrentUser: async (): Promise<User> => {
    const res = await axiosInstance.get("/user/userDetails");
    return res.data;
  },
};