import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, role } = useAuth();

  if (!user || role !== requiredRole) {

    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
