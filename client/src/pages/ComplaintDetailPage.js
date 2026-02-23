import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const statusOptions = ["pending", "resolved"];

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [responseText, setResponseText] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/complaints/${id}`);
      setItem(data);
      setStatus(data.status);
      setResponseText(data.response?.text || "");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load complaint");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const saveStatus = async () => {
    try {
      await api.put(`/complaints/${id}/status`, { status });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const saveResponse = async () => {
    try {
      await api.put(`/complaints/${id}/response`, { text: responseText });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update response");
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this complaint/feedback?")) return;
    try {
      await api.delete(`/complaints/${id}`);
      navigate("/complaints");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!item) return <div className="p-6 text-red-600">{error || "Not found"}</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{item.subject}</h1>
      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="space-y-2 card">
        <div className="text-sm text-neutral-600">
          Kind: {item.kind} · Category: {item.category}
        </div>
        <div className="text-sm text-neutral-600">
          Status: <span className="font-semibold">{item.status}</span>
        </div>
        <p className="whitespace-pre-line text-neutral-900">{item.message}</p>
        <div className="text-xs text-neutral-500">
          Created: {new Date(item.createdAt).toLocaleString()}
        </div>
      </div>

      {item.response?.text && (
        <div className="space-y-1 card">
          <div className="font-semibold">Admin response</div>
          <div className="text-sm whitespace-pre-line text-neutral-800">{item.response.text}</div>
          <div className="text-xs text-neutral-500">
            {item.response.respondedAt
              ? new Date(item.response.respondedAt).toLocaleString()
              : ""}
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="space-y-3 card">
          <h3 className="text-lg font-semibold">Admin actions</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              className="input-field"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button className="btn-secondary" onClick={saveStatus}>
              Update Status
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Response</label>
            <textarea
              className="input-field"
              rows={3}
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Write a response to the user"
            />
            <button className="btn-secondary" onClick={saveResponse}>
              Save Response
            </button>
          </div>

          <button className="text-red-600 border-red-400 btn-outline" onClick={remove}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetailPage;