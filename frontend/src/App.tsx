import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./layouts/sidebar";
import Footer from "./layouts/footer";
import Navbar from "./layouts/navbar";
import Login from "./pages/auth/login";
import Dashboard from "./pages/dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import Announcements from './pages/AnnouncementsPage'
import UsersIndex from "./pages/Admin/Users/Index";
import './App.css'

const App: React.FC = () => {
  const { user, loading } = useAuth();

  return (
    <div className="h-screen flex">
      {user && <Sidebar />}
      <div className="flex-1 flex flex-col justify-center align-center ">
        {user && <Navbar />}
        <main className="flex-1 justify-center overflow-auto ">
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
        {user && <Footer />}
      </div>
    </div>
  );
};

export default App;
