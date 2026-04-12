import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "./layouts/ProtectedLayout";
import ToastListener from "./components/ToastListener";

import Landing from "./pages/Landing";
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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
//Booking pages
import AddBooking from "./pages/addBooking";
import ViewBookings from "./pages/ViewBookings";
import UpdateBooking from "./pages/UpdateBooking";
import AdminViewBooking from "./pages/AdminViewBooking";
//Schedule pages
import SchedulePage from "./pages/SchedulePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRouteManagement from "./pages/admin/AdminRouteManagement";
import AdminScheduleManagement from "./pages/admin/AdminScheduleManagement";
import RouteScheduleManagement from "./pages/admin/AdminDashboard";

import AddUser from "./pages/AddUser";
import ViewComplaintsPage from "./pages/ViewComplaintsPage";
import AdminPermissions from "./pages/AdminPermissions";

const Unauthorized = () => <div>Unauthorized</div>;

function App() {
  return (
    <>
      <ToastListener />
      <Header />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
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

            <Route element={<ProtectedRoute roles={["admin"]} />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/bookings" element={<AdminViewBooking />} />
              <Route path="/admin/dashboard" element={<RouteScheduleManagement />} />
              <Route path="/admin/routes" element={<AdminRouteManagement />} />
              <Route path="/admin/schedules" element={<AdminScheduleManagement />} />
              <Route path="/admin-permissions" element={<AdminPermissions />} />
              <Route path="/add-user" element={<AddUser />} />
              <Route path="/view-complaints" element={<ViewComplaintsPage />} />
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

            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
            {/* Booking routes */}
            <Route path="/addBooking" element={<AddBooking />} />
            <Route path="/viewBookings" element={<ViewBookings />} />
            <Route path="/updateBooking/:id" element={<UpdateBooking />} />

            {/* Schedule routes */}
            <Route path="/schedules" element={<SchedulePage />} />

          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
