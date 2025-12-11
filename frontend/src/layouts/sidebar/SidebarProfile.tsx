import React from "react";
import { FaUserCircle } from "react-icons/fa";


interface Props {
user: any;
collapsed: boolean;
onToggleMenu: () => void;
buttonRef: React.RefObject<HTMLButtonElement>;
}


const SidebarProfile: React.FC<Props> = ({ user, collapsed, onToggleMenu, buttonRef }) => {
return (
<div className="p-4 border-t border-gray-700 bg-gray-900/50">
<button
ref={buttonRef}
onClick={onToggleMenu}
className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-gray-700 hover:text-white group relative"
type="button"
>
{user?.avatar_url ? (
<img src={user.avatar_url} alt={`${user?.name ?? 'User'} avatar`} className="h-6 w-6 rounded-full object-cover flex-shrink-0 ring-2 ring-indigo-100" />
) : (
<FaUserCircle className="w-6 h-6 flex-shrink-0" />
)}


<div className={`ml-3 text-left transition-all duration-300 ${collapsed ? "opacity-0 -translate-x-6 w-0 overflow-hidden" : "opacity-100 translate-x-0 w-auto"}`}>
<p className="text-sm font-medium truncate">{user?.name ?? "User"}</p>
<p className="text-xs text-gray-500 truncate">{user?.role ?? "Guest"}</p>
</div>


{collapsed && (
<span className="absolute left-full ml-3 px-3 py-1 bg-gray-700 text-sm text-white rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 hidden sm:block">
{user?.name ?? "User"} ({user?.role ?? "Guest"})
</span>
)}
</button>
</div>
);
};


export default React.memo(SidebarProfile);