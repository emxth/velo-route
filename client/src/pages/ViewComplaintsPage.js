import { useEffect, useState } from "react";
import api from "../api/axios";

const statusOptions = ["pending", "resolved"];

const ViewComplaintsPage = () => {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("pending");
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  const loadList = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/complaints");
      setItems(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id) => {
    if (!id) return;
    setDetailLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/complaints/${id}`);
      setItem(data);
      setStatus(data.status);
      setResponseText(data.response?.text || "");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load complaint");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId);
  }, [selectedId]);

  const updateComplaint = async () => {
    if (!selectedId) return;
    try {
      await api.put(`/complaints/${selectedId}/status`, { status });
      await api.put(`/complaints/${selectedId}/response`, { text: responseText });
      await loadDetail(selectedId);
      await loadList();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const remove = async () => {
    if (!selectedId) return;
    if (!window.confirm("Delete this complaint/feedback?")) return;
    try {
      await api.delete(`/complaints/${selectedId}`);
      setSelectedId(null);
      setItem(null);
      await loadList();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
    }
  };

  const closeDetail = () => {
    setSelectedId(null);
    setItem(null);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">All Complaints & Feedback</h1>
      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Detail Panel */}
        <div className="space-y-4 card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Complaint Detail</h2>
            {selectedId && (
              <button className="btn-outline" onClick={closeDetail}>
                Close
              </button>
            )}
          </div>

          {!selectedId && <div className="text-sm text-neutral-600">Select a complaint to view.</div>}
          {detailLoading && <div className="text-sm text-neutral-600">Loading...</div>}

          {!detailLoading && item && (
            <>
              <div className="space-y-2">
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

              {item.location?.lat !== undefined && item.location?.lng !== undefined && (
                <div className="space-y-1">
                  <div className="font-semibold">Location</div>
                  <div className="text-sm text-neutral-800">
                    {item.location.lat}, {item.location.lng}{" "}
                    {item.location.label ? `(${item.location.label})` : ""}
                  </div>
                </div>
              )}

              {item.response?.text && (
                <div className="space-y-1">
                  <div className="font-semibold">Admin response</div>
                  <div className="text-sm whitespace-pre-line text-neutral-800">
                    {item.response.text}
                  </div>
                </div>
              )}

              <div className="space-y-3">
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
                </div>

                <div className="flex gap-2">
                  <button className="btn-secondary" onClick={updateComplaint}>
                    Update
                  </button>
                  <button className="text-red-600 border-red-400 btn-outline" onClick={remove}>
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* List */}
        <div className="space-y-3 card">
          {loading && <div className="text-sm text-neutral-600">Loading...</div>}
          {!loading && items.length === 0 && (
            <div className="text-sm text-neutral-600">No complaints/feedback found.</div>
          )}

          <ul className="space-y-2">
            {items.map((c) => (
              <li
                key={c.id}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-neutral-50 ${
                  selectedId === c.id ? "border-primary-500 bg-primary-50" : ""
                }`}
                onClick={() => setSelectedId(c.id)}
              >
                <div className="font-semibold">{c.subject}</div>
                <div className="text-xs text-neutral-600">
                  {c.kind} · {c.category} · {c.status}
                </div>
                <div className="text-xs text-neutral-500">
                  {new Date(c.createdAt).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ViewComplaintsPage;