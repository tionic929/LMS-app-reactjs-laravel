import { useEffect, useLayoutEffect, useState } from "react";
const useSidebarPersistence = (isCollapsed: boolean, openSubMenus: Record<string, boolean>, setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>) => {
    // Initialize Collapse state from localStorage
    useLayoutEffect(() => {
        try {
            const storedCollapsed = localStorage.getItem("sidebar_is_collapsed");
            if (storedCollapsed !== null) {
                setIsCollapsed(JSON.parse(storedCollapsed));
            }
        } catch (e) {
            console.error("Could not read collapse state:", e);
        }
    }, [setIsCollapsed]);

    // Persist Collapse state
    useEffect(() => {
        localStorage.setItem("sidebar_is_collapsed", JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    // Persist Submenu state
    useEffect(() => {
        localStorage.setItem("sidebar_open_submenus", JSON.stringify(openSubMenus));
    }, [openSubMenus]);
};

const useMenuClosureEffects = (location: any, isMobileMenuOpen: boolean, setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>, isCollapsed: boolean, setOpenSubMenus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>) => {
    // Close mobile menu and user menu on route change
    useEffect(() => {
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
        // We'll handle user menu closure inside the main component to keep its state local
    }, [location.pathname]);
    
    // Close all submenus when sidebar collapses on desktop
    useEffect(() => {
        if (isCollapsed) {
            setOpenSubMenus({});
        }
    }, [isCollapsed]);
};

const useUserMenuPosition = (isUserMenuOpen: boolean, isCollapsed: boolean, sidebarRef: React.RefObject<HTMLElement>, userButtonRef: React.RefObject<HTMLButtonElement>, setPanelPos: React.Dispatch<React.SetStateAction<{ left: number, bottom: number }>>) => {
    useLayoutEffect(() => {
        if (!isUserMenuOpen) return;

        const place = () => {
            const sb = sidebarRef.current;
            const btn = userButtonRef.current;
            if (!sb || !btn || window.innerWidth < 640) return;

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
            if (e.key === "Escape") setPanelPos(prev => ({ ...prev, isUserMenuOpen: false }));
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isUserMenuOpen]);
};