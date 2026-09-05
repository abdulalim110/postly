import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { StatusPanel } from "../components/StatusPanel.jsx";

export function RequireAuth() {
  const auth = useAuth();
  const location = useLocation();

  if (auth.booting) {
    return (
      <main className="page-shell narrow-shell">
        <StatusPanel kind="loading" title="Memeriksa sesi" />
      </main>
    );
  }
  if (!auth.user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
