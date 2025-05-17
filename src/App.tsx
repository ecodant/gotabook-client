import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthPage from "./authentication/AuthenticationSection";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Dashboard } from "./app/dashboard/page";
import { AuthContext } from "./components/context/AuthContext";
import { User, UserLoginInput } from "./lib/types";
import { useCallback, useEffect, useState } from "react";
import { userService } from "./services/userService";
import { dummyUser } from "./lib/localSession";

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(dummyUser);

  const fetchusers = useCallback(async () => {
    try {
      let fetchedUsers: User[] = [];
      const result = await userService.getAllUsers();
      fetchedUsers = Array.isArray(result) ? result : [result];

      setUsers(fetchedUsers.filter((user: User) => user.id !== currentUser.id));
    } catch (error) {
      console.error("Failed to fetch users: ", error);
    }
  }, [currentUser.id]);

  const handleUpdateUser = async (userToUpdate: User): Promise<User> => {
    try {
      const userUpdated = await userService.updateUser(
        userToUpdate.id,
        userToUpdate
      );
      if (userUpdated.id === currentUser.id) {
        setCurrentUser(userUpdated);
      }
      return userUpdated;
    } catch (error) {
      console.error("Error sending the request:", error);
    }
    return dummyUser;
  };

  const handleLoginUser = async (data: UserLoginInput): Promise<User> => {
    try {
      const user = await userService.login(data);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem("currentUser", JSON.stringify(user));
        await fetchusers();
        return user;
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
    return currentUser;
  };

  useEffect(() => {
    const initializeSession = async () => {
      const valueStore = localStorage.getItem("currentUser");

      if (valueStore) {
        try {
          const userStore: User = JSON.parse(valueStore);

          if (userStore.email && userStore.password) {
            const userReLogged = await handleLoginUser({
              email: userStore.email,
              password: userStore.password,
            });
            if (userReLogged) {
              setCurrentUser(userReLogged);
            }
          } else {
            console.warn("Invalid session data, logging out...");
            localStorage.removeItem("currentUser");
          }
        } catch (error) {
          console.error("Error re-authenticating:", error);
          localStorage.removeItem("currentUser");
        }
      }
      await fetchusers();
    };

    initializeSession();
  }, [fetchusers]);

  return (
    <BrowserRouter>
      <AuthContext.Provider
        value={{
          currentUser,
          users,
          setUsers,
          setCurrentUser,
          handleLoginUser,
          handleUpdateUser,
        }}
      >
        <Routes>
          {/* Redirect root path to /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<AuthPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* Fallback route for unmatched paths */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthContext.Provider>
    </BrowserRouter>
  );
}
