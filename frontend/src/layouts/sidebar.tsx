import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaUsers, FaUserCircle, FaBook, FaTimes } from "react-icons/fa"; // Added FaTimes for close button
import { FaArrowRightFromBracket, FaPersonChalkboard } from "react-icons/fa6";
import { BsMegaphoneFill } from "react-icons/bs";
import { MdMenu } from "react-icons/md";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { toast } from 'react-toastify';

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
    expandedWidth: string; // sm:w-64
    collapsedWidth: string; // sm:w-[70px]
    // 🔥 NEW PROPS FOR RESPONSIVENESS
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Navigation Item Type
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
    isMobileMenuOpen, // 🔥 New Prop
    setIsMobileMenuOpen // 🔥 New Prop
}) => {
    const [showAlert, setShowAlert] = useState(true);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const sidebarRef = useRef<HTMLElement | null>(null);
    const userButtonRef = useRef<HTMLButtonElement | null>(null);
    const [panelPos, setPanelPos] = useState({ left: 0, bottom: 0 });

    // Close mobile menu when navigating
    useEffect(() => {
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    // --------------------------
    // 🔥 FIXED LOGOUT HANDLER
    // --------------------------
    const handleLogout = async () => {
        setIsLoggingOut(true);  // Start animation

        try {
            await logout(); // API call
        } catch (err) {
            console.error("Logout error:", err);
        }

        // Delay ensures animation is visible before redirect
        setTimeout(() => {
            setIsLoggingOut(false);
            setIsUserMenuOpen(false); // close dropdown AFTER animation
            navigate("/login");
        }, 600); // matches framer-motion animation duration
    };

    // Toggle sidebar size (Desktop only)
    const toggleCollapse = () => setIsCollapsed((prev) => !prev);

    // Toggle user dropdown
    const toggleUserMenu = () => setIsUserMenuOpen((prev) => !prev);

    // Reposition dropdown beside sidebar
    useLayoutEffect(() => {
        if (!isUserMenuOpen) return;

        const placePanel = () => {
            
            // 🔥 FIX: Check if refs are mounted before accessing .current
            const sidebarElement = sidebarRef.current;
            const buttonElement = userButtonRef.current;

            if (!sidebarElement || !buttonElement) return;

            // Only calculate position if sidebar is visible (desktop)
            const isDesktop = window.innerWidth >= 640;
            if (!isDesktop) {
                // Fallback for mobile (optional) or simply return if you don't need the panel on mobile
                // Since the mobile sidebar is full width, positioning relative to it is messy.
                // If you want the panel to be centered on mobile:
                // setPanelPos({ left: (window.innerWidth / 2) - 128, bottom: 20 });
                return;
            }

            const sidebarRect = sidebarElement.getBoundingClientRect();
            const buttonRect = buttonElement.getBoundingClientRect();
            
            const left = Math.round(sidebarRect.right + 8);
            const bottom = Math.round(window.innerHeight - buttonRect.bottom);

            setPanelPos({ left, bottom });
        };

        placePanel();
        window.addEventListener("resize", placePanel);

        return () => window.removeEventListener("resize", placePanel);
    }, [isUserMenuOpen, isCollapsed]);

    // Close dropdown on Escape
    useEffect(() => {
        if (!isUserMenuOpen) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsUserMenuOpen(false);
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isUserMenuOpen]);

    // Sidebar styling logic
    const widthClass = isCollapsed ? collapsedWidth : expandedWidth;
    const sidebarTransition = "transition-[width,transform] duration-300 ease-in-out";
    const textTransition = "transition-all duration-300 ease-in-out";
    
    // 🔥 ADJUSTED: Use responsive class for text visibility
    const textClass = isCollapsed 
        ? "opacity-0 sm:group-hover:opacity-100 -translate-x-10 sm:group-hover:translate-x-0 overflow-hidden" 
        : "opacity-100 translate-x-0 w-auto";

    // RBAC Navigation
    const allNavItems: NavItem[] = [
        { to: "/dashboard", icon: FaHome, label: "Dashboard", roles: ["admin", "instructor", "learner"] },
        { to: "/users", icon: FaUsers, label: "User Management", roles: ["admin"] },
        { to: "/instructor-applications", icon: FaPersonChalkboard, label: "Instructor Applications", roles: ["admin"] },
        { to: "/announcements", icon: BsMegaphoneFill, label: "Announcements", roles: ["admin", "instructor", "learner"] },
        { to: "/courses", icon: FaBook, label: "Courses/Community", roles: ["admin", "instructor", "learner"] }
    ];

    const navItems = allNavItems.filter((i) =>
        user?.role && i.roles.includes(user.role as any)
    );

    return (
        <>
            {/* 🔥 MOBILE OVERLAY */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/50 sm:hidden" 
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* 🔥 SIDEBAR CONTAINER - Adjusted for responsiveness */}
            <aside
                ref={sidebarRef}
                className={`
                    ${widthClass} 
                    bg-gray-800 text-gray-200 border-r border-gray-700 flex flex-col fixed h-screen z-50 
                    ${sidebarTransition}
                    // Mobile specific positioning and visibility
                    ${isMobileMenuOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'}
                    sm:w-auto sm:translate-x-0 // Desktop overrides
                    ${!isCollapsed ? 'sm:w-64' : 'sm:w-[70px]'} // Desktop width toggle
                `}
            >
                {/* Header */}
                <div className="flex items-center h-16 px-4 border-b border-gray-700 bg-gray-900/50">
                    <FaBook className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    <div className={`ml-3 font-bold text-xl text-blue-500 ${textTransition} ${textClass}`}>
                        LMS
                    </div>

                    {/* 🔥 DESKTOP Collapse Button */}
                    <button
                    title="collapse"
                        onClick={toggleCollapse}
                        className="ml-auto p-1.5 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white hidden sm:block" // Hidden on mobile
                    >
                        <MdMenu className={`w-6 h-6 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
                    </button>

                    {/* 🔥 MOBILE Close Button */}
                    <button
                        title="Close Menu"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="ml-auto p-1.5 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white sm:hidden" // Only shown on mobile
                    >
                        <FaTimes className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.to;

                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                // 🔥 ADDED 'group' for hover state when collapsed
                                className={`flex items-center px-3 py-2.5 rounded-lg transition-colors group relative ${
                                    isActive
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                                }`}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                <span className={`ml-3 font-medium ${textTransition} ${textClass} whitespace-nowrap`}>
                                    {item.label}
                                </span>
                                {/* 🔥 TOOLTIP/EXPANDED LABEL ON COLLAPSED HOVER */}
                                {isCollapsed && (
                                    <span className="absolute left-full ml-3 px-3 py-1 bg-gray-700 text-sm text-white rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 hidden sm:block">
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer User Button */}
                <div className="p-4 border-t border-gray-700 bg-gray-900/50">
                    <button
                        ref={userButtonRef}
                        onClick={toggleUserMenu}
                        className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-gray-700 hover:text-white group relative"
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
                        <div className={`ml-3 text-left ${textTransition} ${textClass}`}>
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

            {/* User Menu Portal */}
            {isUserMenuOpen &&
                createPortal(
                    <>
                        {/* Overlay - Z-index fixed for mobile/desktop overlap */}
                        <div
                            className="fixed inset-0 z-[49] bg-black/0" // Changed z-40 to z-[49]
                            onClick={() => !isLoggingOut && setIsUserMenuOpen(false)}
                        />

                        {/* Dropdown Panel - Z-index fixed for mobile/desktop overlap */}
                        <div
                            className="fixed z-[51] text-left items-center bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-64" // Changed z-50 to z-[51]
                            style={{ left: panelPos.left, bottom: panelPos.bottom }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-3 border-b border-gray-700">
                                <div className="flex items-center gap-3">
                                    {user?.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={`${user?.name ?? 'User'} avatar`}
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
                                    onClick={() => !isLoggingOut && setIsUserMenuOpen(false)}
                                    className="px-3 py-2 rounded-md hover:bg-gray-700/70 hover:text-white text-gray-300 "
                                >
                                    Account Details
                                </Link>

                                { showAlert && (
                                    <div className="mt-3 px-4 py-3 rounded-md bg-yellow-500/15 text-yellow-400 border hover:bg-yellow-500/30 border-yellow-500/30 flex items-center justify-between">
                                        <button
                                            onClick={() => toast.info('Settings not yet implemented')}
                                            className="text-yellow-400 hover:text-yellow-300"
                                        >
                                            Settings
                                        </button>
                                    </div>
                                )}
                                
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className={`mt-2 flex items-start justify-start px-3 py-2 rounded-md w-full transition-colors ${
                                        isLoggingOut
                                            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                            : "text-red-400 hover:bg-gray-700/70 hover:text-red-300"
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
                                                <span className="font-medium">Logging out...</span>
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
                                                <span className="font-medium">Logout</span>
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



//DO NOT USE THIS COMPONENT
//DECAPRICATED