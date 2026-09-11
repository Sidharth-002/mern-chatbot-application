import React, { useContext, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { state, refreshSession, isLoading } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    if (isLoading || state?.user) return;

    refreshSession().catch(() => {});
  }, [isLoading, state?.user, refreshSession]);

  if (isLoading) {
    return (
      <div style={{ padding: "1rem", textAlign: "center" }}>Loading...</div>
    );
  }

  if (!state?.user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
