import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/HomePage/Admin/AdminSidebar";
import EmployeeSidebar from "../components/HomePage/Employee/EmployeeSidebar";

// Admin Pages
// import UploadDocs from "../components/HomePage/Admin/UploadDocs";
// import RemoveDocs from "../components/HomePage/Admin/RemoveDocs";
// import Requests from "../components/HomePage/Admin/RequestList";
// import UploadedDocs from "../components/HomePage/Admin/UploadedDocs";
// import Token from "../components/HomePage/Admin/TokenDocs";

// Employee Page
// import EmployeeChat from "../components/HomePage/Employee/EmployeeChat";

function HomePage() {
  // const role = localStorage.getItem("role");
  // const navigate = useNavigate();

  // const handleLogout = () => {
  //   localStorage.removeItem("role");
  //   navigate("/");
  // };

  // if (!role) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <h1>Please login first</h1>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen flex">
      <h1>helo</h1>

      {/* ✅ SIDEBAR */}
      {/* {role === "admin" ? (
        <AdminSidebar handleLogout={handleLogout} />
      ) : (
        <EmployeeSidebar handleLogout={handleLogout} />
      )} */}

    </div>
  );
}

export default HomePage;