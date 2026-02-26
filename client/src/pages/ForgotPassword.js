import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/forgot", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset code");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-neutral-50">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-2xl shadow-card">
        <h2 className="text-xl font-semibold text-center">Forgot Password</h2>
        {sent ? (
          <div className="text-sm text-green-700">
            Reset code sent to {email}. Check your inbox, then{" "}
            <button className="underline text-primary-600" onClick={() => navigate("/reset-password", { state: { email } })}>
              reset here
            </button>.
          </div>
        ) : (
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
            <button className="w-full btn-secondary" type="submit">
              Send reset code
            </button>
            {error && <div className="text-sm text-red-600">{error}</div>}
          </form>
        )}
        <button className="w-full btn-outline" onClick={() => navigate("/login")}>
          Back to login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;