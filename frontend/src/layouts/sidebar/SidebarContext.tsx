import React, { createContext, useContext, useState } from "react";


interface SidebarContextValue {
isCollapsed: boolean;
setIsCollapsed: (v: boolean) => void;
isMobileMenuOpen: boolean;
setIsMobileMenuOpen: (v: boolean) => void;
}


const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);


export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
const [isCollapsed, setIsCollapsed] = useState(false);
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


return (
<SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, isMobileMenuOpen, setIsMobileMenuOpen }}>
{children}
</SidebarContext.Provider>
);
};


export const useSidebar = () => {
const ctx = useContext(SidebarContext);
if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
return ctx;
};