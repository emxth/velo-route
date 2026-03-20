import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

// Seat Selection Modal Component
const SeatSelectionModal = ({ isOpen, onClose, onSelectSeats, transportType, selectedSeats }) => {
  const [localSelectedSeats, setLocalSelectedSeats] = useState(selectedSeats || []);
  
  // Define seat layout based on transport type
  const seatLayout = transportType === 'Train' 
    ? { rows: 6, cols: 5 } // 30 seats for train (reduced from 48)
    : { rows: 8, cols: 4 }; // 32 seats for bus (reduced from 48)

  const totalSeats = seatLayout.rows * seatLayout.cols;
  const occupiedSeats = [5, 10, 15, 22, 28]; // Sample occupied seats

  // Handle seat click
  const toggleSeat = (seatNumber) => {
    setLocalSelectedSeats(prev => 
      prev.includes(seatNumber) 
        ? prev.filter(s => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  // Confirm selection and close modal
  const handleConfirm = () => {
    onSelectSeats(localSelectedSeats);
    onClose();
  };

  // Render individual seat
  const renderSeat = (seatNumber) => {
    const isOccupied = occupiedSeats.includes(seatNumber);
    const isSelected = localSelectedSeats.includes(seatNumber);

    return (
      <button
        key={seatNumber}
        onClick={() => !isOccupied && toggleSeat(seatNumber)}
        disabled={isOccupied}
        className={`
          w-6 h-6 rounded border-2 transition-all duration-200 font-semibold text-xs flex items-center justify-center
          ${isOccupied 
            ? 'bg-gray-400 border-gray-500 cursor-not-allowed' 
            : isSelected 
            ? 'bg-green-500 border-green-600 text-white' 
            : 'bg-white border-blue-400 hover:bg-blue-50 cursor-pointer'
          }
        `}
        title={`Seat ${seatNumber}`}
      >
        {seatNumber}
      </button>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Modal Container - Fixed height with scroll for seat grid */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm max-h-[90vh] flex flex-col">
        
        {/* Modal Header - Fixed */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">
            Select {transportType} Seats
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          
          {/* Legend */}
          <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-white border-2 border-blue-400 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 border-2 border-green-600 rounded"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-400 border-2 border-gray-500 rounded"></div>
              <span>Occupied</span>
            </div>
          </div>

          {/* Seat Grid */}
          <div className="bg-gray-50 p-3 rounded-lg mb-5">
            <div
              className={`grid gap-1 justify-center`}
              style={{ gridTemplateColumns: `repeat(${seatLayout.cols}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: totalSeats }, (_, i) => renderSeat(i + 1))}
            </div>
          </div>

          {/* Selected Seats Info */}
          {localSelectedSeats.length > 0 && (
            <div className="p-3 bg-blue-50 rounded border border-blue-200 mb-4">
              <p className="text-xs font-semibold text-gray-800 mb-1">
                Selected: {localSelectedSeats.length} seat(s)
              </p>
              <p className="text-xs text-gray-700 break-words">
                {localSelectedSeats.sort((a, b) => a - b).join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons - Fixed */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 flex-shrink-0 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium text-sm hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={localSelectedSeats.length === 0}
            className={`px-4 py-2 rounded-lg font-medium text-white text-sm transition ${
              localSelectedSeats.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Trip Booking Form Component
const AddBooking = () => {
  // Hardcoded fare per seat (100)
  const FARE_PER_SEAT = 100;

  // Form State
  const [formData, setFormData] = useState({
    phoneNumber: '',
    transportType: 'Train',
    tripId: '',
    seatNumbers: [],
    coachNumber: '',
    fromLocation: '',
    toLocation: '',
    departureTime: '',
    amount: 0, // Auto-calculated field
  });

  // Modal State
  const [seatModalOpen, setSeatModalOpen] = useState(false);

  // Form Errors State
  const [errors, setErrors] = useState({});

  // Calculate amount based on seat count
  const calculateAmount = (seatCount) => {
    return seatCount * FARE_PER_SEAT;
  };

  // Validation Rules
  const validateForm = () => {
    const newErrors = {};

    // Phone Number Validation (10-digit Indian phone number)
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Enter a valid 10-digit phone number';
    }

    // Trip ID Validation
    if (!formData.tripId.trim()) {
      newErrors.tripId = 'Trip ID is required';
    }

    // Seat Numbers Validation
    if (formData.seatNumbers.length === 0) {
      newErrors.seatNumbers = 'Please select at least one seat';
    }

    // Coach Number Validation (only for trains)
    if (formData.transportType === 'Train' && !formData.coachNumber.trim()) {
      newErrors.coachNumber = 'Coach number is required for train bookings';
    }

    // From Location Validation
    if (!formData.fromLocation.trim()) {
      newErrors.fromLocation = 'From location is required';
    }

    // To Location Validation
    if (!formData.toLocation.trim()) {
      newErrors.toLocation = 'To location is required';
    }

    // Different Locations Check
    if (formData.fromLocation === formData.toLocation && formData.fromLocation !== '') {
      newErrors.toLocation = 'Destination must be different from origin';
    }

    // Departure Time Validation
    if (!formData.departureTime.trim()) {
      newErrors.departureTime = 'Departure time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle Seat Selection from Modal
  const handleSelectSeats = (seats) => {
    // Calculate new amount based on selected seats
    const newAmount = calculateAmount(seats.length);
    
    setFormData(prev => ({
      ...prev,
      seatNumbers: seats,
      amount: newAmount, // Auto-update amount
    }));
    if (errors.seatNumbers) {
      setErrors(prev => ({
        ...prev,
        seatNumbers: '',
      }));
    }
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Form Data:', formData);
      alert(`Booking submitted successfully!\nTotal Amount: ₹${formData.amount}`);
      // API call would go here
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Trip Booking</h1>
          <p className="text-gray-600">Book your journey with ease</p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-8 space-y-6"
        >
          {/* Phone Number Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter 10-digit phone number"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.phoneNumber
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              maxLength="10"
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Transport Type Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Transport Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="transportType"
                value={formData.transportType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
              >
                <option value="Train">Train</option>
                <option value="Bus">Bus</option>
              </select>
              {/* Custom Dropdown Icon */}
              <ChevronDown
                size={20}
                className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Trip ID Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Trip ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="tripId"
              value={formData.tripId}
              onChange={handleInputChange}
              placeholder="e.g., TR12345"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.tripId
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.tripId && (
              <p className="text-red-500 text-sm mt-1">{errors.tripId}</p>
            )}
          </div>

          {/* Seat Selection Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Seats <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setSeatModalOpen(true)}
              className={`w-full px-4 py-2 border rounded-lg text-left transition ${
                errors.seatNumbers
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-gray-50'
              } hover:bg-blue-50`}
            >
              {formData.seatNumbers.length > 0 ? (
                <div>
                  <p className="font-medium text-gray-800">
                    {formData.seatNumbers.length} seat(s) selected
                  </p>
                  <p className="text-sm text-gray-600">
                    {formData.seatNumbers.sort((a, b) => a - b).join(', ')}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Click to select seats</p>
              )}
            </button>
            {errors.seatNumbers && (
              <p className="text-red-500 text-sm mt-1">{errors.seatNumbers}</p>
            )}
          </div>

          {/* Seat Count Field (Auto-generated) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Seat Count
            </label>
            <input
              type="number"
              value={formData.seatNumbers.length}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
            />
            {/* Auto-generated from selected seats */}
            <p className="text-xs text-gray-500 mt-1">Auto-generated from selected seats</p>
          </div>

          {/* Amount Field (Auto-calculated: ₹100 per seat) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Total Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-gray-600 font-semibold text-lg">₹</span>
              <input
                type="number"
                value={formData.amount}
                readOnly
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed font-semibold"
              />
            </div>
            {/* Comment: Auto-calculated at ₹100 per seat */}
            <p className="text-xs text-gray-500 mt-1">Auto-calculated at ₹{FARE_PER_SEAT} per seat</p>
          </div>

          {/* Coach Number Field (Conditional - Only for Trains) */}
          {formData.transportType === 'Train' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Coach Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="coachNumber"
                value={formData.coachNumber}
                onChange={handleInputChange}
                placeholder="e.g., A1, B2"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.coachNumber
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.coachNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.coachNumber}</p>
              )}
            </div>
          )}

          {/* From Location Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              From Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fromLocation"
              value={formData.fromLocation}
              onChange={handleInputChange}
              placeholder="Enter departure location"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.fromLocation
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.fromLocation && (
              <p className="text-red-500 text-sm mt-1">{errors.fromLocation}</p>
            )}
          </div>

          {/* To Location Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              To Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="toLocation"
              value={formData.toLocation}
              onChange={handleInputChange}
              placeholder="Enter destination location"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.toLocation
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.toLocation && (
              <p className="text-red-500 text-sm mt-1">{errors.toLocation}</p>
            )}
          </div>

          {/* Departure Time Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Departure Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="departureTime"
              value={formData.departureTime}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.departureTime
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.departureTime && (
              <p className="text-red-500 text-sm mt-1">{errors.departureTime}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-200 shadow-md hover:shadow-lg"
          >
            Book Trip
          </button>
        </form>
      </div>

      {/* Seat Selection Modal */}
      <SeatSelectionModal
        isOpen={seatModalOpen}
        onClose={() => setSeatModalOpen(false)}
        onSelectSeats={handleSelectSeats}
        transportType={formData.transportType}
        selectedSeats={formData.seatNumbers}
      />
    </div>
  );
};

export default AddBooking;