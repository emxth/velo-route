import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "./layouts/ProtectedLayout";
import ToastListener from "./components/ToastListener";

// Public pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Role‑specific pages
import AdminPage from "./pages/AdminPage";
import OperatorPage from "./pages/OperatorPage";
import DriverPage from "./pages/DriverPage";
import AnalystPage from "./pages/AnalystPage";

// Shared pages
import Welcome from "./pages/Welcome";
import Header from "./components/Header";
import Profile from "./pages/Profile";
import ComplaintsPage from "./pages/ComplaintsPage";
import ComplaintDetailPage from "./pages/ComplaintDetailPage";

// Department Management pages
import AddDepartmentPage from "./pages/DepartmentManagement/AddDepartmentPage";
import AllDepartmentsPage from "./pages/DepartmentManagement/AllDepartmentsPage";
import DepartmentDetailsPage from "./pages/DepartmentManagement/DepartmentDetailsPage";
import UpdateDepartmentPage from "./pages/DepartmentManagement/UpdateDepartmentPage";

// Vehicle Management pages
import AddVehiclePage from "./pages/VehicleManagement/AddVehiclePage";
import AllVehiclesPage from "./pages/VehicleManagement/AllVehiclesPage";
import VehicleDetailsPage from "./pages/VehicleManagement/VehicleDetailsPage";
import UpdateVehiclePage from "./pages/VehicleManagement/UpdateVehiclePage";

const Unauthorized = () => <div>Unauthorized</div>;

function App() {
  return (
    <>
      <ToastListener />
      <Header />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected with shared layout + sidenav */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            {/* General pages */}
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/profile" element={<Profile />} />

            {/* Role‑specific areas */}
            <Route element={<ProtectedRoute roles={["admin"]} />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
            <Route element={<ProtectedRoute roles={["operator"]} />}>
              <Route path="/operator" element={<OperatorPage />} />
            </Route>
            <Route element={<ProtectedRoute roles={["driver"]} />}>
              <Route path="/driver" element={<DriverPage />} />
            </Route>
            <Route element={<ProtectedRoute roles={["analyst"]} />}>
              <Route path="/analyst" element={<AnalystPage />} />
            </Route>

            {/* Department routes (admin only) */}
            <Route element={<ProtectedRoute roles={["admin"]} />}>
              <Route path="/departments" element={<AllDepartmentsPage />} />
              <Route path="/departments/add" element={<AddDepartmentPage />} />
              <Route
                path="/departments/:id"
                element={<DepartmentDetailsPage />}
              />
              <Route
                path="/departments/edit/:id"
                element={<UpdateDepartmentPage />}
              />
            </Route>

            {/* Vehicle routes (admin only) */}
            <Route element={<ProtectedRoute roles={["admin"]} />}>
              <Route path="/vehicles" element={<AllVehiclesPage />} />
              <Route path="/vehicles/add" element={<AddVehiclePage />} />
              <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
              <Route
                path="/vehicles/edit/:id"
                element={<UpdateVehiclePage />}
              />
            </Route>

            {/* Complaints – accessible by all authenticated users */}
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
