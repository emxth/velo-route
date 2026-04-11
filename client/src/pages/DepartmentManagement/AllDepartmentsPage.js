import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
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

const AllDepartmentsPage = () => {
  const [allDepartments, setAllDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await api.get("/departments", { params: { limit: 1000 } });
        setAllDepartments(res.data.data);
      } catch (err) {
        setToast({ message: "Failed to load departments", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filteredDepartments = useMemo(() => {
    let result = [...allDepartments];
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      result = result.filter(
        (dept) =>
          dept.name?.toLowerCase().includes(searchLower) ||
          dept.managerName?.toLowerCase().includes(searchLower) ||
          dept.email?.toLowerCase().includes(searchLower),
      );
    }
    if (region) result = result.filter((dept) => dept.region === region);
    if (status) result = result.filter((dept) => dept.status === status);
    return result;
  }, [allDepartments, search, region, status]);

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const paginatedDepartments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDepartments.slice(start, start + itemsPerPage);
  }, [filteredDepartments, currentPage]);

  useEffect(() => setCurrentPage(1), [search, region, status]);

  const resetFilters = () => {
    setSearch("");
    setRegion("");
    setStatus("");
    setCurrentPage(1);
  };

  const getStatusStyle = (status) => {
    if (status === "active") {
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        dot: "bg-emerald-600",
      };
    }
    return { bg: "bg-rose-100", text: "text-rose-800", dot: "bg-rose-600" };
  };

  // Truncate helper with title for full text on hover
  const truncate = (str, maxLength = 30) => {
    if (!str) return "—";
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + "...";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
            Departments
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Manage and oversee all organizational departments
          </p>
        </div>
        <Link
          to="/departments/add"
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
          Add Department
        </Link>
      </div>

      {/* Search & Filters with nice Reset button */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, manager or email..."
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <button
              onClick={resetFilters}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary-50 border border-secondary-200 text-secondary-700 font-semibold hover:bg-secondary-100 hover:border-secondary-300 transition-all flex items-center justify-center gap-2"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reset filters
            </button>
          </div>
        </div>
      </div>

      {/* Grid UI – no address column */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-neutral-200 p-4 animate-pulse"
            >
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3 h-5 bg-neutral-200 rounded"></div>
                <div className="col-span-2 h-5 bg-neutral-200 rounded"></div>
                <div className="col-span-4 h-5 bg-neutral-200 rounded"></div>
                <div className="col-span-2 h-5 bg-neutral-200 rounded"></div>
                <div className="col-span-1 h-5 bg-neutral-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : paginatedDepartments.length === 0 ? (
        <div className="text-center py-20 bg-neutral-50 rounded-2xl">
          <svg
            className="w-20 h-20 mx-auto text-neutral-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <p className="text-neutral-500 text-lg">No departments found</p>
          <p className="text-neutral-400 text-sm mt-1">
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <>
          {/* Grid header – bold, no address column */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-neutral-50 rounded-xl text-sm font-bold text-neutral-700 uppercase tracking-wide mb-2">
            <div className="col-span-3">Department name</div>
            <div className="col-span-2">Manager</div>
            <div className="col-span-4">Email</div>
            <div className="col-span-2">Region</div>
            <div className="col-span-1">Status</div>
          </div>

          {/* Grid rows */}
          <div className="space-y-3">
            {paginatedDepartments.map((dept) => {
              const statusStyle = getStatusStyle(dept.status);
              return (
                <div
                  key={dept._id}
                  className="bg-white rounded-xl border border-neutral-200 hover:border-primary-200 hover:shadow-md transition-all duration-200 p-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start md:items-center">
                    {/* Department name – clickable */}
                    <div className="md:col-span-3">
                      <Link
                        to={`/departments/${dept._id}`}
                        className="font-semibold text-primary-700 hover:text-primary-800 hover:underline transition-colors text-base"
                      >
                        {dept.name}
                      </Link>
                    </div>
                    {/* Manager */}
                    <div className="md:col-span-2">
                      <span className="md:hidden text-xs font-semibold text-neutral-500 block mb-0.5">
                        Manager
                      </span>
                      <p
                        className="text-neutral-800 text-sm truncate"
                        title={dept.managerName}
                      >
                        {truncate(dept.managerName, 25)}
                      </p>
                    </div>
                    {/* Email */}
                    <div className="md:col-span-4">
                      <span className="md:hidden text-xs font-semibold text-neutral-500 block mb-0.5">
                        Email
                      </span>
                      <p
                        className="text-neutral-800 text-sm truncate"
                        title={dept.email}
                      >
                        {truncate(dept.email, 35)}
                      </p>
                    </div>
                    {/* Region */}
                    <div className="md:col-span-2">
                      <span className="md:hidden text-xs font-semibold text-neutral-500 block mb-0.5">
                        Region
                      </span>
                      <p className="text-neutral-800 text-sm">{dept.region}</p>
                    </div>
                    {/* Status – bigger badge */}
                    <div className="md:col-span-1">
                      <span className="md:hidden text-xs font-semibold text-neutral-500 block mb-0.5">
                        Status
                      </span>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${statusStyle.dot}`}
                        ></span>
                        {dept.status === "active" ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-5 py-2 rounded-xl border border-neutral-200 text-neutral-600 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 transition-all"
              >
                ← Previous
              </button>
              <span className="text-neutral-600 text-sm">
                Page <strong className="text-primary-600">{currentPage}</strong>{" "}
                of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-5 py-2 rounded-xl border border-neutral-200 text-neutral-600 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 transition-all"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllDepartmentsPage;
