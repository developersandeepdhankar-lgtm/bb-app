import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PublicRoute() {
  const { isAuthenticated } = useAuth();

  // If already logged in → redirect to dashboard
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
