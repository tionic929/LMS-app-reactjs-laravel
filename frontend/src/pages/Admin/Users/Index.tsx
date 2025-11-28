// UsersIndex.tsx

import React, { useState, useEffect, useCallback } from "react";
import { MdDeleteForever, MdEdit, MdRemoveRedEye } from "react-icons/md";
// NOTE: FaRegBan is not available, using FaBan for both states.
import { FaBan, FaCheckCircle, FaToggleOn, FaToggleOff, FaRegCheckCircle, FaUser, FaUsers, FaGraduationCap } from "react-icons/fa"; 
import { deleteUser, getAllUsers, toggleUserField, getUsersAnalytics, type User, type UserAnalytics } from "../../../api/users"; 
import AddUserModal from "../../../components/modals/AddUserModal";
import EditUserModal from "../../../components/modals/EditUserModal";
import ViewUserModal from "../../../components/modals/ViewUserModal";

// --- START: Helper Functions and Components ---

const roleLabel = (r: User["role"]) =>
    r === "instructor" ? "Instructor" : r === "learner" ? "Learner" : "Admin";

// Function to determine the user's primary status label and color
const getUserStatusLabel = (user: User) => {
    let label: string;
    let colorClass: string;

    if (user.is_banned_from_comments) {
        label = 'Banned'; // Most restrictive state
        colorClass = 'bg-red-100 text-red-700';
    } else if (user.is_enabled) {
        label = 'Active';
        colorClass = 'bg-green-100 text-green-700';
    } else {
        label = 'Disabled'; // Default state when not banned or active
        colorClass = 'bg-gray-100 text-gray-700';
    }
    return { label, colorClass };
};

// Helper component for Metric Cards (for the Analytics section)
interface MetricCardProps {
    icon: React.ElementType;
    title: string;
    value: string;
    color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex items-center justify-between">
        <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">{title}</span>
            <span className="text-3xl font-bold text-gray-900 mt-1">{value}</span>
        </div>
        {/* Use string manipulation to switch from background color class (bg-...) to text color class (text-...) */}
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
    </div>
);


// Helper function for button styling - FIX: Ensure icon color inherits
const ActionButton: React.FC<React.ComponentProps<'button'> & { icon: React.ElementType, isDanger?: boolean, title: string, className?: string }> = ({ 
    icon: Icon, 
    isDanger = false, 
    children, 
    className = "", // Allow custom className to be passed
    ...props 
}) => (
    <button
        {...props}
        className={`p-2 rounded-md transition disabled:opacity-50 flex items-center justify-center ${className}`} // Use passed className
        title={props.title}
    >
        {/* FIX: Use style={{ color: 'currentColor' }} to ensure the icon respects parent's text color */}
        <Icon className="w-5 h-5" style={{ color: 'currentColor' }} /> 
    </button>
);

// --- END: Helper Functions and Components ---

const UsersIndex: React.FC = () => {
    // --- State Management ---
    const [users, setUsers] = useState<User[]>([]);
    const [filter, setFilter] = useState<"all" | User["role"]>("all");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [userToView, setUserToView] = useState<User | null>(null);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const [analytics, setAnalytics] = useState<UserAnalytics>({
        totalUsers: 0,
        activeUsers: 0,
        unconfirmedInstructors: 0,
        bannedUsers: 0,
    });

    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const fetchAnalytics = useCallback(async () => {
        setAnalyticsLoading(true);
        try {
            const data = await getUsersAnalytics();
            setAnalytics(data);
        } catch (err) {
            console.error("Failed to fetch analytics", err);
        } finally {
            setAnalyticsLoading(false);
        }
    }, []);

    // --- Data Fetching and Handlers ---

    const fetchUsers = useCallback(async (p = 1, q = query, r = filter) => {
        setLoading(true);
        try {
            const data = await getAllUsers(p, q, r);
            setUsers(data.data);
            setPage(data.current_page);
            setLastPage(data.last_page);
        } catch (err) {
            console.error("Failed to fetch users", err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [query, filter]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const handleUserCreatedOrUpdated = useCallback(() => {
        fetchUsers(1, query, filter);
        fetchAnalytics();
    }, [fetchUsers, fetchAnalytics, query, filter]);
    
    const handleToggleStatus = useCallback(async (userId: number, field: keyof User) => {
        if (togglingId) return;

        setTogglingId(userId);
        try {
            await toggleUserField(userId, field); 
            setUsers(prev => prev.map(u => 
                u.id === userId ? { ...u, [field]: !u[field] } : u
            ));
            handleUserCreatedOrUpdated();
        } catch (err) {
            console.error(`Failed to toggle ${field} for user ${userId}`, err);
            alert(`Error updating user status.`);
            handleUserCreatedOrUpdated();
        } finally {
            setTogglingId(null);
            handleUserCreatedOrUpdated();
        }
    }, [togglingId, handleUserCreatedOrUpdated]);

    const handleViewClick = (user: User) => {
        setUserToView(user);
        setIsViewModalOpen(true);
    }

    const handleEditClick = (user: User) => {
        setUserToEdit(user);
        setIsEditModalOpen(true);
    }

    const handleDeleteClick = async (userId: number, userName: string) => {
        if (window.confirm(`Are you sure you want to delete user: ${userName}? This action cannot be undone.`)) {
            try {
                setLoading(true);
                await deleteUser(userId);
                handleUserCreatedOrUpdated();
            }
            catch (err) {
                console.error("Failed to delete the user: ", err);
                alert("Error deleting the user.");
            }
            finally {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchUsers(1, query, filter);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [query, filter, fetchUsers]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= lastPage) {
            fetchUsers(newPage, query, filter);
        }
    };

    const isActionDisabled = (userId: number) => loading || togglingId === userId;
    
    // --- START: Main Render ---
    return (
        <main className="h-full overflow-y-auto bg-gray-50">
            <div className="mx-auto py-8 px-4 sm:px-6 lg:px-8">

                {/* Header and Main Action */}
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="text-md text-gray-500 mt-1">Overview and control panel for all system users.</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        Add New User
                    </button>
                </header>
                <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    {analyticsLoading ? (
                        <div className="col-span-full text-center py-4 text-gray-500">Loading Analytics...</div>
                    ) : (
                        <>
                            <MetricCard 
                                icon={FaUsers} 
                                title="Total Users" 
                                value={analytics.totalUsers.toLocaleString()} 
                                color="bg-indigo-500"
                            />
                            
                            <MetricCard 
                                icon={FaUser} 
                                title="Active Accounts" 
                                value={analytics.activeUsers.toLocaleString()} 
                                color="bg-green-500"
                            />

                            <MetricCard 
                                icon={FaGraduationCap} 
                                title="Pending Instructors" 
                                value={analytics.unconfirmedInstructors.toLocaleString()} 
                                color="bg-yellow-500"
                            />

                            <MetricCard 
                                icon={FaBan} 
                                title="Banned Users"  
                                value={analytics.bannedUsers.toLocaleString()} 
                                color="bg-red-500"
                            />
                        </>
                    )}
                </section>

                {/* 2. Main Content: Search, Filters, and List */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    
                    {/* Filters and Search Bar */}
                    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold text-gray-900 flex-shrink-0">User List</h2>
                        <div className="flex-1 min-w-0 md:max-w-md">
                            <div className="relative">
                                <svg className="absolute top-1/2 left-3 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search name or email..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="flex rounded-lg bg-gray-100 p-1 space-x-1 shadow-inner flex-shrink-0">
                            {["all", "instructor", "learner", "admin"].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setFilter(r as "all" | User["role"])}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                        filter === r
                                            ? "bg-indigo-600 text-white shadow-md"
                                            : "text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    {r.charAt(0).toUpperCase() + r.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* User List Container */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        {loading ? (
                            <div className="text-center py-10 text-gray-500">
                                <svg className="animate-spin h-5 w-5 mr-3 inline-block text-indigo-500" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
                                Loading users...
                            </div>
                        ) : users.length > 0 ? (
                            users.map((user) => {
                                const status = getUserStatusLabel(user);
                                return (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100"
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            {/* User Avatar Initials */}
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm flex-shrink-0 ${
                                                user.role === "admin" ? "bg-purple-100 text-purple-700" :
                                                user.role === "instructor" ? "bg-green-100 text-green-700" :
                                                "bg-blue-100 text-blue-700"
                                            }`}>
                                                {user.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()}
                                            </div>

                                            {/* User Details & Status Hierarchy */}
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                                    {user.name}
                                                    
                                                    {/* Status Block */}
                                                    <div className="inline-flex items-center ml-3 space-x-2">
                                                        {/* 1. ROLE TAG (Always present) */}
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                                user.role === "instructor" ? "bg-green-100 text-green-800" :
                                                                user.role === "admin" ? "bg-purple-100 text-purple-800" :
                                                                "bg-blue-100 text-blue-800"
                                                            }`}
                                                        >
                                                            {roleLabel(user.role)}
                                                        </span>
                                                        
                                                        {/* 2. OPERATIONAL STATUS (Active/Disabled/Banned) */}
                                                        {user.role !== 'admin' && (
                                                            <span 
                                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${status.colorClass}`}
                                                            >
                                                                {status.label}
                                                            </span>
                                                        )}

                                                        {/* 3. CONFIRMATION STATUS (Instructors Only) */}
                                                        {user.role === 'instructor' && (
                                                            <span 
                                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${user.is_confirmed ? 'bg-indigo-100 text-indigo-700' : 'bg-yellow-100 text-yellow-700'}`}
                                                            >
                                                                {user.is_confirmed ? 'Confirmed' : 'Unconfirmed'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </h3>
                                                <p className="mt-1 text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                        </div>

                                        {/* Actions Button Group */}
                                        <div className="flex gap-1 ml-4 flex-shrink-0 border p-1 rounded-lg bg-gray-50">
                                            {/* 1. Account Enable/Disable (Instructor/Learner) */}
                                            {(user.role === 'instructor' || user.role === 'learner') && (
                                                <ActionButton
                                                    icon={user.is_enabled ? FaToggleOn : FaToggleOff}
                                                    onClick={() => handleToggleStatus(user.id, 'is_enabled')}
                                                    disabled={isActionDisabled(user.id)}
                                                    isDanger={!user.is_enabled}
                                                    title={user.is_enabled ? "Disable Account" : "Enable Account"}
                                                    className={`${user.is_enabled ? 'text-green-600 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'}`}
                                                />
                                            )}

                                            {/* 2. Instructor Account Confirmation */}
                                            {user.role === 'instructor' && (
                                                <ActionButton
                                                    icon={user.is_confirmed ? FaCheckCircle : FaRegCheckCircle} // FIX: Use FaRegCheckCircle for unconfirmed
                                                    onClick={() => handleToggleStatus(user.id, 'is_confirmed')}
                                                    disabled={isActionDisabled(user.id)}
                                                    title={user.is_confirmed ? "Unconfirm Instructor" : "Confirm Instructor"}
                                                    className={`${user.is_confirmed ? 'text-indigo-600 hover:bg-indigo-100' : 'text-yellow-600 hover:bg-yellow-100'}`}
                                                />
                                            )}

                                            {/* 3. Ban/Unban from Comments (Instructor/Learner) */}
                                            {(user.role === 'instructor' || user.role === 'learner') && (
                                                <ActionButton
                                                    icon={FaBan} // FIX: Use FaBan for both states as FaRegBan is unavailable
                                                    onClick={() => handleToggleStatus(user.id, 'is_banned_from_comments')}
                                                    disabled={isActionDisabled(user.id)}
                                                    // isDanger logic removed from ActionButton props, color handled by className
                                                    title={user.is_banned_from_comments ? "Unban Comments" : "Ban from Comments"}
                                                    // FIX: Ensures RED color when BANNED, GRAY when UNBANNED
                                                    className={`${user.is_banned_from_comments ? 'text-red-600 hover:bg-red-100' : 'text-gray-400 hover:bg-gray-100'}`}
                                                />
                                            )}
                                            
                                            {/* Standard View/Edit/Delete Actions */}
                                            <div className="w-px h-6 bg-gray-200 mx-1 self-center"></div> {/* Separator */}

                                            <ActionButton
                                                icon={MdRemoveRedEye}
                                                onClick={() => handleViewClick(user)}
                                                disabled={isActionDisabled(user.id)}
                                                title="View Details"
                                                className="text-indigo-600 hover:bg-indigo-100" // Default color provided in ActionButton helper
                                            />
                                            <ActionButton
                                                icon={MdEdit}
                                                onClick={() => handleEditClick(user)}
                                                disabled={isActionDisabled(user.id)}
                                                title="Edit User"
                                                className="text-indigo-600 hover:bg-indigo-100"
                                            />
                                            <ActionButton
                                                icon={MdDeleteForever}
                                                onClick={() => handleDeleteClick(user.id, user.name)}
                                                disabled={isActionDisabled(user.id)}
                                                isDanger={true}
                                                title="Delete User"
                                                className="text-red-600 hover:bg-red-100"
                                            />
                                        </div>
                                    </div>
                                ); // End User Map Return
                            }
                        )) : (
                            <div className="rounded-xl p-10 text-center text-gray-500">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M12 20.005v-2.348m0-12.72v-2.348m-5.464 12.378l1.638-1.638m9.252-9.252l-1.638 1.638m0 9.252l-1.638-1.638M4.354 12a4 4 0 115.292 0 4 4 0 01-5.292 0z"></path></svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Get started by adding a new user or adjusting your search filters.
                                </p>
                            </div>
                        )}
                    </div>
                    
                    {/* Pagination Controls */}
                    <div className="flex items-center justify-center gap-4 pt-6 mt-4 border-t border-gray-100">
                        <button
                            disabled={page <= 1 || loading}
                            onClick={() => handlePageChange(page - 1)}
                            className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">
                            Page <span className="font-semibold text-gray-900">{page}</span> of {lastPage}
                        </span>
                        <button
                            disabled={page >= lastPage || loading}
                            onClick={() => handlePageChange(page + 1)}
                            className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Next
                        </button>
                    </div>

                </div> {/* End Main Content Block */}
            </div>

            {/* Modals */}
            <AddUserModal show={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={handleUserCreatedOrUpdated} />
            <ViewUserModal show={isViewModalOpen} user={userToView} onClose={() => { setIsViewModalOpen(false); setUserToView(null); }} onSuccess={handleUserCreatedOrUpdated} />
            <EditUserModal show={isEditModalOpen} user={userToEdit} onClose={() => { setIsEditModalOpen(false); setUserToEdit(null); }} onSuccess={handleUserCreatedOrUpdated} />

        </main>
    );
};

export default UsersIndex;