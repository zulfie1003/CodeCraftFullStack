import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  clearStoredAuth,
  getHomePathForRole,
  getStoredToken,
  getStoredUser,
} from "../utils/auth";

function ProtectedRoute({ children, role }) {
  const location = useLocation();
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || !user) {
    clearStoredAuth();
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && user.role !== role) {
    return <Navigate to={getHomePathForRole(user.role)} replace />;
  }

  return children || <Outlet />;
}

export default ProtectedRoute;
