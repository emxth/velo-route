import { format } from "date-fns";

const ScheduleFilters = ({ 
  filters, 
  filterOptions, 
  onFilterChange, 
  onReset 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2 text-neutral-700">
            Route
          </label>
          <select
            name="routeName"
            value={filters.routeName}
            onChange={onFilterChange}
            className="input-field w-full"
          >
            <option value="">All Routes</option>
            {filterOptions.routes.map(route => (
              <option key={route} value={route}>{route}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-neutral-700">
            Start Destination
          </label>
          <select
            name="startDestination"
            value={filters.startDestination}
            onChange={onFilterChange}
            className="input-field w-full"
          >
            <option value="">All Starting Points</option>
            {filterOptions.startDestinations.map(dest => (
              <option key={dest} value={dest}>{dest}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-neutral-700">
            End Destination
          </label>
          <select
            name="endDestination"
            value={filters.endDestination}
            onChange={onFilterChange}
            className="input-field w-full"
          >
            <option value="">All Destinations</option>
            {filterOptions.endDestinations.map(dest => (
              <option key={dest} value={dest}>{dest}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-neutral-700">
            Arrival Time
          </label>
          <input
            type="time"
            name="arrivalTime"
            value={filters.arrivalTime}
            onChange={onFilterChange}
            className="input-field w-full"
            placeholder="HH:MM"
          />
          <p className="text-xs text-neutral-500 mt-1">
            Shows schedules within 30 minutes
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-neutral-700">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={onFilterChange}
            className="input-field w-full"
            min={format(new Date(), "yyyy-MM-dd")}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <button
          onClick={onReset}
          className="btn-outline px-4 py-2 text-sm"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default ScheduleFilters;