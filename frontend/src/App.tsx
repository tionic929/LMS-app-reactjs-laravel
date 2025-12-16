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
import InstructorApplications from "./pages/Admin/Instructors/Index";
import PendingApproval from "./pages/auth/pendingApproval";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Home from "./pages/Home";
// import NotificationComponent from './components/NotificationComponent';
import { MdMenu } from "react-icons/md";
import LearnerDashboard from "./pages/Learner/LearnerDashboard";

const RoleGuard = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: ('admin' | 'instructor' | 'learner')[] }) => {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role as ('admin' | 'instructor' | 'learner'))) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
        const { user, loading } = useAuth();
        const defaultRoute = user ? (user.role === 'learner' ? '/learner-dashboard' : '/dashboard') : '/dashboard';
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
        {/* BACKUP */}
{/*       { user && ( */}
{/*       <NotificationComponent userId={user.id} userRole={user.role} /> */}
{/*       )} */}

      <ToastContainer position="top-right" />

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
            <Route path="/" element={user ? <Navigate to={defaultRoute} replace /> : <Home />} />
            <Route path="/login" element={user ? <Navigate to={defaultRoute} replace /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to={defaultRoute} replace /> : <Register />} />
            <Route path="/registerInstructor" element={user ? <Navigate to={defaultRoute} replace /> : <RegisterInstructor />} />
            <Route path="/forgot-password" element={user ? <Navigate to={defaultRoute} replace /> : <ForgotPassword />} />
            <Route path="/reset-password/:token" element={user ? <Navigate to={defaultRoute} replace /> : <ResetPassword />} />
            <Route path="/pending" element={user ? <Navigate to={defaultRoute} replace /> : <PendingApproval />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<RoleGuard allowedRoles={['admin','instructor']}><Dashboard /></RoleGuard>} />
              <Route path="/learner-dashboard" element={<RoleGuard allowedRoles={['learner']}><LearnerDashboard /></RoleGuard>} />
              <Route path="/users" element={<RoleGuard allowedRoles={['admin']}><UsersIndex /></RoleGuard>} />
              <Route path="/instructor-applications" element={<RoleGuard allowedRoles={['admin']}><InstructorApplications /></RoleGuard>} />
              <Route path="/announcements" element={<RoleGuard allowedRoles={['admin','instructor','learner']}><Announcements /></RoleGuard>} />
              <Route path="/courses" element={<RoleGuard allowedRoles={['admin','instructor','learner']}><Courses /></RoleGuard>} />
              <Route path="/courses/:id" element={<RoleGuard allowedRoles={['admin','instructor','learner']}><CourseDetails /></RoleGuard>} />
              <Route path="/account/update" element={<AccountUpdate />} />
              <Route path="*" element={<Navigate to={defaultRoute} replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;