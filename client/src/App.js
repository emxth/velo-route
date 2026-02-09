import { Routes, Route, Link } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ToastListener from "./components/ToastListener";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminPage from "./pages/AdminPage";
import OperatorPage from "./pages/OperatorPage";
import DriverPage from "./pages/DriverPage";
import AnalystPage from "./pages/AnalystPage";
import UserDashboard from "./pages/UserDashboard";

/* Public Pages */
const Home = () => (
    <div>
        <h1>VeloRoute</h1>
        <nav>
            <Link to="/login">Login</Link> |{" "}
            <Link to="/register">Register</Link>
        </nav>
    </div>
);

const Unauthorized = () => <div>Unauthorized</div>;

function App() {
    return (
        <>
            <ToastListener />
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Any logged-in user */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<UserDashboard />} />
                </Route>

                {/* Role-based routes */}
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
            </Routes>
        </>
    );
}

export default App;
