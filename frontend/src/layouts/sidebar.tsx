// Sidebar.jsx (The Fixed Component)

import React from "react";
import { FaHome, FaUser, FaUsers } from "react-icons/fa";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import { Link } from "react-router-dom";

const Sidebar: React.FC = () => {
  return (
    // REMOVED: fixed, left-0, top-0, bottom-0, z-50
    // ADDED: flex-shrink-0 (optional, but good practice)
    <aside className="w-64 bg-gray-800 text-gray-100 p-4 flex flex-col flex-shrink-0 hidden md:flex overflow-hidden">
      <div className="flex items-center gap-3 px-2 py-4">
        <div className="text-2xl font-bold">LMS</div>
      </div>
      
      {/* ... navigation content ... */}

      <nav className="mt-4 flex-1">
        
        {/* Navigation Links */}
        <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700">
          <FaHome className="w-5 h-5" />
          <span>Home</span>
        </Link>
        {/* ... other links ... */}
        <Link to="/users" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 mt-1">
          <FaUsers className="w-5 h-5" />
          <span>Users</span>
        </Link>
        <Link to="/announcements" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 mt-1">
          <FaUsers className="w-5 h-5" />
          <span>Announcements</span>
        </Link>
        <Link to="/profile" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 mt-1">
          <FaUser className="w-5 h-5" />
          <span>Profile</span>
        </Link>
      </nav>
      
      {/* Optional: Logout button at the bottom */}
      <div className="mt-auto pt-4 border-t border-gray-700">
         <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 text-red-400">
             <FaArrowRightFromBracket className="w-5 h-5" />
             <span>Logout</span>
         </button>
      </div>

    </aside>
  );
};

export default Sidebar;