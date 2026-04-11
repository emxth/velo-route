import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "./layouts/ProtectedLayout";
import ToastListener from "./components/ToastListener";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminPage from "./pages/AdminPage";
import OperatorPage from "./pages/OperatorPage";
import DriverPage from "./pages/DriverPage";
import AnalystPage from "./pages/AnalystPage";
import Welcome from "./pages/Welcome";
import Header from "./components/Header";
import Profile from "./pages/Profile";
import ComplaintsPage from "./pages/ComplaintsPage";
import ComplaintDetailPage from "./pages/ComplaintDetailPage";
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
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/profile" element={<Profile />} />


            <Route element={<ProtectedRoute roles={["admin"]} />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/bookings" element={<AdminViewBooking />} />
              <Route path="/admin/dashboard" element={<RouteScheduleManagement />} />
              <Route path="/admin/routes" element={<AdminRouteManagement />} />
              <Route path="/admin/schedules" element={<AdminScheduleManagement />} />

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


            <Route path="/schedules" element={<SchedulePage />} />


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