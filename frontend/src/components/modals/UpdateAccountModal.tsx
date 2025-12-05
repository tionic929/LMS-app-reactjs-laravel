import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import { updateUser, deleteUserAvatar, type User, type UpdateUserPayload } from "../../api/users";
import { useAuth } from "../../contexts/AuthContext";

interface UpdateAccountModalProps {
  show: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

const UpdateAccountModal: React.FC<UpdateAccountModalProps> = ({ show, user, onClose, onSuccess }) => {
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState<UpdateUserPayload>({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "learner",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    } else {
      setAvatarPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    const payload: UpdateUserPayload & { avatar?: File } = {
      name: formData.name,
      email: formData.email,
      role: user.role, // enforce original role; not editable in account update
    };
    if (formData.password) {
      payload.password = formData.password;
    }
    if (avatarFile) {
      payload.avatar = avatarFile;
    }

    try {
      await updateUser(user.id, payload);
      onSuccess();
      // Refresh user data after successful update
      await refreshUser();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update account.";
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
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {avatarPreview || user?.avatar_url ? (
              <img
                src={avatarPreview || (user?.avatar_url as string)}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500 text-xs">No photo</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
            <input
              title="avatar"
              name="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <p className="text-xs text-gray-500 mt-1">JPEG/PNG/WebP up to 5MB.</p>
          </div>
        </div>
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
            disabled={loading}
            onClick={async () => {
              if (!user) return;
              setLoading(true);
              setError(null);
              try {
                await deleteUserAvatar(user.id);
                setAvatarFile(null);
                setAvatarPreview(null);
                await refreshUser();
                onSuccess();
              } catch (err: any) {
                const msg = err.response?.data?.message || err.message || "Failed to delete avatar.";
                setError(msg);
              } finally {
                setLoading(false);
              }
            }}
            className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
          >
            Remove Photo
          </button>
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
