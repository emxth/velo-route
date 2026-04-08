
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import api from '../api/axios';

const SeatSelectionModal = ({ isOpen, onClose, onSelectSeats, transportType, selectedSeats, occupiedSeats = [] }) => {
    const [localSelectedSeats, setLocalSelectedSeats] = useState(selectedSeats || []);

    useEffect(() => {
        if (isOpen) {
            const nextSelected = (selectedSeats || []).filter((seat) => !occupiedSeats.includes(seat));
            setLocalSelectedSeats(nextSelected);
        }
    }, [isOpen, selectedSeats, occupiedSeats]);

    const seatLayout = transportType === 'TRAIN'
        ? { rows: 6, cols: 5 }
        : { rows: 8, cols: 4 };

    const totalSeats = seatLayout.rows * seatLayout.cols;
    const toggleSeat = (seatNumber) => {
        setLocalSelectedSeats((prev) =>
            prev.includes(seatNumber)
                ? prev.filter((s) => s !== seatNumber)
                : [...prev, seatNumber]
        );
    };

    const handleConfirm = () => {
        onSelectSeats(localSelectedSeats);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">Select {transportType} Seats</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
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

                    <div className="bg-gray-50 p-3 rounded-lg mb-5">
                        <div
                            className="grid gap-1 justify-center"
                            style={{ gridTemplateColumns: `repeat(${seatLayout.cols}, minmax(0, 1fr))` }}
                        >
                            {Array.from({ length: totalSeats }, (_, i) => {
                                const seatNumber = i + 1;
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
                            })}
                        </div>
                    </div>

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

    const FARE_PER_SEAT = 500;

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
        const toInputDateTime = booking.departureTime
            ? new Date(booking.departureTime).toISOString().slice(0, 16)
            : '';
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

    const calculateAmount = (seatCount) => seatCount * FARE_PER_SEAT;

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
        if (!formData.departureTime) {
            newErrors.departureTime = 'Departure time is required';
        } else {
            const selectedTime = new Date(formData.departureTime);
            const now = new Date();
            if (selectedTime <= now) {
                newErrors.departureTime = 'Departure time must be in the future';
            }
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
                    <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700">
                        <p><span className="font-semibold">Booking ID:</span> {booking._id}</p>
                        <p><span className="font-semibold">Status:</span> {booking.bookingStatus}</p>
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
                            className={`w-full border rounded-lg px-4 py-2 ${
                                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
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
                            disabled={!isPending || saving || loadingOccupiedSeats}
                            className={`w-full px-4 py-2 border rounded-lg text-left transition ${
                                errors.seatNumbers
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300 bg-gray-50'
                                } hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                            {loadingOccupiedSeats ? (
                                <p className="text-gray-500">Loading seat availability...</p>
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
                        <p className="text-xs text-gray-500 mt-1">Auto-calculated at Rs. {FARE_PER_SEAT} per seat</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Departure Time</label>
                        <input
                            type="datetime-local"
                            name="departureTime"
                            value={formData.departureTime}
                            onChange={handleChange}
                            disabled={!isPending || saving}
                            className={`w-full border rounded-lg px-4 py-2 ${
                                errors.departureTime ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.departureTime && (
                            <p className="text-red-500 text-sm mt-1">{errors.departureTime}</p>
                        )}
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
            />
        </div>
    );
};

export default UpdateBooking;