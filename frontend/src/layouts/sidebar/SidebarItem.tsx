import React from "react";
import { Link, useLocation } from "react-router-dom";


interface Props {
to: string;
icon: React.ElementType;
label: string;
collapsed: boolean;
}


const SidebarItem: React.FC<Props> = ({ to, icon: Icon, label, collapsed }) => {
const location = useLocation();
const isActive = location.pathname === to;


return (
<Link
to={to}
className={`flex items-center px-3 py-2.5 rounded-lg transition-colors group relative ${
isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"
}`}
>
<Icon className="w-5 h-5 flex-shrink-0" />
<span
className={`ml-3 font-medium transition-all duration-300 ease-in-out ${
collapsed ? "opacity-0 -translate-x-6 w-0 overflow-hidden" : "opacity-100 translate-x-0 w-auto"
}`}
>
{label}
</span>


{/* tooltip on desktop when collapsed */}
{collapsed && (
<span className="absolute left-full ml-3 px-3 py-1 bg-gray-700 text-sm text-white rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 hidden sm:block">
{label}
</span>
)}
</Link>
);
};


export default React.memo(SidebarItem);