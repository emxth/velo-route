import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Toast from "../../components/Toast";

const VehicleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [departmentName, setDepartmentName] = useState("—");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await api.get(`/vehicles/${id}`);
        const vehicleData = res.data;
        setVehicle(vehicleData);

        // Get department name
        if (vehicleData.department?.name) {
          setDepartmentName(vehicleData.department.name);
        } else if (vehicleData.departmentDetails?.name) {
          setDepartmentName(vehicleData.departmentDetails.name);
        } else if (
          vehicleData.department &&
          typeof vehicleData.department === "string"
        ) {
          try {
            const deptRes = await api.get(
              `/departments/${vehicleData.department}`,
            );
            setDepartmentName(deptRes.data.name);
          } catch {
            setDepartmentName("—");
          }
        } else {
          setDepartmentName("—");
        }
      } catch (err) {
        setToast({ message: "Failed to load vehicle", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

  const handleDelete = async () => {
    try {
      await api.delete(`/vehicles/${id}`);
      navigate("/vehicles", {
        state: {
          toast: { message: "Vehicle deleted successfully", type: "success" },
        },
      });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Delete failed",
        type: "error",
      });
      setShowDeleteModal(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "AVAILABLE":
        return {
          label: "Available",
          bg: "bg-emerald-100",
          text: "text-emerald-700",
          dot: "bg-emerald-500",
        };
      case "UNDER MAINTENANCE":
        return {
          label: "Under Maintenance",
          bg: "bg-amber-100",
          text: "text-amber-700",
          dot: "bg-amber-500",
        };
      default:
        return {
          label: "Unavailable",
          bg: "bg-rose-100",
          text: "text-rose-700",
          dot: "bg-rose-500",
        };
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  if (!vehicle)
    return (
      <div className="text-center py-20 text-rose-500">Vehicle not found</div>
    );

  const statusConfig = getStatusConfig(vehicle.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
              <div className="bg-rose-50 px-6 py-4 border-b border-rose-100">
                <h3 className="text-lg font-bold text-rose-800 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Confirm Deletion
                </h3>
              </div>
              <div className="px-6 py-4">
                <p className="text-neutral-700">
                  Are you sure you want to delete the vehicle{" "}
                  <strong className="font-semibold">
                    {vehicle.registrationNumber}
                  </strong>
                  ?
                </p>
                <p className="text-neutral-500 text-sm mt-1">
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 bg-neutral-50">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg bg-rose-500 text-white font-medium hover:bg-rose-600"
                >
                  Delete Vehicle
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with status badge inside top-right */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-5 flex justify-between items-center flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white font-mono tracking-tight">
                {vehicle.registrationNumber}
              </h1>
              <p className="text-primary-100 text-sm mt-1">
                {vehicle.brand} {vehicle.model} • {vehicle.yearOfManufacture}
              </p>
            </div>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${statusConfig.bg} ${statusConfig.text}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${statusConfig.dot}`}
              ></span>
              {statusConfig.label}
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Horizontal row: Image + Basic Info */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              {vehicle.vehiclePhoto && (
                <div className="md:w-56 h-40 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                  <img
                    src={vehicle.vehiclePhoto}
                    alt="Vehicle"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-neutral-500 text-xs uppercase tracking-wide mb-1">
                    Department
                  </div>
                  <div className="font-semibold text-neutral-800 text-base">
                    {departmentName}
                  </div>
                </div>
                <div>
                  <div className="text-neutral-500 text-xs uppercase tracking-wide mb-1">
                    Category / Type
                  </div>
                  <div className="font-semibold text-neutral-800 text-base">
                    {vehicle.category} / {vehicle.type}
                  </div>
                </div>
                {vehicle.type === "Passenger" && (
                  <div>
                    <div className="text-neutral-500 text-xs uppercase tracking-wide mb-1">
                      Seat Capacity
                    </div>
                    <div className="font-semibold text-neutral-800 text-base">
                      {vehicle.seatCapacity}
                    </div>
                  </div>
                )}
                {vehicle.type === "Cargo" && (
                  <div>
                    <div className="text-neutral-500 text-xs uppercase tracking-wide mb-1">
                      Cargo Capacity
                    </div>
                    <div className="font-semibold text-neutral-800 text-base">
                      {vehicle.cargoCapacityKg} kg
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Insurance & Fitness sections */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Insurance Card - Blue theme */}
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <svg
                      className="w-4 h-4"
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
                  </div>
                  <h3 className="font-bold text-blue-800 text-base">
                    Insurance Details
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-blue-100">
                    <span className="text-blue-700">Provider:</span>
                    <span className="font-medium text-neutral-800">
                      {vehicle.insurance?.provider || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-blue-100">
                    <span className="text-blue-700">Policy Number:</span>
                    <span className="font-medium text-neutral-800">
                      {vehicle.insurance?.policyNumber || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-blue-100">
                    <span className="text-blue-700">Type:</span>
                    <span className="font-medium text-neutral-800">
                      {vehicle.insurance?.type || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-blue-700">Expiry Date:</span>
                    <span className="font-medium text-neutral-800">
                      {vehicle.insurance?.expiryDate
                        ? new Date(
                            vehicle.insurance.expiryDate,
                          ).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fitness Card - Purple theme */}
              <div className="bg-purple-50 rounded-xl p-5 border border-purple-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <svg
                      className="w-4 h-4"
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
                  </div>
                  <h3 className="font-bold text-purple-800 text-base">
                    Fitness Certificate
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-purple-100">
                    <span className="text-purple-700">Certificate Number:</span>
                    <span className="font-medium text-neutral-800">
                      {vehicle.fitness?.certificateNumber || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-purple-100">
                    <span className="text-purple-700">Issue Date:</span>
                    <span className="font-medium text-neutral-800">
                      {vehicle.fitness?.issueDate
                        ? new Date(
                            vehicle.fitness.issueDate,
                          ).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-purple-700">Expiry Date:</span>
                    <span className="font-medium text-neutral-800">
                      {vehicle.fitness?.expiryDate
                        ? new Date(
                            vehicle.fitness.expiryDate,
                          ).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance Section - Amber theme */}
            {(vehicle.lastMaintenance?.date ||
              vehicle.nextMaintenanceDue?.date) && (
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 shadow-sm mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <svg
                      className="w-4 h-4"
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
                  </div>
                  <h3 className="font-bold text-amber-800 text-base">
                    Maintenance Schedule
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  {vehicle.lastMaintenance?.date && (
                    <div>
                      <div className="text-amber-700 mb-1">
                        Last Maintenance
                      </div>
                      <div className="font-medium text-neutral-800">
                        {new Date(
                          vehicle.lastMaintenance.date,
                        ).toLocaleDateString()}
                        {vehicle.lastMaintenance.maintenanceType &&
                          ` (${vehicle.lastMaintenance.maintenanceType})`}
                        {vehicle.lastMaintenance.odometer &&
                          ` • ${vehicle.lastMaintenance.odometer} km`}
                      </div>
                    </div>
                  )}
                  {vehicle.nextMaintenanceDue?.date && (
                    <div>
                      <div className="text-amber-700 mb-1">
                        Next Maintenance Due
                      </div>
                      <div className="font-medium text-neutral-800">
                        {new Date(
                          vehicle.nextMaintenanceDue.date,
                        ).toLocaleDateString()}
                        {vehicle.nextMaintenanceDue.odometer &&
                          ` • ${vehicle.nextMaintenanceDue.odometer} km`}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Buttons at bottom right with icons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
              <Link
                to={`/vehicles/edit/${vehicle._id}`}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Vehicle
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-red-600 text-white font-semibold shadow-md hover:bg-red-700 transition-all"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete Vehicle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsPage;
