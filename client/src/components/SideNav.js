import { Link, useLocation } from "react-router-dom";

// Add Side Nav items paths here
const NAV_ITEMS = [
  { key: "admin", label: "Admin Area", to: "/admin" },
  { key: "operator", label: "Operator Area", to: "/operator" },
  { key: "driver", label: "Driver Area", to: "/driver" },
  { key: "analyst", label: "Analyst Area", to: "/analyst" },
];

const SideNav = ({ allowed = [] }) => {
  const location = useLocation();
  const items = NAV_ITEMS.filter((item) => allowed.includes(item.key));

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <aside className="w-64 h-screen p-4 space-y-2 bg-white border-r">
      <h3 className="mb-3 text-lg font-semibold">Navigation</h3>
      {items.length === 0 && <div className="text-sm text-neutral-500">No access granted</div>}
      {items.map((item) => (
        <Link
          key={item.key}
          to={item.to}
          className={`block rounded-lg px-3 py-2 text-sm font-medium hover:bg-neutral-100 ${isActive(item.to) ? "bg-neutral-100 text-primary-700" : "text-neutral-800"
            }`}
        >
          {item.label}
        </Link>
      ))}
    </aside>
  );
};

export default SideNav;