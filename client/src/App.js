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
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected with shared layout + sidenav */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/welcome" element={<Welcome />} />

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
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;