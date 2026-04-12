import React from 'react';

const VehicleDetailsCard = ({ vehicleDetails, transportType, coachNumber }) => {
  const categoryLabel =
    vehicleDetails?.category || (transportType === 'TRAIN' ? 'Train' : 'Bus');

  return (
    <aside className="bg-slate-900 text-slate-100 rounded-2xl shadow-xl p-5">
      <h3 className="text-base font-semibold mb-3 text-cyan-300">Vehicle Details</h3>
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-slate-300">Category</span>
          <span className="font-medium">{categoryLabel}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-300">Registration</span>
          <span className="font-medium text-right">
            {vehicleDetails?.registrationNumber || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-300">Brand / Model</span>
          <span className="font-medium text-right">
            {vehicleDetails ? `${vehicleDetails.brand} / ${vehicleDetails.model}` : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-300">Year</span>
          <span className="font-medium">{vehicleDetails?.yearOfManufacture || 'N/A'}</span>
        </div>
        {transportType === 'BUS' ? (
          <>
            <div className="flex justify-between gap-3">
              <span className="text-slate-300">Seat Capacity</span>
              <span className="font-medium">{vehicleDetails?.seatCapacity || 'N/A'}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-300">Service Type</span>
              <span className="font-medium">{vehicleDetails?.type || 'N/A'}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between gap-3">
              <span className="text-slate-300">Train Type</span>
              <span className="font-medium">{vehicleDetails?.type || 'N/A'}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-300">Coach</span>
              <span className="font-medium">{coachNumber || 'Not selected'}</span>
            </div>
          </>
        )}
      </div>
      <div className="border-t border-slate-700 mt-4 pt-4">
        <p className="text-slate-300 text-sm mb-1">Availability Status</p>
        <p className="text-lg font-bold">{vehicleDetails?.status || 'N/A'}</p>
      </div>
    </aside>
  );
};

export default VehicleDetailsCard;
