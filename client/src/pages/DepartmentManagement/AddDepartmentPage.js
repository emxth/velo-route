import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { validateDepartmentForm } from "../../utils/departmentValidation";
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

const AddDepartmentPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    managerName: "",
    contactNumber: "",
    email: "",
    address: "",
    region: "",
    // status field removed as requested
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateDepartmentForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setToast({ message: "Please fix form errors", type: "error" });
      return;
    }
    setLoading(true);
    try {
      await api.post("/departments", form);
      navigate("/departments", {
        state: {
          toast: {
            message: "Department created successfully",
            type: "success",
          },
        },
      });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Creation failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

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
        {/* Modern gradient header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-8 py-6">
          <h1 className="text-2xl font-bold text-white">
            Create New Department
          </h1>
          <p className="text-primary-100 text-sm mt-1">
            Fill in the details to add a department to the system
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Department Name <span className="text-rose-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? "border-rose-500 ring-1 ring-rose-500" : "border-neutral-200"} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                placeholder="e.g., Ceylon Transport Board"
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
                value={form.managerName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Sampath Perera"
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
                value={form.contactNumber}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="0763456278"
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
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="department@gmail.com"
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
                value={form.address}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="No.50, Colombo"
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
                value={form.region}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
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
            {/* Status dropdown removed as requested */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Description (optional)
              </label>
              <textarea
                name="description"
                rows="4"
                value={form.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                placeholder="Additional information about the department"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => navigate("/departments")}
              className="px-6 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70"
            >
              {loading ? "Creating..." : "Create Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartmentPage;
