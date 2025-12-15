import React, { useRef, useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import { useNotifications } from "../../api/useNotifications";

interface Props {
  userId?: number;
  userRole?: string;
}

const NotificationBell: React.FC<Props> = ({ userId, userRole }) => {
  const { notifications, unreadCount, clear } = useNotifications(userId, userRole);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-md hover:bg-gray-700"
        aria-label="Notifications"
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between p-3 border-b text-sm font-medium">
            Notifications
            <button onClick={clear} className="text-xs text-blue-600 hover:underline">
              Clear
            </button>
          </div>

          <div className="max-h-72 overflow-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No notifications</div>
            ) : (
              notifications.map((n, i) => (
                <div key={i} className="p-3 border-b text-sm">
                  <div className="font-medium text-gray-800">{n.message}</div>
                  <div className="text-xs text-gray-500 capitalize">{n.type}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
