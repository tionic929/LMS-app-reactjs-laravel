import React from "react";
import { FaHome, FaUsers,  } from "react-icons/fa";
import { FaArrowUpRightFromSquare, FaArrowRightFromBracket } from "react-icons/fa6";
import { BsMegaphoneFill } from "react-icons/bs";
import { FaBook } from "react-icons/fa6";
import { Link } from "react-router-dom";

const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gray-800 text-gray-100 p-4 hidden md:flex md:flex-col z-50 overflow-hidden">
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
          <BsMegaphoneFill className="w-5 h-5" />
          <span>Announcements</span>
        </Link>
        <Link
          to="/courses"
          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 mt-1"
        >
          <FaBook className="w-5 h-5" />
          <span>Courses</span>
        </Link>
        <Link
          to="/login"
          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 mt-1"
        >
          <FaArrowRightFromBracket className="w-5 h-5" />
          <span>Login</span>
        </Link>
        <Link
          to="/register"
          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 mt-1"
        >
          <FaArrowUpRightFromSquare className="w-5 h-5" />
          <span>Register</span>
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
