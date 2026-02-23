import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  kind: "complaint",
  category: "general",
  subject: "",
  message: "",
  location: { lat: "", lng: "", label: "" },
};

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

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          location: {
            ...f.location,
            lat: pos.coords.latitude.toFixed(6),
            lng: pos.coords.longitude.toFixed(6),
          },
        }));
      },
      () => setError("Unable to fetch current location")
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const path = form.kind === "feedback" ? "/complaints/feedback" : "/complaints";
      const payload = {
        kind: form.kind,
        category: form.category,
        subject: form.subject,
        message: form.message,
      };
      if (form.location.lat && form.location.lng) {
        payload.location = {
          lat: Number(form.location.lat),
          lng: Number(form.location.lng),
          label: form.location.label,
        };
      }
      await api.post(path, payload);
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

            <div className="p-3 space-y-2 border rounded-lg bg-neutral-50">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Attach Location (optional)</div>
                <button type="button" className="text-sm text-primary-600" onClick={useMyLocation}>
                  Use my location
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-neutral-600">Latitude</label>
                  <input
                    className="input-field"
                    value={form.location.lat}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, location: { ...f.location, lat: e.target.value } }))
                    }
                    placeholder="e.g. 7.8731"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-600">Longitude</label>
                  <input
                    className="input-field"
                    value={form.location.lng}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, location: { ...f.location, lng: e.target.value } }))
                    }
                    placeholder="e.g. 80.7718"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-neutral-600">Location label (optional)</label>
                <input
                  className="input-field"
                  value={form.location.label}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: { ...f.location, label: e.target.value } }))
                  }
                  placeholder="e.g. Near main road, bridge"
                />
              </div>
              {(form.location.lat && form.location.lng) && (
                <div className="text-xs text-neutral-700">
                  Selected: {form.location.lat}, {form.location.lng} {form.location.label ? `(${form.location.label})` : ""}
                </div>
              )}
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
                  {c.location && (
                    <div className="text-xs text-neutral-500">
                      {c.location.lat}, {c.location.lng} {c.location.label ? `(${c.location.label})` : ""}
                    </div>
                  )}
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