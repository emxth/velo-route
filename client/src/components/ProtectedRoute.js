import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const PATH_KEY_MAP = {
  "/welcome": "dashboard",
  "/admin": "admin",
  "/operator": "operator",
  "/driver": "driver",
  "/analyst": "analyst",
};

const ProtectedRoute = ({ roles }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [allowedNav, setAllowedNav] = useState(null); // null = loading

  // Fetch permissions once per mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data } = await api.get("/users/me/permissions");
        if (mounted) setAllowedNav(data.allowedNav || []);
      } catch (err) {
        console.error("Failed to load permissions", err);
        if (mounted) setAllowedNav([]);
      }
    };
    if (user) load();
    else setAllowedNav([]);
    return () => { mounted = false; };
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  // Admin always allowed
  if (user.role === "admin") return <Outlet />;

  // While permissions loading
  if (allowedNav === null) return null; // or a loader

  // Role-protected route
  if (roles && roles.length) {
    const ok = roles.includes(user.role);
    return ok ? <Outlet /> : <Navigate to="/unauthorized" replace />;
  }

  // Permission-protected route (by path)
  const key = PATH_KEY_MAP[location.pathname];
  if (key && allowedNav.includes(key)) return <Outlet />;

  // Default allow if no key specified (e.g., nested routes without a map entry)
  if (!key) return <Outlet />;

  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;