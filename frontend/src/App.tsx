import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./layouts/sidebar";
// import Footer from "./layouts/footer"; 
import Navbar from "./layouts/navbar"; 
import Login from "./pages/auth/login";
import Dashboard from "./pages/dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import Announcements from './pages/AnnouncementsPage'
import UsersIndex from "./pages/Admin/Users/Index";
import Courses from "./pages/Course";
import CourseDetails from './pages/CourseDetails'
import Register from "./pages/auth/register";
import AccountUpdate from "./pages/Account/Update";
import RegisterInstructor from "./pages/auth/registerInstructor";
import NotificationDisplay from "./components/notification/NotificationDisplay";

import './App.css'

// --- NEW IMPORTS FOR REAL-TIME NOTIFICATIONS ---
// 🛑 REMOVED: import useSocketNotifications from "./hooks/useSocketNotifications"; 
import SocketInitializer from "./components/SocketInitializer"; // 💡 NEW IMPORT
// ------------------------------------------------

// --- 1. RBAC Guard Component ---
// This component checks the user's role against the allowed list.
interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: ('admin' | 'instructor' | 'learner')[];
}

const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
    const { user } = useAuth();
    
    // If the user's role is not one of the allowed roles, redirect them to the home page.
    if (!user || !allowedRoles.includes(user.role as ('admin' | 'instructor' | 'learner'))) {
        return <Navigate to="/" replace />;
    }
    
    return <>{children}</>;
};
// -------------------------------

const App: React.FC = () => {
    const { user, loading } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // 🛑 REMOVED: useSocketNotifications(); 
    // The hook is now called inside the memoized <SocketInitializer /> component.

    // Define widths for easy calculation
    const expandedWidth = 'w-64'; // 256px
    const collapsedWidth = 'w-[70px]'; // 80px
    
    // Calculate margin based on state
    const calculatedMargin = isCollapsed ? 'ml-[70px]' : 'ml-64'; // Use the Tailwind class value
    const marginClass = user ? calculatedMargin : 'ml-0';

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return (
        <div className="h-screen flex relative bg-gray-100"> 
            
            {/* 💡 NEW COMPONENT: Initializes the socket connection */}
            <SocketInitializer /> 

            {/* --- NOTIFICATION CONTAINER (Fixed in Viewport) --- */}
            <NotificationDisplay />
            {/* -------------------------------------------------- */}
            
            {/* Sidebar is only rendered if user is authenticated */}
            {user && (
                <Sidebar 
                    isCollapsed={isCollapsed} 
                    setIsCollapsed={setIsCollapsed} 
                    expandedWidth={expandedWidth}
                    collapsedWidth={collapsedWidth}
                />
            )}

            <div 
                className={`flex-1 flex flex-col ${marginClass} transition-all duration-300 ease-in-out`} 
            >
                {/* Navbar is only rendered if user is authenticated */}
                {user && <Navbar />}
                
                <main className="flex-1 overflow-y-auto"> 
                    <Routes>
                        {/* Public route / Unauthenticated redirect */}
                        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
                        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
                        <Route path="/registerInstructor" element={user ? <Navigate to="/" replace /> : <RegisterInstructor />} />

                        {/* Protected Routes (Requires Authentication handled by <ProtectedRoute />) */}
                        <Route element={<ProtectedRoute />}>
                            
                            {/* Dashboard: All Roles */}
                            <Route 
                                path="/" 
                                element={<RoleGuard allowedRoles={['admin', 'instructor', 'learner']}><Dashboard /></RoleGuard>} 
                            />
                            
                            {/* User Management: Admin Only */}
                            <Route 
                                path="/users" 
                                element={<RoleGuard allowedRoles={['admin']}><UsersIndex /></RoleGuard>} 
                            />
                            
                            {/* Announcements: All Roles */}
                            <Route 
                                path="/announcements" 
                                element={<RoleGuard allowedRoles={['admin', 'instructor', 'learner']}><Announcements /></RoleGuard>} 
                            />
                            
                            {/* Courses/Community: All Roles */}
                            <Route 
                                path="/courses" 
                                element={<RoleGuard allowedRoles={['admin', 'instructor', 'learner']}><Courses /></RoleGuard>} 
                            />

                            {/* Course Details: All Roles */}
                            <Route 
                                path="/courses/:id" 
                                element={<RoleGuard allowedRoles={['admin', 'instructor', 'learner']}><CourseDetails /></RoleGuard>} 
                            />
                            
                            <Route path="/account/update" element={<AccountUpdate />} />
                            
                            {/* Fallback for authenticated users if they hit an unknown route */}
                            <Route path="*" element={<Navigate to="/" replace />} />

                        </Route>
                        
                        {/* Fallback for unauthenticated users */}
                        {/* Note: This is usually redundant because of the ProtectedRoute, but good for completeness */}
                        <Route path="*" element={<Navigate to="/login" replace />} />

                    </Routes>
                </main>
                {/* {user && <Footer />} Assuming Footer exists */}
            </div>
        </div>
    );
};

export default App;