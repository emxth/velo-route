const StatusBadge = ({ status, customColors }) => {
  const defaultColors = {
    "SCHEDULED": "bg-blue-100 text-blue-800",
    "IN_PROGRESS": "bg-yellow-100 text-yellow-800",
    "COMPLETED": "bg-green-100 text-green-800",
    "DELAYED": "bg-red-100 text-red-800",
    "CANCELLED": "bg-gray-100 text-gray-800",
    "ACTIVE": "bg-green-100 text-green-800",
    "INACTIVE": "bg-gray-100 text-gray-800"
  };

  const colors = customColors || defaultColors;
  const colorClass = colors[status] || "bg-gray-100 text-gray-800";

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${colorClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;