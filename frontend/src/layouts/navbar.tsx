import React from 'react'
import { FaBell, FaSearch, FaUserCircle } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <nav className="top-0 bg-gray-800 text-gray-100 shadow p-4">
      <div className="max-w-8xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <button aria-label="Search" className="text-gray-100 hover:text-white p-2 rounded-md hidden md:inline-flex" >
            <FaSearch />
          </button>
          <div className="text-lg font-semibold">Dashboard</div>
        </div>

        <div className="flex items-center gap-3">
          <button aria-label="Notifications" className="p-2 rounded-md hover:bg-gray-700">
            <FaBell />
          </button>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 p-3 rounded-md hover:bg-gray-700">
              <FaUserCircle className="w-6 h-6" />
              <span className="hidden sm:inline">{user?.name ?? 'Account'}{user?.role ?? 'Role Not Found'}</span>
            </button>

            <button onClick={handleLogout} className="ml-2 px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
