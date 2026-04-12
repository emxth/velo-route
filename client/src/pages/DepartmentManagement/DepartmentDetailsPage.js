import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Toast from "../../components/Toast";

const DepartmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dept, setDept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    api
      .get(`/departments/${id}`)
      .then((res) => setDept(res.data))
      .catch(() =>
        setToast({ message: "Failed to load department", type: "error" }),
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      await api.delete(`/departments/${id}`);
      navigate("/departments", {
        state: {
          toast: {
            message: "Department deleted successfully",
            type: "success",
          },
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

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  if (!dept)
    return (
      <div className="text-center py-20 text-rose-500">
        Department not found
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
                  Are you sure you want to delete the department{" "}
                  <strong className="font-semibold">{dept.name}</strong>?
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
                  Delete Department
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header – primary blue gradient (matching screenshot) */}
          <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {dept.name}
                </h1>
                <p className="text-primary-100 text-xs mt-1">
                  Department details & information
                </p>
              </div>
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-md ${
                  dept.status === "active"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {dept.status === "active" ? "● Active" : "● Inactive"}
              </div>
            </div>
          </div>

          {/* Content area – increased vertical spacing */}
          <div className="p-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              {/* Left column – more space between fields */}
              <div className="space-y-7">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Manager
                    </p>
                    <p className="text-neutral-800 text-sm font-medium">
                      {dept.managerName}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Contact Number
                    </p>
                    <p className="text-neutral-800 text-sm font-medium">
                      {dept.contactNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Email Address
                    </p>
                    <p className="text-neutral-800 text-sm font-medium break-all">
                      {dept.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right column – more space between fields */}
              <div className="space-y-7">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Region
                    </p>
                    <p className="text-neutral-800 text-sm font-medium">
                      {dept.region}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
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
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Address
                    </p>
                    <p className="text-neutral-800 text-sm font-medium leading-relaxed">
                      {dept.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Created On
                    </p>
                    <p className="text-neutral-800 text-sm font-medium">
                      {new Date(dept.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description – also with increased spacing */}
              {dept.description && (
                <div className="md:col-span-2 mt-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-neutral-200 text-neutral-600 flex items-center justify-center">
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
                          d="M4 6h16M4 12h16M4 18h7"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                        Description
                      </p>
                      <p className="text-neutral-700 text-sm leading-relaxed">
                        {dept.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons – larger */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8 pt-5 border-t border-neutral-100">
              <Link
                to={`/departments/edit/${dept._id}`}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200"
              >
                <svg
                  className="w-5 h-5 mr-2"
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
                Edit Department
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-base shadow-md hover:bg-red-700 transition-all duration-200"
              >
                <svg
                  className="w-5 h-5 mr-2"
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
                Delete Department
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetailsPage;
