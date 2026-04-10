import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import SeatButton from './SeatButton';

const SeatSelectionModal = ({
  isOpen,
  onClose,
  onSelectSeats,
  transportType,
  selectedSeats,
  occupiedSeats = [],
  seatCapacity,
}) => {
  const [localSelectedSeats, setLocalSelectedSeats] = useState(selectedSeats || []);

  const safeSeatCapacity = Number.isFinite(Number(seatCapacity)) && Number(seatCapacity) > 0
    ? Number(seatCapacity)
    : null;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const nextSelected = (selectedSeats || []).filter((seat) => {
      if (occupiedSeats.includes(seat)) {
        return false;
      }

      if (safeSeatCapacity && seat > safeSeatCapacity) {
        return false;
      }

      return true;
    });

    setLocalSelectedSeats(nextSelected);
  }, [isOpen, selectedSeats, occupiedSeats, safeSeatCapacity]);

  if (!isOpen) return null;

  const isBus = transportType === 'BUS';
  const fallbackColumns = 5;
  const totalSeats = safeSeatCapacity;
  const seatLayout = {
    cols: fallbackColumns,
    rows: totalSeats ? Math.ceil(totalSeats / fallbackColumns) : 0,
  };

  const buildBusRows = (seatCount) => {
    const rows = [];
    if (seatCount <= 6) {
      rows.push({
        seats: Array.from({ length: seatCount }, (_, index) => index + 1),
        leftCount: 0,
        isLastRow: true,
      });
      return rows;
    }

    const seatsBeforeLastRow = seatCount - 6;
    let nextSeat = 1;
    const splitRowsLimit = 9;
    const splitRowSeatCount = 5;
    const rightOnlySeatCount = 3;
    const splitRowsCount = Math.min(splitRowsLimit, Math.ceil(seatsBeforeLastRow / splitRowSeatCount));

    for (let rowIndex = 0; rowIndex < splitRowsCount && nextSeat <= seatsBeforeLastRow; rowIndex += 1) {
      const remainingBeforeLastRow = seatsBeforeLastRow - nextSeat + 1;
      const rowSeatCount = Math.min(splitRowSeatCount, remainingBeforeLastRow);

      rows.push({
        seats: Array.from({ length: rowSeatCount }, (_, offset) => nextSeat + offset),
        leftCount: Math.min(2, rowSeatCount),
        isSplitRow: true,
      });

      nextSeat += rowSeatCount;
    }

    while (nextSeat <= seatsBeforeLastRow) {
      const remainingBeforeLastRow = seatsBeforeLastRow - nextSeat + 1;
      const rowSeatCount = Math.min(rightOnlySeatCount, remainingBeforeLastRow);

      rows.push({
        seats: Array.from({ length: rowSeatCount }, (_, offset) => nextSeat + offset),
        leftCount: 0,
        isRightOnlyRow: true,
      });

      nextSeat += rowSeatCount;
    }

    rows.push({
      seats: Array.from({ length: 6 }, (_, offset) => nextSeat + offset),
      leftCount: 2,
      isLastRow: true,
    });

    return rows;
  };

  const busRows = isBus && totalSeats ? buildBusRows(totalSeats) : [];

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">Select {transportType} Seats</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-white border-2 border-blue-400 rounded" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 border-2 border-green-600 rounded" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-400 border-2 border-gray-500 rounded" />
              <span>Occupied</span>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg mb-5">
            {!safeSeatCapacity ? (
              <div className="py-10 text-center text-sm text-gray-600">
                Loading vehicle seat details...
              </div>
            ) : isBus ? (
              <div className="space-y-2">
                {busRows.map((row, rowIndex) => {
                  const leftCount = row.leftCount || 2;
                  const leftSeats = row.seats.slice(0, leftCount);
                  const rightSeats = row.seats.slice(leftCount);

                  let rowContent;

                  if (row.isLastRow && row.seats.length === 6) {
                    rowContent = (
                      <div className="grid grid-cols-6 gap-1">
                        {row.seats.map((seatNumber) => (
                          <SeatButton
                            key={seatNumber}
                            seatNumber={seatNumber}
                            isOccupied={occupiedSeats.includes(seatNumber)}
                            isSelected={localSelectedSeats.includes(seatNumber)}
                            onToggle={toggleSeat}
                          />
                        ))}
                      </div>
                    );
                  } else if (row.isRightOnlyRow) {
                    rowContent = (
                      <div className="flex justify-center w-full">
                        <div className="flex items-center gap-5">
                          <div className="flex gap-1 min-w-[3.5rem] justify-center">
                            <div className="w-6 h-6" aria-hidden="true" />
                          </div>
                          <div className="flex gap-1 min-w-[5.5rem] justify-center">
                            {row.seats.map((seatNumber) => (
                              <SeatButton
                                key={seatNumber}
                                seatNumber={seatNumber}
                                isOccupied={occupiedSeats.includes(seatNumber)}
                                isSelected={localSelectedSeats.includes(seatNumber)}
                                onToggle={toggleSeat}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    rowContent = (
                      <div className="flex items-center gap-5">
                        <div className="flex gap-1 min-w-[3.5rem] justify-center">
                          {leftSeats.map((seatNumber) => (
                            <SeatButton
                              key={seatNumber}
                              seatNumber={seatNumber}
                              isOccupied={occupiedSeats.includes(seatNumber)}
                              isSelected={localSelectedSeats.includes(seatNumber)}
                              onToggle={toggleSeat}
                            />
                          ))}
                        </div>
                        <div className="flex gap-1 min-w-[5.5rem] justify-center">
                          {rightSeats.map((seatNumber) => (
                            <SeatButton
                              key={seatNumber}
                              seatNumber={seatNumber}
                              isOccupied={occupiedSeats.includes(seatNumber)}
                              isSelected={localSelectedSeats.includes(seatNumber)}
                              onToggle={toggleSeat}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={`row-${rowIndex}`} className="flex justify-center">
                      {rowContent}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className="grid gap-1 justify-center"
                style={{ gridTemplateColumns: `repeat(${seatLayout.cols}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: totalSeats }, (_, i) => {
                  const seatNumber = i + 1;
                  return (
                    <SeatButton
                      key={seatNumber}
                      seatNumber={seatNumber}
                      isOccupied={occupiedSeats.includes(seatNumber)}
                      isSelected={localSelectedSeats.includes(seatNumber)}
                      onToggle={toggleSeat}
                    />
                  );
                })}
              </div>
            )}
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

export default SeatSelectionModal;
