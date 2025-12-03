import React, { useState } from "react";
import { addCourseMaterial } from "../../../api/courses";
import { RiCheckLine } from "react-icons/ri";
import { LiaTimesSolid } from "react-icons/lia";

type MaterialType = "file" | "video" | "link";

interface AddMaterialModalProps {
  courseId: string;
  onClose: () => void;
  onMaterialAdded?: (material: any) => void;
}

const AddMaterialModal: React.FC<AddMaterialModalProps> = ({
  courseId,
  onClose,
  onMaterialAdded,
}) => {
  const [materialType, setMaterialType] = useState<MaterialType>("file");
  const [materialForm, setMaterialForm] = useState({
    title: "",
    url: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    // Create optimistic material object
    const optimisticMaterial = {
      id: Date.now(), // Temporary ID
      title: materialForm.title,
      type: materialType,
      description: materialForm.description,
      url: materialType === "file" ? null : materialForm.url,
      created_at: new Date().toISOString(),
    };

    // Optimistic update - add to UI immediately
    if (onMaterialAdded) {
      onMaterialAdded(optimisticMaterial);
    }

    // Close modal and reset form immediately
    onClose();
    setMaterialForm({ title: "", url: "", description: "" });
    setSelectedFile(null);

    try {
      const formData = new FormData();
      formData.append("title", materialForm.title);
      formData.append("type", materialType);
      formData.append("description", materialForm.description);

      if (materialType === "file" && selectedFile) {
        formData.append("file", selectedFile);
      } else {
        formData.append("url", materialForm.url);
      }

      const response = await addCourseMaterial(courseId, formData);

      // Update with real data from server if available
      if (response.data?.material && onMaterialAdded) {
        // Replace optimistic material with real one
        onMaterialAdded(response.data.material);
      }
    } catch (err: any) {
      console.error("Error adding material:", err);
      // On error, we could remove the optimistic material, but for now just log
      alert(err.response?.data?.message || "Failed to add material");
    } finally {
      setUploading(false);
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
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    file:cursor-pointer cursor-pointer"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
                  required
                />
              </div>
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
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
              disabled={uploading}
            >
              <LiaTimesSolid className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 inline-flex items-center gap-2 disabled:opacity-50"
              disabled={uploading}
            >
              <RiCheckLine className="h-4 w-4" />
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMaterialModal;