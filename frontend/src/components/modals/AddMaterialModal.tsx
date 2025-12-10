import React, { useState } from "react";
import Modal from "./Modal";

export interface AddMaterialPayload {
  title: string;
  type: "file" | "video" | "link";
  url: string;
  description?: string;
}

interface AddMaterialModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (payload: AddMaterialPayload) => Promise<void> | void;
}

const AddMaterialModal: React.FC<AddMaterialModalProps> = ({ show, onClose, onSubmit }) => {
  const [type, setType] = useState<"file" | "video" | "link">("file");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (type !== "file" && !url.trim()) {
      setError("URL is required for video/link");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ title: title.trim(), type, url: url.trim(), description: description.trim() });
      setTitle("");
      setUrl("");
      setDescription("");
      setType("file");
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to add material";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} title="Add Course Material">
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Material Type</label>
        <div className="flex gap-2">
          {(["file", "video", "link"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 px-4 py-2 rounded-full text-xs font-semibold transition-colors border ${type === t ? "bg-indigo-600 text-white border-indigo-600 shadow" : "bg-white/70 text-gray-700"}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          required
        />

        {type === "file" ? (
          <>
            <label className="block text-sm font-medium text-gray-700">File URL (temporary)</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/files/document.pdf"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </>
        ) : (
          <>
            <label className="block text-sm font-medium text-gray-700">URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </>
        )}

        <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm disabled:opacity-50">
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddMaterialModal;
