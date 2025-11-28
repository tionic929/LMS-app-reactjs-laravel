import React, { useState, useRef, useEffect } from 'react'
import { FaBell, FaSearch } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  // logout is available via `logout` from useAuth if needed elsewhere

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const toggleNotifications = async () => {
    const next = !open;
    setOpen(next);

    if (next) {
      try {
        setError(null);
        const res = await api.get('/announcements/admin');
        // debug
        // eslint-disable-next-line no-console
        console.debug('announcements/admin response', res.status, res.data);
        setNotifications(res.data || []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load notifications', err);
        setNotifications([]);
        if (err && (err as any).response) {
          setError(`Failed to load notifications: ${(err as any).response.status} ${(err as any).response.statusText}`);
        } else {
          setError('Failed to load notifications');
        }
      }
    }
  };

  return (
    <nav className="top-0 bg-gray-100 border-b border-gray-300 shadow p-4">
      <div className="max-w-8xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* <div className="text-lg font-semibold border-b border-gray-900">
            <FaBreadSlice />
          </div> */}
        </div>

        <div className="flex items-center gap-3">
          <button aria-label="Search" className="text-gray-900 hover:text-white hover:bg-gray-700 p-2 rounded-md hidden md:inline-flex" >
            <FaSearch />
          </button>
          <div className="relative" ref={dropdownRef}>
            <button aria-label="Notifications" onClick={toggleNotifications} className="relative p-2 rounded-md text-gray-900 hover:bg-gray-700">
              <FaBell />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">{notifications.length}</span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-96 bg-white border rounded shadow-lg z-50">
                <div className="p-3 border-b text-sm font-medium flex items-center justify-between">
                  <span>Admin Announcements</span>
                  <button onClick={async (e) => { e.stopPropagation(); setNotifications([]); setError(null); try { const res = await api.get('/announcements/admin'); setNotifications(res.data || []); } catch (err) { console.error(err); setError('Failed to refresh'); } }} className="text-xs text-blue-600 hover:underline">Refresh</button>
                </div>
                <div className="max-h-72 overflow-auto">
                  {error && <div className="p-3 text-sm text-red-600">{error}</div>}

                  {notifications.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">No notifications</div>
                  ) : (
                    notifications.map((n: any) => (
                      <div key={n.id} className="w-full text-left p-3 hover:bg-gray-50 border-b">
                        <button
                          className="w-full text-left"
                          onClick={() => {
                            if (user?.role === 'admin') {
                              window.location.href = '/announcements';
                            } else {
                              // show content inline for non-admins
                              alert(n.title + '\n\n' + (n.content ?? ''));
                            }
                          }}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-gray-900">{n.title}</div>
                              <div className="text-xs text-gray-600 mt-1">{(n.content || '').slice(0, 120)}{(n.content || '').length > 120 ? '...' : ''}</div>
                            </div>
                            <div className="text-xs text-gray-400 ml-2">{new Date(n.created_at || n.updated_at || Date.now()).toLocaleString()}</div>
                          </div>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 p-3 rounded-md hover:bg-gray-700">
              <FaUserCircle className="w-6 h-6" />
              <span className="hidden sm:inline">{user?.name ?? 'Account'}{user?.role ?? 'Role Not Found'}</span>
            </button>

            <button onClick={handleLogout} className="ml-2 px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white">
              Logout
            </button>
          </div> */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
