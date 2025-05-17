import { User, UserLoginInput } from "@/lib/types";
import { createContext } from "react";

export interface UserContextType {
  currentUser: User;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setCurrentUser: React.Dispatch<React.SetStateAction<User>>;
  handleLoginUser: (credentials: UserLoginInput) => Promise<User>;
  handleUpdateUser: (userToUpdate: User) => Promise<User>;
}

export const AuthContext = createContext<UserContextType | undefined>(
  undefined
);
