import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const user = await login(email, password); // expect user object returned
            // Role-based landing
            if (user.role === "admin") navigate("/admin");
            else if (user.role === "operator") navigate("/operator");
            else if (user.role === "driver") navigate("/driver");
            else if (user.role === "analyst") navigate("/analyst");
            else navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>
                    <input className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
                </div>
                <div>
                    <label>Password</label>
                    <input className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
                </div>
                <button className="btn-secondary" type="submit">Login</button>
            </form>
            <button className="btn-primary" type="button" onClick={() => navigate("/register")}>
                Go to Signup
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default Login;