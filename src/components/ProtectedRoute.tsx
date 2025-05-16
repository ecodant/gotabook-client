import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Component logic

  return (
    <>
      {/* Add your protection logic here */}

      {children}
    </>
  );
};
