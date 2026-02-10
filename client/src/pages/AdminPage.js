import { useEffect, useState } from "react";
import api from "../api/axios";

const NAV_KEYS = ["dashboard", "admin", "operator", "driver", "analyst"];

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [allowed, setAllowed] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get("/users"); // [{_id, name, email, role}]
      setUsers(data);
    };
    load();
  }, []);

  const loadPermissions = async (userId) => {
    const { data } = await api.get(`/users/${userId}/permissions`);
    setAllowed(data.allowedNav || []);
  };

  const toggle = (key) => {
    setAllowed((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const save = async () => {
    if (!selected) return;
    await api.put(`/users/${selected}/permissions`, { allowedNav: allowed });
    alert("Permissions updated");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Permissions</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card">
          <h3 className="mb-3 text-lg font-semibold">Users</h3>
          <ul className="space-y-2">
            {users.map((u) => (
              <li
                key={u._id}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-neutral-50 ${selected === u._id ? "border-primary-500 bg-primary-50" : ""
                  }`}
                onClick={() => {
                  setSelected(u._id);
                  loadPermissions(u._id);
                }}
              >
                <div className="font-medium">{u.name}</div>
                <div className="text-sm text-neutral-600">{u.email} ({u.role})</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3 className="mb-3 text-lg font-semibold">Allowed Navigation</h3>
          {!selected && <p className="text-sm text-neutral-600">Select a user to edit.</p>}
          {selected && (
            <div className="space-y-2">
              {NAV_KEYS.map((key) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={allowed.includes(key)}
                    onChange={() => toggle(key)}
                  />
                  <span className="capitalize">{key}</span>
                </label>
              ))}
              <button className="mt-4 btn-secondary" onClick={save}>
                Save Permissions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;