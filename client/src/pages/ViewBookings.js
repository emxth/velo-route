
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { Users, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Toast from '../components/Toast';
import BookingCard from '../components/Booking/BookingCard';
import CancelBookingModal from '../components/Booking/CancelBookingModal';
import { formatDateTime, getStatusBadgeClass, getPaymentBadgeClass } from '../utils/bookingFormatters';

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

    // Compute pagination values
    const totalPages = Math.ceil(bookings.length / itemsPerPage);
    const paginatedBookings = bookings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
                    <button
                        type="button"
                        onClick={() => navigate('/addBooking')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        + New Booking
                    </button>
                </div>

                {/* Calculate pagination */}
                {bookings.length > 0 && (
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