import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { validateDepartmentUpdate } from "../../utils/departmentValidation";
import Toast from "../../components/Toast";

const regions = [
  "Western",
  "Southern",
  "Central",
  "Northern",
  "Eastern",
  "North Western",
  "North Central",
  "Uva",
  "Sabaragamuwa",
];

const UpdateDepartmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api
      .get(`/departments/${id}`)
      .then((res) => setForm(res.data))
      .catch(() =>
        setToast({ message: "Failed to load department", type: "error" }),
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateDepartmentUpdate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setToast({ message: "Please fix form errors", type: "error" });
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/departments/${id}`, form);
      navigate("/departments", {
        state: {
          toast: {
            message: "Department updated successfully",
            type: "success",
          },
        },
      });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Update failed",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return <div className="text-center py-20">Loading department...</div>;
  if (!form)
    return (
      <div className="text-center py-20 text-rose-500">
        Department not found
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden">
        {/* Amber/Orange header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-6">
          <h1 className="text-2xl font-bold text-white">Edit Department</h1>
          <p className="text-amber-100 text-sm mt-1">
            Update department information – you can change one or more fields
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* All fields marked with * */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Department Name <span className="text-rose-500">*</span>
              </label>
              <input
                name="name"
                value={form.name || ""}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? "border-rose-500 ring-1 ring-rose-500" : "border-neutral-200"} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                placeholder="e.g., Transport Division"
              />
              {errors.name && (
                <p className="text-rose-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Manager Name <span className="text-rose-500">*</span>
              </label>
              <input
                name="managerName"
                value={form.managerName || ""}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.managerName ? "border-rose-500 ring-1 ring-rose-500" : "border-neutral-200"} focus:outline-none focus:ring-2 focus:ring-primary-500`}
              />
              {errors.managerName && (
                <p className="text-rose-500 text-sm mt-1">
                  {errors.managerName}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Contact Number <span className="text-rose-500">*</span>
              </label>
              <input
                name="contactNumber"
                value={form.contactNumber || ""}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.contactNumber ? "border-rose-500 ring-1 ring-rose-500" : "border-neutral-200"} focus:outline-none focus:ring-2 focus:ring-primary-500`}
              />
              {errors.contactNumber && (
                <p className="text-rose-500 text-sm mt-1">
                  {errors.contactNumber}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email || ""}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.email ? "border-rose-500 ring-1 ring-rose-500" : "border-neutral-200"} focus:outline-none focus:ring-2 focus:ring-primary-500`}
              />
              {errors.email && (
                <p className="text-rose-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Address <span className="text-rose-500">*</span>
              </label>
              <input
                name="address"
                value={form.address || ""}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.address ? "border-rose-500 ring-1 ring-rose-500" : "border-neutral-200"} focus:outline-none focus:ring-2 focus:ring-primary-500`}
              />
              {errors.address && (
                <p className="text-rose-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Region <span className="text-rose-500">*</span>
              </label>
              <select
                name="region"
                value={form.region || ""}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.region ? "border-rose-500 ring-1 ring-rose-500" : "border-neutral-200"} bg-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
              >
                <option value="">Select Region</option>
                {regions.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              {errors.region && (
                <p className="text-rose-500 text-sm mt-1">{errors.region}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                name="status"
                value={form.status || "active"}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Description (optional)
              </label>
              <textarea
                name="description"
                rows="4"
                value={form.description || ""}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => navigate(`/departments/${id}`)} // ← changed to go to details page
              className="px-6 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70"
            >
              {submitting ? "Updating..." : "Update Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateDepartmentPage;
