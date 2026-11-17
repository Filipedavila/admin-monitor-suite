import { Navigate } from "react-router-dom";
import { usePermissions } from "../context/AuthContext";

// Route guard: redirects to the home page when the user lacks the given permission
// (e.g. a viewer opening a /create or /edit URL directly).
const RequirePermission = ({ permission, children }) => {
  const permissions = usePermissions();
  if (!permissions[permission]) {
    return <Navigate to="/dashboard/home" replace />;
  }
  return children;
};

export default RequirePermission;
