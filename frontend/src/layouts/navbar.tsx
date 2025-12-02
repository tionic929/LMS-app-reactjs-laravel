import React, { useState, useRef, useEffect } from 'react'
import { FaBell, FaSearch } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext' // Import Context
import api from '../api/axios'

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { refreshTrigger } = useNotification(); // 💡 Listen for socket updates
  
  const [open, setOpen] = useState(false);
  const [dbNotifications, setDbNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    } 
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // 💡 Function to fetch notifications from the new Backend Controller
  const fetchNotifications = async () => {
    try {
      setError(null);
      // Changed endpoint to the generic user notifications one
      const res = await api.get('/notifications');
      setDbNotifications(res.data || []);
    } catch (err: any) {
      console.error('Failed to load notifications', err);
      // Quiet fail or set error state
    }
  };

  // 💡 EFFECT: Fetch initially AND whenever refreshTrigger changes (Socket Event)
  useEffect(() => {
    if(user) {
        fetchNotifications();
    }
  }, [user, refreshTrigger]); // dependencies ensure real-time update

  const toggleNotifications = () => {
    setOpen(!open);
    // Optional: Re-fetch on open just in case
    if (!open) fetchNotifications();
  };

  const handleMarkAsRead = async (id: number) => {
      try {
          // Optimistic update
          setDbNotifications(prev => prev.filter(n => n.id !== id));
          await api.post(`/notifications/${id}/read`);
      } catch (e) {
          console.error("Failed to mark read");
      }
  }

  return (
    <nav className="top-0 bg-gray-100 border-b border-gray-300 shadow p-4">
      <div className="max-w-8xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Brand or Breadcrumbs */}
        </div>

        <div className="flex items-center gap-3">
          <button aria-label="Search" className="text-gray-900 hover:text-white hover:bg-gray-700 p-2 rounded-md hidden md:inline-flex" >
            <FaSearch />
          </button>
          
          <div className="relative" ref={dropdownRef}>
            <button aria-label="Notifications" onClick={toggleNotifications} className="relative p-2 rounded-md text-gray-900 hover:bg-gray-700">
              <FaBell />
              {/* Show count of DB notifications */}
              {dbNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {dbNotifications.length}
                </span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-96 bg-white border rounded shadow-lg z-50">
                <div className="p-3 border-b text-sm font-medium flex items-center justify-between">
                  <span>Notifications</span>
                  <button onClick={(e) => { e.stopPropagation(); fetchNotifications(); }} className="text-xs text-blue-600 hover:underline">
                    Refresh
                  </button>
                </div>
                
                <div className="max-h-72 overflow-auto">
                  {error && <div className="p-3 text-sm text-red-600">{error}</div>}

                  {dbNotifications.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">No new notifications</div>
                  ) : (
                    dbNotifications.map((n: any) => (
                      <div key={n.read_id || n.id} className="w-full text-left p-3 hover:bg-gray-50 border-b relative group">
                        
                        <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-gray-900">{n.message}</div>
                              <div className="text-xs text-gray-500 mt-1 capitalize">Type: {n.type}</div>
                            </div>
                            <div className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                                {new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>

                        {/* Mark as read button (appears on hover) */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n.id); }}
                            className="text-xs text-red-500 mt-2 hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            Mark as read
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;