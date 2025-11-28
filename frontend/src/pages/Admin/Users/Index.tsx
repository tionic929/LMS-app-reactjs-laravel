import React, { useState, useEffect } from "react";
import { MdDeleteForever, MdEdit, MdRemoveRedEye  } from "react-icons/md";
import { deleteUser, getAllUsers, type User } from "../../../api/users"; 
import AddUserModal from "../../../components/modals/AddUserModal";
import EditUserModal from "../../../components/modals/EditUserModal";
import ViewUserModal from "../../../components/modals/ViewUserModal";

const roleLabel = (r: User["role"]) =>
  r === "instructor" ? "Instructor" : r === "learner" ? "Learner" : "Admin";

const UsersIndex: React.FC = () => {
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

  const fetchUsers = async (p = 1, q = query, r = filter) => {
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
  };

  const handleUserCreatedOrUpdated = () => {
    // After C/U/D, refresh the list, typically from page 1
    fetchUsers(1, query, filter);
  }

  const handleViewClick = (user: User) => {
    setUserToView(user);
    setIsViewModalOpen(true);
  }

  const handleEditClick = (user: User) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  }
  
  const handleDeleteClick = async (userId: number, userName: string) => {
    if(window.confirm(`Are you sure you want to delete user: ${userName}? This action cannot be undone.`)){
      try{
        setLoading(true); // Disable buttons while deleting
        await deleteUser(userId);
        handleUserCreatedOrUpdated();
      }
      catch (err) {
        console.error("Failed to delete the user: ", err);
        alert("Error deleting the user.");
      }
      finally{
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers(1, query, filter);
    }, 500); // Waits 500ms before running fetchUsers

    return () => {
      clearTimeout(handler); // Clears the timer if query/filter changes again
    };
  }, [query, filter]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= lastPage) {
      fetchUsers(newPage, query, filter);
    }
  };

  return (
    <main className="h-full overflow-y-auto bg-gray-50">
      <div className="mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Header and Main Action */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-md text-gray-500 mt-1">Manage, filter, and search all system users.</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Add New User
          </button>
        </div>
        
        {/* Filters and Search Bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl shadow-md border border-gray-200">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px] sm:min-w-[300px]">
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

          {/* Role Filters */}
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

        {/* Users List Container */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-10 text-gray-500">
              <svg className="animate-spin h-5 w-5 mr-3 inline-block text-indigo-500" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
              Loading users...
            </div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* User Avatar Initials (Styled by role) */}
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm flex-shrink-0 ${
                    user.role === "admin" ? "bg-purple-100 text-purple-700" :
                    user.role === "instructor" ? "bg-green-100 text-green-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {user.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  
                  {/* User Details */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                      <span
                        className={`ml-3 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          user.role === "instructor" ? "bg-green-100 text-green-800" :
                          user.role === "admin" ? "bg-purple-100 text-purple-800" :
                          "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {roleLabel(user.role)}
                      </span>
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                
                {/* Actions Button Group */}
                <div className="flex gap-1 ml-4 flex-shrink-0">
                  <button
                  title="view"
                    onClick={() => handleViewClick(user)}
                    className="px-2 py-1 text-sm font-medium text-indigo-500 border border-gray-300 hover:bg-blue-700 hover:shadow-md hover:shadow-gray-300 hover:text-white rounded-md transition disabled:opacity-50"
                    disabled={loading}
                  >
                    <MdRemoveRedEye className="w-6 h-6"/>
                  </button>
                  <button
                  title="edit"
                    onClick={() => handleEditClick(user)}
                    className="px-2 py-1 text-sm font-medium text-indigo-500 border border-gray-300 hover:bg-blue-700 hover:shadow-md hover:shadow-gray-300 hover:text-white rounded-md transition disabled:opacity-50"
                    disabled={loading}
                  >
                    <MdEdit className="w-6 h-6"/>
                  </button>
                  <button
                  title="delete"
                    onClick={() => handleDeleteClick(user.id, user.name)}
                    className="px-3 py-1 text-sm font-medium text-red-500 hover:text-white hover:bg-red-800 border hover:shadow-md hover:shadow-gray-300 rounded-md transition disabled:opacity-50"
                    disabled={loading}
                  >
                    <MdDeleteForever className="w-6 h-6"/>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow-md">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M12 20.005v-2.348m0-12.72v-2.348m-5.464 12.378l1.638-1.638m9.252-9.252l-1.638 1.638m0 9.252l-1.638-1.638M4.354 12a4 4 0 115.292 0 4 4 0 01-5.292 0z"></path></svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding a new user or adjusting your search filters.
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
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
      </div>

        {/* Modals */}
        <AddUserModal
            show={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSuccess={handleUserCreatedOrUpdated}
        />

        <ViewUserModal
            show={isViewModalOpen}
            user={userToView}
            onClose={() => {
                setIsViewModalOpen(false);
                setUserToView(null);
            }}
            onSuccess={handleUserCreatedOrUpdated}
        />

        <EditUserModal
            show={isEditModalOpen}
            user={userToEdit}
            onClose={() => {
                setIsEditModalOpen(false);
                setUserToEdit(null);
            }}
            onSuccess={handleUserCreatedOrUpdated}
        />

    </main>
  );
};

export default UsersIndex;