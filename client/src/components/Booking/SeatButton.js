import React from 'react';

const SeatButton = ({ seatNumber, isOccupied, isSelected, onToggle }) => {
  const baseClasses = `
    w-6 h-6 rounded border-2 transition-all duration-200 font-semibold text-xs
    flex items-center justify-center
  `;

  const stateClasses = isOccupied
    ? 'bg-gray-400 border-gray-500 cursor-not-allowed'
    : isSelected
    ? 'bg-green-500 border-green-600 text-white'
    : 'bg-white border-blue-400 hover:bg-blue-50 cursor-pointer';

  return (
    <button
      onClick={() => !isOccupied && onToggle(seatNumber)}
      disabled={isOccupied}
      className={`${baseClasses} ${stateClasses}`}
      title={`Seat ${seatNumber}`}
    >
      {seatNumber}
    </button>
  );
};

export default SeatButton;
