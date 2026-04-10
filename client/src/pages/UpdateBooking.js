
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import SeatSelectionModal from '../components/Booking/SeatSelectionModal';

// Convert stored Date value to a value suitable for datetime-local input
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

const UpdateBooking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [booking, setBooking] = useState(location.state?.booking || null);
    const [loading, setLoading] = useState(!location.state?.booking);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [seatModalOpen, setSeatModalOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const [occupiedSeats, setOccupiedSeats] = useState([]);
    const [loadingOccupiedSeats, setLoadingOccupiedSeats] = useState(false);
    const [farePerSeat, setFarePerSeat] = useState(0);
    const [seatCapacity, setSeatCapacity] = useState(null);
    const [seatCapacityLoading, setSeatCapacityLoading] = useState(false);

    const [formData, setFormData] = useState({
        phoneNumber: '',
        seatNumbers: [],
        departureTime: '',
        amount: 0,
    });

    useEffect(() => {
        const fetchBooking = async () => {
            if (booking) return;
            try {
                setLoading(true);
                const res = await api.get('/bookings/me');
                const found = res.data.find((b) => b._id === id);
                if (!found) {
                    setError('Booking not found for current user.');
                    return;
                }
                setBooking(found);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load booking details.');
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [booking, id]);

    useEffect(() => {
        if (!booking) return;
        const seatCount = Number(booking.seatCount) || (booking.seatNumbers || []).length || 0;
        const resolvedFarePerSeat = seatCount > 0 ? Number(booking.amount || 0) / seatCount : 0;
        setFarePerSeat(Number.isFinite(resolvedFarePerSeat) ? resolvedFarePerSeat : 0);

        const toInputDateTime = toDateTimeLocalValue(booking.departureTime);
        setFormData({
            phoneNumber: booking.phoneNumber || '',
            seatNumbers: (booking.seatNumbers || []).map((seat) => {
                const n = Number(seat);
                return Number.isNaN(n) ? seat : n;
            }),
            departureTime: toInputDateTime,
            amount: booking.amount || 0,
        });
    }, [booking]);

    useEffect(() => {
        const fetchSeatCapacity = async () => {
            if (!booking?.tripId) {
                setSeatCapacity(null);
                setSeatCapacityLoading(false);
                return;
            }

            try {
                setSeatCapacityLoading(true);
                const response = await api.get(`/schedules/${booking.tripId}`);
                const schedule = response.data?.schedule || response.data;
                const vehicle = schedule?.vehicleID || {};
                const capacity = Number(vehicle.seatCapacity);
                setSeatCapacity(Number.isFinite(capacity) && capacity > 0 ? capacity : null);
            } catch (err) {
                console.error('Failed to fetch seat capacity:', err);
                setSeatCapacity(null);
            }
            finally {
                setSeatCapacityLoading(false);
            }
        };

        fetchSeatCapacity();
    }, [booking?.tripId]);

    useEffect(() => {
        const fetchOccupiedSeats = async () => {
            if (!booking || !formData.departureTime) {
                setOccupiedSeats([]);
                return;
            }

            try {
                setLoadingOccupiedSeats(true);
                const response = await api.get('/bookings/occupied-seats', {
                    params: {
                        tripId: booking.tripId,
                        transportType: booking.transportType,
                        fromLocation: booking.fromLocation,
                        toLocation: booking.toLocation,
                        departureTime: formData.departureTime,
                        excludeBookingId: id,
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
    }, [booking, id, formData.departureTime]);

    const isPending = booking?.bookingStatus === 'PENDING';

    const calculateAmount = (seatCount) => seatCount * farePerSeat;

    const validateDepartureTime = (value) => {
        if (!value) {
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

    const validate = () => {
        const newErrors = {};
        if (!isPending) {
            return { formError: 'Only PENDING bookings can be updated.', fieldErrors: {} };
        }
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        } else {
            const phoneError = validatePhoneNumber(formData.phoneNumber);
            if (phoneError) {
                newErrors.phoneNumber = phoneError;
            }
        }
        if (formData.seatNumbers.length === 0) {
            newErrors.seatNumbers = 'Please select at least one seat';
        }
        const departureTimeError = validateDepartureTime(formData.departureTime);
        if (departureTimeError) {
            newErrors.departureTime = departureTimeError;
        }
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            return { formError: 'Please fix the validation errors above', fieldErrors: newErrors };
        }
        return { formError: '', fieldErrors: {} };
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Real-time validation for phone number
        if (name === 'phoneNumber') {
            const phoneError = validatePhoneNumber(value);
            setErrors((prev) => ({ ...prev, phoneNumber: phoneError }));
        } else if (name === 'departureTime') {
            const departureTimeError = validateDepartureTime(value);
            setErrors((prev) => ({ ...prev, departureTime: departureTimeError }));
        } else if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleSelectSeats = (seats) => {
        const seatLabels = seats.map((s) => String(s));
        setFormData((prev) => ({
            ...prev,
            seatNumbers: seatLabels,
            amount: calculateAmount(seatLabels.length),
        }));
        if (errors.seatNumbers) {
            setErrors((prev) => ({ ...prev, seatNumbers: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const { formError } = validate();
        if (formError) {
            setError(formError);
            return;
        }

        try {
            setSaving(true);
            await api.patch(`/bookings/${id}`, {
                phoneNumber: formData.phoneNumber,
                seatNumbers: formData.seatNumbers,
                departureTime: formData.departureTime,
            });
            setSuccess('Booking updated successfully. Redirecting...');
            setTimeout(() => navigate('/viewBookings'), 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update booking.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
                <p className="text-gray-600">Loading booking...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6 md:p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Update Booking</h1>
                <p className="text-sm text-gray-600 mb-6">Only editable fields are shown below.</p>

                {booking && (
                    <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</p>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                {booking.bookingStatus}
                            </span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 rounded border border-green-200 bg-green-50 text-green-700 text-sm">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            disabled={!isPending || saving}
                            className={`w-full border rounded-lg px-4 py-2 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="+94XXXXXXXXX"
                        />
                        {errors.phoneNumber && (
                            <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Seat Numbers</label>
                        <button
                            type="button"
                            onClick={() => setSeatModalOpen(true)}
                            disabled={!isPending || saving || loadingOccupiedSeats || seatCapacityLoading || !seatCapacity}
                            className={`w-full px-4 py-2 border rounded-lg text-left transition ${errors.seatNumbers
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300 bg-gray-50'
                                } hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                            {seatCapacityLoading ? (
                                <p className="text-gray-500">Loading vehicle seat details...</p>
                            ) : loadingOccupiedSeats ? (
                                <p className="text-gray-500">Loading seat availability...</p>
                            ) : !seatCapacity ? (
                                <p className="text-gray-500">Vehicle seat capacity unavailable</p>
                            ) : formData.seatNumbers.length > 0 ? (
                                <div>
                                    <p className="font-medium text-gray-800">
                                        {formData.seatNumbers.length} seat(s) selected
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {[...formData.seatNumbers]
                                            .sort((a, b) => Number(a) - Number(b))
                                            .join(', ')}
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

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Seat Count</label>
                        <input
                            type="number"
                            value={formData.seatNumbers.length}
                            readOnly
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Total Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-2.5 text-gray-600 font-semibold text-lg">Rs.</span>
                            <input
                                type="number"
                                value={formData.amount}
                                readOnly
                                className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed font-semibold"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Auto-calculated at Rs. {farePerSeat} per seat</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Departure Time (read only)</label>
                        <input
                            type="datetime-local"
                            name="departureTime"
                            value={formData.departureTime}
                            readOnly
                            disabled
                            className="w-full border rounded-lg px-4 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                        <button
                            type="button"
                            onClick={() => navigate('/viewBookings')}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!isPending || saving}
                            className="px-5 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
                        >
                            {saving ? 'Updating...' : 'Update Booking'}
                        </button>
                    </div>
                </form>
            </div>

            <SeatSelectionModal
                isOpen={seatModalOpen}
                onClose={() => setSeatModalOpen(false)}
                onSelectSeats={handleSelectSeats}
                transportType={booking?.transportType || 'BUS'}
                selectedSeats={formData.seatNumbers.map((s) => Number(s)).filter((n) => !Number.isNaN(n))}
                occupiedSeats={occupiedSeats}
                seatCapacity={seatCapacity}
            />
        </div>
    );
};

export default UpdateBooking;