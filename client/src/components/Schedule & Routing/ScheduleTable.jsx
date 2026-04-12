import { formatDate, formatTime } from "../../utils/dateFormatters";
import { useNavigate } from "react-router-dom";

const ScheduleTable = ({ schedules }) => {
  const navigate = useNavigate();

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      "SCHEDULED": "badge-info",
      "IN_PROGRESS": "badge-warning",
      "COMPLETED": "badge-success",
      "DELAYED": "badge-error",
      "CANCELLED": "badge-error"
    };
    return statusMap[status] || "badge-error";
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (!schedules || schedules.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-neutral-500">No schedules available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Route
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Destination
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Destination
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Departure Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Arrival Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Book Now
              </th>
              
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schedules.map((schedule) => {
              const availableSeats = schedule.vehicleID?.capacity || 0;
              const scheduleDepartureTime = schedule.depatureTime || schedule.departureTime;
              const tripId = schedule.tripId || schedule._id || schedule.id || "";

              const handleBookNow = () => {
                navigate("/addBooking", {
                  state: {
                    prefillBooking: {
                      tripId,
                      // Determine transport type based on vehicle category (Bus / Train)
                      transportType:
                        schedule.vehicleID?.category?.toLowerCase() === "train"
                          ? "TRAIN"
                          : "BUS",
                      fromLocation: schedule.routeId?.startLocation?.name || "",
                      toLocation: schedule.routeId?.endLocation?.name || "",
                      departureTime: scheduleDepartureTime || "",
                      estimatedFare: Number(schedule.routeId?.estimatedFare) || 0,
                    },
                  },
                });
              };
              
              return (
                <tr key={schedule._id || schedule.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {schedule.routeId?.name || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {schedule.routeId?.routeNumber || ""}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">
                      {schedule.routeId?.startLocation?.name || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {schedule.routeId?.startLocation?.district || ""}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">
                      {schedule.routeId?.endLocation?.name || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {schedule.routeId?.endLocation?.district || ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900 font-medium">
                      {formatTime(schedule.depatureTime)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(schedule.depatureTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">
                      {formatDate(schedule.arrivalTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">
                      {formatDuration(schedule.routeId?.estimatedDuration)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">
                      {schedule.vehicleID?.registrationNumber || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {schedule.vehicleID?.category || ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">
                      <button
                        type="button"
                        onClick={handleBookNow}
                        className="bg-[#27AE60] p-2 rounded-full hover:text-slate-200"
                      >
                        Book Now
                      </button>
                    </div>
                  </td>
                  
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleTable;