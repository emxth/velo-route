
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import axios from 'axios';
import { Calendar, MapPin, Users, Smartphone, Trash2, AlertCircle, Edit2, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from "../context/AuthContext";

const ViewBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(null);
    const [cancelPaymentLoading, setCancelPaymentLoading] = useState(null);
    const [cancelConfirmBooking, setCancelConfirmBooking] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Fetch user's bookings on component mount
    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        const confirmPaymentFromRedirect = async () => {
            const params = new URLSearchParams(window.location.search);
            const payment = params.get('payment');
            const sessionId = params.get('session_id');
            const bookingId = params.get('bookingId');

            if (payment !== 'success' || !sessionId || !bookingId) {
                return;
            }

            try {
                await api.post(`/bookings/${bookingId}/pay/confirm`, { sessionId });
                await fetchBookings();
                alert('Payment verified successfully.');
            } catch (err) {
                console.error('Payment confirmation error:', err);
                alert(err.response?.data?.message || 'Payment verification failed.');
            } finally {
                window.history.replaceState({}, '', '/viewBookings');
            }
        };

        confirmPaymentFromRedirect();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/bookings/me');
            // Sort by most recent first (descending by createdAt)
            const sortedBookings = response.data.sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            setBookings(sortedBookings);
            setCurrentPage(1); // Reset to first page
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError(err.response?.data?.message || 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    // Format date and time
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status badge styles
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'CONFIRMED':
                return 'bg-green-100 text-green-800 border border-green-300';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 border border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-300';
        }
    };

    const getPaymentBadgeClass = (status) => {
        switch (status) {
            case 'PAID':
                return 'bg-green-100 text-green-800 border border-green-300';
            case 'UNPAID':
                return 'bg-red-100 text-red-800 border border-red-300';
            case 'REFUNDED':
                return 'bg-blue-100 text-blue-800 border border-blue-300';
            case 'FAILED':
                return 'bg-orange-100 text-orange-800 border border-orange-300';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-300';
        }
    };

    // Handle delete booking - cancels first if PENDING, then deletes and refreshes list
    const handleDeleteBooking = async (bookingId) => {
        const booking = bookings.find(b => b._id === bookingId);
        const isPending = booking?.bookingStatus === 'PENDING';
        const isUnpaid = booking?.paymentStatus === 'UNPAID';
        
        const confirmMsg = isPending && isUnpaid 
            ? 'Are you sure you want to cancel this booking? This will free up the seat(s).'
            : 'Are you sure you want to delete this booking?';
        
        if (!window.confirm(confirmMsg)) {
            return;
        }

        try {
            setDeleteLoading(bookingId);
            
            // If PENDING + UNPAID, first cancel the booking to mark it as CANCELLED and free up seats
            if (isPending && isUnpaid) {
                console.log('Cancelling PENDING+UNPAID booking:', bookingId);
                await api.patch(`/bookings/${bookingId}/cancel`);
            }
            
            // Then delete the booking completely
            console.log('Deleting booking:', bookingId);
            await api.delete(`/bookings/${bookingId}`);
            
            // Refresh bookings from server so UI is always up-to-date
            await fetchBookings();

            alert(isPending && isUnpaid 
                ? 'Booking cancelled successfully. Seat(s) are now available for other passengers.' 
                : 'Booking deleted successfully');
        } catch (err) {
            console.error('Error handling booking:', err);
            alert(err.response?.data?.message || 'Failed to process booking. Please try again.');
        } finally {
            setDeleteLoading(null);
        }
    };

    // Handle update booking (redirect to edit page)
    const handleUpdateBooking = (bookingId) => {
        window.location.href = `/updateBooking/${bookingId}`;
    };

    // Handle payment with Stripe
    const handleMakePayment = async (bookingId) => {
        try {
            setPaymentLoading(bookingId);
            
            // Call backend to create Stripe checkout session
            const response = await api.post(`/bookings/${bookingId}/pay`);
            
            if (response.data.checkoutUrl) {
                // Redirect to Stripe checkout
                window.location.href = response.data.checkoutUrl;
            } else {
                alert('Failed to initiate payment. Please try again.');
            }
        } catch (err) {
            console.error('Payment error:', err);
            alert(err.response?.data?.message || 'Failed to process payment. Please try again.');
            setPaymentLoading(null);
        }
    };

    // Handle payment cancellation/refund for paid pending bookings
    const handleCancelPayment = (booking) => {
        setCancelConfirmBooking(booking);
    };

    const confirmCancelPayment = async () => {
        if (!cancelConfirmBooking) {
            return;
        }

        const bookingId = cancelConfirmBooking._id;

        try {
            setCancelPaymentLoading(bookingId);
            const response = await api.patch(`/bookings/${bookingId}/cancel`);

            setBookings(prevBookings =>
                prevBookings.map(booking =>
                    booking._id === bookingId ? response.data : booking
                )
            );

            if (response.data.paymentStatus === 'REFUNDED') {
                alert('Booking cancelled. Refund has been initiated based on the policy.');
            } else {
                alert('Booking cancelled. No refund applies for this cancellation.');
            }
        } catch (err) {
            console.error('Error cancelling payment:', err);
            alert(err.response?.data?.message || 'Failed to cancel payment');
        } finally {
            setCancelPaymentLoading(null);
            setCancelConfirmBooking(null);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="inline-block">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-4 text-gray-600 font-medium">Loading your bookings...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
                        <div>
                            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Bookings</h2>
                            <p className="text-red-700 mb-4">{error}</p>
                            <button
                                onClick={fetchBookings}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Empty state
    if (bookings.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">My Bookings</h1>
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                            <Users className="text-blue-600" size={32} />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">No bookings yet</h2>
                        <p className="text-gray-600 mb-6">You haven't made any bookings. Start your journey by creating a new booking!</p>
                        <a
                            href="/addBooking"
                            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            Create New Booking
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Bookings list
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
                        <p className="text-gray-600 mt-1">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} found</p>
                    </div>
                    <a
                        href="/addBooking"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        + New Booking
                    </a>
                </div>

                {/* Calculate pagination */}
                {bookings.length > 0 && (
                    <>
                        {/* Bookings Grid */}
                        <div className="grid gap-6 mb-8">
                            {bookings
                                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                .map((booking) => (
                        <div
                            key={booking._id}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden border border-gray-200"
                        >
                            {/* Card Header with Status */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {booking.fromLocation} → {booking.toLocation}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">Booking ID: {booking._id.slice(-8).toUpperCase()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(booking.bookingStatus)}`}>
                                        {booking.bookingStatus}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentBadgeClass(booking.paymentStatus)}`}>
                                        {booking.paymentStatus}
                                    </span>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {/* Left Column */}
                                    <div className="space-y-4">
                                        {/* Transport Type */}
                                        <div className="flex items-start gap-3">
                                            <div className="bg-blue-100 p-2 rounded">
                                                <Users size={20} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-semibold uppercase">Transport Type</p>
                                                <p className="text-base font-semibold text-gray-800">{booking.transportType}</p>
                                            </div>
                                        </div>

                                        {/* Departure */}
                                        <div className="flex items-start gap-3">
                                            <div className="bg-green-100 p-2 rounded">
                                                <Calendar size={20} className="text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-semibold uppercase">Departure</p>
                                                <p className="text-base font-semibold text-gray-800">{formatDateTime(booking.departureTime)}</p>
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div className="flex items-start gap-3">
                                            <div className="bg-purple-100 p-2 rounded">
                                                <Smartphone size={20} className="text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-semibold uppercase">Contact</p>
                                                <p className="text-base font-semibold text-gray-800">{booking.phoneNumber}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-4">
                                        {/* Seats */}
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Seats ({booking.seatCount})</p>
                                            <p className="text-sm font-mono text-gray-800 break-words">
                                                {booking.seatNumbers.join(', ')}
                                            </p>
                                        </div>

                                        {/* Coach Number (if Train) */}
                                        {booking.transportType === 'TRAIN' && booking.coachNumber && (
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Coach Number</p>
                                                <p className="text-base font-semibold text-gray-800">{booking.coachNumber}</p>
                                            </div>
                                        )}

                                        {/* Amount */}
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                            <p className="text-xs text-blue-700 font-semibold uppercase mb-2">Total Amount</p>
                                            <p className="text-2xl font-bold text-blue-900">Rs. {booking.amount}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Vehicle Number (replaces Trip ID) */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Vehicle No</p>
                                    <p className="text-sm font-mono text-gray-800 break-all">
                                        {booking.vehicleRegistrationNumber || 'N/A'}
                                    </p>
                                </div>

                                {/* Meta Info */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs text-gray-600 mb-6 pb-6 border-b border-gray-200">
                                    <div>
                                        <p className="text-gray-500 font-semibold uppercase">Booked On</p>
                                        <p className="font-medium text-gray-800">{formatDateTime(booking.createdAt)}</p>
                                    </div>
                                    {booking.updatedAt && (
                                        <div>
                                            <p className="text-gray-500 font-semibold uppercase">Last Updated</p>
                                            <p className="font-medium text-gray-800">{formatDateTime(booking.updatedAt)}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-3 justify-end">
                                    {(() => {
                                        const isPending = booking.bookingStatus === 'PENDING';
                                        const isCancelled = booking.bookingStatus === 'CANCELLED';
                                        const isPaid = booking.paymentStatus === 'PAID';
                                        const departureMs = new Date(booking.departureTime).getTime();
                                        const isDepartureTimeValid = !Number.isNaN(departureMs);
                                        const hasDeparturePassed = isDepartureTimeValid && departureMs <= Date.now();
                                        const canCancelPaidBooking = !isCancelled && isPaid && !hasDeparturePassed;

                                        return (
                                            <>
                                    {/* Update Button - Only if PENDING */}
                                    {isPending && (
                                        <button
                                            onClick={() => handleUpdateBooking(booking._id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium"
                                        >
                                            <Edit2 size={16} />
                                            Update
                                        </button>
                                    )}

                                    {/* Make Payment Button - Only if UNPAID */}
                                    {booking.paymentStatus === 'UNPAID' && (
                                        <button
                                            onClick={() => handleMakePayment(booking._id)}
                                            disabled={paymentLoading === booking._id}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <CreditCard size={16} />
                                            {paymentLoading === booking._id ? 'Processing...' : 'Make Payment'}
                                        </button>
                                    )}

                                    {/* Cancel Booking Button - Only before departure for paid active bookings */}
                                    {canCancelPaidBooking && (
                                        <button
                                            onClick={() => handleCancelPayment(booking)}
                                            disabled={cancelPaymentLoading === booking._id}
                                            className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <CreditCard size={16} />
                                            {cancelPaymentLoading === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                                        </button>
                                    )}

                                    {/* Delete Button - If CANCELLED or PENDING + UNPAID */}
                                    {(isCancelled || (isPending && !isPaid)) && (
                                        <button
                                            onClick={() => handleDeleteBooking(booking._id)}
                                            disabled={deleteLoading === booking._id}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 size={16} />
                                            {deleteLoading === booking._id ? 'Processing...' : (isPending && !isPaid ? 'Cancel & Delete' : 'Delete')}
                                        </button>
                                    )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {bookings.length > itemsPerPage && (
                            <div className="flex items-center justify-center gap-4 mt-8">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={18} />
                                    Previous
                                </button>

                                <div className="flex gap-2">
                                    {Array.from({ length: Math.ceil(bookings.length / itemsPerPage) }, (_, i) => i + 1).map(
                                        (page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-lg font-medium transition ${
                                                    currentPage === page
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    )}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(bookings.length / itemsPerPage)))}
                                    disabled={currentPage === Math.ceil(bookings.length / itemsPerPage)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </>
                )}

                {cancelConfirmBooking && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-gray-200">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="rounded-full bg-amber-100 p-2">
                                    <AlertCircle className="text-amber-600" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Confirm Booking Cancellation</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        You are about to cancel this booking from {cancelConfirmBooking.fromLocation} to {cancelConfirmBooking.toLocation}.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-5">
                                <p className="text-sm font-semibold text-amber-900 mb-2">Refund Policy</p>
                                <ul className="text-sm text-amber-800 space-y-1 list-disc pl-5">
                                    <li>More than 24 hours before trip: 100% refund</li>
                                    <li>Within 24 hours before trip: 50% refund</li>
                                    <li>No-show: 0% refund</li>
                                </ul>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setCancelConfirmBooking(null)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
                                >
                                    Keep Booking
                                </button>
                                <button
                                    onClick={confirmCancelPayment}
                                    disabled={cancelPaymentLoading === cancelConfirmBooking._id}
                                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cancelPaymentLoading === cancelConfirmBooking._id ? 'Cancelling...' : 'Confirm Cancellation'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewBookings;