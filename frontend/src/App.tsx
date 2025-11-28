import React, { useState } from "react"; // <-- Import useState
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./layouts/sidebar";
import Footer from "./layouts/footer"; // Assuming this is used elsewhere
import Navbar from "./layouts/navbar"; // Assuming this is used elsewhere
import Login from "./pages/auth/login";
import Dashboard from "./pages/dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import Announcements from './pages/AnnouncementsPage'
import UsersIndex from "./pages/Admin/Users/Index";
import Courses from "./pages/Course";
import Register from "./pages/Register";

import './App.css'

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false); // <-- NEW STATE

  // Define widths for easy calculation
  const expandedWidth = 'w-64'; // 256px
  const collapsedWidth = 'w-[70px]'; // 80px
  
  // Calculate margin based on state
  const marginClass = isCollapsed ? 'ml-20' : 'ml-64';

  if (loading) {
      // Handle loading state if necessary
      return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="h-screen flex relative bg-gray-100"> 
      {/* 1. Sidebar (Fixed) */}
      {user && (
        <Sidebar 
          isCollapsed={isCollapsed} // <-- Pass state down
          setIsCollapsed={setIsCollapsed} // <-- Pass setter function down
          expandedWidth={expandedWidth}
          collapsedWidth={collapsedWidth}
        />
      )}

      {/* 2. Main Content Wrapper */}
      <div 
        className={`flex-1 flex flex-col ${marginClass} transition-all duration-300 ease-in-out`} // <-- Apply dynamic margin
      >
        {user && <Navbar />}
        <main className="flex-1 overflow-y-auto"> {/* <-- ADDED padding for content */}
            <Routes>
              <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<UsersIndex />} />
                <Route path="/announcements" element={<Announcements />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/register" element={<Register />} />
              </Route>
            </Routes>
        </main>
        {/* {user && <Footer />} Assuming Footer exists */}
      </div>
    </div>
  );
};

export default App;