import React from "react";
import { MdMenu } from "react-icons/md";
import { FaTimes } from "react-icons/fa";


interface Props {
collapsed: boolean;
setCollapsed: (v: boolean) => void;
isMobile: boolean;
isMobileOpen: boolean;
setMobileOpen: (v: boolean) => void;
}


const SidebarToggle: React.FC<Props> = ({ collapsed, setCollapsed, isMobile, isMobileOpen, setMobileOpen }) => {
if (isMobile) {
return (
<button title="setOpenMobile" onClick={() => setMobileOpen(false)} className="ml-auto p-1.5 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white sm:hidden">
<FaTimes className="w-6 h-6" />
</button>
);
}


return (
<button title="setCollapsed" onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1.5 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white hidden sm:block">
<MdMenu className={`w-6 h-6 transition-transform ${collapsed ? "rotate-180" : ""}`} />
</button>
);
};


export default React.memo(SidebarToggle);