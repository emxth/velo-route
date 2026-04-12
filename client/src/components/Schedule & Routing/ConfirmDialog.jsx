import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  type = "danger" // danger, warning, info
}) => {
  const colors = {
    danger: {
      button: "bg-red-600 hover:bg-red-700",
      icon: "text-red-600"
    },
    warning: {
      button: "bg-yellow-600 hover:bg-yellow-700",
      icon: "text-yellow-600"
    },
    info: {
      button: "bg-blue-600 hover:bg-blue-700",
      icon: "text-blue-600"
    }
  };

  const color = colors[type] || colors.danger;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaExclamationTriangle className={`text-2xl ${color.icon}`} />
                <h2 className="text-xl font-bold">{title}</h2>
              </div>
              <p className="text-gray-600">{message}</p>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button
                onClick={onConfirm}
                className={`${color.button} text-white px-4 py-2 rounded-lg flex-1 transition-colors`}
              >
                {confirmText}
              </button>
              <button
                onClick={onClose}
                className="btn-outline flex-1"
              >
                {cancelText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;