import { FaBus, FaShuttleVan, FaTrain } from "react-icons/fa";

const TransportIcon = ({ type, className = "text-blue-500", size = 16 }) => {
  const iconMap = {
    "Bus": FaBus,
    "Train": FaTrain,
    "Van": FaShuttleVan,
    
  };

  const IconComponent = iconMap[type] || FaBus;

  return <IconComponent className={className} size={size} />;
};

export default TransportIcon;