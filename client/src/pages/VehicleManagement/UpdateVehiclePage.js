import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { validateVehicleForm } from "../../utils/vehicleValidation";
import Toast from "../../components/Toast";

const categories = ["Bus", "Train"];
const types = ["Passenger", "Cargo"];
const insuranceTypes = ["Comprehensive", "Third Party", "Liability"];
const statuses = ["AVAILABLE", "UNDER MAINTENANCE", "UNAVAILABLE"];

const UpdateVehiclePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  // Reset irrelevant capacity when type changes
  useEffect(() => {
    if (form && form.type === "Passenger") {
      setForm((prev) => ({ ...prev, cargoCapacityKg: "" }));
    } else if (form && form.type === "Cargo") {
      setForm((prev) => ({ ...prev, seatCapacity: "" }));
    }
  }, [form?.type]);

  useEffect(() => {
    Promise.all([api.get("/departments?limit=100"), api.get(`/vehicles/${id}`)])
      .then(([deptRes, vehicleRes]) => {
        setDepartments(deptRes.data.data);
        const vehicle = vehicleRes.data;
        // Format dates for input fields
        if (vehicle.insurance?.startDate)
          vehicle.insurance.startDate =
            vehicle.insurance.startDate.split("T")[0];
        if (vehicle.insurance?.expiryDate)
          vehicle.insurance.expiryDate =
            vehicle.insurance.expiryDate.split("T")[0];
        if (vehicle.fitness?.issueDate)
          vehicle.fitness.issueDate = vehicle.fitness.issueDate.split("T")[0];
        if (vehicle.fitness?.expiryDate)
          vehicle.fitness.expiryDate = vehicle.fitness.expiryDate.split("T")[0];
        if (vehicle.lastMaintenance?.date)
          vehicle.lastMaintenance.date =
            vehicle.lastMaintenance.date.split("T")[0];
        if (vehicle.nextMaintenanceDue?.date)
          vehicle.nextMaintenanceDue.date =
            vehicle.nextMaintenanceDue.date.split("T")[0];
        setForm(vehicle);
        setLoading(false);
      })
      .catch((err) => {
        setToast({ message: "Failed to load vehicle", type: "error" });
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setForm((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateVehicleForm(form, true);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setToast({ message: "Please fix form errors", type: "error" });
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (
        key === "_id" ||
        key === "createdAt" ||
        key === "updatedAt" ||
        key === "__v" ||
        key === "departmentDetails" ||
        key === "vehiclePhoto"
      )
        return;
      if (
        [
          "insurance",
          "fitness",
          "lastMaintenance",
          "nextMaintenanceDue",
        ].includes(key)
      ) {
        Object.keys(form[key]).forEach((sub) => {
          if (form[key][sub]) formData.append(`${key}[${sub}]`, form[key][sub]);
        });
      } else {
        if (form[key] !== undefined && form[key] !== null && form[key] !== "")
          formData.append(key, form[key]);
      }
    });
    if (imageFile) formData.append("vehiclePhoto", imageFile);

    try {
      await api.put(`/vehicles/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/vehicles", {
        state: {
          toast: { message: "Vehicle updated successfully", type: "success" },
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
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  if (!form)
    return (
      <div className="text-center py-20 text-rose-500">Vehicle not found</div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden">
        {/* Header - amber/orange gradient for edit context */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-6">
          <h1 className="text-2xl font-bold text-white">Edit Vehicle</h1>
          <p className="text-amber-100 text-sm mt-1">
            Update vehicle information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Basic Info Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Registration Number <span className="text-red-500">*</span>
              </label>
              <input
                name="registrationNumber"
                value={form.registrationNumber || ""}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.registrationNumber
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-neutral-200"
                } focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all`}
              />
              {errors.registrationNumber && (
                <p className="text-rose-500 text-sm mt-1">
                  {errors.registrationNumber}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-rose-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {types.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              {errors.type && (
                <p className="text-rose-500 text-sm mt-1">{errors.type}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Brand <span className="text-red-500">*</span>
              </label>
              <input
                name="brand"
                value={form.brand || ""}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.brand
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-neutral-200"
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              />
              {errors.brand && (
                <p className="text-rose-500 text-sm mt-1">{errors.brand}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Model <span className="text-red-500">*</span>
              </label>
              <input
                name="model"
                value={form.model || ""}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.model
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-neutral-200"
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              />
              {errors.model && (
                <p className="text-rose-500 text-sm mt-1">{errors.model}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Year of Manufacture <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="yearOfManufacture"
                value={form.yearOfManufacture || ""}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.yearOfManufacture
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-neutral-200"
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              />
              {errors.yearOfManufacture && (
                <p className="text-rose-500 text-sm mt-1">
                  {errors.yearOfManufacture}
                </p>
              )}
            </div>

            {/* Conditional Capacity Fields */}
            {form.type === "Passenger" && (
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                  Seat Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="seatCapacity"
                  value={form.seatCapacity || ""}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.seatCapacity
                      ? "border-rose-500 ring-1 ring-rose-500"
                      : "border-neutral-200"
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
                {errors.seatCapacity && (
                  <p className="text-rose-500 text-sm mt-1">
                    {errors.seatCapacity}
                  </p>
                )}
              </div>
            )}
            {form.type === "Cargo" && (
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                  Cargo Capacity (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="cargoCapacityKg"
                  value={form.cargoCapacityKg || ""}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.cargoCapacityKg
                      ? "border-rose-500 ring-1 ring-rose-500"
                      : "border-neutral-200"
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
                {errors.cargoCapacityKg && (
                  <p className="text-rose-500 text-sm mt-1">
                    {errors.cargoCapacityKg}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                value={form.department?._id || form.department || ""}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.department
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-neutral-200"
                } bg-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="text-rose-500 text-sm mt-1">
                  {errors.department}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={form.status || "AVAILABLE"}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.status
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-neutral-200"
                } bg-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
              >
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              {errors.status && (
                <p className="text-rose-500 text-sm mt-1">{errors.status}</p>
              )}
            </div>
          </div>

          {/* Insurance Section – blue border */}
          <div className="bg-neutral-50 rounded-xl p-6 border-2 border-blue-200">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Insurance Details
            </h3>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Provider <span className="text-red-500">*</span>
                </label>
                <input
                  name="insurance.provider"
                  value={form.insurance?.provider || ""}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors["insurance.provider"]
                      ? "border-rose-500"
                      : "border-neutral-200"
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
                {errors["insurance.provider"] && (
                  <p className="text-rose-500 text-sm mt-1">
                    {errors["insurance.provider"]}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Policy Number <span className="text-red-500">*</span>
                </label>
                <input
                  name="insurance.policyNumber"
                  value={form.insurance?.policyNumber || ""}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors["insurance.policyNumber"]
                      ? "border-rose-500"
                      : "border-neutral-200"
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
                {errors["insurance.policyNumber"] && (
                  <p className="text-rose-500 text-sm mt-1">
                    {errors["insurance.policyNumber"]}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Type
                </label>
                <select
                  name="insurance.type"
                  value={form.insurance?.type || "Comprehensive"}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {insuranceTypes.map((it) => (
                    <option key={it}>{it}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="insurance.startDate"
                  value={form.insurance?.startDate || ""}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors["insurance.startDate"]
                      ? "border-rose-500"
                      : "border-neutral-200"
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
                {errors["insurance.startDate"] && (
                  <p className="text-rose-500 text-sm mt-1">
                    {errors["insurance.startDate"]}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="insurance.expiryDate"
                  value={form.insurance?.expiryDate || ""}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors["insurance.expiryDate"]
                      ? "border-rose-500"
                      : "border-neutral-200"
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
                {errors["insurance.expiryDate"] && (
                  <p className="text-rose-500 text-sm mt-1">
                    {errors["insurance.expiryDate"]}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Fitness Section – PURPLE BORDER (neutral background, black heading) */}
          <div className="bg-neutral-50 rounded-xl p-6 border-2 border-purple-200">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Fitness Certificate
            </h3>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Certificate Number <span className="text-red-500">*</span>
                </label>
                <input
                  name="fitness.certificateNumber"
                  value={form.fitness?.certificateNumber || ""}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors["fitness.certificateNumber"]
                      ? "border-rose-500"
                      : "border-neutral-200"
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
                {errors["fitness.certificateNumber"] && (
                  <p className="text-rose-500 text-sm mt-1">
                    {errors["fitness.certificateNumber"]}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Issue Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="fitness.issueDate"
                  value={form.fitness?.issueDate || ""}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors["fitness.issueDate"]
                      ? "border-rose-500"
                      : "border-neutral-200"
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
                {errors["fitness.issueDate"] && (
                  <p className="text-rose-500 text-sm mt-1">
                    {errors["fitness.issueDate"]}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="fitness.expiryDate"
                  value={form.fitness?.expiryDate || ""}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors["fitness.expiryDate"]
                      ? "border-rose-500"
                      : "border-neutral-200"
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
                {errors["fitness.expiryDate"] && (
                  <p className="text-rose-500 text-sm mt-1">
                    {errors["fitness.expiryDate"]}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Maintenance Section – amber border */}
          <div className="bg-neutral-50 rounded-xl p-6 border-2 border-amber-200">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Maintenance (Optional)
            </h3>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Last Maintenance Date
                </label>
                <input
                  type="date"
                  name="lastMaintenance.date"
                  value={form.lastMaintenance?.date || ""}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors["lastMaintenance.date"]
                      ? "border-rose-500"
                      : "border-neutral-200"
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
                {errors["lastMaintenance.date"] && (
                  <p className="text-rose-500 text-sm mt-1">
                    {errors["lastMaintenance.date"]}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Maintenance Type
                </label>
                <input
                  name="lastMaintenance.maintenanceType"
                  value={form.lastMaintenance?.maintenanceType || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Odometer (km)
                </label>
                <input
                  type="number"
                  name="lastMaintenance.odometer"
                  value={form.lastMaintenance?.odometer || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Next Maintenance Due
                </label>
                <input
                  type="date"
                  name="nextMaintenanceDue.date"
                  value={form.nextMaintenanceDue?.date || ""}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors["nextMaintenanceDue.date"]
                      ? "border-rose-500"
                      : "border-neutral-200"
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
                {errors["nextMaintenanceDue.date"] && (
                  <p className="text-rose-500 text-sm mt-1">
                    {errors["nextMaintenanceDue.date"]}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Next Odometer (km)
                </label>
                <input
                  type="number"
                  name="nextMaintenanceDue.odometer"
                  value={form.nextMaintenanceDue?.odometer || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Vehicle Photo{" "}
              <span className="text-neutral-400 text-xs">
                (optional, new replaces old)
              </span>
            </label>
            <div className="flex items-center gap-4 flex-wrap">
              <label className="cursor-pointer bg-primary-50 hover:bg-primary-100 text-primary-700 px-5 py-2.5 rounded-xl font-medium transition-all border border-primary-200">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg shadow"
                />
              ) : (
                form.vehiclePhoto && (
                  <img
                    src={form.vehiclePhoto}
                    alt="Current"
                    className="w-24 h-24 object-cover rounded-lg shadow"
                  />
                )
              )}
            </div>
          </div>

          {/* Form Actions – Update button in orange */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => navigate("/vehicles")}
              className="px-6 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-70"
            >
              {submitting ? "Updating..." : "Update Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateVehiclePage;
