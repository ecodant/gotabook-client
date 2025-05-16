import { User, UserLoginInput, UserRegisterInput } from "@/lib/types";
import { userService } from "@/services/userService";
import {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";

export interface AuthContextType {
  currentUser: User | null;
  login: (credentials: UserLoginInput) => Promise<User>;
  register: (userData: UserRegisterInput) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
          // Validate the stored user against the backend
          const parsedUser = JSON.parse(storedUser);
          try {
            // Verify the user still exists and token is valid
            const user = await userService.getUserById(parsedUser._id);
            setCurrentUser(user);
          } catch {
            // If verification fails, clear the invalid session
            localStorage.removeItem("currentUser");
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to initialize authentication"
        );
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(
    async (credentials: UserLoginInput): Promise<User> => {
      try {
        setLoading(true);
        setError(null);

        // Use the userService to authenticate
        const user = await userService.login(credentials);

        // Store user in state and localStorage
        setCurrentUser(user);
        localStorage.setItem("currentUser", JSON.stringify(user));

        return user;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const register = useCallback(
    async (userData: UserRegisterInput): Promise<User> => {
      try {
        setLoading(true);
        setError(null);

        // Use the userService to register
        const newUser = await userService.register(userData);

        // Automatically log in the new user
        setCurrentUser(newUser);
        localStorage.setItem("currentUser", JSON.stringify(newUser));

        return newUser;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Registration failed";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    // Optionally call a logout API endpoint if needed
  }, []);

  const value: AuthContextType = {
    currentUser,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
