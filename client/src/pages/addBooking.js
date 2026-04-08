import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, X, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../api/axios';

// Seat Selection Modal Component
const SeatSelectionModal = ({ isOpen, onClose, onSelectSeats, transportType, selectedSeats, occupiedSeats = [] }) => {
  const [localSelectedSeats, setLocalSelectedSeats] = useState(selectedSeats || []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const nextSelected = (selectedSeats || []).filter((seat) => !occupiedSeats.includes(seat));
    setLocalSelectedSeats(nextSelected);
  }, [isOpen, selectedSeats, occupiedSeats]);
  
  // Define seat layout based on transport type
  const seatLayout = transportType === 'TRAIN' 
    ? { rows: 6, cols: 5 } // 30 seats for train (reduced from 48)
    : { rows: 8, cols: 4 }; // 32 seats for bus (reduced from 48)

  const totalSeats = seatLayout.rows * seatLayout.cols;
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
                {[...localSelectedSeats].sort((a, b) => a - b).join(', ')}
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
  const navigate = useNavigate();
  
  // Hardcoded fare per seat (100)
  const FARE_PER_SEAT = 500;

  // Form State
  const [formData, setFormData] = useState({
    phoneNumber: '',
    transportType: 'BUS',
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
  
  // Loading and feedback state
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [loadingOccupiedSeats, setLoadingOccupiedSeats] = useState(false);

  // Calculate amount based on seat count
  const calculateAmount = (seatCount) => {
    return seatCount * FARE_PER_SEAT;
  };

  // Validation Rules
  const validateForm = () => {
    const newErrors = {};

    // Phone Number Validation (Sri Lanka format: +94XXXXXXXXX)
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else {
      const phoneError = validatePhoneNumber(formData.phoneNumber);
      if (phoneError) {
        newErrors.phoneNumber = phoneError;
      }
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
    if (formData.transportType === 'TRAIN' && !formData.coachNumber.trim()) {
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
    } else {
      // Check if departure time is in the future
      const selectedTime = new Date(formData.departureTime);
      const now = new Date();
      if (selectedTime <= now) {
        newErrors.departureTime = 'Departure time must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate phone number format: +94 followed by exactly 9 digits
  const validatePhoneNumber = (phone) => {
    if (!phone) return '';
    
    // Check format: +94 + exactly 9 digits
    const isValid = /^\+94\d{9}$/.test(phone);
    
    if (!isValid) {
      // Check if user started with +94
      if (phone.startsWith('+94')) {
        const digitsOnly = phone.slice(3).replace(/\D/g, '');
        if (digitsOnly.length < 9) {
          return `Add ${9 - digitsOnly.length} more digit(s)`;
        } else if (digitsOnly.length > 9) {
          return 'Remove extra digits (must have exactly 9 digits after +94)';
        } else {
          return 'Phone number can only contain digits after +94';
        }
      } else if (phone.length > 0) {
        return 'Phone number must start with +94';
      }
    }
    
    return '';
  };

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Real-time validation for phone number
    if (name === 'phoneNumber') {
      const phoneError = validatePhoneNumber(value);
      setErrors(prev => ({
        ...prev,
        phoneNumber: phoneError,
      }));
    } else if (errors[name]) {
      // Clear error for other fields when user starts typing
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

  useEffect(() => {
    const hasRequiredTripDetails =
      formData.tripId.trim() &&
      formData.fromLocation.trim() &&
      formData.toLocation.trim() &&
      formData.departureTime;

    if (!hasRequiredTripDetails) {
      setOccupiedSeats([]);
      return;
    }

    const fetchOccupiedSeats = async () => {
      try {
        setLoadingOccupiedSeats(true);
        const response = await api.get('/bookings/occupied-seats', {
          params: {
            tripId: formData.tripId.trim(),
            transportType: formData.transportType,
            fromLocation: formData.fromLocation.trim(),
            toLocation: formData.toLocation.trim(),
            departureTime: formData.departureTime,
          },
        });

        const normalized = (response.data?.occupiedSeats || [])
          .map((seat) => Number(seat))
          .filter((seat) => !Number.isNaN(seat));

        setOccupiedSeats(normalized);
      } catch (err) {
        console.error('Failed to fetch occupied seats:', err);
        setOccupiedSeats([]);
      } finally {
        setLoadingOccupiedSeats(false);
      }
    };

    fetchOccupiedSeats();
  }, [formData.tripId, formData.transportType, formData.fromLocation, formData.toLocation, formData.departureTime]);

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    if (!validateForm()) {
      setErrorMessage('Please fix the validation errors above');
      return;
    }

    try {
      setIsLoading(true);
      
      // Prepare booking data for backend
      const bookingData = {
        phoneNumber: formData.phoneNumber,
        transportType: formData.transportType,
        tripId: formData.tripId,
        seatNumbers: formData.seatNumbers,
        coachNumber: formData.coachNumber || undefined,
        fromLocation: formData.fromLocation,
        toLocation: formData.toLocation,
        departureTime: formData.departureTime,
      };

      // Make API call to create booking
      const response = await api.post('/bookings', bookingData);

      setSuccessMessage('Booking created successfully! Redirecting...');
      setIsLoading(false);
      
      // Reset form
      setFormData({
        phoneNumber: '',
        transportType: 'BUS',
        tripId: '',
        seatNumbers: [],
        coachNumber: '',
        fromLocation: '',
        toLocation: '',
        departureTime: '',
        amount: 0,
      });

      // Redirect to view bookings after 2 seconds
      setTimeout(() => {
        navigate('/viewBookings');
      }, 2000);

    } catch (err) {
      console.error('Booking error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create booking. Please try again.';
      setErrorMessage(errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-sky-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Trip Booking</h1>
          <p className="text-slate-600">Enter trip details and review your fare before submitting</p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-700 text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-green-800 font-semibold">Success</p>
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 space-y-7"
          >
            <div className="pb-3 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800">Passenger Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., +94712345678"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.phoneNumber
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-cyan-500'
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Transport Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="transportType"
                    value={formData.transportType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none bg-white cursor-pointer"
                  >
                    <option value="BUS">Bus</option>
                    <option value="TRAIN">Train</option>
                  </select>
                  <ChevronDown
                    size={20}
                    className="absolute right-3 top-3 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

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
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.tripId
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-cyan-500'
                  }`}
                />
                {errors.tripId && (
                  <p className="text-red-500 text-sm mt-1">{errors.tripId}</p>
                )}
              </div>

              {formData.transportType === 'TRAIN' && (
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
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${
                      errors.coachNumber
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-cyan-500'
                    }`}
                  />
                  {errors.coachNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.coachNumber}</p>
                  )}
                </div>
              )}
            </div>

            <div className="pb-3 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800">Journey Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.fromLocation
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-cyan-500'
                  }`}
                />
                {errors.fromLocation && (
                  <p className="text-red-500 text-sm mt-1">{errors.fromLocation}</p>
                )}
              </div>

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
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.toLocation
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-cyan-500'
                  }`}
                />
                {errors.toLocation && (
                  <p className="text-red-500 text-sm mt-1">{errors.toLocation}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Departure Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.departureTime
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-cyan-500'
                  }`}
                />
                {errors.departureTime && (
                  <p className="text-red-500 text-sm mt-1">{errors.departureTime}</p>
                )}
              </div>
            </div>

            <div className="pb-3 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800">Seat Selection</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Seats <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setSeatModalOpen(true)}
                  disabled={loadingOccupiedSeats || !formData.tripId.trim() || !formData.fromLocation.trim() || !formData.toLocation.trim() || !formData.departureTime}
                  className={`w-full px-4 py-3 border rounded-lg text-left transition ${
                    errors.seatNumbers
                      ? 'border-red-500 bg-red-50'
                      : 'border-slate-300 bg-slate-50'
                  } hover:bg-cyan-50 disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {loadingOccupiedSeats ? (
                    <p className="text-gray-500">Loading seat availability...</p>
                  ) : formData.seatNumbers.length > 0 ? (
                    <div>
                      <p className="font-medium text-gray-800">
                        {formData.seatNumbers.length} seat(s) selected
                      </p>
                      <p className="text-sm text-gray-600">
                        {[...formData.seatNumbers].sort((a, b) => a - b).join(', ')}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      {formData.tripId.trim() && formData.fromLocation.trim() && formData.toLocation.trim() && formData.departureTime
                        ? 'Click to select seats'
                        : 'Enter Trip ID, From, To and Departure Time first'}
                    </p>
                  )}
                </button>
                {errors.seatNumbers && (
                  <p className="text-red-500 text-sm mt-1">{errors.seatNumbers}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Seat Count
                </label>
                <input
                  type="number"
                  value={formData.seatNumbers.length}
                  readOnly
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Auto-generated from selected seats</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-gray-600 font-semibold text-lg">Rs</span>
                  <input
                    type="number"
                    value={formData.amount}
                    readOnly
                    className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed font-semibold"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Auto-calculated at Rs {FARE_PER_SEAT} per seat</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-bold py-3 rounded-lg transition duration-200 shadow-md text-white ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                'Book Trip'
              )}
            </button>
          </form>

          <aside className="bg-slate-900 text-slate-100 rounded-2xl shadow-xl p-6 sticky top-6">
            <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-300">Transport</span>
                <span className="font-medium">{formData.transportType}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-300">Trip ID</span>
                <span className="font-medium">{formData.tripId || '-'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-300">Route</span>
                <span className="font-medium text-right">{(formData.fromLocation && formData.toLocation) ? `${formData.fromLocation} to ${formData.toLocation}` : '-'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-300">Seat Count</span>
                <span className="font-medium">{formData.seatNumbers.length}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-300">Seats</span>
                <span className="font-medium text-right max-w-[180px] break-words">
                  {formData.seatNumbers.length > 0 ? [...formData.seatNumbers].sort((a, b) => a - b).join(', ') : '-'}
                </span>
              </div>
            </div>
            <div className="border-t border-slate-700 mt-5 pt-5">
              <p className="text-slate-300 text-sm mb-1">Estimated Total</p>
              <p className="text-3xl font-bold">Rs {formData.amount}</p>
            </div>
          </aside>
        </div>
      </div>

      {/* Seat Selection Modal */}
      <SeatSelectionModal
        isOpen={seatModalOpen}
        onClose={() => setSeatModalOpen(false)}
        onSelectSeats={handleSelectSeats}
        transportType={formData.transportType}
        selectedSeats={formData.seatNumbers}
        occupiedSeats={occupiedSeats}
      />
    </div>
  );
};

export default AddBooking;