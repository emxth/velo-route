// components/ScheduleEmptyState.jsx
const ScheduleEmptyState = ({ onReset }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-12 text-center">
      <div className="text-6xl mb-4">🚌</div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Schedules Found</h3>
      <p className="text-neutral-600">
        Try adjusting your filters to find available schedules.
      </p>
      <button
        onClick={onReset}
        className="mt-4 btn-outline"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default ScheduleEmptyState;