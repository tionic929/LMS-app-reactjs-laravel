import React, { useState, useEffect } from "react";
import { updateCourseMaterial } from "../../../api/courses";
import { RiCheckLine } from "react-icons/ri";
import { LiaTimesSolid } from "react-icons/lia";

interface Material {
  id: number;
  title: string;
  type: "file" | "video" | "link";
  url: string;
  description: string;
  file_type?: string;
  original_filename?: string;
  created_at: string;
}

interface EditMaterialModalProps {
  courseId: string;
  material: Material;
  onClose: () => void;
  onSuccess: () => void;
}

const EditMaterialModal: React.FC<EditMaterialModalProps> = ({
  courseId,
  material,
  onClose,
  onSuccess,
}) => {
  const [materialForm, setMaterialForm] = useState({
    title: material.title,
    description: material.description || "",
  });

  const handleEditMaterial = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateCourseMaterial(courseId, material.id, materialForm);
      onSuccess();
      onClose();
      alert("Material updated successfully!");
    } catch (err: any) {
      console.error("Error updating material:", err);
      alert(err.response?.data?.message || "Failed to update material");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Course Material</h2>
        <form onSubmit={handleEditMaterial}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={materialForm.title}
              onChange={(e) =>
                setMaterialForm({ ...materialForm, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Description (Optional)
            </label>
            <textarea
              value={materialForm.description}
              onChange={(e) =>
                setMaterialForm({ ...materialForm, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
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
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMaterialModal;