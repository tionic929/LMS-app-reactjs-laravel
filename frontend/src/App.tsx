import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Sidebar from "./layouts/sidebar";
import Footer from "./layouts/footer";
import Navbar from "./layouts/navbar";
import Login from "./pages/auth/login";
import Dashboard from "./pages/dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";

const App: React.FC = () => {
  const { user, loading } = useAuth();
  
  return (
    <div className="h-screen flex">
      {user && <Sidebar />}
      <div className="flex-1 flex flex-col">
        {user && <Navbar />}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <Routes>
              <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
              </Route>
            </Routes>
          </div>
        </main>
        {user && <Footer />}
      </div>
    </div>
  );
};

export default App;
