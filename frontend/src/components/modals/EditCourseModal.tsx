import React from "react";
import { LiaTimesSolid } from "react-icons/lia";
import { RiCheckLine } from "react-icons/ri";

export interface EditCourseForm {
  title: string;
  content: string;
  privacy: "public" | "private";
  capacity: number;
}

interface EditCourseModalProps {
  open: boolean;
  form: EditCourseForm;
  onChange: (next: EditCourseForm) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({ open, form, onChange, onClose, onSubmit }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Course</h2>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Course Name</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => onChange({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.content}
              onChange={(e) => onChange({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Privacy</label>
            <select
              value={form.privacy}
              onChange={(e) => onChange({ ...form, privacy: e.target.value as "public" | "private" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Learners Limit</label>
            <input
              type="number"
              value={form.capacity}
              onChange={(e) => onChange({ ...form, capacity: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min={1}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-md inline-flex items-center gap-2"
            >
              <LiaTimesSolid className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 inline-flex items-center gap-2"
            >
              <RiCheckLine className="h-4 w-4" />
              Update Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourseModal;
