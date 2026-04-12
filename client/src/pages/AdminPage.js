import { useEffect, useState } from "react";
import api from "../api/axios";

const NAV_PREVIEW = {
  admin: ["dashboard", "admin", "operator", "driver", "analyst"],
  operator: ["dashboard", "operator"],
  driver: ["dashboard", "driver"],
  analyst: ["dashboard", "analyst"],
  user: ["dashboard", "schedules"],
};

const ROLES = ["admin", "operator", "driver", "analyst", "user"];

const AdminPage = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin View</h1>
    </div>
  );
};

export default AdminPage;