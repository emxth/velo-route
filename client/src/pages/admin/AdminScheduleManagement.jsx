// pages/admin/AdminScheduleManagement.jsx (Refactored)
import { useState, useEffect } from "react";
import { FaClock, FaCalendarAlt } from "react-icons/fa";
import api from "../../api/axios";
import LoadingVehicle from "../../components/LoadingVehicle";
import StatusBadge from "../../components/Schedule & Routing/StatusBadge";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/Schedule & Routing/DataTable";
import ScheduleFilters from "../../components/Schedule & Routing/ScheduleFilters";
import ScheduleForm from "../../components/Schedule & Routing/ScheduleForm";
import ConfirmDialog from "../../components/Schedule & Routing/ConfirmDialog";

const AdminScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedulesRes, routesRes, vehiclesRes] = await Promise.all([
        api.get("/schedules"),
        api.get("/routes"),
        api.get("/vehicles")
      ]);

      const vehiclesArray = vehiclesRes.data?.data || 
                         vehiclesRes.data?.vehicles || 
                         (Array.isArray(vehiclesRes.data) ? vehiclesRes.data : []);
                         
      setSchedules(schedulesRes.data.schedule || schedulesRes.data || []);
      setRoutes(routesRes.data);
      setVehicles(vehiclesArray);
       console.log("Vehicles response:", vehiclesRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (scheduleData) => {
    try {
      await api.post("/schedules/addSchedule", scheduleData);
      await fetchData();
      setShowForm(false);
    } catch (err) {
      console.error("Error creating schedule:", err);
      alert(err.response?.data?.error || "Failed to create schedule");
    }
  };

  const handleUpdateSchedule = async (id, scheduleData) => {
    try {
      await api.put(`/schedules/updateSchedule/${id}`, scheduleData);
      await fetchData();
      setEditingSchedule(null);
    } catch (err) {
      console.error("Error updating schedule:", err);
      alert(err.response?.data?.error || "Failed to update schedule");
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await api.delete(`/schedules/remove/${id}`);
      await fetchData();
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting schedule:", err);
      alert(err.response?.data?.error || "Failed to delete schedule");
    }
  };

  const filteredSchedules = schedules.filter(schedule =>
    schedule.routeId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.vehicleID?.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: "Route",
      accessor: "routeId",
      render: (schedule) => (
        <div>
          <div className="font-medium">{schedule.routeId?.name || "N/A"}</div>
          <div className="text-sm text-gray-500">{schedule.routeId?.routeNumber}</div>
        </div>
      )
    },
    {
      header: "Vehicle",
      accessor: "vehicleID",
      render: (schedule) => (
        <div>
          <div>{schedule.vehicleID?.registrationNumber || "N/A"}</div>
          <div className="text-sm text-gray-500">{schedule.vehicleID?.type}</div>
        </div>
      )
    },
    {
      header: "Departure",
      accessor: "depatureTime",
      render: (schedule) => (
        <div className="flex items-center gap-1">
          <FaClock className="text-gray-400 text-sm" />
          <span>{new Date(schedule.depatureTime).toLocaleString()}</span>
        </div>
      )
    },
    {
      header: "Arrival",
      accessor: "arrivalTime",
      render: (schedule) => new Date(schedule.arrivalTime).toLocaleString()
    },
    {
      header: "Status",
      accessor: "status",
      render: (schedule) => <StatusBadge status={schedule.status} />
    },
    {
      header: "Seats",
      accessor: "seats",
      render: (schedule) => (
        <span>
          {schedule.availableSeats || schedule.totalSeats}/{schedule.totalSeats}
        </span>
      )
    }
  ];

  if (loading) return <LoadingVehicle message="Loading Schedules..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule Management"
        description="Manage bus, van, and train schedules"
        buttonText="Add New Schedule"
        onButtonClick={() => setShowForm(true)}
      />

      <DataTable
        columns={columns}
        data={filteredSchedules}
        onEdit={(schedule) => setEditingSchedule(schedule)}
        onDelete={(id) => setDeleteConfirm(schedules.find(s => s._id === id))}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by route name or vehicle number..."
        emptyMessage="No schedules found"
        emptyIcon={FaCalendarAlt}
      />

      {/* Schedule Form Modal */}
      {(showForm || editingSchedule) && (
        <ScheduleForm
          routes={routes}
          vehicles={vehicles}
          initialData={editingSchedule}
          onSubmit={editingSchedule ? 
            (data) => handleUpdateSchedule(editingSchedule._id, data) : 
            handleCreateSchedule
          }
          onCancel={() => {
            setShowForm(false);
            setEditingSchedule(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDeleteSchedule(deleteConfirm._id)}
        title="Delete Schedule"
        message={`Are you sure you want to delete the schedule for "${deleteConfirm?.routeId?.name}"? This action cannot be undone.`}
        confirmText="Delete Schedule"
      />
    </div>
  );
};

export default AdminScheduleManagement;