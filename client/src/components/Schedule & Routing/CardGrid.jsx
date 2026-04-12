import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTrash } from "react-icons/fa";

const CardGrid = ({
  items,
  renderCard,
  onEdit,
  onDelete,
  emptyMessage = "No items found",
  emptyIcon: EmptyIcon,
  searchTerm = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  columns = "md:grid-cols-2 lg:grid-cols-3"
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

      {/* Grid */}
      <div className={`grid grid-cols-1 ${columns} gap-6`}>
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={item._id || item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              {renderCard(item, { onEdit, onDelete })}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          {EmptyIcon && <EmptyIcon className="mx-auto text-gray-400 text-5xl mb-4" />}
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default CardGrid;