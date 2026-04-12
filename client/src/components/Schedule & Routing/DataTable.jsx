import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTrash } from "react-icons/fa";

const DataTable = ({
  columns,
  data,
  onEdit,
  onDelete,
  emptyMessage = "No data found",
  emptyIcon: EmptyIcon,
  searchTerm = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  actions = true
}) => {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {onSearchChange && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="input-field w-full"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: column.width }}
                  >
                    {column.header}
                  </th>
                ))}
                {actions && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence>
                {data.map((item, index) => (
                  <motion.tr
                    key={item._id || item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="px-6 py-4">
                        {column.render ? column.render(item) : item[column.accessor]}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(item)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <FaEdit />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(item._id || item.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {data.length === 0 && (
          <div className="text-center py-12">
            {EmptyIcon && <EmptyIcon className="mx-auto text-gray-400 text-5xl mb-4" />}
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;