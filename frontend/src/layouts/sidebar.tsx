// Sidebar

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const Sidebar: React.FC<SidebarProps> = ({ 
    isCollapsed, 
    setIsCollapsed, 
    expandedWidth, 
    collapsedWidth 
}) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
        const sidebarRef = useRef<HTMLElement | null>(null);
        const userButtonRef = useRef<HTMLButtonElement | null>(null);
        const [panelPos, setPanelPos] = useState<{ left: number; bottom: number }>({ left: 0, bottom: 0 });
  
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

    const toggleUserMenu = () => {
        setIsUserMenuOpen(prev => !prev);
    };

    // Position the modal panel next to the sidebar footer button
    useLayoutEffect(() => {
        if (!isUserMenuOpen) return;
        const placePanel = () => {
            const sidebarRect = sidebarRef.current?.getBoundingClientRect();
            const buttonRect = userButtonRef.current?.getBoundingClientRect();
            if (!sidebarRect || !buttonRect) return;
            const left = Math.round(sidebarRect.right + 8); // 8px gap from sidebar edge
            const bottom = Math.round(window.innerHeight - buttonRect.bottom);
            setPanelPos({ left, bottom });
        };
        placePanel();
        window.addEventListener('resize', placePanel);
        return () => window.removeEventListener('resize', placePanel);
    }, [isUserMenuOpen, isCollapsed]);

    // Close on Escape
    useEffect(() => {
        if (!isUserMenuOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsUserMenuOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isUserMenuOpen]);

    // 1. Container Width Logic
    const widthClass = isCollapsed ? collapsedWidth : expandedWidth;
    
    // 2. Shared Transition Logic (Matches Laravel Breeze ease-in-out)
    const sidebarTransition = "transition-[width] duration-300 ease-in-out";
    const textTransition = "transition-all duration-300 ease-in-out";

    // 3. Text Visibility Logic (Fade + Slide)
    // If collapsed: opacity 0, move left slightly (-translate-x-2), hidden overflow
    const textClass = isCollapsed 
        ? "opacity-0 -translate-x-10 overflow-hidden" 
        : "opacity-100 translate-x-0 w-auto";

    const navItems = [
        { to: "/", icon: FaHome, label: "Home" },
        { to: "/users", icon: FaUsers, label: "Users" },
        { to: "/announcements", icon: BsMegaphoneFill, label: "Announcements" },
        { to: "/courses", icon: FaBook, label: "Courses" },
        { to: "/register", icon: FaUserCircle, label: "Register" }
    ];

    return (
        <>
        <aside 
            ref={sidebarRef}
            className={`${widthClass} bg-gray-800 text-gray-200 border-r border-gray-700 flex flex-col flex-shrink-0 fixed h-screen z-50 ${sidebarTransition} overflow-hidden`}
        >
            {/* --- HEADER --- */}
            <div className="flex items-center h-16 px-4 border-b border-gray-700 bg-gray-900/50">
                {/* Icon Wrapper - Fixed width to prevent squishing */}
                <div className={`flex items-center justify-center  ${textTransition} ${textClass}`}>
                    <FaBook className="w-6 h-6 text-blue-500" />
                </div>

                {/* Text Wrapper */}
                <div className={`ml-3 font-bold text-xl text-blue-500 whitespace-nowrap ${textTransition} ${textClass}`}>
                    LMS
                </div>
                
                {/* Toggle Button - Absolute positioned to right or hidden logic based on preference, 
                    but keeping it inline for this layout */}
                <button
                    onClick={toggleCollapse}
                    className={`ml-auto p-1.5 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 ${isCollapsed ? 'absolute right-4' : ''}`}
                >
                     {/* The icon rotates 180 degrees when collapsed */}
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
                            title={isCollapsed ? item.label : ""} // Tooltip for accessibility when collapsed
                            className={`
                                flex items-center px-3 py-2.5 rounded-lg group relative
                                ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}
                                transition-colors duration-200
                            `}
                        >
                            {/* Icon - Fixed Minimum Width to anchor it */}
                            <div className={`flex-shrink-0 inline-flex items-center justify-center ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                <item.icon className="w-5 h-5" />
                            </div>

                            {/* Text - Animates opacity and position */}
                            <span className={`ml-3 whitespace-nowrap font-medium ${textTransition} ${textClass}`}>
                                {item.label}
                            </span>

                            {/* Optional: Tooltip bubble style (often seen in Laravel kits) logic could go here */}
                        </Link>
                    );
                })}
            </nav>
            
            {/* --- FOOTER (User Dropdown) --- */}
            <div className="p-4 border-t border-gray-700 bg-gray-900/50">
                <div className="flex flex-col gap-2">
                    {/* User Info (toggle dropdown) */}
                    <button
                        ref={userButtonRef}
                        onClick={toggleUserMenu}
                        className="flex items-center w-full px-3 py-2 text-left rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                        <div className="flex-shrink-0">
                            <FaUserCircle className="w-6 h-6" />
                        </div>
                        <div className={`ml-3 ${textTransition} ${textClass}`}>
                            <p className="text-sm font-medium text-white truncate">{user?.name ?? 'User'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.role ?? 'Guest'}</p>
                        </div>
                    </button>
                    {/* Modal rendered via portal, positioned beside the sidebar footer */}
                </div>
            </div>
        </aside>
        {isUserMenuOpen && createPortal(
            <>
                {/* Overlay to capture outside clicks */}
                <div
                    className="fixed inset-0 z-40 bg-black/0"
                    onClick={() => setIsUserMenuOpen(false)}
                    aria-hidden="true"
                />
                {/* Panel */}
                <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-64 max-w-[85vw] text-gray-200"
                    style={{ left: panelPos.left, bottom: panelPos.bottom }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-3 border-b border-gray-700">
                        <div className="flex items-center gap-3">
                            <FaUserCircle className="w-8 h-8 text-gray-300" />
                            <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">{user?.name ?? 'User'}</p>
                                <p className="text-xs text-gray-400 truncate">{user?.role ?? 'Guest'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-2 flex flex-col">
                        <Link
                            to="/account/update"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="px-3 py-2 rounded-md hover:bg-gray-700/70 transition-colors"
                        >
                            Account Details
                        </Link>
                        <button
                            type="button"
                            disabled
                            className="px-3 py-2 rounded-md text-gray-500 cursor-not-allowed bg-gray-800/70 mt-1 text-left"
                        >
                            Settings (soon)
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsUserMenuOpen(false); handleLogout(); }}
                            className="mt-2 flex items-center px-3 py-2 rounded-md text-red-400 hover:bg-gray-700/70 hover:text-red-300 transition-colors text-left"
                        >
                            <FaArrowRightFromBracket className="w-5 h-5" />
                            <span className="ml-2 font-medium">Logout</span>
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