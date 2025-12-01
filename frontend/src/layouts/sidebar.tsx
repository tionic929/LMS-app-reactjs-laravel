// Sidebar.jsx

import React from "react";
import { FaHome, FaUsers, FaUserCircle, FaBook } from "react-icons/fa";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import { BsMegaphoneFill } from "react-icons/bs";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { MdMenu } from 'react-icons/md';

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
    expandedWidth: string; // e.g., "w-64"
    collapsedWidth: string; // e.g., "w-20"
}

// Define the structure for a navigation item
interface NavItem {
    to: string;
    icon: React.ElementType;
    label: string;
    // Define which roles can see this link
    roles: ('admin' | 'instructor' | 'learner')[]; 
}

const Sidebar: React.FC<SidebarProps> = ({ 
    isCollapsed, 
    setIsCollapsed, 
    expandedWidth, 
    collapsedWidth 
}) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    
    const handleLogout = async () => {
      try {
        await logout();
      } catch (err) {
        console.error('Logout failed', err);
      }
    };
    
    const toggleCollapse = () => {
        setIsCollapsed(prev => !prev);
    };

    // 1. Container Width Logic
    const widthClass = isCollapsed ? collapsedWidth : expandedWidth;
    
    // 2. Shared Transition Logic
    const sidebarTransition = "transition-[width] duration-300 ease-in-out";
    const textTransition = "transition-all duration-300 ease-in-out";

    // 3. Text Visibility Logic
    const textClass = isCollapsed 
        ? "opacity-0 -translate-x-10 overflow-hidden" 
        : "opacity-100 translate-x-0 w-auto";

    // --- RBAC: Define ALL Navigation Items ---
    const allNavItems: NavItem[] = [
        { 
            to: "/", 
            icon: FaHome, 
            label: "Dashboard", 
            roles: ['admin', 'instructor', 'learner'] 
        },
        { 
            to: "/users", 
            icon: FaUsers, 
            label: "User Management", 
            roles: ['admin'] // Only Admin can manage users
        },
        { 
            to: "/announcements", 
            icon: BsMegaphoneFill, 
            label: "Announcements", 
            roles: ['admin', 'instructor', 'learner'] 
        },
        { 
            to: "/courses", 
            icon: FaBook, 
            label: "Courses/Community", 
            roles: ['admin', 'instructor', 'learner'] 
        },
        // Removed the '/register' link as it's typically pre-auth or part of Admin user management
    ];

    // --- RBAC: Filter Navigation Items based on the authenticated user's role ---
    const navItems = allNavItems.filter(item => 
        user?.role && item.roles.includes(user.role as ('admin' | 'instructor' | 'learner'))
    );


    return (
        <aside 
            className={`${widthClass} bg-gray-800 text-gray-200 border-r border-gray-700 flex flex-col flex-shrink-0 fixed h-screen z-50 ${sidebarTransition} overflow-hidden`}
        >
            {/* --- HEADER --- */}
            <div className="flex items-center h-16 px-4 border-b border-gray-700 bg-gray-900/50">
                <div className={`flex items-center justify-center  ${textTransition} ${textClass}`}>
                    <FaBook className="w-6 h-6 text-blue-500" />
                </div>
                <div className={`ml-3 font-bold text-xl text-blue-500 whitespace-nowrap ${textTransition} ${textClass}`}>
                    LMS
                </div>
                <button
                    title="collapse"
                    onClick={toggleCollapse}
                    className={`ml-auto p-1.5 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 ${isCollapsed ? 'absolute right-4' : ''}`}
                >
                    <MdMenu className={`w-6 h-6 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                </button>
            </div>
            
            {/* --- NAVIGATION --- */}
            <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-hidden overflow-x-hidden">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.to;
                    
                    return (
                        <Link 
                            key={item.to} 
                            to={item.to}
                            title={isCollapsed ? item.label : ""}
                            className={`
                                flex items-center px-3 py-2.5 rounded-lg group relative
                                ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}
                                transition-colors duration-200
                            `}
                        >
                            <div className={`flex-shrink-0 inline-flex items-center justify-center ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className={`ml-3 whitespace-nowrap font-medium ${textTransition} ${textClass}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
            
            {/* --- FOOTER (User/Logout) --- */}
            <div className="p-4 border-t border-gray-700 bg-gray-900/50">
                <div className="flex flex-col gap-1">
                    
                    {/* User Info */}
                    <div className="flex items-center px-3 py-2 rounded-lg text-gray-300">
                        <div className="flex-shrink-0">
                            <FaUserCircle className="w-6 h-6" />
                        </div>
                        <div className={`ml-3 ${textTransition} ${textClass}`}>
                            <p className="text-sm font-medium text-white truncate">{user?.name ?? 'User'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Guest'}</p>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button 
                        onClick={handleLogout} 
                        className="flex items-center w-full px-3 py-2 text-left rounded-lg text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                    >
                        <div className="flex-shrink-0">
                            <FaArrowRightFromBracket className="w-5 h-5" />
                        </div>
                        <span className={`ml-3 font-medium whitespace-nowrap ${textTransition} ${textClass}`}>
                            Logout
                        </span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;