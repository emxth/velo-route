import React from 'react';

const BookingSummaryCard = ({ transportType, fromLocation, toLocation, seatNumbers, amount }) => {
  const safeSeatNumbers = Array.isArray(seatNumbers) ? seatNumbers : [];

  return (
    <aside className="bg-slate-900 text-slate-100 rounded-2xl shadow-xl p-5">
      <h3 className="text-base font-semibold mb-3 text-cyan-300">Booking Summary</h3>
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-slate-300">Transport</span>
          <span className="font-medium">{transportType}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-300">Route</span>
          <span className="font-medium text-right">
            {fromLocation && toLocation ? `${fromLocation} to ${toLocation}` : '-'}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-300">Seat Count</span>
          <span className="font-medium">{safeSeatNumbers.length}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-300">Seats</span>
          <span className="font-medium text-right max-w-[180px] break-words">
            {safeSeatNumbers.length > 0
              ? [...safeSeatNumbers].sort((a, b) => a - b).join(', ')
              : '-'}
          </span>
        </div>
      </div>
      <div className="border-t border-slate-700 mt-4 pt-4">
        <p className="text-slate-300 text-sm mb-1">Estimated Total</p>
        <p className="text-3xl font-bold">Rs {amount}</p>
      </div>
    </aside>
  );
};

export default BookingSummaryCard;
