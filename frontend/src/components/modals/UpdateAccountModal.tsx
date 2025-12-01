import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import { updateUser, type User, type UpdateUserPayload } from "../../api/users";

interface UpdateAccountModalProps {
  show: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

const UpdateAccountModal: React.FC<UpdateAccountModalProps> = ({ show, user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<UpdateUserPayload>({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "learner",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: "",
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    const payload: UpdateUserPayload = {
      name: formData.name,
      email: formData.email,
      role: user.role, // enforce original role; not editable in account update
    };
    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      await updateUser(user.id, payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update account.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!show || !user) return null;

  return (
    <Modal show={show} onClose={onClose} title="Update Account">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          />
        </div>

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
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <input
            title="role"
            name="role"
            type="text"
            value={user?.role ?? ""}
            readOnly
            className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password (optional)</label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Enter new password to change"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Account"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateAccountModal;
