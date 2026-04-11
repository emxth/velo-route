import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleLabel = (role) => {
  if (!role) return "User";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const Welcome = () => {
  const { user } = useAuth();
  if (!user) return null;

  const quickLinks = [
    { title: "My Profile", desc: "Update your details and security settings.", to: "/profile" },
  ];

  return (
    <div className="space-y-5 welcome">
      {/* Header */}
      <div className="welcome-hero card">
        <div className="welcome-hero-top">
          <div>
            <div className="welcome-kicker">Dashboard</div>
            <h1 className="welcome-title">Welcome, {user.name}</h1>
            <p className="welcome-subtitle">
              Use the sidebar to manage your work. Here are the most common actions to get started.
            </p>
          </div>

          <div className="welcome-role">
            <div className="welcome-avatar" title={user.email}>
              {(user.email || user.name || "U").slice(0, 2).toUpperCase()}
            </div>
            <div className="welcome-role-meta">
              <div className="welcome-role-name">{roleLabel(user.role)}</div>
              <div className="welcome-role-email">{user.email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="welcome-grid">
        {quickLinks.map((q) => (
          <div key={q.title} className="card welcome-tile">
            <div>
              <h3 className="welcome-tile-title">{q.title}</h3>
              <p className="welcome-tile-desc">{q.desc}</p>
            </div>
            <Link className="btn btn-outline" to={q.to}>
              Open
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Welcome;