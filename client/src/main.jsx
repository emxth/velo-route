import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminPage from "./pages/AdminPage";
import OperatorPage from "./pages/OperatorPage";
import DriverPage from "./pages/DriverPage";
import AnalystPage from "./pages/AnalystPage";
import UserDashboard from "./pages/UserDashboard";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/unauthorized" element={<div>Unauthorized</div>} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<UserDashboard />} />
                    </Route>

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
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
