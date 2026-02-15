import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

const Profile = () => {
  const { user, logout, updateUserState } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data } = await api.get("/users/me");
        if (mounted) setForm({ name: data.name || "", email: data.email || "", password: "" });
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (user) load();
    return () => { mounted = false; };
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/users/me", {
        name: form.name,
        email: form.email,
        password: form.password || undefined,
      });
      updateUserState(data); // sync header/context
      setForm((prev) => ({ ...prev, password: "" }));
      setToast({ message: "Profile updated", type: "success" });
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Update failed", type: "error" });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;
    try {
      await api.delete("/users/me");
      logout();
      navigate("/login");
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Delete failed", type: "error" });
    }
  };

  if (!user) return null;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-xl space-y-4">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "info" })}
      />
      <h1 className="text-2xl font-bold">My Profile</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-1">
          <label>Name</label>
          <input
            className="input-field"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
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
          />
        </div>
        <div className="space-y-1">
          <label>Password (leave blank to keep current)</label>
          <input
            className="input-field"
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            placeholder="New password"
          />
        </div>
        <button className="w-full btn-secondary" type="submit">
          Save
        </button>
      </form>

      <hr />

      <button className="w-full btn-outline text-danger-600 border-danger-400" onClick={handleDelete}>
        Delete my account
      </button>
    </div>
  );
};

export default Profile;