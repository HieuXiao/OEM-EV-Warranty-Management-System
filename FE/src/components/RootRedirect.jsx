import useAuth from "@/hook/useAuth";

export default function RootRedirect(params) {
  const { auth } = useAuth();

  if (auth?.role) {
    switch (auth.role) {
      case "ADMIN":
        return <Navigate to="/admin/users" replace />;
      case "SC_STAFF":
        return <Navigate to="/scstaff/dashboard" replace />;
      case "SC_TECHNICIAN":
        return <Navigate to="/sctechnician/dashboard" replace />;
      case "EVM_STAFF":
        return <Navigate to="/evmstaff/warranty" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <Navigate to="/login" replace />;
}
