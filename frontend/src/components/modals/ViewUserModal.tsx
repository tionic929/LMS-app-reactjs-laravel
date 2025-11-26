import React, { useState, useEffect } from "react";
import Modal from "./Modal"; // Assuming Modal is in the same directory or adjust path
import { updateUser, type User, type UpdateUserPayload } from "../../api/users"; // Adjust path as needed

interface ViewUserModalProps {
  show: boolean;
  user: User | null; // Note: Ensure User interface includes 'role'
  onClose: () => void;
  onSuccess: () => void;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({ show, user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<UpdateUserPayload>({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "learner", // Initialize role
    password: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Synchronize state when the `user` prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: "", // Always clear password field on user change
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    // Prepare payload, excluding empty password field
    const payload: UpdateUserPayload = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
    };
    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      await updateUser(user.id, payload);
      onSuccess(); // Refresh parent list
      onClose();   // Close modal
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to update user.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!show || !user) return null;

  return (
    <Modal show={show} onClose={onClose} title={`View User: ${user.name}`}>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            title="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            disabled
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            title="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            disabled
          />
        </div>
        
        {/* Role Selection (New) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <input
            title="email"
            name="email"
            type="email"
            required
            value={formData.role}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            disabled
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ViewUserModal;