import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Toast from "./Toast";

const ToastListener = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (location.state?.toast) {
      setToast(location.state.toast);

      // Clear toast from navigation state
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  return (
    <Toast
      message={toast?.message}
      type={toast?.type}
      onClose={() => setToast(null)}
    />
  );
};

export default ToastListener;
