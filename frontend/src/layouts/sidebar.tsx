import React from 'react'
import { FaHome, FaUser, FaCog, FaSignOutAlt, FaUsers } from 'react-icons/fa'

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-800 text-gray-100 h-full p-4 hidden md:flex md:flex-col">
      <div className="flex items-center gap-3 px-2 py-4">
        <div className="text-2xl font-bold">LMS</div>
      </div>

      <nav className="mt-4 flex-1">
        <a className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700" href="#">
          <FaHome className="w-5 h-5" />
          <span>Home</span>
        </a>
        <a className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 mt-1" href="#">
          <FaUser className="w-5 h-5" />
          <span>Profile</span>
        </a>
        <a className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 mt-1" href="#/users">
          <FaUsers className="w-5 h-5" />
          <span>Users</span>
        </a>
        <a className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 mt-1" href="#">
          <FaCog className="w-5 h-5" />
          <span>Settings</span>
        </a>
      </nav>

      <div className="mt-auto px-3 py-4">
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded hover:bg-gray-700">
          <FaSignOutAlt className="w-5 h-5" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar