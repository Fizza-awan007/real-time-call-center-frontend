import { Navigate } from "react-router-dom";
import { isJwtExpired } from "../../../utils/auth";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  const tokenExpired = token ? isJwtExpired(token) : false;

  if (!token || tokenExpired) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
