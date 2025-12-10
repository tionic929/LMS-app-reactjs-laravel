import React from "react";
import Modal from "./Modal";
import { type User } from "../../api/users";
import { FaUsers, FaUser, FaGraduationCap, FaBan, FaCheckCircle, FaRegCheckCircle } from "react-icons/fa";

interface ViewUserModalProps {
  show: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({ show, user, onClose }) => {
  if (!show || !user) return null;

  const roleChip = (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
        user.role === "instructor"
          ? "bg-green-100 text-green-800"
          : user.role === "admin"
          ? "bg-purple-100 text-purple-800"
          : "bg-blue-100 text-blue-800"
      }`}
    >
      {user.role === "instructor" ? "Instructor" : user.role === "learner" ? "Learner" : "Admin"}
    </span>
  );

  const activeChip = (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
        user.is_banned_from_comments
          ? "bg-rose-100 text-rose-700"
          : user.is_enabled
          ? "bg-emerald-100 text-emerald-700"
          : "bg-gray-100 text-gray-700"
      }`}
    >
      {user.is_banned_from_comments ? "Banned" : user.is_enabled ? "Active" : "Disabled"}
    </span>
  );

  const confirmChip = (
    user.role === "instructor" ? (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
          user.is_confirmed ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"
        }`}
      >
        {user.is_confirmed ? "Confirmed" : "Unconfirmed"}
      </span>
    ) : null
  );

  return (
    <Modal show={show} onClose={onClose} title={`User Profile`}>
      <div className="space-y-6">
        {/* Header with avatar */}
        <div className="flex items-center gap-4">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="avatar" className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
              {user.name.split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{user.name}</h3>
            <p className="text-sm text-gray-600 truncate">{user.email}</p>
            <div className="mt-2 flex items-center gap-2">
              {roleChip}
              {activeChip}
              {confirmChip}
            </div>
          </div>
        </div>

        {/* Quick facts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 text-gray-700"><FaUsers className="h-4 w-4" /><span className="text-xs">User ID</span></div>
            <div className="mt-1 text-sm font-medium text-gray-900">{user.id}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 text-gray-700"><FaUser className="h-4 w-4" /><span className="text-xs">Username</span></div>
            <div className="mt-1 text-sm font-medium text-gray-900">{user.name}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 text-gray-700"><FaGraduationCap className="h-4 w-4" /><span className="text-xs">Role</span></div>
            <div className="mt-1 text-sm font-medium text-gray-900">{user.role}</div>
          </div>
        </div>

        {/* Status section */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h4 className="text-sm font-semibold text-gray-900">Account Status</h4>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {activeChip}
            {confirmChip}
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${user.is_banned_from_comments ? "bg-rose-100 text-rose-700" : "bg-gray-100 text-gray-700"}`}>
              <FaBan className="h-3 w-3 mr-1" /> {user.is_banned_from_comments ? "Comments Banned" : "Comments Allowed"}
            </span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${user.role === "instructor" ? (user.is_confirmed ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700") : "bg-gray-100 text-gray-700"}`}>
              {(user.role === "instructor" ? (user.is_confirmed ? <FaCheckCircle className="h-3 w-3 mr-1" /> : <FaRegCheckCircle className="h-3 w-3 mr-1" />) : null)} {user.role === "instructor" ? (user.is_confirmed ? "Instructor Confirmed" : "Instructor Unconfirmed") : "Standard Account"}
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewUserModal;