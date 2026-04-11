const ScheduleErrorState = ({ error, onRetry }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-8 bg-red-50 rounded-lg">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Schedules</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={onRetry}
          className="mt-4 btn-primary"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ScheduleErrorState;