import { useEffect } from "react";

const Toast = ({ message, type = "info", onClose, duration = 2500 }) => {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onClose, duration);
    return () => clearTimeout(id);
  }, [message, duration, onClose]);

  if (!message) return null;

  const color =
    type === "success" ? "bg-success-50 text-success-900 border-success-500" :
      type === "error" ? "bg-danger-50 text-danger-900 border-danger-500" :
        "bg-neutral-100 text-neutral-800 border-neutral-200";

  return (
    <div className={`fixed top-4 right-4 border rounded-lg px-4 py-3 shadow-card ${color}`}>
      <div className="font-medium">
        {type === "success" ? "Success" : type === "error" ? "Error" : "Info"}
      </div>
      <div className="text-sm">{message}</div>
    </div>
  );
};

export default Toast;