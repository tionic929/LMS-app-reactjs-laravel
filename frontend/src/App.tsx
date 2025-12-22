import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./layouts/sidebar/Sidebar";
import Navbar from "./layouts/navbar";
import Login from "./pages/auth/login";
import Dashboard from "./pages/dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import Announcements from './pages/AnnouncementsPage';
import UsersIndex from "./pages/Admin/Users/Index";
import Courses from "./pages/Course";
import CourseDetails from './pages/Admin/Courses/CourseDetails';
import Register from "./pages/auth/register";
import AccountUpdate from "./pages/Account/Update";
import RegisterInstructor from "./pages/auth/registerInstructor";
import ForgotPassword from "./pages/auth/forgotPassword";
import ResetPassword from "./pages/auth/resetPassword";
import InstructorApplications from "./pages/Admin/Instructors/instructorApplications";
import InstructorIndex from "./pages/Admin/Instructors/instructorIndex";
import PendingApproval from "./pages/auth/pendingApproval";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Home from "./pages/Home";
// import NotificationComponent from './components/NotificationComponent';
import { MdMenu } from "react-icons/md";
import AdminDashboard from "./pages/Admin/Dashboard/adminDashboard";
// import InstructorDashboard from "./pages/Instructor/Dashboard/dashboard";
// import LearnerDashboard from "./pages/Learner/Dashboard/dashboard";

import AuditLogs from './pages/Admin/History/AuditLogs';
import NetworkLogs from './pages/Admin/History/NetworkLogs';
import SystemLogs from './pages/Admin/History/SystemLogs';

const RoleGuard = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: ('admin' | 'instructor' | 'learner')[] }) => {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role as ('admin' | 'instructor' | 'learner'))) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // 🔥 NEW: State for Mobile/Off-Canvas Sidebar
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const expandedWidth = 'sm:w-64';
  const collapsedWidth = 'sm:w-[70px]';

  // 🔥 ADJUSTED: Use responsive classes for margin
  const marginClass = user 
    ? (isSidebarCollapsed ? 'sm:ml-[70px]' : 'sm:ml-64') 
    : 'ml-0';

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="h-screen flex relative bg-gray-100">
      <ToastContainer position="top-center" />

      {user && (
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          expandedWidth={expandedWidth}
          collapsedWidth={collapsedWidth}
          // 🔥 PASSED NEW PROPS FOR MOBILE CONTROL
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      )}

      {/* 🔥 ADDED NAV TOGGLE BUTTON FOR MOBILE */}
      {user && !isMobileMenuOpen && (
        <button 
          title="mobile"
          onClick={() => setIsMobileMenuOpen(true)}
          className="absolute top-4 left-4 p-2 bg-gray-800 text-white rounded-md z-40 sm:hidden"
        >
          <MdMenu className="w-6 h-6" />
        </button>
      )}

      {/* 🔥 MAIN CONTENT: Added transition for main content margin */}
      <div className={`flex-1 flex flex-col ${marginClass} transition-all duration-300 ease-in-out`}>
        {user && <Navbar />}

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Home />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
            <Route path="/registerInstructor" element={user ? <Navigate to="/dashboard" replace /> : <RegisterInstructor />} />
            <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} />
            <Route path="/reset-password/:token" element={user ? <Navigate to="/dashboard" replace /> : <ResetPassword />} />
            <Route path="/pending" element={user ? <Navigate to="/dashboard" replace /> : <PendingApproval />} />

            <Route element={<ProtectedRoute />}>        
               {/* History Paths  */}
              <Route path="/logs/audit" element={<RoleGuard allowedRoles={['admin']}><AuditLogs /></RoleGuard>} />
              <Route path="/logs/system" element={<RoleGuard allowedRoles={['admin']}><SystemLogs /></RoleGuard>} />
              <Route path="/logs/network" element={<RoleGuard allowedRoles={['admin']}><NetworkLogs /></RoleGuard>} />

               {/* Dashboards  */}
              <Route path="/instructor/dashboard" element={<RoleGuard allowedRoles={['instructor']}><Dashboard /></RoleGuard>} />
              <Route path="/admin/dashboard" element={<RoleGuard allowedRoles={['admin']}><AdminDashboard /></RoleGuard>} />
              <Route path="/learner/dashboard" element={<RoleGuard allowedRoles={['learner']}><Dashboard /></RoleGuard>} />

              <Route path="/users" element={<RoleGuard allowedRoles={['admin']}><UsersIndex /></RoleGuard>} />
              <Route path="/instructor-applications" element={<RoleGuard allowedRoles={['admin']}><InstructorApplications /></RoleGuard>} />
              <Route path="/instructors" element={<RoleGuard allowedRoles={['admin']}><InstructorIndex /></RoleGuard>} />
              <Route path="/announcements" element={<RoleGuard allowedRoles={['admin','instructor','learner']}><Announcements /></RoleGuard>} />
              <Route path="/courses" element={<RoleGuard allowedRoles={['admin','instructor','learner']}><Courses /></RoleGuard>} />
              <Route path="/courses/:id" element={<RoleGuard allowedRoles={['admin','instructor','learner']}><CourseDetails /></RoleGuard>} />
              <Route path="/account/update" element={<AccountUpdate />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;