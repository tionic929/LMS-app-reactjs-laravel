import React from 'react'
import { FaBell, FaUserCircle } from 'react-icons/fa'

const Navbar: React.FC = () => {
  return (
    <header className="bg-gray-800 text-gray-100 p-3 shadow">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold">Dashboard</div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-md hover:bg-gray-700">
            <FaBell />
          </button>
          <button className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-700">
            <FaUserCircle className="w-6 h-6" />
            <span className="hidden sm:inline">Account</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
