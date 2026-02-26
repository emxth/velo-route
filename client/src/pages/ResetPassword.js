import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios";

const ResetPassword = () => {
  const nav = useNavigate();
  const loc = useLocation();
  const presetEmail = loc.state?.email || "";
  const [email, setEmail] = useState(presetEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/auth/reset", { email, otp, newPassword: password });
      setSuccess("Password reset. Redirecting to login...");
      setTimeout(() => nav("/login"), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-neutral-50">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-2xl shadow-card">
        <h2 className="text-xl font-semibold text-center">Reset Password</h2>
        <form onSubmit={submit} className="space-y-4">
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
            <label>OTP Code</label>
            <input
              className="input-field"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder="6-digit code"
            />
          </div>
          <div className="space-y-1">
            <label>New Password</label>
            <input
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>
          <button className="w-full btn-secondary" type="submit">
            Reset Password
          </button>
          {error && <div className="text-sm text-red-600">{error}</div>}
          {success && <div className="text-sm text-green-700">{success}</div>}
        </form>
        <button className="w-full btn-outline" onClick={() => nav("/login")}>
          Back to login
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;