// pages/SchedulePage.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import LoadingVehicle from "../components/LoadingVehicle";
import api from "../api/axios";
import ScheduleTable from "../components/Schedule & Routing/ScheduleTable";
import ScheduleFilters from "../components/Schedule & Routing/ScheduleFilters";
import ScheduleErrorState from "../components/Schedule & Routing/ScheduleErrorState";
import ScheduleEmptyState from "../components/Schedule & Routing/ScheduleEmptyState";

const SchedulePage = () => {
    const [allSchedules, setAllSchedules] = useState([]); // Store all fetched schedules
    const [filteredSchedules, setFilteredSchedules] = useState([]); // Filtered results
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter states
    const [filters, setFilters] = useState({
        routeName: "",
        startDestination: "",
        endDestination: "",
        arrivalTime: "",
        date: "",
    });

    // Fetch all schedules once
    const fetchSchedules = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log("Find schedules");
            // Fetch all active schedules (no filters on backend)
            const response = await api.get("/schedules/", {
                params: { active: true }
            });

            // Extract schedules from response
            const scheduleData = response.data.schedule || response.data || [];
            setAllSchedules(scheduleData);
            console.log(scheduleData);
        } catch (error) {
            console.error("Error fetching schedules:", error);
            setError(error.response?.data?.error || "Failed to load schedules");
        } finally {
            setLoading(false);
        }
    }, []);

    // Extract unique values for dropdowns from all schedules
    const filterOptions = useMemo(() => {
        const routes = new Set();
        const startDestinations = new Set();
        const endDestinations = new Set();

        allSchedules.forEach(schedule => {
            const route = schedule.routeId;
            if (route) {
                if (route.name) routes.add(route.name);
                if (route.startLocation?.name) startDestinations.add(route.startLocation.name);
                if (route.endLocation?.name) endDestinations.add(route.endLocation.name);
            }
        });

        return {
            routes: Array.from(routes).sort(),
            startDestinations: Array.from(startDestinations).sort(),
            endDestinations: Array.from(endDestinations).sort()
        };
    }, [allSchedules]);

    // Apply all filters on the frontend
    const applyFilters = useCallback(() => {
        let filtered = [...allSchedules];

        // Filter by route name
        if (filters.routeName) {
            filtered = filtered.filter(schedule =>
                schedule.routeId?.name?.toLowerCase().includes(filters.routeName.toLowerCase())
            );
        }

        // Filter by start destination
        if (filters.startDestination) {
            filtered = filtered.filter(schedule =>
                schedule.routeId?.startLocation?.name?.toLowerCase().includes(filters.startDestination.toLowerCase())
            );
        }

        // Filter by end destination
        if (filters.endDestination) {
            filtered = filtered.filter(schedule =>
                schedule.routeId?.endLocation?.name?.toLowerCase().includes(filters.endDestination.toLowerCase())
            );
        }

        // Filter by date
        if (filters.date) {
            filtered = filtered.filter(schedule => {
                const scheduleDate = format(new Date(schedule.depatureTime), "yyyy-MM-dd");
                return scheduleDate === filters.date;
            });
        }

        // Filter by arrival time (with 30 minute buffer)
        if (filters.arrivalTime) {
            const [searchHour, searchMinute] = filters.arrivalTime.split(':').map(Number);
            const searchTotalMinutes = searchHour * 60 + searchMinute;

            filtered = filtered.filter(schedule => {
                const arrivalDate = new Date(schedule.arrivalTime);
                const arrivalTotalMinutes = arrivalDate.getHours() * 60 + arrivalDate.getMinutes();
                const timeDiff = Math.abs(arrivalTotalMinutes - searchTotalMinutes);
                return timeDiff <= 30; // 30 minutes buffer
            });
        }

        setFilteredSchedules(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [allSchedules, filters]);

    // Fetch schedules on mount
    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    // Apply filters whenever allSchedules or filters change
    useEffect(() => {
        if (allSchedules.length > 0) {
            applyFilters();
        }
    }, [allSchedules, filters, applyFilters]);

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({
            routeName: "",
            startDestination: "",
            endDestination: "",
            arrivalTime: "",
            date: ""
        });
    };

    // Pagination
    const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSchedules = filteredSchedules.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingVehicle message="Loading schedule data..." />
            </div>
        );
    }

    if (error) {
        return <ScheduleErrorState error={error} onRetry={fetchSchedules} />;
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Schedule Checker</h1>
                <p className="text-neutral-600 mt-1">
                    View and filter bus schedules by route, destinations, and time
                </p>
            </div>

            {/* Filters Section */}
            <ScheduleFilters
                filters={filters}
                filterOptions={filterOptions}
                onFilterChange={handleFilterChange}
                onReset={resetFilters}
            />

            {/* Results Summary */}
            <div className="flex justify-between items-center flex-wrap gap-3">
                <p className="text-neutral-600">
                    Found <span className="font-semibold text-primary-700">{filteredSchedules.length}</span> schedule(s)
                    {filteredSchedules.length !== allSchedules.length && (
                        <span className="text-sm text-neutral-500 ml-2">
                            (filtered from {allSchedules.length} total)
                        </span>
                    )}
                </p>

                {Object.values(filters).some(v => v) && (
                    <div className="text-sm text-neutral-500">
                        Active filters: {Object.entries(filters).filter(([_, v]) => v).length}
                    </div>
                )}
            </div>

            {/* Pagination Controls (Top) */}
            {totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span className="px-3 py-1">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Schedule Table */}
            {filteredSchedules.length === 0 ? (
                <ScheduleEmptyState onReset={resetFilters} />
            ) : (
                <>
                    <ScheduleTable schedules={currentSchedules} />

                    {/* Pagination Controls (Bottom) */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                            <div className="text-sm text-gray-600">
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredSchedules.length)} of {filteredSchedules.length} results
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                                >
                                    Previous
                                </button>

                                {/* Page numbers */}
                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-1 border rounded ${currentPage === pageNum
                                                ? 'bg-primary-600 text-white'
                                                : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SchedulePage;