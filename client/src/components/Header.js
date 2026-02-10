import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = useMemo(() => {
    if (!user?.email) return "";
    return user.email.slice(0, 2).toUpperCase();
  }, [user?.email]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="flex items-center justify-between max-w-screen-xl gap-4 px-4 py-3 mx-auto">
        <div className="leading-tight">
          <p className="text-xs text-neutral-500">
            {getGreeting()},{` `}
            {user ? user.name : "Guest"}
          </p>
          <h1 className="text-lg font-semibold text-neutral-900">VeloRoute</h1>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 font-semibold rounded-full bg-primary-100 text-primary-800">
                {initials}
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-neutral-900">{user.name}</div>
                <div className="text-xs text-neutral-600">{user.email}</div>
              </div>
            </div>
          )}
          {user ? (
            <button className="btn-outline" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <button className="btn-secondary" onClick={() => navigate("/login")}>
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;