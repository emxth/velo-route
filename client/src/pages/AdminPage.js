import { useEffect, useState } from "react";
import api from "../api/axios";

const NAV_PREVIEW = {
  admin: ["dashboard", "admin", "operator", "driver", "analyst"],
  operator: ["dashboard", "operator"],
  driver: ["dashboard", "driver"],
  analyst: ["dashboard", "analyst"],
  user: ["dashboard"],
};

const ROLES = ["admin", "operator", "driver", "analyst", "user"];

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  const loadUsers = async () => {
    const { data } = await api.get("/users"); // returns [{ id, name, email, role }]
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadPermissions = async (userId) => {
    if (!userId) return;
    await api.get(`/users/${userId}/permissions`); // role-derived; no need to read response
  };

  const onSelectUser = (u) => {
    setSelectedId(u.id);
    setSelectedRole(u.role);
    loadPermissions(u.id);
  };

  const save = async () => {
    if (!selectedId) return;
    await api.put(`/users/${selectedId}/permissions`, { role: selectedRole });
    setUsers((prev) =>
      prev.map((u) => (u.id === selectedId ? { ...u, role: selectedRole } : u))
    );
    alert("Role updated (permissions derived from role)");
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
                key={u.id}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-neutral-50 ${selectedId === u.id ? "border-primary-500 bg-primary-50" : ""
                  }`}
                onClick={() => onSelectUser(u)}
              >
                <div className="font-medium">{u.name}</div>
                <div className="text-sm text-neutral-600">
                  {u.email} ({u.role})
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3 className="mb-3 text-lg font-semibold">Role / Derived Navigation</h3>
          {!selectedId && <p className="text-sm text-neutral-600">Select a user to edit.</p>}
          {selectedId && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Role</label>
              <select
                className="input-field"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <div className="text-sm text-neutral-700">
                Allowed navigation: {NAV_PREVIEW[selectedRole].join(", ")}
              </div>
              <button className="mt-4 btn-secondary" onClick={save}>
                Save Role
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;