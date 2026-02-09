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
            if (user.role === "admin") navigate("/admin");
            else if (user.role === "operator") navigate("/operator");
            else if (user.role === "driver") navigate("/driver");
            else if (user.role === "analyst") navigate("/analyst");
            else navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name</label>
                    <input className="input-field" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div>
                    <label>Email</label>
                    <input className="input-field" name="email" value={form.email} onChange={handleChange} type="email" required />
                </div>
                <div>
                    <label>Password</label>
                    <input className="input-field" name="password" value={form.password} onChange={handleChange} type="password" required />
                </div>
                <div>
                    <label>Role</label>
                    <select className="input-field" name="role" value={form.role} onChange={handleChange}>
                        <option value="user">User</option>
                        <option value="operator">Operator</option>
                        <option value="driver">Driver</option>
                        <option value="analyst">Analyst</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <button className="btn-primary" type="submit">Register</button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default Register;