import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const emptyForm = { kind: "complaint", category: "general", subject: "", message: "" };

const ComplaintsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/complaints");
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const path = form.kind === "feedback" ? "/complaints/feedback" : "/complaints";
      await api.post(path, form);
      setForm(emptyForm);
      setSuccess("Submitted successfully");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Submit failed");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Complaints & Feedback</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 card">
          <h3 className="text-lg font-semibold">Submit</h3>
          {error && <div className="text-sm text-red-600">{error}</div>}
          {success && <div className="text-sm text-green-600">{success}</div>}
          <form onSubmit={submit} className="space-y-3">
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="kind"
                  value="complaint"
                  checked={form.kind === "complaint"}
                  onChange={() => setForm((f) => ({ ...f, kind: "complaint" }))}
                />
                Complaint
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="kind"
                  value="feedback"
                  checked={form.kind === "feedback"}
                  onChange={() => setForm((f) => ({ ...f, kind: "feedback" }))}
                />
                Feedback
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Category</label>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                <option value="general">General</option>
                <option value="road">Road/Damage</option>
                <option value="safety">Safety</option>
                <option value="driver">Driver</option>
                <option value="delay">Delay</option>
                <option value="transport">Transport</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Subject</label>
              <input
                className="input-field"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Message</label>
              <textarea
                className="input-field"
                rows={4}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                required
              />
            </div>

            <button className="w-full btn-secondary" type="submit">
              Submit
            </button>
          </form>
        </div>

        <div className="space-y-3 card">
          <h3 className="text-lg font-semibold">My {isAdmin ? "All" : ""} Complaints/Feedback</h3>
          {loading && <div className="text-sm text-neutral-600">Loading...</div>}
          {!loading && items.length === 0 && (
            <div className="text-sm text-neutral-600">No items yet.</div>
          )}
          <ul className="space-y-2">
            {items.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-neutral-50"
              >
                <div>
                  <div className="font-semibold">
                    <Link className="underline text-primary-600" to={`/complaints/${c.id}`}>
                      {c.subject}
                    </Link>
                  </div>
                  <div className="text-xs text-neutral-600">
                    {c.kind} · {c.category} · {c.status}
                  </div>
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

export default ComplaintsPage;