// Sidebar.jsx (The Fixed Component)

import React from "react";
import { FaHome, FaUsers, FaUserCircle  } from "react-icons/fa";
import { FaArrowUpRightFromSquare, FaArrowRightFromBracket } from "react-icons/fa6";
import { BsMegaphoneFill } from "react-icons/bs";
import { FaBook } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
  
    const handleLogout = async () => {
      try {
        await logout();
      } catch (err) {
        console.error('Logout failed', err);
      }
    };
  return (
    // REMOVED: fixed, left-0, top-0, bottom-0, z-50
    // ADDED: flex-shrink-0 (optional, but good practice)
    <aside className="w-64 bg-gray-200 text-gray-900 p-4 border-r border-gray-300 flex flex-col flex-shrink-0  md:flex overflow-hidden">
      <div className="flex items-center align-center gap-3 px-2 pb-4 border-b border-gray-400">
        <div className="text-3xl font-bold text-blue-800">LMS</div>
      </div>
      
      {/* ... navigation content ... */}

      <nav className="mt-4 flex-1">
        
        {/* Navigation Links */}
        <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 hover:text-gray-100">
          <FaHome className="w-5 h-5" />
          <span>Home</span>
        </Link>
        {/* ... other links ... */}
        <Link to="/users" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 hover:text-gray-100 mt-1">
          <FaUsers className="w-5 h-5" />
          <span>Users</span>
        </Link>
        <Link
          to="/announcements"
          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 hover:text-gray-100 mt-1"
        >
          <BsMegaphoneFill className="w-5 h-5" />
          <span>Announcements</span>
        </Link>
        <Link
          to="/courses"
          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 hover:text-gray-100 mt-1"
        >
          <FaBook className="w-5 h-5" />
          <span>Courses</span>
        </Link>
        <Link
          to="/register"
          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 hover:text-gray-100 mt-1"
        >
          <FaUserCircle className="w-5 h-5" />
          <span>Register</span>
        </Link>
      </nav>
      
      {/* Optional: Logout button at the bottom */}
      <div className="flex flex-col pt-4 border-t border-gray-700">
        {/* Account Button Section */}
        <div className=""> {/* Reduced vertical padding for a tighter fit */}
          <button className="flex items-center gap-2 px-3 py-2 w-full rounded-md hover:bg-gray-700 hover:text-gray-100 text-left">
            {/* Ensure icons and text align nicely */}
            <FaUserCircle className="w-6 h-6 flex-shrink-0" />
            <span className="hidden sm:inline truncate">
              {user?.name ?? 'Account'} {user?.role ?? 'Role Not Found'}
            </span>
          </button>
        </div>
        
        {/* Logout Button Section */}
        <div className="py-1"> {/* Reduced vertical padding */}
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 hover:text-gray-100 text-red-400 text-left"
          >
            <FaArrowRightFromBracket className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;