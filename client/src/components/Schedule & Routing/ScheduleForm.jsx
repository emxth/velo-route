import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const ScheduleForm = ({ routes, vehicles, onSubmit, initialData = null, onCancel }) => {
  const [formData, setFormData] = useState(initialData || {
    routeId: "",
    vehicleID: "",
    depatureTime: "",
    frequency: "DAILY",
    totalSeats: 40
  });

  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    if (formData.routeId) {
      const route = routes.find(r => r._id === formData.routeId);
      setSelectedRoute(route);
    }
  }, [formData.routeId, routes]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-xl max-w-lg w-full"
      >
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">
            {initialData ? "Edit Schedule" : "Create New Schedule"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Route *</label>
            <select
              required
              className="input-field"
              value={formData.routeId}
              onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
            >
              <option value="">Choose a route...</option>
              {routes.map(route => (
                <option key={route._id} value={route._id}>
                  {route.name} - {route.routeNumber} (₹{route.estimatedFare})
                </option>
              ))}
            </select>
            {selectedRoute && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2 p-3 bg-blue-50 rounded-lg text-sm"
              >
                <div>Distance: {selectedRoute.distance}km</div>
                <div>Duration: {Math.floor(selectedRoute.estimatedDuration / 60)}h {selectedRoute.estimatedDuration % 60}m</div>
                <div>Fare: ₹{selectedRoute.estimatedFare}</div>
              </motion.div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Select Vehicle *</label>
            <select
              required
              className="input-field"
              value={formData.vehicleID}
              onChange={(e) => setFormData({ ...formData, vehicleID: e.target.value })}
            >
              <option value="">Choose a vehicle...</option>
              {vehicles.map(vehicle => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.name || vehicle.registrationNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Departure Time *</label>
            <input
              type="datetime-local"
              required
              className="input-field"
              value={formData.depatureTime}
              onChange={(e) => setFormData({ ...formData, depatureTime: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Frequency</label>
              <select
                className="input-field"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKEND">Weekend</option>
                <option value="HOLIDAY">Holiday</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Seats</label>
              <input
                type="number"
                min="1"
                max="100"
                className="input-field"
                value={formData.totalSeats}
                onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {initialData ? "Update Schedule" : "Create Schedule"}
            </button>
            <button type="button" onClick={onCancel} className="btn-outline flex-1">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ScheduleForm;