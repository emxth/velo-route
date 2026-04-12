import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import Toast from "../components/Toast";

const ROLES = ["user", "operator", "driver", "analyst", "admin"];

const AddUser = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [editingId, setEditingId] = useState(null);
  const [resetPassword, setResetPassword] = useState(false); // NEW
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [loading, setLoading] = useState(false);

  const sortParam = useMemo(() => `${sortField}:${sortDir}`, [sortField, sortDir]);

  const loadUsers = async (page = pagination.page) => {
    setLoading(true);
    try {
      const { data } = await api.get("/users", {
        params: {
          page,
          limit: pagination.limit,
          search: search || undefined,
          sort: sortParam,
        },
      });
      setUsers(data.data || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0, limit: 10 });
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to load users", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortParam]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", role: "user" });
    setEditingId(null);
    setResetPassword(false); // NEW
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, {
          name: form.name,
          email: form.email,
          role: form.role,
          // only send password when admin explicitly checked reset
          password: resetPassword ? form.password : undefined,
        });
        setToast({ message: "User updated", type: "success" });
      } else {
        await api.post("/users", form);
        setToast({ message: "User created", type: "success" });
      }
      resetForm();
      loadUsers();
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Action failed", type: "error" });
    }
  };

  const handleEdit = (u) => {
    setEditingId(u.id);
    setResetPassword(false); // NEW: default to NOT resetting password
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      setToast({ message: "User deleted", type: "success" });
      loadUsers();
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Delete failed", type: "error" });
    }
  };

  const goPage = (next) => {
    const page = Math.min(Math.max(1, next), pagination.pages || 1);
    loadUsers(page);
  };

  return (
    <div className="p-6 space-y-6 adduser">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "info" })}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.5fr]">
        {/* FORM CARD */}
        <div className="space-y-4 card adduser-card">
          <div className="adduser-card-head">
            <h2 className="text-xl font-semibold">
              {editingId ? "Update User" : "Add New User"}
            </h2>
            <p className="adduser-muted">
              {editingId
                ? "Update user details. Password remains unchanged unless you choose to reset it."
                : "Create a new account and assign the correct role."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label>Name</label>
              <input
                className="input-field"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Full name"
              />
            </div>

            <div className="space-y-1">
              <label>Email</label>
              <input
                className="input-field"
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                required
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-1">
              <label>Role</label>
              <select className="input-field" name="role" value={form.role} onChange={handleChange}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* PASSWORD: Create mode */}
            {!editingId && (
              <div className="space-y-1">
                <label>Password</label>
                <input
                  className="input-field"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type="password"
                  required
                  placeholder="Create a secure password"
                />
                <div className="adduser-help">
                  This password can be changed later using the reset flow.
                </div>
              </div>
            )}

            {/* PASSWORD: Edit mode */}
            {editingId && (
              <div className="space-y-2 adduser-resetbox">
                <label className="adduser-checkbox">
                  <input
                    type="checkbox"
                    checked={resetPassword}
                    onChange={(e) => {
                      setResetPassword(e.target.checked);
                      // clear password when unchecked so it never accidentally submits
                      if (!e.target.checked) setForm((p) => ({ ...p, password: "" }));
                    }}
                  />
                  <span>Reset this user’s password</span>
                </label>

                {resetPassword && (
                  <div className="space-y-1">
                    <label>New Password</label>
                    <input
                      className="input-field"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      type="password"
                      required
                      placeholder="Set a new password"
                    />
                    <div className="adduser-help">
                      Only set this if the user requested a reset or access must be restored.
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button className="btn-secondary" type="submit">
                {editingId ? "Update User" : "Create User"}
              </button>
              {editingId && (
                <button className="btn-outline" type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* TABLE CARD */}
        <div className="space-y-4 card adduser-card">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h2 className="text-xl font-semibold">All Users</h2>
              <p className="adduser-muted">Search, sort, and manage accounts securely.</p>
            </div>

            <div className="adduser-controls">
              <input
                className="input-field adduser-search"
                placeholder="Search name, email, role"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="adduser-sortrow">
                <select
                  className="input-field"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                >
                  <option value="createdAt">Created</option>
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="role">Role</option>
                </select>

                <select
                  className="input-field"
                  value={sortDir}
                  onChange={(e) => setSortDir(e.target.value)}
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 pl-4 overflow-x-auto adduser-tablewrap">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-neutral-600">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center">Loading...</td>
                  </tr>
                )}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-neutral-500">No users found</td>
                  </tr>
                )}
                {!loading && users.map((u) => (
                  <tr key={u.id} className="border-t adduser-row">
                    <td className="py-2 font-medium">{u.name}</td>
                    <td className="py-2">{u.email}</td>
                    <td className="py-2">
                      <span className={`role-pill role-${u.role}`}>{u.role}</span>
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button className="btn-outline" type="button" onClick={() => handleEdit(u)}>
                          Edit
                        </button>
                        <button
                          className="btn-outline adduser-danger"
                          type="button"
                          onClick={() => handleDelete(u.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">
              Page {pagination.page} of {pagination.pages} • Total {pagination.total}
            </div>
            <div className="flex gap-2">
              <button
                className="btn-outline"
                type="button"
                onClick={() => goPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Prev
              </button>
              <button
                className="btn-outline"
                type="button"
                onClick={() => goPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser;