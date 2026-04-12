import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const statusOptions = ["pending", "resolved"];

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // list state (search + pagination)
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });

  // selected complaint
  const [selectedId, setSelectedId] = useState(id || null);

  // detail state
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("pending");
  const [responseText, setResponseText] = useState("");

  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const detailRef = useRef(null);

  // keep selectedId in sync with URL param
  useEffect(() => {
    if (id) setSelectedId(id);
  }, [id]);

  const loadList = async (page = 1) => {
    setLoadingList(true);
    setError("");
    try {
      // If your backend supports pagination/search, use these params.
      // If not, it will ignore them and still return all (we handle that gracefully).
      const { data } = await api.get("/complaints", {
        params: {
          page,
          limit: pagination.limit,
          search: search || undefined,
        },
      });

      // support both formats:
      // A) data is array
      // B) data = { data: [], pagination: {...} }
      if (Array.isArray(data)) {
        // fallback: client-side pagination + search
        const filtered = search
          ? data.filter((c) => {
              const q = search.toLowerCase();
              return (
                (c.subject || "").toLowerCase().includes(q) ||
                (c.kind || "").toLowerCase().includes(q) ||
                (c.category || "").toLowerCase().includes(q) ||
                (c.status || "").toLowerCase().includes(q)
              );
            })
          : data;

        const limit = pagination.limit;
        const pages = Math.max(1, Math.ceil(filtered.length / limit));
        const safePage = Math.min(Math.max(1, page), pages);
        const start = (safePage - 1) * limit;
        const pageItems = filtered.slice(start, start + limit);

        setItems(pageItems);
        setPagination({ page: safePage, pages, total: filtered.length, limit });
      } else {
        setItems(data.data || []);
        setPagination(data.pagination || { page: 1, pages: 1, total: 0, limit: pagination.limit });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load complaints");
    } finally {
      setLoadingList(false);
    }
  };

  const loadDetail = async (complaintId) => {
    if (!complaintId) return;
    setLoadingDetail(true);
    setError("");
    try {
      const { data } = await api.get(`/complaints/${complaintId}`);
      setItem(data);
      setStatus(data.status || "pending");
      setResponseText(data.response?.text || "");

      // smooth scroll into view
      requestAnimationFrame(() => {
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load complaint");
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const goPage = (next) => {
    const page = Math.min(Math.max(1, next), pagination.pages || 1);
    loadList(page);
  };

  const onSelect = (complaintId) => {
    setSelectedId(complaintId);
    // keep URL in sync (nice UX)
    navigate(`/complaints/${complaintId}`, { replace: false });
  };

  const hasChanges = useMemo(() => {
    if (!item) return false;
    const origStatus = item.status || "pending";
    const origResponse = item.response?.text || "";
    return status !== origStatus || responseText !== origResponse;
  }, [item, status, responseText]);

  const saveAll = async () => {
    if (!selectedId || !isAdmin) return;
    setSaving(true);
    setError("");
    try {
      // Update status + response in one "Save Changes" click
      // (two requests because backend endpoints are separate)
      await api.put(`/complaints/${selectedId}/status`, { status });
      await api.put(`/complaints/${selectedId}/response`, { text: responseText });

      await loadDetail(selectedId);
      await loadList(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selectedId) return;
    if (!window.confirm("Delete this complaint/feedback?")) return;
    setError("");
    try {
      await api.delete(`/complaints/${selectedId}`);
      setSelectedId(null);
      setItem(null);
      await loadList(1);
      navigate("/complaints", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="p-6 space-y-4 complaints-detail">
      <div className="complaints-detail-head">
        <div>
          <h1 className="text-2xl font-bold">Complaints & Feedback</h1>
          <p className="complaints-muted">
            Search, review details, and respond (admin only).
          </p>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>

      <div className="complaints-layout">
        {/* LEFT: list */}
        <aside className="card complaints-list">
          <div className="complaints-list-controls">
            <input
              className="input-field"
              placeholder="Search subject, kind, category, status"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loadingList && <div className="text-sm text-neutral-600">Loading list...</div>}

          {!loadingList && items.length === 0 && (
            <div className="text-sm text-neutral-600">No complaints/feedback found.</div>
          )}

          <ul className="complaints-items">
            {items.map((c) => (
              <li
                key={c.id}
                className={`complaints-item ${selectedId === c.id ? "is-active" : ""}`}
                onClick={() => onSelect(c.id)}
                role="button"
                tabIndex={0}
              >
                <div className="complaints-item-main">
                  <div className="complaints-item-title">{c.subject}</div>
                  <div className="complaints-item-meta">
                    <span className={`status-pill status-${c.status}`}>{c.status}</span>
                    <span>{c.kind}</span>
                    <span>•</span>
                    <span>{c.category}</span>
                  </div>

                  {c.location && (
                    <div className="complaints-item-loc">
                      {c.location.lat}, {c.location.lng}{" "}
                      {c.location.label ? `(${c.location.label})` : ""}
                    </div>
                  )}
                </div>

                <div className="complaints-item-date">
                  {new Date(c.createdAt).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>

          <div className="complaints-pager">
            <div className="text-sm text-neutral-600">
              Page {pagination.page} of {pagination.pages} • Total {pagination.total}
            </div>
            <div className="flex gap-2">
              <button
                className="btn-outline"
                type="button"
                onClick={() => goPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Prev
              </button>
              <button
                className="btn-outline"
                type="button"
                onClick={() => goPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
              >
                Next
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT: detail */}
        <main className="card complaints-detail-panel" ref={detailRef}>
          {!selectedId && (
            <div className="text-sm text-neutral-600">
              Select a complaint to view details.
            </div>
          )}

          {selectedId && loadingDetail && (
            <div className="text-sm text-neutral-600">Loading detail...</div>
          )}

          {selectedId && !loadingDetail && item && (
            <div className="complaints-detail-grid">
              {/* Detail column */}
              <section className="complaints-box">
                <div className="complaints-box-head">
                  <h2 className="text-lg font-semibold">{item.subject}</h2>
                  <span className={`status-pill status-${item.status}`}>{item.status}</span>
                </div>

                <div className="complaints-kv">
                  <div>
                    <div className="complaints-k">Kind</div>
                    <div className="complaints-v">{item.kind}</div>
                  </div>
                  <div>
                    <div className="complaints-k">Category</div>
                    <div className="complaints-v">{item.category}</div>
                  </div>
                  <div>
                    <div className="complaints-k">Created</div>
                    <div className="complaints-v">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="complaints-message">
                  <div className="complaints-k">Message</div>
                  <p className="whitespace-pre-line text-neutral-900">{item.message}</p>
                </div>

                {item.location?.lat !== undefined && item.location?.lng !== undefined && (
                  <div className="complaints-location">
                    <div className="complaints-k">Location</div>
                    <div className="text-sm text-neutral-800">
                      {item.location.lat}, {item.location.lng}{" "}
                      {item.location.label ? `(${item.location.label})` : ""}
                    </div>
                  </div>
                )}

                {item.response?.text && (
                  <div className="complaints-response">
                    <div className="complaints-k">Admin response</div>
                    <div className="text-sm whitespace-pre-line text-neutral-800">
                      {item.response.text}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {item.response.respondedAt
                        ? new Date(item.response.respondedAt).toLocaleString()
                        : ""}
                    </div>
                  </div>
                )}
              </section>

              {/* Actions column (admin only) */}
              <section className="complaints-box">
                <h3 className="text-lg font-semibold">Actions</h3>

                {!isAdmin && (
                  <div className="text-sm text-neutral-600">
                    Only admins can update status or respond.
                  </div>
                )}

                {isAdmin && (
                  <>
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

                    <div className="mt-3 space-y-2">
                      <label className="text-sm font-medium">Response</label>
                      <textarea
                        className="input-field"
                        rows={6}
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Write a response to the user"
                      />
                      <div className="complaints-muted">
                        Tip: Keep it short, polite, and include next steps.
                      </div>
                    </div>

                    <div className="complaints-actions-row">
                      <button
                        className="btn-secondary"
                        onClick={saveAll}
                        disabled={!hasChanges || saving}
                        type="button"
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>

                      <button
                        className="btn-outline complaints-danger"
                        onClick={remove}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ComplaintDetailPage;