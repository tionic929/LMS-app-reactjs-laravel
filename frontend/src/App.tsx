import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./layouts/sidebar";
import Navbar from "./layouts/navbar";
import Login from "./pages/auth/login";
import Dashboard from "./pages/dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import Announcements from './pages/AnnouncementsPage';
import UsersIndex from "./pages/Admin/Users/Index";
import Courses from "./pages/Course";
import CourseDetails from './pages/CourseDetails';
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
import NotificationComponent from './components/NotificationComponent';

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
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Loader for logout

  const expandedWidth = 'w-64';
  const collapsedWidth = 'w-[70px]';
  const marginClass = user ? (isSidebarCollapsed ? 'ml-[70px]' : 'ml-64') : 'ml-0';

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="h-screen flex relative bg-gray-100">
      <NotificationComponent />
      <ToastContainer position="top-right" />

      {user && (
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          expandedWidth={expandedWidth}
          collapsedWidth={collapsedWidth}
        />
      )}

      <div className={`flex-1 flex flex-col ${marginClass} transition-all duration-300 ease-in-out`}>
        {user && <Navbar />}

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/" replace /> : <Home />} />
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
            <Route path="/registerInstructor" element={user ? <Navigate to="/" replace /> : <RegisterInstructor />} />
            <Route path="/forgot-password" element={user ? <Navigate to="/" replace /> : <ForgotPassword />} />
            <Route path="/reset-password" element={user ? <Navigate to="/" replace /> : <ResetPassword />} />
            <Route path="/pending" element={user ? <Navigate to="/" replace /> : <PendingApproval />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<RoleGuard allowedRoles={['admin','instructor','learner']}><Dashboard /></RoleGuard>} />
              <Route path="/users" element={<RoleGuard allowedRoles={['admin']}><UsersIndex /></RoleGuard>} />
              <Route path="/instructor-applications" element={<RoleGuard allowedRoles={['admin']}><InstructorApplications /></RoleGuard>} />
              <Route path="/announcements" element={<RoleGuard allowedRoles={['admin','instructor','learner']}><Announcements /></RoleGuard>} />
              <Route path="/courses" element={<RoleGuard allowedRoles={['admin','instructor','learner']}><Courses /></RoleGuard>} />
              <Route path="/courses/:id" element={<RoleGuard allowedRoles={['admin','instructor','learner']}><CourseDetails /></RoleGuard>} />
              <Route path="/account/update" element={<AccountUpdate />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
