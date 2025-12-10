import React, { useState, useEffect } from "react";
import Modal from "./Modal";

export interface EditCoursePayload {
  title: string;
  content: string;
  privacy: "public" | "private";
  capacity: number;
}

interface EditCourseModalProps {
  show: boolean;
  onClose: () => void;
  initial: EditCoursePayload | null;
  onSubmit: (payload: EditCoursePayload) => Promise<void> | void;
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({ show, onClose, initial, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [capacity, setCapacity] = useState<number>(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show && initial) {
      setTitle(initial.title || "");
      setContent(initial.content || "");
      setPrivacy(initial.privacy || "public");
      setCapacity(initial.capacity ?? 50);
    }
  }, [show, initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("Title and description are required");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ title: title.trim(), content: content.trim(), privacy, capacity });
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to update course";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} title="Edit Course">
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Course Name</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          required
        />

        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          required
        />

        <label className="block text-sm font-medium text-gray-700">Privacy</label>
        <select
          value={privacy}
          onChange={(e) => setPrivacy(e.target.value as "public" | "private")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        <label className="block text-sm font-medium text-gray-700">Learners Limit</label>
        <input
          type="number"
          value={capacity}
          min={1}
          onChange={(e) => setCapacity(parseInt(e.target.value || "0", 10))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm disabled:opacity-50">
            {loading ? "Updating..." : "Update Course"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditCourseModal;
