import React from "react";
import { FaSearch } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import NotificationBell from "../components/navbar/NotificationBell";

const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-gray-100 border-b border-gray-300 shadow px-4 py-3">
      <div className="flex items-center justify-between max-w-8xl mx-auto">
        <div />

        <div className="flex items-center gap-3">
          <button className="hidden md:inline-flex p-2 rounded-md hover:bg-gray-700" title="search">
            <FaSearch />
          </button>

          {user && (
            <NotificationBell userId={user.id} userRole={user.role} />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
