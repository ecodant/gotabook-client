import {
  User,
  UserLoginInput,
  UserRegisterInput,
  UserUpdateInput,
} from "@/lib/types";
import api from "./api";

export const userService = {
  login: async (credentials: UserLoginInput): Promise<User> => {
    const response = await api.post("api/users/login", credentials);
    return response.data;
  },
  register: async (userData: UserRegisterInput): Promise<User> => {
    const response = await api.post("api/users/register", userData);
    return response.data;
  },
  getUserById: async (id: string): Promise<User> => {
    const response = await api.get(`api/users/${id}`);
    return response.data;
  },
  getAllUsers: async (): Promise<User> => {
    const response = await api.get(`api/users/`);
    return response.data;
  },
  updateUser: async (
    id: string,
    userData: Partial<UserUpdateInput>
  ): Promise<User> => {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/api/users/${id}`);
  },
};
