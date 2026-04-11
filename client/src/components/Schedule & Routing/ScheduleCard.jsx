// src/components/ScheduleCard.js
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle, PlayCircle } from "lucide-react";

const ScheduleCard = ({ schedule, onBook, isAdmin = false, onEdit, onDelete }) => {
  const getStatusIcon = (status) => {
    switch(status) {
      case "SCHEDULED": return <Clock size={16} className="text-warning-500" />;
      case "IN_PROGRESS": return <PlayCircle size={16} className="text-primary-500" />;
      case "COMPLETED": return <CheckCircle size={16} className="text-success-500" />;
      case "DELAYED": return <AlertCircle size={16} className="text-danger-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      SCHEDULED: "bg-warning-50 text-warning-700 border-warning-200",
      IN_PROGRESS: "bg-primary-50 text-primary-700 border-primary-200",
      COMPLETED: "bg-success-50 text-success-700 border-success-200",
      DELAYED: "bg-danger-50 text-danger-700 border-danger-200"
    };
    return colors[status] || "bg-neutral-100 text-neutral-700";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl shadow-soft border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-display font-semibold text-primary-800">
              {schedule.routeId?.name || "Unknown Route"}
            </h3>
            <p className="text-sm text-neutral-500">
              Vehicle: {schedule.vehicleID?.vehicleNumber}
            </p>
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(schedule.status)}`}>
            {getStatusIcon(schedule.status)}
            <span>{schedule.status.replace("_", " ")}</span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-primary-500" />
            <span className="text-neutral-700">
              {new Date(schedule.depatureTime).toLocaleDateString()}
            </span>
            <Clock size={16} className="text-primary-500 ml-2" />
            <span className="text-neutral-700">
              {new Date(schedule.depatureTime).toLocaleTimeString()}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <MapPin size={16} className="text-primary-500" />
            <span>
              {schedule.routeId?.startLocation?.name} → {schedule.routeId?.endLocation?.name}
            </span>
          </div>

          <div className="flex gap-2 text-xs">
            <span className="px-2 py-0.5 bg-neutral-100 rounded-full">
              {schedule.frequency}
            </span>
            <span className="px-2 py-0.5 bg-neutral-100 rounded-full">
              Duration: {schedule.routeId?.estimatedDuration} min
            </span>
            <span className="px-2 py-0.5 bg-neutral-100 rounded-full">
              Fare: ${schedule.routeId?.estimatedFare}
            </span>
          </div>
        </div>

        {isAdmin ? (
          <div className="flex gap-2 mt-4 pt-3 border-t border-neutral-100">
            <button
              onClick={() => onEdit(schedule)}
              className="flex-1 px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(schedule._id)}
              className="flex-1 px-3 py-1.5 text-sm font-medium text-danger-500 bg-danger-50 rounded-lg hover:bg-danger-100 transition-colors"
            >
              Delete
            </button>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onBook(schedule)}
            className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-soft"
          >
            Book Now →
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default ScheduleCard;