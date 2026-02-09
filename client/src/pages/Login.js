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
      const user = await login(email, password);
      const toast = { message: "Logged in successfully", type: "success" };

      if (user.role === "admin") navigate("/admin", { state: { toast } });
      else if (user.role === "operator") navigate("/operator", { state: { toast } });
      else if (user.role === "driver") navigate("/driver", { state: { toast } });
      else if (user.role === "analyst") navigate("/analyst", { state: { toast } });
      else navigate("/dashboard", { state: { toast } });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card p-8">
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

        {error &&
          <>
            <hr className="my-6" />
            <div className="border rounded-lg px-4 py-3 shadow-card bg-danger-50 text-danger-900 border-danger-500 mt-3">
              <div className="font-medium">
                <dev className="text-sm">{error}</dev>
              </div>
            </div>
          </>
        }
      </div>
    </div>
  );
};

export default Login;