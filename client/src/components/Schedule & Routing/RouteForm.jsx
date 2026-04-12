
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FaMapMarkerAlt, 
    FaSpinner, 
    FaPlus, 
    FaTrash, 
    FaBus, 
    FaTrain, 
    FaShuttleVan,
    FaSearch,
    FaCheckCircle,
    FaExclamationTriangle
} from "react-icons/fa";
import LocationService from "../../api/locationService";

const RouteForm = ({ onSubmit, initialData = null, onCancel }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        routeNumber: initialData?.routeNumber || "",
        transportType: initialData?.transportType || "Bus",
        busNumber: initialData?.busNumber || "",
        startLocation: initialData?.startLocation || { 
            name: "", 
            district: "", 
            lat: "", 
            lng: "" 
        },
        endLocation: initialData?.endLocation || { 
            name: "", 
            district: "", 
            lat: "", 
            lng: "" 
        },
        stops: initialData?.stops || []
    });

    const [currentStop, setCurrentStop] = useState({
        name: "",
        lat: "",
        lng: "",
        fareFromPrevious: 0
    });
    
    const [loading, setLoading] = useState(false);
    const [loadingStop, setLoadingStop] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [validationErrors, setValidationErrors] = useState({});

    // Validate form before submission
    const validateForm = () => {
        const errors = {};
        
        if (!formData.name.trim()) errors.name = "Route name is required";
        if (!formData.routeNumber.trim()) errors.routeNumber = "Route number is required";
        if (!formData.startLocation.name.trim()) errors.startLocation = "Start location is required";
        if (!formData.endLocation.name.trim()) errors.endLocation = "End location is required";
        
        if (formData.transportType === "Bus" && !formData.busNumber) {
            errors.busNumber = "Bus number is required for bus routes";
        }
        
        if (formData.startLocation.lat && !LocationService.isValidCoordinates(
            formData.startLocation.lat, 
            formData.startLocation.lng
        )) {
            errors.startCoordinates = "Invalid start location coordinates";
        }
        
        if (formData.endLocation.lat && !LocationService.isValidCoordinates(
            formData.endLocation.lat, 
            formData.endLocation.lng
        )) {
            errors.endCoordinates = "Invalid end location coordinates";
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Auto-detect coordinates for a location
    const detectCoordinates = async (type, locationName, locationObj = null) => {
        if (!locationName || locationName.trim() === "") {
            setError("Please enter a location name first");
            return false;
        }

        if (type === 'start' || type === 'end') {
            setLoading(true);
        } else {
            setLoadingStop(true);
        }
        
        setError("");
        setSuccess("");

        try {
            const coords = await LocationService.getCoordinates(locationName);
            
            if (coords && coords.lat && coords.lng) {
                if (type === 'start') {
                    setFormData({
                        ...formData,
                        startLocation: {
                            ...formData.startLocation,
                            lat: coords.lat,
                            lng: coords.lng
                        }
                    });
                    setSuccess(`Start location coordinates detected successfully!`);
                } else if (type === 'end') {
                    setFormData({
                        ...formData,
                        endLocation: {
                            ...formData.endLocation,
                            lat: coords.lat,
                            lng: coords.lng
                        }
                    });
                    setSuccess(`End location coordinates detected successfully!`);
                } else if (type === 'stop') {
                    setCurrentStop({
                        ...currentStop,
                        lat: coords.lat,
                        lng: coords.lng
                    });
                    setSuccess(`Stop location coordinates detected successfully!`);
                }
                
                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(""), 3000);
                return true;
            }
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            if (type === 'start' || type === 'end') {
                setLoading(false);
            } else {
                setLoadingStop(false);
            }
        }
    };

    // Add a stop to the route
   const addStop = async () => {
    if (!currentStop.name.trim()) {
        setError("Please enter a stop name");
        return;
    }

    let lat = currentStop.lat;
    let lng = currentStop.lng;

    if (!lat || !lng) {
        const coords = await LocationService.getCoordinates(currentStop.name);
        lat = coords.lat;
        lng = coords.lng;
    }

    const newStop = {
        name: currentStop.name,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        fareFromPrevious: parseFloat(currentStop.fareFromPrevious) || 0
    };

    setFormData({
        ...formData,
        stops: [...formData.stops, newStop]
    });

    setCurrentStop({ name: "", lat: "", lng: "", fareFromPrevious: 0 });
};
    // Remove a stop
    const removeStop = (index) => {
        setFormData({
            ...formData,
            stops: formData.stops.filter((_, i) => i !== index)
        });
        setSuccess("Stop removed successfully!");
        setTimeout(() => setSuccess(""), 3000);
    };

    // Calculate route distance using Haversine formula
    const calculateDistance = () => {
        if (!formData.startLocation.lat || !formData.startLocation.lng || 
            !formData.endLocation.lat || !formData.endLocation.lng) {
            return null;
        }

        const R = 6371; // Earth's radius in km
        const lat1 = formData.startLocation.lat * Math.PI / 180;
        const lat2 = formData.endLocation.lat * Math.PI / 180;
        const deltaLat = (formData.endLocation.lat - formData.startLocation.lat) * Math.PI / 180;
        const deltaLng = (formData.endLocation.lng - formData.startLocation.lng) * Math.PI / 180;

        const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        return Math.round(distance * 10) / 10;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setError("Please fix the validation errors before submitting");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Auto-detect missing coordinates
            if (!formData.startLocation.lat || !formData.startLocation.lng) {
                await detectCoordinates('start', formData.startLocation.name);
            }
            
            if (!formData.endLocation.lat || !formData.endLocation.lng) {
                await detectCoordinates('end', formData.endLocation.name);
            }

            // Calculate distance if coordinates available
            const distance = calculateDistance();
            const estimatedDuration = distance ? Math.round(distance / 40 * 60) : 60; // Assuming 40 km/h average speed
            
            const submitData = {
                ...formData,
                distance: distance || 0,
                estimatedDuration: estimatedDuration,
                estimatedFare: Math.round(distance * 15) || 100, // Rs. 15 per km
                busNumber: formData.transportType === "Bus" ? formData.busNumber : undefined,
                stops: formData.stops.map((stop, index) => ({
                    ...stop,
                    order: index + 1
                }))
            };

            await onSubmit(submitData);
            setSuccess("Route saved successfully!");
            setTimeout(() => onCancel(), 2000);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to save route. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const distance = calculateDistance();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
                    <h2 className="text-2xl font-bold">
                        {initialData ? "✏️ Edit Route" : "➕ Create New Route"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Success/Error Messages */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"
                            >
                                <FaExclamationTriangle />
                                <span>{error}</span>
                            </motion.div>
                        )}
                        
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2"
                            >
                                <FaCheckCircle />
                                <span>{success}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Basic Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Route Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className={`input-field ${validationErrors.name ? 'border-red-500' : ''}`}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Kadawatha - Colombo Road"
                                />
                                {validationErrors.name && (
                                    <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Route Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className={`input-field ${validationErrors.routeNumber ? 'border-red-500' : ''}`}
                                    value={formData.routeNumber}
                                    onChange={(e) => setFormData({ ...formData, routeNumber: e.target.value })}
                                    placeholder="e.g., A1, 138"
                                />
                                {validationErrors.routeNumber && (
                                    <p className="text-red-500 text-xs mt-1">{validationErrors.routeNumber}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Transport Type</label>
                                <select
                                    className="input-field"
                                    value={formData.transportType}
                                    onChange={(e) => setFormData({ ...formData, transportType: e.target.value })}
                                >
                                    <option value="Bus">🚌 Bus</option>
                                    <option value="Van">🚐 Van</option>
                                    <option value="Train">🚆 Train</option>
                                </select>
                            </div>
                            
                            {formData.transportType === "Bus" && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    <label className="block text-sm font-medium mb-1">
                                        Bus Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`input-field ${validationErrors.busNumber ? 'border-red-500' : ''}`}
                                        value={formData.busNumber}
                                        onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                                        placeholder="e.g., 138, 15-1234"
                                    />
                                    {validationErrors.busNumber && (
                                        <p className="text-red-500 text-xs mt-1">{validationErrors.busNumber}</p>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Start Location */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <FaMapMarkerAlt className="text-green-500" />
                            Start Location <span className="text-red-500">*</span>
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Location Name</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        required
                                        className="input-field flex-1"
                                        value={formData.startLocation.name}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            startLocation: { ...formData.startLocation, name: e.target.value }
                                        })}
                                        placeholder="e.g., Kadawatha"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => detectCoordinates('start', formData.startLocation.name)}
                                        disabled={loading || !formData.startLocation.name}
                                        className="btn-primary px-4"
                                    >
                                        {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">District</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.startLocation.district}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        startLocation: { ...formData.startLocation, district: e.target.value }
                                    })}
                                    placeholder="e.g., Gampaha"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    className="input-field"
                                    value={formData.startLocation.lat}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        startLocation: { ...formData.startLocation, lat: parseFloat(e.target.value) }
                                    })}
                                    placeholder="Auto-detected or manual"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    className="input-field"
                                    value={formData.startLocation.lng}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        startLocation: { ...formData.startLocation, lng: parseFloat(e.target.value) }
                                    })}
                                    placeholder="Auto-detected or manual"
                                />
                            </div>
                        </div>
                    </div>

                    {/* End Location */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <FaMapMarkerAlt className="text-red-500" />
                            End Location <span className="text-red-500">*</span>
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Location Name</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        required
                                        className="input-field flex-1"
                                        value={formData.endLocation.name}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            endLocation: { ...formData.endLocation, name: e.target.value }
                                        })}
                                        placeholder="e.g., Colombo"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => detectCoordinates('end', formData.endLocation.name)}
                                        disabled={loading || !formData.endLocation.name}
                                        className="btn-primary px-4"
                                    >
                                        {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">District</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.endLocation.district}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        endLocation: { ...formData.endLocation, district: e.target.value }
                                    })}
                                    placeholder="e.g., Colombo"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    className="input-field"
                                    value={formData.endLocation.lat}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        endLocation: { ...formData.endLocation, lat: parseFloat(e.target.value) }
                                    })}
                                    placeholder="Auto-detected or manual"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    className="input-field"
                                    value={formData.endLocation.lng}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        endLocation: { ...formData.endLocation, lng: parseFloat(e.target.value) }
                                    })}
                                    placeholder="Auto-detected or manual"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Route Stops */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-lg mb-4">Route Stops</h3>
                        
                        {/* Existing Stops */}
                        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                            <AnimatePresence>
                                {formData.stops.map((stop, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex items-center justify-between bg-white p-3 rounded-lg border"
                                    >
                                        <div className="flex-1">
                                            <span className="font-medium">{index + 1}. {stop.name}</span>
                                            <span className="text-sm text-gray-500 ml-3">
                                                Fare: Rs. {stop.fareFromPrevious}
                                            </span>
                                            {stop.lat && stop.lng && (
                                                <span className="text-xs text-gray-400 ml-3">
                                                    📍 {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeStop(index)}
                                            className="text-red-500 hover:text-red-700 p-2"
                                        >
                                            <FaTrash />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        
                        {/* Add New Stop */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t">
                            <input
                                type="text"
                                placeholder="Stop Name"
                                className="input-field"
                                value={currentStop.name}
                                onChange={(e) => setCurrentStop({ ...currentStop, name: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="Fare from previous (Rs.)"
                                className="input-field"
                                value={currentStop.fareFromPrevious}
                                onChange={(e) => setCurrentStop({ ...currentStop, fareFromPrevious: e.target.value })}
                            />
                            <input
                                type="number"
                                step="any"
                                placeholder="Latitude (optional)"
                                className="input-field"
                                value={currentStop.lat}
                                onChange={(e) => setCurrentStop({ ...currentStop, lat: parseFloat(e.target.value) })}
                            />
                            <input
                                type="number"
                                step="any"
                                placeholder="Longitude (optional)"
                                className="input-field"
                                value={currentStop.lng}
                                onChange={(e) => setCurrentStop({ ...currentStop, lng: parseFloat(e.target.value) })}
                            />
                            <div className="col-span-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => detectCoordinates('stop', currentStop.name)}
                                    disabled={loadingStop || !currentStop.name}
                                    className="btn-outline flex-1"
                                >
                                    {loadingStop ? <FaSpinner className="animate-spin inline mr-2" /> : <FaSearch className="inline mr-2" />}
                                    Auto-detect Coordinates
                                </button>
                                <button
                                    type="button"
                                    onClick={addStop}
                                    className="btn-primary flex-1"
                                >
                                    <FaPlus className="inline mr-2" />
                                    Add Stop
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Route Summary */}
                    {distance && (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <h3 className="font-semibold text-lg mb-2">📊 Route Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Distance:</span>
                                    <span className="font-semibold ml-2">{distance} km</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Est. Duration:</span>
                                    <span className="font-semibold ml-2">{Math.round(distance / 40 * 60)} min</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Est. Fare:</span>
                                    <span className="font-semibold ml-2">Rs. {Math.round(distance * 15)}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Total Stops:</span>
                                    <span className="font-semibold ml-2">{formData.stops.length}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white py-4">
                        <button 
                            type="submit" 
                            className="btn-primary flex-1"
                            disabled={loading}
                        >
                            {loading ? (
                                <><FaSpinner className="animate-spin inline mr-2" /> Saving...</>
                            ) : (
                                <>{initialData ? "✏️ Update Route" : "✅ Create Route"}</>
                            )}
                        </button>
                        <button 
                            type="button" 
                            onClick={onCancel} 
                            className="btn-outline flex-1"
                            disabled={loading}
                        >
                          
                             Cancel
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default RouteForm;