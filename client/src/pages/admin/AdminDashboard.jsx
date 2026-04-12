
import { useState } from "react";
import { motion } from "framer-motion";
import { FaRoute, FaCalendarAlt, FaChartLine, FaUsers } from "react-icons/fa";
import AdminRouteManagement from "./AdminRouteManagement";
import AdminScheduleManagement from "./AdminScheduleManagement";
import AdminPage from "../AdminPage";
import AnalystPage from "../AnalystPage";

const RouteScheduleManagement = () => {
  const [activeTab, setActiveTab] = useState("routes");

  const tabs = [
    { id: "routes", label: "Route Management", icon: FaRoute },
    { id: "schedules", label: "Schedule Management", icon: FaCalendarAlt },
    //{ id: "users", label: "User Management", icon: FaUsers },
    //{ id: "analytics", label: "Analytics", icon: FaChartLine }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-2 mt-5"
      >
        <div className="flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <tab.icon />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "routes" && <AdminRouteManagement />}
        {activeTab === "schedules" && <AdminScheduleManagement />}
        
        
      </motion.div>
    </div>
  );
};

export default RouteScheduleManagement;