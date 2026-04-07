import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage"
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
// import AdminSidebar from "./components/HomePage/Admin/AdminSidebar";
// import EmployeeSidebar from "./components/HomePage/Employee/EmployeeSidebar";

function App() {
  return (
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* signUp Page */}
        <Route path="/signup" element={<SignupPage />} />

        {/* Login Page */}
        <Route path="/login" element={<LoginPage />} />

        <Route path="/home" element= {<HomePage/>}/>

        {/* after login as admin or emp  */}
        {/* Admin Route */}
        {/* <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        /> */}

        {/* Employee Route */}
        {/* <Route
          path="/employee-dashboard"
          element={
            <ProtectedRoute allowedRole="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        /> */}
      </Routes>
  );
}

export default App;