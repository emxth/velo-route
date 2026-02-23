import { Link, useLocation } from "react-router-dom";

// Add Side Nav items paths here
const NAV_GROUPS = [
  {
    category: "User Management",
    items: [
      { key: "admin", label: "Admin Area", to: "/admin" },
      { key: "operator", label: "Operator Area", to: "/operator" },
    ],
  },
  {
    category: "Vehicle Management",
    items: [{ key: "driver", label: "Driver Area", to: "/driver" }],
  },
  {
    category: "Analytics",
    items: [{ key: "analyst", label: "Analyst Area", to: "/analyst" }],
  },
  {
    category: "Complaints & Feedback",
    items: [
      // mark as public so it bypasses allowed filter
      { key: "complaints", label: "View Complaints", to: "/complaints", public: true },
    ],
  },
];

const SideNav = ({ allowed = [] }) => {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  // Keep only categories that have at least one allowed or public link
  const visibleGroups = NAV_GROUPS
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.public || allowed.includes(item.key)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside className="w-64 h-screen p-4 space-y-6 bg-white border-r">
      <h3 className="text-lg font-semibold">Navigation</h3>

      {visibleGroups.length === 0 && (
        <div className="text-sm text-neutral-500">No access granted</div>
      )}

      {visibleGroups.map((group) => (
        <div key={group.category} className="space-y-2">
          <div className="text-xs font-semibold tracking-wide uppercase text-neutral-500">
            {group.category}
          </div>
          {group.items.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className={`block rounded-lg px-3 py-2 text-sm font-medium hover:bg-neutral-100 ${isActive(item.to) ? "bg-neutral-100 text-primary-700" : "text-neutral-800"
                }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </aside>
  );
};

export default SideNav;