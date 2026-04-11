import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import SeatSelectionModal from '../components/Booking/SeatSelectionModal';
import BookingSummaryCard from '../components/Booking/BookingSummaryCard';
import VehicleDetailsCard from '../components/Booking/VehicleDetailsCard';

// Main Trip Booking Form Component
// Handles passenger/journey details, validation and API calls.
// Seat-selection UI is delegated to the shared SeatSelectionModal component.
const AddBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isScheduleAutofill = Boolean(location.state?.prefillBooking);

  const [farePerSeat, setFarePerSeat] = useState(0);

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
  const [vehicleDetails, setVehicleDetails] = useState(null);

  // Convert stored date/time to a value usable by datetime-local input
  const toDateTimeLocalValue = (value) => {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  // Prefill form data when coming from Trip Finder with a selected schedule
  useEffect(() => {
    const prefill = location.state?.prefillBooking;

    if (!prefill) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      transportType: prefill.transportType === 'TRAIN' ? 'TRAIN' : 'BUS',
      tripId: prefill.tripId || '',
      fromLocation: prefill.fromLocation || '',
      toLocation: prefill.toLocation || '',
      departureTime: toDateTimeLocalValue(prefill.departureTime),
      seatNumbers: [],
      amount: 0,
      coachNumber: '',
    }));

    setFarePerSeat(Number(prefill.estimatedFare) || 0);
    setVehicleDetails(null);

    setErrors({});
    setErrorMessage('');
    setSuccessMessage('');
  }, [location.state]);

  // Calculate amount based on seat count
  const calculateAmount = (seatCount, seatFare = farePerSeat) => {
    return seatCount * seatFare;
  };

  // Validate that departure time is in future and within one month
  const validateDepartureTime = (value) => {
    if (!value?.trim()) {
      return 'Departure time is required';
    }

    const selectedTime = new Date(value);
    if (Number.isNaN(selectedTime.getTime())) {
      return 'Enter a valid departure time';
    }

    const now = new Date();
    const maxAllowedDate = new Date(now);
    maxAllowedDate.setMonth(maxAllowedDate.getMonth() + 1);

    if (selectedTime <= now) {
      return 'Departure time must be in the future';
    }

    if (selectedTime > maxAllowedDate) {
      return 'Departure time must be within one month from today';
    }

    return '';
  };

  // Validation Rules
  // Run all field-level validations before submitting the form
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
    const departureTimeError = validateDepartureTime(formData.departureTime);
    if (departureTimeError) {
      newErrors.departureTime = departureTimeError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate phone number format: +94 followed by exactly 9 digits
  // Provides user-friendly guidance while typing Sri Lankan phone numbers
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
  // Update form state and perform real-time validation for key fields
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
    } else if (name === 'departureTime') {
      const departureTimeError = validateDepartureTime(value);
      setErrors(prev => ({
        ...prev,
        departureTime: departureTimeError,
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
  // Update selected seats and recalculate amount when user confirms seat selection
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

  // Recalculate total amount whenever fare per seat changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      amount: calculateAmount(prev.seatNumbers.length),
    }));
  }, [farePerSeat]);

  // Load estimated fare and vehicle details when tripId changes
  useEffect(() => {
    const tripId = formData.tripId.trim();

    if (!tripId) {
      setFarePerSeat(0);
      setVehicleDetails(null);
      return;
    }
    //Fetch estimated fare for the selected trip and update state
    const fetchEstimatedFare = async () => {
      try {
        const response = await api.get(`/schedules/${tripId}`);
        const schedule = response.data?.schedule || response.data;
        const estimatedFare = Number(schedule?.routeId?.estimatedFare) || 0;
        const vehicle = schedule?.vehicleID || {};

        setFarePerSeat(estimatedFare);
        setVehicleDetails({
          registrationNumber: vehicle.registrationNumber || 'N/A',
          category: vehicle.category || 'N/A',
          type: vehicle.type || 'N/A',
          brand: vehicle.brand || 'N/A',
          model: vehicle.model || 'N/A',
          yearOfManufacture: vehicle.yearOfManufacture || 'N/A',
          seatCapacity: vehicle.seatCapacity || 'N/A',
          cargoCapacityKg: vehicle.cargoCapacityKg || 'N/A',
          status: vehicle.status || 'N/A',
        });
      } catch (err) {
        console.error('Failed to fetch route estimated fare:', err);
        setFarePerSeat(0);
        setVehicleDetails(null);
      }
    };

    fetchEstimatedFare();
  }, [formData.tripId]);

  // Fetch occupied seats whenever core trip details change
  useEffect(() => {
    const hasRequiredTripDetails =
      formData.tripId.trim() &&
      formData.fromLocation.trim() &&
      formData.toLocation.trim() &&
      formData.departureTime;

    if (!hasRequiredTripDetails) {
      console.log('Skipping - missing required fields');
      setOccupiedSeats([]);
      return;
    }

    const fetchOccupiedSeats = async () => {
      try {
        setLoadingOccupiedSeats(true);
        
        // Convert datetime-local format to ISO string for API
        const departureTimeISO = formData.departureTime 
          ? new Date(formData.departureTime).toISOString() 
          : formData.departureTime;
        
        const params = {
          tripId: formData.tripId.trim(),
          transportType: formData.transportType,
          fromLocation: formData.fromLocation.trim(),
          toLocation: formData.toLocation.trim(),
          departureTime: departureTimeISO,
        };

        const response = await api.get('/bookings/occupied-seats', { params });

        const normalized = (response.data?.occupiedSeats || [])
          .map((seat) => Number(seat))
          .filter((seat) => !Number.isNaN(seat));

        setOccupiedSeats(normalized);
      } catch (err) {
        console.error('Failed to fetch occupied seats:', err.response?.data || err.message);
        console.error('Full error:', err);
        setOccupiedSeats([]);
      } finally {
        setLoadingOccupiedSeats(false);
      }
    };

    fetchOccupiedSeats();
  }, [formData.tripId, formData.transportType, formData.fromLocation, formData.toLocation, formData.departureTime]);

  // Handle Form Submission
  // Validate form and send booking data to backend API
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
      setFarePerSeat(0);
      setVehicleDetails(null);

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
            <input type="hidden" name="tripId" value={formData.tripId} />

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
                    disabled={isScheduleAutofill}
                    className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none bg-white ${
                      isScheduleAutofill
                        ? 'cursor-not-allowed bg-gray-100 text-gray-600'
                        : 'focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer'
                    }`}
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
                  readOnly={isScheduleAutofill}
                  placeholder="Enter departure location"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.fromLocation
                      ? 'border-red-500 focus:ring-red-500'
                      : isScheduleAutofill
                        ? 'border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed'
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
                  readOnly={isScheduleAutofill}
                  placeholder="Enter destination location"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.toLocation
                      ? 'border-red-500 focus:ring-red-500'
                      : isScheduleAutofill
                        ? 'border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed'
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
                  readOnly={isScheduleAutofill}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.departureTime
                      ? 'border-red-500 focus:ring-red-500'
                      : isScheduleAutofill
                        ? 'border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed'
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

            <div className="inline-flex items-center gap-3 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2">
              <span className="text-sm font-semibold text-cyan-800">Price per seat</span>
              <span className="text-lg font-bold text-cyan-900">Rs {farePerSeat || 0}</span>
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
                        : 'Select a schedule from Trip Finder first'}
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
                <p className="text-xs text-gray-500 mt-1">
                  {farePerSeat > 0
                    ? `Auto-calculated at Rs ${farePerSeat} per seat`
                    : 'Fare will be loaded from route estimated fare'}
                </p>
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

          <div className="space-y-4 lg:sticky lg:top-2">
            <BookingSummaryCard
              transportType={formData.transportType}
              fromLocation={formData.fromLocation}
              toLocation={formData.toLocation}
              seatNumbers={formData.seatNumbers}
              amount={formData.amount}
            />

            <VehicleDetailsCard
              vehicleDetails={vehicleDetails}
              transportType={formData.transportType}
              coachNumber={formData.coachNumber}
            />
          </div>
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
        seatCapacity={vehicleDetails?.seatCapacity}
      />
    </div>
  );
};

export default AddBooking;