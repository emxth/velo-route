import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import SideNav from "../components/SideNav";

// Add User default navigations here (if not set, will fallback to these based on role)
const ADMIN_DEFAULT_NAV = ["admin", "operator", "driver", "analyst"];
const USER_DEFAULT_NAV = [];

const ProtectedLayout = () => {
  const { user } = useAuth();
  const [allowedNav, setAllowedNav] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data } = await api.get("/users/me/permissions");
        const fallback = user?.role === "admin" ? ADMIN_DEFAULT_NAV : USER_DEFAULT_NAV;
        const incoming = data.allowedNav && data.allowedNav.length ? data.allowedNav : fallback;
        if (mounted) setAllowedNav(incoming);
      } catch (err) {
        console.error("Failed to load permissions", err);
        const fallback = user?.role === "admin" ? ADMIN_DEFAULT_NAV : USER_DEFAULT_NAV;
        if (mounted) setAllowedNav(fallback);
      }
    };
    if (user) load();
    return () => {
      mounted = false;
    };
  }, [user]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <SideNav allowed={allowedNav} />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedLayout;