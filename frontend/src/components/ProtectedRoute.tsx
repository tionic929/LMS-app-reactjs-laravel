// ProtectedRoute.tsx
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingScreen from "./LoadingScreen";

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
