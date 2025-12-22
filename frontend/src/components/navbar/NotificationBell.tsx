import React, { useRef, useState, useEffect, useMemo } from "react";
import { FaRegBell } from "react-icons/fa";
import { Loader2 } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion"; 
import { useNotifications } from "../../api/useNotifications";
import { type User } from "../../contexts/AuthContext";

interface Notification {
    id: number;
    message: string;
    type: string;
    created_at: string;
    user?: User;
}

interface Props {
    userId?: number;
    userRole?: string;
}

const NotificationBell: React.FC<Props> = ({ userId, userRole }) => {
    const { notifications, unreadCount, clear, loading, error, isClearing } = useNotifications(userId, userRole);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("click", onClick);
        return () => document.removeEventListener("click", onClick);
    }, []);

    const toggleOpen = () => {
        if (!loading && !isClearing) {
            setOpen((v) => !v);
        }
    };

    const DropdownContent = useMemo(() => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-sm text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2" />
                    <span>Loading...</span>
                </div>
            );
        }

        if (error) {
            return <div className="p-4 text-sm text-red-500 text-center font-medium">{error}</div>;
        }

        if (notifications.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-gray-400">
                    <FaRegBell className="w-8 h-8 mb-2 opacity-20" />
                    <span className="text-sm">No new notifications</span>
                </div>
            );
        }

        return (
            <div className="max-h-[22rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                {notifications.map((n) => {
                    const fullName = n.user?.name || n.user?.email || "Unknown";
                    const initials = fullName
                        .split(" ")
                        .map((x) => x[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2);

                    const avatarSrc = n.user?.avatar_url
                        ? n.user.avatar_url.startsWith("http")
                            ? n.user.avatar_url
                            : `http://localhost:8000/storage/${n.user.avatar_url}`
                        : `https://ui-avatars.com/api/?name=${initials}&background=e2e8f0&color=475569&bold=true`;

                    return (
                        <div
                            key={n.id}
                            className="flex items-start p-4 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/80 transition-all cursor-default"
                        >
                            {/* Avatar Section */}
                            <div className="relative flex-shrink-0 mr-3">
                                <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                                    <img 
                                        src={avatarSrc} 
                                        alt={fullName} 
                                        className="h-full w-full object-cover" 
                                        onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${initials}`)}
                                    />
                                </div>
                                {/* Small status dot based on type */}
                                <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${n.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'}`} />
                            </div>

                            {/* Text Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-[0.925rem] leading-[1.4] text-gray-700 font-normal">
                                    <span className="font-semibold text-gray-900 mr-1">{fullName}</span>
                                    {n.message}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                        {n.type}
                                    </span>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-[11px] text-gray-400">
                                        {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }, [loading, error, notifications]);

    return (
        <div ref={ref} className="relative inline-block text-left">
            <button
                onClick={toggleOpen}
                className={`relative p-2.5 rounded-full transition-all duration-200 ${
                    open ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
                } ${loading || isClearing ? 'cursor-not-allowed opacity-70' : ''}`}
                aria-label="Notifications"
                disabled={loading || isClearing}
            >
                {loading || isClearing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <FaRegBell className="w-5 h-5" />
                )}

                {unreadCount > 0 && !(loading || isClearing) && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 text-[10px] font-bold text-white items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-[350px] bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
                            <button 
                                onClick={clear}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 p-1 rounded transition-colors disabled:text-gray-400"
                                disabled={notifications.length === 0 || isClearing}
                            >
                                {isClearing ? "Clearing..." : "Mark all as read"}
                            </button>
                        </div>

                        {/* Content Area */}
                        {DropdownContent}
                        
                        {/* Footer */}
                        {notifications.length > 0 && !(loading || isClearing) && (
                            <div className="border-t border-gray-100">
                                <a 
                                    href="/notifications" 
                                    onClick={() => setOpen(false)} 
                                    className="block w-full py-2.5 text-center text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                                >
                                    See all notifications
                                </a>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;