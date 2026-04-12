
import { motion } from "framer-motion";
import { MapPin, Clock, DollarSign, Bus } from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";

const RouteCard = ({ route, onEdit, onDelete, isAdmin = false }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white rounded-xl shadow-soft border border-neutral-200 overflow-hidden"
        >
            <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-display font-semibold text-lg text-primary-800">
                            {route.name}
                        </h3>
                        <p className="text-sm text-neutral-500">#{route.routeNumber}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${route.transportType === "Bus"
                        ? "bg-primary-100 text-primary-700"
                        : "bg-secondary-100 text-secondary-700"
                        }`}>
                        {route.transportType}
                    </span>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <MapPin size={16} className="text-primary-500" />
                        <span>{route.startLocation?.name} → {route.endLocation?.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                            <Clock size={14} className="text-neutral-400" />
                            <span>{route.estimatedDuration} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <FaRupeeSign size={14} className="text-neutral-400" />
                            <span>${route.estimatedFare}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Bus size={14} className="text-neutral-400" />
                            <span>{route.distance} km</span>
                        </div>
                    </div>
                </div>

                {route.stops && route.stops.length > 0 && (
                    <div className="border-t border-neutral-100 pt-3 mt-2">
                        <p className="text-xs text-neutral-500 mb-2">
                            {route.stops.length} stops • Fare from ${route.stops[0]?.fareFromPrevious || 0}
                        </p>
                        <div className="flex gap-1">
                            {route.stops.slice(0, 3).map((stop, idx) => (
                                <span key={idx} className="text-xs px-2 py-0.5 bg-neutral-100 rounded-full">
                                    {stop.name}
                                </span>
                            ))}
                            {route.stops.length > 3 && (
                                <span className="text-xs px-2 py-0.5 bg-neutral-100 rounded-full">
                                    +{route.stops.length - 3}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {isAdmin && (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-neutral-100">
                        <button
                            onClick={() => onEdit(route)}
                            className="flex-1 px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(route._id)}
                            className="flex-1 px-3 py-1.5 text-sm font-medium text-danger-500 bg-danger-50 rounded-lg hover:bg-danger-100 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default RouteCard;