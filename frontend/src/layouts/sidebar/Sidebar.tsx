import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaUserCircle, FaTimes } from "react-icons/fa";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import { MdMenu, MdKeyboardArrowRight } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";

import { useAuth, type User } from "../../contexts/AuthContext";

// --- START: NEW CONFIG IMPORTS ---
import { type NavItem, type UserRole, getNavItemsForRole } from "./sidebar-config"; 
// --- END: NEW CONFIG IMPORTS ---

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
    expandedWidth: string;   // sm:w-64
    collapsedWidth: string;  // sm:w-[70px]
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const COLLAPSE_KEY = "sidebar_is_collapsed";
const SUBMENU_KEY = "sidebar_open_submenus";

const ChildContainer: React.FC<{
    isOpen: boolean;
    children: React.ReactNode;
}> = ({ isOpen, children }) => {
    const containerClasses = `
        overflow-hidden mt-1 space-y-1 transition-[max-height,opacity] duration-300 ease-in-out
        ${isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"} 
    `;
    
    return (
        <div className={containerClasses}>
            {children}
        </div>
    );
};

const Sidebar: React.FC<SidebarProps> = ({
    isCollapsed,
    setIsCollapsed,
    expandedWidth,
    collapsedWidth,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
}) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [panelPos, setPanelPos] = useState({ left: 0, bottom: 0 });

    const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>(() => {
        try {
            const stored = localStorage.getItem(SUBMENU_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            console.error("Could not read submenus from localStorage:", e);
            return {};
        }
    });

    const sidebarRef = useRef<HTMLElement | null>(null);
    const userButtonRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        localStorage.setItem(SUBMENU_KEY, JSON.stringify(openSubMenus));
    }, [openSubMenus]);

    useEffect(() => {
        localStorage.setItem(COLLAPSE_KEY, JSON.stringify(isCollapsed));
    }, [isCollapsed]);
    
    useLayoutEffect(() => {
        try {
            const storedCollapsed = localStorage.getItem(COLLAPSE_KEY);
            if (storedCollapsed !== null) {
                setIsCollapsed(JSON.parse(storedCollapsed));
            }
        } catch (e) {
            console.error("Could not read collapse state from localStorage:", e);
        }
    }, []);

    const toggleSubMenu = (label: string) => {
        setOpenSubMenus(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };

    useEffect(() => {
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
    }, [location.pathname]);
    
    useEffect(() => {
        const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 640;
        if (isCollapsed && isDesktop) {
            setOpenSubMenus({});
        }
    }, [isCollapsed]);

    const navItems = getNavItemsForRole(user?.role);

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

    useEffect(() => {
        if (!isUserMenuOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsUserMenuOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isUserMenuOpen]);

    const sidebarClasses = `
        fixed left-0 top-0 h-screen z-50 flex flex-col
        bg-white text-gray-800 border-r border-gray-200
        overflow-hidden transition-[width,transform] duration-300 ease-in-out

        /* ---- MOBILE ---- */
        ${isMobileMenuOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full"}

        /* ---- DESKTOP ---- */
        sm:flex sm:translate-x-0
        ${isCollapsed ? collapsedWidth : expandedWidth}
    `;

    const textClasses = isCollapsed 
        ? "opacity-0 w-0 -translate-x-2" 
        : "opacity-100 w-auto translate-x-0"; 
        
    const textTransition = "transition-all duration-300 ease-in-out";

    const NavItemComponent: React.FC<{ item: NavItem, level?: number }> = ({ item, level = 0 }) => {
        const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 640;
        const itemTo = item.to ?? "";
        const isParent = item.children && item.children.length > 0; 
        
        const isActive = itemTo ? location.pathname === itemTo : false || (isParent && item.children?.some(c => location.pathname.includes(c.to!)));
        const isOpen = openSubMenus[item.label] && !isCollapsed; 

        const groupPaddingClass = level === 0 ? 'pl-3' : `pl-${level * 3 + 3}`;

        const itemClasses = `
            flex items-center w-full ${groupPaddingClass} py-2.5 px-5 rounded-lg transition-colors relative group
            ${isActive
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
            }
            ${level > 0 ? "text-sm" : "font-medium"}
        `;

        const renderContent = (
            <>
                <item.icon className="w-5 h-5 flex-shrink-0" />
                
                <span
                    className={`whitespace-nowrap ml-3 overflow-hidden ${textTransition} ${textClasses}`}
                >
                    {item.label}
                </span>
                
                {isParent && (
                    <MdKeyboardArrowRight 
                        className={`ml-auto mr-1 transition-transform duration-300 flex-shrink-0
                            ${isCollapsed ? 'opacity-0 hidden sm:block' : 'opacity-100'}
                            ${isOpen ? 'rotate-90' : 'rotate-0'}
                        `}
                    />
                )}
                
                {isCollapsed && level === 0 && isDesktop && (
                    <span className="absolute left-full ml-3 px-3 py-1 bg-gray-800 text-sm text-white rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap z-50">
                        {item.label}
                    </span>
                )}
            </>
        );

        if (isParent) {
            const handleClick = () => {
                if (isCollapsed && isDesktop) {
                    setIsCollapsed(false);
                } else {
                    toggleSubMenu(item.label);
                }
            };
            
            return (
                <div key={item.label} className="w-full">
                    <button
                        onClick={handleClick}
                        className={`text-left ${itemClasses}`}
                    >
                        {renderContent}
                    </button>
                    
                    <ChildContainer isOpen={isOpen}>
                        {item.children?.map((child) => (
                            <NavItemComponent key={child.label} item={child} level={level + 1} />
                        ))}
                    </ChildContainer>
                </div>
            );
        }

        return (
            <Link key={item.to} to={itemTo} className={itemClasses}>
                {renderContent}
            </Link>
        );
    };

    return (
        <>
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/30 sm:hidden transition-opacity duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <aside ref={sidebarRef} className={sidebarClasses}>
                <div className="flex items-center h-16 px-4 border-b border-gray-200 bg-white">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-6 h-6 text-blue-600 fill-current">
                        <path d="M480 32C480 14.33 465.7 0 448 0H192c-17.67 0-32 14.33-32 32v128h160c17.67 0 32 14.33 32 32v128H480c17.67 0 32 14.33 32 32v96C512 497.7 497.7 512 480 512H32C14.33 512 0 497.7 0 480V32C0 14.33 14.33 0 32 0h128v192c0 17.67-14.33 32-32 32H32v224h448V288c0-17.67-14.33-32-32-32H160V32h288v96H192V32h288V480H32V256h128c17.67 0 32-14.33 32-32V32zM32 480c0 8.837 7.163 16 16 16h432c8.837 0 16-7.163 16-16v-96H32v96z"/>
                    </svg>

                    <div 
                        className={`font-bold text-xl text-blue-600 ${textTransition} overflow-hidden whitespace-nowrap ${textClasses}`}
                    >
                        <span className="px-3">LMS</span>
                    </div>

                    <button
                        title="desktopCollapse"
                        onClick={() => setIsCollapsed((v) => !v)}
                        className="ml-auto p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hidden sm:block"
                    >
                        <MdMenu className={`w-6 h-6 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
                    </button>

                    <button
                        title="mobileOpenMenu"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="ml-auto p-1.5 rounded-md hover:bg-gray-100 text-gray-500 sm:hidden"
                    >
                        <FaTimes className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto overflow-hidden">
                    {navItems.map((item) => (
                        <NavItemComponent key={item.label} item={item} />
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <button
                        ref={userButtonRef}
                        onClick={toggleUserMenu}
                        className="group flex items-center w-full px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors relative"
                    >
                        {user?.avatar_url ? (
                            <img
                                src={user.avatar_url}
                                alt={`${user?.name ?? 'User'} avatar`}
                                className="h-6 w-6 rounded-full object-cover flex-shrink-0 ring-2 ring-blue-100"
                            />
                        ) : (
                            <FaUserCircle className="w-6 h-6 flex-shrink-0 text-gray-400" />
                        )}
                        <div 
                            className={`ml-2 text-left ${textTransition} overflow-hidden whitespace-nowrap ${textClasses}`}
                        >
                            <p className="text-sm font-medium text-gray-700 truncate">{user?.name ?? "User"}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.role ?? "Guest"}</p>
                        </div>
                        {isCollapsed && (
                            <span className="absolute left-full ml-3 px-3 py-1 bg-gray-800 text-sm text-white rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 hidden sm:block whitespace-nowrap z-50">
                                {user?.name ?? "User"} ({user?.role ?? "Guest"})
                            </span>
                        )}
                    </button>
                </div>
            </aside>

            {isUserMenuOpen &&
                createPortal(
                    <>
                        <div
                            className="fixed inset-0 z-[49] bg-black/0"
                            onClick={() => !isLoggingOut && setIsUserMenuOpen(false)}
                        />

                        <div 
                            className={`fixed z-[51] bg-white border border-gray-200 rounded-lg shadow-2xl w-64 origin-bottom-left transition-opacity duration-150
                                ${isUserMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                            `}
                            style={{ left: panelPos.left, bottom: panelPos.bottom }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-3 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    {user?.avatar_url ? (
                                        <img
                                            title="userAvatar"
                                            src={user.avatar_url}
                                            className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-100"
                                            alt="User"
                                        />
                                    ) : (
                                        <FaUserCircle className="w-8 h-8 text-gray-400" />
                                    )}
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user?.role}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-2 flex flex-col">
                                <Link
                                    to="/account/update"
                                    onClick={() => setIsUserMenuOpen(false)}
                                    className="px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700"
                                >
                                    Account Details
                                </Link>

                                <button
                                    onClick={() => alert("Settings not implemented")}
                                    className="mt-3 px-4 py-3 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200"
                                >
                                    Settings
                                </button>

                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className={`mt-2 flex items-start justify-start px-3 py-2 rounded-md w-full transition-colors duration-200 ${
                                        isLoggingOut
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "text-red-600 hover:bg-red-50"
                                    }`}
                                >
                                    {isLoggingOut ? (
                                        <div className="flex items-center space-x-2">
                                            <FaSpinner className="w-5 h-5 text-blue-600 animate-spin" />
                                            <span>Logging out...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <FaArrowRightFromBracket className="w-5 h-5" />
                                            <span>Logout</span>
                                        </div>
                                    )}
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