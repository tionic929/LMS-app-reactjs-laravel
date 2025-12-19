import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaUsers, FaUserCircle, FaBook, FaTimes } from "react-icons/fa";
import { FaArrowRightFromBracket, FaPersonChalkboard } from "react-icons/fa6";
import { BsMegaphoneFill } from "react-icons/bs";
import { MdMenu } from "react-icons/md";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from 'react-toastify';

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
    expandedWidth: string;   // sm:w-64
    collapsedWidth: string;  // sm:w-[70px]
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface NavItem {
    to: string;
    icon: React.ElementType;
    label: string;
    roles: ("admin" | "instructor" | "learner")[];
}

const Sidebar: React.FC<SidebarProps> = ({
    isCollapsed,
    setIsCollapsed,
    expandedWidth,
    collapsedWidth,
    isMobileMenuOpen,
    setIsMobileMenuOpen
}) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [panelPos, setPanelPos] = useState({ left: 0, bottom: 0 });

    const sidebarRef = useRef<HTMLElement | null>(null);
    const userButtonRef = useRef<HTMLButtonElement | null>(null);

    const allNavItems: NavItem[] = [
        { to: "/dashboard", icon: FaHome, label: "Dashboard", roles: ["admin", "instructor"] },
        { to: "/learner-dashboard", icon: FaUserCircle, label: "Dashboard", roles: ["learner"] },
        { to: "/users", icon: FaUsers, label: "User Management", roles: ["admin"] },
        { to: "/instructor-applications", icon: FaPersonChalkboard, label: "Instructor Applications", roles: ["admin"] },
        { to: "/announcements", icon: BsMegaphoneFill, label: "Announcements", roles: ["admin", "instructor", "learner"] },
        { to: "/courses", icon: FaBook, label: "Courses/Community", roles: ["admin", "instructor", "learner"] }
    ];

    const navItems = allNavItems.filter((i) => user?.role && i.roles.includes(user.role));

    // Close mobile menu on route change
    useEffect(() => {
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Logout with animation
    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } catch (e) {
            console.error(e);
        }
        setTimeout(() => {
            setIsLoggingOut(false);
            setIsUserMenuOpen(false);
            navigate("/login");
        }, 600);
    };

    const toggleUserMenu = () => setIsUserMenuOpen((v) => !v);

    // Position dropdown near sidebar
    useLayoutEffect(() => {
        if (!isUserMenuOpen) return;

        const place = () => {
            const sb = sidebarRef.current;
            const btn = userButtonRef.current;
            if (!sb || !btn) return;

            if (window.innerWidth < 640) return;

            const sbRect = sb.getBoundingClientRect();
            const btnRect = btn.getBoundingClientRect();

            setPanelPos({
                left: sbRect.right + 8,
                bottom: window.innerHeight - btnRect.bottom
            });
        };

        place();
        window.addEventListener("resize", place);
        return () => window.removeEventListener("resize", place);
    }, [isUserMenuOpen, isCollapsed]);

    // ESC to close dropdown
    useEffect(() => {
        if (!isUserMenuOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsUserMenuOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isUserMenuOpen]);

    // ----------------------------------
    // FIXED SIDEBAR WIDTH LOGIC (the bug)
    // ----------------------------------
    const sidebarClasses = `
        fixed left-0 top-0 h-screen z-50 flex flex-col
        bg-gray-800 text-gray-200 border-r border-gray-700
        overflow-hidden transition-[width,transform] duration-300 ease-in-out

        /* ---- MOBILE ---- */
        ${isMobileMenuOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full"}

        /* ---- DESKTOP ---- */
         sm:flex sm:translate-x-0
        ${isCollapsed ? collapsedWidth : expandedWidth}
    `;

    const textTransition = "transition-all duration-300 ease-in-out";

    const textClass = isCollapsed
        ? "opacity-0 -translate-x-10 overflow-hidden sm:group-hover:opacity-100 sm:group-hover:translate-x-0"
        : "opacity-100 translate-x-0";

    return (
        <>
            {/* Mobile overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 sm:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside ref={sidebarRef} className={sidebarClasses}>
                {/* Header */}
                <div className="flex items-center h-16 px-4 border-b border-gray-700 bg-gray-900/50">
                    <FaBook className="w-6 h-6 text-blue-500" />
                    <div className={`font-bold text-xl text-blue-500 transition-all ${textClass}`}>
                        <span className="px-3">LMS</span>
                    </div>

                    {/* Desktop collapse */}
                    <button
                        title="desktopCollapse"
                        onClick={() => setIsCollapsed((v) => !v)}
                        className="ml-auto p-1.5 rounded-md hover:bg-gray-700 hidden sm:block"
                    >
                        <MdMenu className={`w-6 h-6 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
                    </button>

                    {/* Mobile close */}
                    <button
                        title="mobileOpenMenu"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="ml-auto p-1.5 rounded-md hover:bg-gray-700 sm:hidden"
                    >
                        <FaTimes className="w-6 h-6" />
                    </button>
                </div>

                {/* NAVIGATION */}
                <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto overflow-hidden">
                    {navItems.map((item) => {
                        const active = location.pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`group flex items-center px-3 py-2.5 rounded-lg transition-colors relative ${
                                    active
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                                }`}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                <span className={`ml-3 font-medium whitespace-nowrap transition-all ${textClass}`}>
                                    {item.label}
                                </span>

                                {/* tooltip when collapsed */}
                                {isCollapsed && (
                                    <span className="absolute left-full ml-3 px-3 py-1 bg-gray-700 text-sm text-white rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 hidden sm:block">
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* USER BUTTON */}
                <div className="p-4 border-t border-gray-700 bg-gray-900/50">
                    <button
                        ref={userButtonRef}
                        onClick={toggleUserMenu}
                        className="group flex items-center w-full px-3 py-2 rounded-lg hover:bg-gray-700 hover:text-white group relative"
                    >
                        {user?.avatar_url ? (
                            <img
                                src={user.avatar_url}
                                alt={`${user?.name ?? 'User'} avatar`}
                                className="h-6 w-6 rounded-full object-cover flex-shrink-0 ring-2 ring-indigo-100"
                            />
                        ) : (
                            <FaUserCircle className="w-6 h-6 flex-shrink-0" />
                        )}
                        <div className={`ml-2 text-left ${textTransition} ${textClass}`}>
                            <p className="text-sm font-medium truncate">{user?.name ?? "User"}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.role ?? "Guest"}</p>
                        </div>
                        {/* 🔥 TOOLTIP on Footer User Button when collapsed */}
                        {isCollapsed && (
                            <span className="absolute left-full ml-3 px-3 py-1 bg-gray-700 text-sm text-white rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 hidden sm:block">
                                {user?.name ?? "User"} ({user?.role ?? "Guest"})
                            </span>
                        )}
                    </button>
                </div>
            </aside>

            {/* USER DROPDOWN */}
            {isUserMenuOpen &&
                createPortal(
                    <>
                        <div
                            className="fixed inset-0 z-[49] bg-black/0"
                            onClick={() => !isLoggingOut && setIsUserMenuOpen(false)}
                        />

                        <div
                            className="fixed z-[51] bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-64"
                            style={{ left: panelPos.left, bottom: panelPos.bottom }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-3 border-b border-gray-700">
                                <div className="flex items-center gap-3">
                                    {user?.avatar_url ? (
                                        <img
                                            title="userAvatar"
                                            src={user.avatar_url}
                                            className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-200"
                                        />
                                    ) : (
                                        <FaUserCircle className="w-8 h-8 text-gray-300" />
                                    )}
                                    <div>
                                        <p className="text-sm font-semibold text-gray-300 truncate">{user?.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{user?.role}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-2 flex flex-col">
                                <Link
                                    to="/account/update"
                                    onClick={() => setIsUserMenuOpen(false)}
                                    className="px-3 py-2 rounded-md hover:bg-gray-700/70 text-gray-300"
                                >
                                    Account Details
                                </Link>

                                <button
                                    onClick={() => toast.info('Settings not implemented')}
                                    className="mt-3 px-4 py-3 rounded-md bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
                                >
                                    Settings
                                </button>

                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className={`mt-2 flex items-start justify-start px-3 py-2 rounded-md w-full ${
                                        isLoggingOut
                                            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                            : "text-red-400 hover:bg-gray-700/70"
                                    }`}
                                >
                                    <AnimatePresence mode="wait">
                                        {isLoggingOut ? (
                                            <motion.div
                                                key="logging-out"
                                                className="flex items-center space-x-2"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ duration: 0.25 }}
                                            >
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{
                                                        repeat: Infinity,
                                                        ease: "linear",
                                                        duration: 1
                                                    }}
                                                >
                                                    <Loader2 className="w-5 h-5 text-white" />
                                                </motion.div>
                                                <span>Logging out...</span>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="logout"
                                                className="flex items-center space-x-2"
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <FaArrowRightFromBracket className="w-5 h-5" />
                                                <span>Logout</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </div>
                        </div>
                    </>,
                    document.body
                )}
        </>
    );
};

export default Sidebar;
