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
      await login(email, password);
      const toast = { message: "Logged in successfully", type: "success" };
      navigate("/welcome", { state: { toast } });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-neutral-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-card">
        <h2 className="text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label>Email</label>
            <input
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div className="space-y-1">
            <label>Password</label>
            <input
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>
          <div className="text-right">
            <button type="button" className="text-sm underline text-primary-600" onClick={() => navigate("/forgot-password")}>
              Forgot password?
            </button>
          </div>
          <button className="w-full btn-secondary" type="submit">
            Login
          </button>
        </form>
        <div className="mt-4">
          <button
            className="w-full btn-outline"
            type="button"
            onClick={() => navigate("/register")}
          >
            Go to Signup
          </button>
        </div>

        {error && (
          <>
            <hr className="my-6" />
            <div className="px-4 py-3 mt-3 border rounded-lg shadow-card bg-danger-50 text-danger-900 border-danger-500">
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

export default Login;