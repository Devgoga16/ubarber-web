import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore, type Role } from "../store/auth";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "super_admin" ? "/admin" : "/"} replace />;
  }

  return <Outlet />;
}
