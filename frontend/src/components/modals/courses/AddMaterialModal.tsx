import React, { useState } from "react";
import { addCourseMaterial } from "../../../api/courses";
import { toast } from "react-toastify";
import { RiCheckLine } from "react-icons/ri";
import { LiaTimesSolid } from "react-icons/lia";

type MaterialType = "file" | "video" | "link";

interface AddMaterialModalProps {
  courseId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AddMaterialModal: React.FC<AddMaterialModalProps> = ({
  courseId,
  onClose,
  onSuccess,
}) => {
  const [materialType, setMaterialType] = useState<MaterialType>("file");
  const [materialForm, setMaterialForm] = useState({
    title: "",
    url: "",
    description: "",
    file: null as File | null,
  });

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data: any = {
        title: materialForm.title,
        type: materialType,
        description: materialForm.description,
      };

      if (materialType === 'file') {
        if (!materialForm.file) {
          toast.error('Please select a file to upload');
          return;
        }
        data.file = materialForm.file;
      } else {
        data.url = materialForm.url;
      }

      const res = await addCourseMaterial(courseId, data);
      onSuccess();
      onClose();
      setMaterialForm({ title: "", url: "", description: "", file: null });
      toast.success(res.data?.message || "Material added successfully!");
    } catch (err: any) {
      console.error("Error adding material:", err);
      toast.error(err.response?.data?.message || "Failed to add material");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Course Material</h2>
        <form onSubmit={handleAddMaterial}>
          {/* Material Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Material Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMaterialType("file")}
                className={`flex-1 px-3 py-2 rounded-md text-sm ${
                  materialType === "file"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                File
              </button>
              <button
                type="button"
                onClick={() => setMaterialType("video")}
                className={`flex-1 px-3 py-2 rounded-md text-sm ${
                  materialType === "video"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Video
              </button>
              <button
                type="button"
                onClick={() => setMaterialType("link")}
                className={`flex-1 px-3 py-2 rounded-md text-sm ${
                  materialType === "link"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Link
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
            title="material"
              type="text"
              value={materialForm.title}
              onChange={(e) =>
                setMaterialForm({ ...materialForm, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {materialType === "file" && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Upload File
              </label>
              <input
                type="file"
                onChange={(e) =>
                  setMaterialForm({ ...materialForm, file: e.target.files?.[0] || null })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                required
              />
            </div>
          )}

          {(materialType === "video" || materialType === "link") && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">URL</label>
              <input
                type="url"
                value={materialForm.url}
                onChange={(e) =>
                  setMaterialForm({ ...materialForm, url: e.target.value })
                }
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Description (Optional)
            </label>
            <textarea
            title="description"
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
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMaterialModal;