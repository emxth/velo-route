import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await register(form);
      const toast = { message: "Registered user successfully", type: "success" };

      if (user.role === "admin") navigate("/admin", { state: { toast } });
      else if (user.role === "operator") navigate("/operator", { state: { toast } });
      else if (user.role === "driver") navigate("/driver", { state: { toast } });
      else if (user.role === "analyst") navigate("/analyst", { state: { toast } });
      else navigate("/dashboard", { state: { toast } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card p-8">
        <h2 className="text-center">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label>Name</label>
            <input className="input-field" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="space-y-1">
            <label>Email</label>
            <input className="input-field" name="email" value={form.email} onChange={handleChange} type="email" required />
          </div>
          <div className="space-y-1">
            <label>Password</label>
            <input className="input-field" name="password" value={form.password} onChange={handleChange} type="password" required />
          </div>
          <div className="space-y-1">
            <label>Role</label>
            <select className="input-field" name="role" value={form.role} onChange={handleChange}>
              <option value="user">User</option>
              <option value="operator">Operator</option>
              <option value="driver">Driver</option>
              <option value="analyst">Analyst</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button className="w-full btn-secondary" type="submit">Register</button>
        </form>

        <div className="mt-4">
          <button
            className="w-full btn-outline"
            type="button"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>

        {error && (
          <>
            <hr className="my-6" />
            <div className="border rounded-lg px-4 py-3 shadow-card bg-danger-50 text-danger-900 border-danger-500 mt-3">
              <div className="font-medium">
                <div className="text-sm">{error}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;