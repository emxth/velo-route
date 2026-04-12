import React from 'react';
import { AlertCircle } from 'lucide-react';

// Confirmation modal for cancelling a paid booking with refund policy info
const CancelBookingModal = ({ booking, isOpen, isLoading, onClose, onConfirm }) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-gray-200">
        <div className="flex items-start gap-3 mb-4">
          <div className="rounded-full bg-amber-100 p-2">
            <AlertCircle className="text-amber-600" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Confirm Booking Cancellation</h2>
            <p className="text-sm text-gray-600 mt-1">
              You are about to cancel this booking from {booking.fromLocation} to {booking.toLocation}.
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
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
          >
            Keep Booking
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Cancelling...' : 'Confirm Cancellation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;
