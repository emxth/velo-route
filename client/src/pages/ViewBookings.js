import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { Users, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Toast from '../components/Toast';
import BookingCard from '../components/Booking/BookingCard';
import CancelBookingModal from '../components/Booking/CancelBookingModal';

const ViewBookings = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(null);
    const [cancelPaymentLoading, setCancelPaymentLoading] = useState(null);
    const [cancelConfirmBooking, setCancelConfirmBooking] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [toast, setToast] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | PENDING | CONFIRMED | CANCELLED
    const [timeFilter, setTimeFilter] = useState('ALL'); // ALL | UPCOMING | PAST
    const [paymentFilter, setPaymentFilter] = useState('ALL'); // ALL | UNPAID | PAID | REFUNDED
    const [transportFilter, setTransportFilter] = useState('ALL'); // ALL | BUS | TRAIN

    // Fetch user's bookings on component mount
    useEffect(() => {
        fetchBookings();
    }, []);

    // Handle Stripe payment confirmation when redirected back from checkout
    useEffect(() => {
        const confirmPaymentFromRedirect = async () => {
            const payment = searchParams.get('payment');
            const sessionId = searchParams.get('session_id');
            const bookingId = searchParams.get('bookingId');

            if (payment !== 'success' || !sessionId || !bookingId) {
                return;
            }

            try {
                await api.post(`/bookings/${bookingId}/pay/confirm`, { sessionId });
                await fetchBookings();
                setToast({ type: 'success', message: 'Payment verified successfully.' });
            } catch (err) {
                console.error('Payment confirmation error:', err);
                setToast({
                    type: 'error',
                    message: err.response?.data?.message || 'Payment verification failed.',
                });
            } finally {
                navigate('/viewBookings', { replace: true });
            }
        };

        confirmPaymentFromRedirect();
    }, [searchParams, navigate]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, timeFilter, paymentFilter, transportFilter]);

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

    // Handle delete booking - cancels first if PENDING, then deletes and refreshes list
    const handleDeleteBooking = async (bookingId) => {
        const booking = bookings.find(b => b._id === bookingId);
        const isPending = booking?.bookingStatus === 'PENDING';
        const isUnpaid = booking?.paymentStatus === 'UNPAID';
        
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

            setToast({
                type: 'success',
                message: isPending && isUnpaid
                    ? 'Booking cancelled successfully. Seat(s) are now available for other passengers.'
                    : 'Booking deleted successfully',
            });
        } catch (err) {
            console.error('Error handling booking:', err);
            setToast({
                type: 'error',
                message: err.response?.data?.message || 'Failed to process booking. Please try again.',
            });
        } finally {
            setDeleteLoading(null);
        }
    };

    // Handle update booking (redirect to edit page)
    const handleUpdateBooking = (bookingId) => {
        navigate(`/updateBooking/${bookingId}`);
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
                setToast({ type: 'error', message: 'Failed to initiate payment. Please try again.' });
            }
        } catch (err) {
            console.error('Payment error:', err);
            setToast({
                type: 'error',
                message: err.response?.data?.message || 'Failed to process payment. Please try again.',
            });
            setPaymentLoading(null);
        }
    };

    // Handle payment cancellation/refund for paid pending bookings
    const handleCancelPayment = (booking) => {
        setCancelConfirmBooking(booking);
    };

    // Confirm cancellation for paid bookings and update local list based on refund policy
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
                setToast({
                    type: 'success',
                    message: 'Booking cancelled. Refund has been initiated based on the policy.',
                });
            } else {
                setToast({
                    type: 'success',
                    message: 'Booking cancelled. No refund applies for this cancellation.',
                });
            }
        } catch (err) {
            console.error('Error cancelling payment:', err);
            setToast({
                type: 'error',
                message: err.response?.data?.message || 'Failed to cancel payment',
            });
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

    // Apply filters to bookings
    const filteredBookings = bookings.filter((booking) => {
        const matchesStatus =
            statusFilter === 'ALL' || booking.bookingStatus === statusFilter;

        const matchesPayment =
            paymentFilter === 'ALL' || booking.paymentStatus === paymentFilter;

        const matchesTransport =
            transportFilter === 'ALL' || booking.transportType === transportFilter;

        let matchesTime = true;
        if (timeFilter !== 'ALL') {
            const departureMs = new Date(booking.departureTime).getTime();
            if (Number.isNaN(departureMs)) {
                matchesTime = false;
            } else if (timeFilter === 'UPCOMING') {
                matchesTime = departureMs > Date.now();
            } else if (timeFilter === 'PAST') {
                matchesTime = departureMs <= Date.now();
            }
        }

        return matchesStatus && matchesPayment && matchesTransport && matchesTime;
    });

    // Compute pagination values based on filtered bookings
    const totalPages = filteredBookings.length === 0
        ? 1
        : Math.ceil(filteredBookings.length / itemsPerPage);

    const paginatedBookings = filteredBookings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    // Bookings list
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
                        <p className="text-gray-600 mt-1">
                            {filteredBookings.length}
                            {' '}
                            booking
                            {filteredBookings.length !== 1 ? 's' : ''}
                            {' '}
                            found
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-xl bg-white shadow-sm border border-gray-200 p-4 md:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Filter bookings
                        </h2>
                        <button
                            type="button"
                            onClick={() => {
                                setStatusFilter('ALL');
                                setTimeFilter('ALL');
                                setPaymentFilter('ALL');
                                setTransportFilter('ALL');
                            }}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                            Reset filters
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label
                                htmlFor="statusFilter"
                                className="block text-xs font-semibold text-gray-600 uppercase tracking-wide"
                            >
                                Status
                            </label>
                            <select
                                id="statusFilter"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                <option value="ALL">All</option>
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="timeFilter"
                                className="block text-xs font-semibold text-gray-600 uppercase tracking-wide"
                            >
                                Time
                            </label>
                            <select
                                id="timeFilter"
                                value={timeFilter}
                                onChange={(e) => setTimeFilter(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                <option value="ALL">All</option>
                                <option value="UPCOMING">Upcoming</option>
                                <option value="PAST">Past</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="paymentFilter"
                                className="block text-xs font-semibold text-gray-600 uppercase tracking-wide"
                            >
                                Payment
                            </label>
                            <select
                                id="paymentFilter"
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                <option value="ALL">All</option>
                                <option value="UNPAID">Unpaid</option>
                                <option value="PAID">Paid</option>
                                <option value="REFUNDED">Refunded</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="transportFilter"
                                className="block text-xs font-semibold text-gray-600 uppercase tracking-wide"
                            >
                                Transport
                            </label>
                            <select
                                id="transportFilter"
                                value={transportFilter}
                                onChange={(e) => setTransportFilter(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                <option value="ALL">All</option>
                                <option value="BUS">Bus</option>
                                <option value="TRAIN">Train</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Calculate pagination */}
                {filteredBookings.length > 0 && (
                    <>
                        {/* Bookings Grid */}
                        <div className="grid gap-6 mb-8">
                            {paginatedBookings.map((booking) => (
                                <BookingCard
                                    key={booking._id}
                                    booking={booking}
                                    paymentLoading={paymentLoading}
                                    deleteLoading={deleteLoading}
                                    cancelPaymentLoading={cancelPaymentLoading}
                                    onUpdateBooking={handleUpdateBooking}
                                    onMakePayment={handleMakePayment}
                                    onDeleteBooking={handleDeleteBooking}
                                    onCancelPayment={handleCancelPayment}
                                />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {filteredBookings.length > itemsPerPage && (
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
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
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
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </>
                )}

                <CancelBookingModal
                    booking={cancelConfirmBooking}
                    isOpen={Boolean(cancelConfirmBooking)}
                    isLoading={cancelConfirmBooking && cancelPaymentLoading === cancelConfirmBooking._id}
                    onClose={() => setCancelConfirmBooking(null)}
                    onConfirm={confirmCancelPayment}
                />

                <Toast
                    message={toast?.message}
                    type={toast?.type}
                    onClose={() => setToast(null)}
                />
            </div>
        </div>
    );
};

export default ViewBookings;