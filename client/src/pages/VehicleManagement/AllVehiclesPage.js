// src/pages/VehicleManagement/AllVehiclesPage.jsx
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Toast from "../../components/Toast";
import SearchBar from "../../components/SearchBar";
import FilterDropdown from "../../components/FilterDropdown";
import Pagination from "../../components/Pagination";
import ResetButton from "../../components/ResetButton";

const AllVehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states
  const [searchRegNo, setSearchRegNo] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Effective status logic (mirrors backend)
  const getEffectiveStatus = (vehicle) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (vehicle.departmentDetails?.status === "inactive") return "UNAVAILABLE";

    const insuranceExpiry = vehicle.insurance?.expiryDate
      ? new Date(vehicle.insurance.expiryDate)
      : null;
    const fitnessExpiry = vehicle.fitness?.expiryDate
      ? new Date(vehicle.fitness.expiryDate)
      : null;

    if (insuranceExpiry && insuranceExpiry <= today) return "UNAVAILABLE";
    if (fitnessExpiry && fitnessExpiry <= today) return "UNAVAILABLE";

    const nextMaintenanceDate = vehicle.nextMaintenanceDue?.date
      ? new Date(vehicle.nextMaintenanceDue.date)
      : null;
    if (nextMaintenanceDate && nextMaintenanceDate <= today) {
      return "UNDER MAINTENANCE";
    }

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

  // Fetch all vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const res = await api.get("/vehicles", { params: { limit: 1000 } });
        setVehicles(res.data.data);
      } catch (err) {
        setToast({ message: "Failed to load vehicles", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // Apply all filters
  const filteredVehicles = useMemo(() => {
    let result = [...vehicles];

    if (searchRegNo.trim()) {
      const searchLower = searchRegNo.trim().toLowerCase();
      result = result.filter((v) =>
        v.registrationNumber?.toLowerCase().includes(searchLower),
      );
    }

    if (filterCategory) {
      result = result.filter((v) => v.category === filterCategory);
    }

    if (filterType) {
      result = result.filter((v) => v.type === filterType);
    }

    if (filterStatus) {
      result = result.filter((v) => getEffectiveStatus(v) === filterStatus);
    }

    return result;
  }, [vehicles, searchRegNo, filterCategory, filterType, filterStatus]);

  // Reset all filters
  const resetFilters = () => {
    setSearchRegNo("");
    setFilterCategory("");
    setFilterType("");
    setFilterStatus("");
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(start, start + itemsPerPage);
  }, [filteredVehicles, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchRegNo, filterCategory, filterType, filterStatus]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header with gradient title (like departments page) */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
            Vehicles
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Manage and oversee all vehicles here
          </p>
        </div>
        <Link
          to="/vehicles/add"
          className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all duration-200 flex items-center gap-2"
        >
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Vehicle
        </Link>
      </div>

      {/* Filter Bar – using reusable components */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 mb-10">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Search by Registration Number
            </label>
            <SearchBar
              value={searchRegNo}
              onChange={setSearchRegNo}
              placeholder="Search by registration number..."
            />
          </div>
          <div className="w-40">
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Category
            </label>
            <FilterDropdown
              label="Category"
              options={["Bus", "Train"]}
              value={filterCategory}
              onChange={setFilterCategory}
            />
          </div>
          <div className="w-40">
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Type
            </label>
            <FilterDropdown
              label="Type"
              options={["Passenger", "Cargo"]}
              value={filterType}
              onChange={setFilterType}
            />
          </div>
          <div className="w-40">
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Status
            </label>
            <FilterDropdown
              label="Status"
              options={["AVAILABLE", "UNDER MAINTENANCE", "UNAVAILABLE"]}
              value={filterStatus}
              onChange={setFilterStatus}
            />
          </div>
          <div>
            <ResetButton onClick={resetFilters} />
          </div>
        </div>
      </div>

      {/* Data Table – Reg No in dark blue, larger */}
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
                const capacity =
                  vehicle.type === "Passenger"
                    ? `${vehicle.seatCapacity} seats`
                    : `${vehicle.cargoCapacityKg} kg`;

                return (
                  <tr
                    key={vehicle._id}
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    {/* Registration Number - dark blue, larger, bold */}
                    <td className="px-4 py-3">
                      <Link
                        to={`/vehicles/${vehicle._id}`}
                        className="text-blue-800 hover:text-blue-900 hover:underline font-semibold text-base"
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

      {/* Pagination - using Pagination component */}
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default AllVehiclesPage;
