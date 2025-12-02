import React, { useState } from "react";
import Modal from "./Modal";

export interface AnnouncementForm {
  title: string;
  content: string;
  type: string;
}

interface AddAnnouncementModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (payload: AnnouncementForm) => Promise<void>;
}

const AddAnnouncementModal: React.FC<AddAnnouncementModalProps> = ({ show, onClose, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ title: title.trim(), content: content.trim(), type });
      setTitle("");
      setContent("");
      setType("info");
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to create announcement";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} title="Create Announcement">
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <form onSubmit={handleCreate} className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <label className="block text-sm font-medium text-gray-700">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="maintenance">Maintenance</option>
        </select>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm disabled:opacity-50">
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddAnnouncementModal;
