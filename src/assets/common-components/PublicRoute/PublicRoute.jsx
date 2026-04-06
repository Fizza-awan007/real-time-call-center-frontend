import { Navigate } from "react-router-dom";
import { isJwtExpired } from "../../../utils/auth";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  const tokenExpired = token ? isJwtExpired(token) : false;

  if (tokenExpired) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }

  if (token && !tokenExpired) {
    return <Navigate to="/leadership-dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
