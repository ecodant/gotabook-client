import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext";
import AuthPage from "./authentication/AuthenticationSection";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./app/dashboard/page";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
