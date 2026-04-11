// src/pages/vehicles/AllVehiclesPage.jsx
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Toast from "../../components/Toast";

const AllVehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentMap, setDepartmentMap] = useState({});
  const itemsPerPage = 10;

  // Helper to get effective status (mirroring backend logic)
  const getEffectiveStatus = (vehicle) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Insurance or fitness expired → UNAVAILABLE
    const insuranceExpiry = vehicle.insurance?.expiryDate
      ? new Date(vehicle.insurance.expiryDate)
      : null;
    const fitnessExpiry = vehicle.fitness?.expiryDate
      ? new Date(vehicle.fitness.expiryDate)
      : null;

    if (insuranceExpiry && insuranceExpiry <= today) return "UNAVAILABLE";
    if (fitnessExpiry && fitnessExpiry <= today) return "UNAVAILABLE";

    // 2. Next maintenance due date passed → UNDER MAINTENANCE
    const nextMaintenanceDate = vehicle.nextMaintenanceDue?.date
      ? new Date(vehicle.nextMaintenanceDue.date)
      : null;
    if (nextMaintenanceDate && nextMaintenanceDate <= today) {
      return "UNDER MAINTENANCE";
    }

    // 3. Otherwise keep the stored status
    return vehicle.status || "AVAILABLE";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "AVAILABLE":
        return (
          <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700">
            Available
          </span>
        );
      case "UNDER MAINTENANCE":
        return (
          <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-700">
            Under Maintenance
          </span>
        );
      default:
        return (
          <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-rose-100 text-rose-700">
            Unavailable
          </span>
        );
    }
  };

  // Fetch vehicles and then fetch department names for IDs found in response
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const res = await api.get("/vehicles", { params: { limit: 1000 } });
        const vehiclesData = res.data.data;
        setVehicles(vehiclesData);

        // Collect unique department IDs (strings) from vehicles that have a department field
        const deptIds = [];
        vehiclesData.forEach((v) => {
          // Check if department exists and is a string (ID) and we don't already have its name
          if (
            v.department &&
            typeof v.department === "string" &&
            !departmentMap[v.department]
          ) {
            deptIds.push(v.department);
          }
        });
        const uniqueDeptIds = [...new Set(deptIds)];
        if (uniqueDeptIds.length > 0) {
          setLoadingDepts(true);
          try {
            const promises = uniqueDeptIds.map((id) =>
              api.get(`/departments/${id}`),
            );
            const deptResponses = await Promise.all(promises);
            const deptMap = {};
            deptResponses.forEach((resp, idx) => {
              deptMap[uniqueDeptIds[idx]] = resp.data.name;
            });
            setDepartmentMap((prev) => ({ ...prev, ...deptMap }));
          } catch (err) {
            console.error("Failed to fetch department names", err);
          } finally {
            setLoadingDepts(false);
          }
        }
      } catch (err) {
        setToast({ message: "Failed to load vehicles", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // Helper to get department name from vehicle object
  const getDepartmentName = (vehicle) => {
    // If department is already an object with name
    if (vehicle.department?.name) return vehicle.department.name;
    // If department is an ID string and we have fetched its name
    if (
      typeof vehicle.department === "string" &&
      departmentMap[vehicle.department]
    ) {
      return departmentMap[vehicle.department];
    }
    // If department is missing altogether
    return "—";
  };

  // Pagination
  const totalPages = Math.ceil(vehicles.length / itemsPerPage);
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return vehicles.slice(start, start + itemsPerPage);
  }, [vehicles, currentPage]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Vehicle Fleet</h1>
          <p className="text-neutral-500 text-sm mt-1">Manage your fleet</p>
        </div>
        <Link
          to="/vehicles/add"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition flex items-center gap-2"
        >
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Vehicle
        </Link>
      </div>

      {loadingDepts && (
        <div className="text-center text-sm text-neutral-500 mb-2">
          Loading department names...
        </div>
      )}

      <div className="bg-white rounded-xl shadow border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Reg No
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Brand / Model
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Category / Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Insurance Expiry
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Fitness Expiry
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Next Maintenance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {paginatedVehicles.map((vehicle) => {
                const effectiveStatus = getEffectiveStatus(vehicle);
                const departmentName = getDepartmentName(vehicle);
                const capacity =
                  vehicle.type === "Passenger"
                    ? `${vehicle.seatCapacity} seats`
                    : `${vehicle.cargoCapacityKg} kg`;

                return (
                  <tr
                    key={vehicle._id}
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-mono font-medium">
                      <Link
                        to={`/vehicles/${vehicle._id}`}
                        className="text-primary-700 hover:text-primary-900 hover:underline"
                      >
                        {vehicle.registrationNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {vehicle.brand} {vehicle.model} (
                      {vehicle.yearOfManufacture})
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {vehicle.category} / {vehicle.type}
                      <br />
                      <span className="text-xs text-neutral-500">
                        {capacity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {departmentName}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(effectiveStatus)}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {vehicle.insurance?.expiryDate
                        ? new Date(
                            vehicle.insurance.expiryDate,
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {vehicle.fitness?.expiryDate
                        ? new Date(
                            vehicle.fitness.expiryDate,
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {vehicle.nextMaintenanceDue?.date
                        ? new Date(
                            vehicle.nextMaintenanceDue.date,
                          ).toLocaleDateString()
                        : "—"}
                      {vehicle.nextMaintenanceDue?.odometer && (
                        <span className="text-xs text-neutral-500 block">
                          {vehicle.nextMaintenanceDue.odometer} km
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-neutral-200 text-neutral-600 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50"
          >
            ← Previous
          </button>
          <span className="text-neutral-600 text-sm">
            Page <strong className="text-primary-600">{currentPage}</strong> of{" "}
            {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border border-neutral-200 text-neutral-600 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default AllVehiclesPage;
