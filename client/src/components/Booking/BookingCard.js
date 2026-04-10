import React from 'react';
import { Calendar, Users, Smartphone, Trash2, Edit2, CreditCard } from 'lucide-react';
import { formatDateTime, getStatusBadgeClass, getPaymentBadgeClass } from '../../utils/bookingFormatters';

// Presentational card showing a single booking with actions
const BookingCard = ({
  booking,
  paymentLoading,
  deleteLoading,
  cancelPaymentLoading,
  onUpdateBooking,
  onMakePayment,
  onDeleteBooking,
  onCancelPayment,
}) => {
  const isPending = booking.bookingStatus === 'PENDING';
  const isCancelled = booking.bookingStatus === 'CANCELLED';
  const isPaid = booking.paymentStatus === 'PAID';
  const departureMs = new Date(booking.departureTime).getTime();
  const isDepartureTimeValid = !Number.isNaN(departureMs);
  const hasDeparturePassed = isDepartureTimeValid && departureMs <= Date.now();
  const canCancelPaidBooking = !isCancelled && isPaid && !hasDeparturePassed;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden border border-gray-200">
      {/* Card Header with Status */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            {booking.fromLocation} 
            <span className="mx-1">→</span> 
            {booking.toLocation}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Booking ID: {booking._id.slice(-8).toUpperCase()}
          </p>
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
              <p className="text-xs text-gray-500 font-semibold uppercase mb-2">
                Seats ({booking.seatCount})
              </p>
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
          {/* Update Button - Only if PENDING */}
          {isPending && (
            <button
              onClick={() => onUpdateBooking(booking._id)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium"
            >
              <Edit2 size={16} />
              Update
            </button>
          )}

          {/* Make Payment Button - Only if UNPAID */}
          {booking.paymentStatus === 'UNPAID' && (
            <button
              onClick={() => onMakePayment(booking._id)}
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
              onClick={() => onCancelPayment(booking)}
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
              onClick={() => onDeleteBooking(booking._id)}
              disabled={deleteLoading === booking._id}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={16} />
              {deleteLoading === booking._id
                ? 'Processing...'
                : isPending && !isPaid
                  ? 'Cancel & Delete'
                  : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
