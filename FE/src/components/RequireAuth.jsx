import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@/hook/useAuth";

const RequireAuth = ({ allowedRoles }) => {
  const { auth } = useAuth();

  return allowedRoles.includes(auth?.role) ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default RequireAuth;
