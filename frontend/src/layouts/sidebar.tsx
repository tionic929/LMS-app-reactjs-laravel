import React from "react";
import { FaHome, FaUser, FaCog, FaSignOutAlt, FaUsers,  } from "react-icons/fa";
import { Link } from "react-router-dom";

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-800 text-gray-100 h-full p-4 hidden md:flex md:flex-col">
      <div className="flex items-center gap-3 px-2 py-4">
        <div className="text-2xl font-bold">LMS</div>
      </div>

      <nav className="mt-4 flex-1">
        
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700"
        >
          <FaHome className="w-5 h-5" />
          <span>Home</span>
        </Link>
        <Link
          to="/users"
          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 mt-1"
        >
          <FaUsers className="w-5 h-5" />
          <span>Users</span>
        </Link>
        <Link
          to="/announcements"
          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 mt-1"
        >
          <FaUsers className="w-5 h-5" />
          <span>Announcements</span>
        </Link>
        <Link
          to="/profile"
          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 mt-1"
        >
          <FaUser className="w-5 h-5" />
          <span>Profile</span>
        </Link>
        <Link
          to="/login"
          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 mt-1"
        >
          <FaCog className="w-5 h-5" />
          <span>Login</span>
        </Link>
        <Link
          to="/register"
          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 mt-1"
        >
          <FaCog className="w-5 h-5" />
          <span>Register</span>
        </Link>
      </nav>

      <div className="mt-auto px-3 py-4">
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded hover:bg-gray-700">
          <FaSignOutAlt className="w-5 h-5" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
