import React, { useState } from "react";
import { deleteCourseMaterial } from "../../../api/courses";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
  MdOutlineSlowMotionVideo,
} from "react-icons/md";
import { HiOutlinePlus } from "react-icons/hi";
import { FaRegFileAlt } from "react-icons/fa";
import { FaLink } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import EditMaterialModal from "../../../components/modals/courses/EditMaterialModal";

// Type for material
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

// Type for filter
type MaterialFilter = "all" | "file" | "video" | "link";

interface CourseMaterialsProps {
  courseId: string;
  materials: Material[];
  isInstructor: boolean;
  onMaterialAction: () => void;
  setShowAddMaterialModal: (show: boolean) => void;
}

const CourseMaterials: React.FC<CourseMaterialsProps> = ({
  courseId,
  materials,
  isInstructor,
  onMaterialAction,
  setShowAddMaterialModal,
}) => {
  const [materialFilter, setMaterialFilter] = useState<MaterialFilter>("all");
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const handleDeleteMaterial = async (materialId: number) => {
    if (!confirm("Are you sure you want to delete this material?")) return;

    try {
      await deleteCourseMaterial(courseId, materialId);
      onMaterialAction();
      alert("Material deleted");
    } catch (err: any) {
      console.error("Error deleting material:", err);
      alert(err.response?.data?.message || "Failed to delete material");
    }
  };

  const filteredMaterials = materials.filter(
    (m) => materialFilter === "all" || m.type === materialFilter
  );

  const getIcon = (type: Material["type"]) => {
    switch (type) {
      case "file":
        return <FaRegFileAlt className="h-10 w-10 text-blue-500" />;
      case "video":
        return <MdOutlineSlowMotionVideo className="h-10 w-10 text-red-500" />;
      case "link":
        return <FaLink className="h-10 w-10 text-green-500" />;
      default:
        return <FaRegFileAlt className="h-10 w-10 text-gray-500" />;
    }
  };

  return (
    <div>
      {/* Category Filter */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMaterialFilter("all")}
          className={`px-3 py-1 rounded-md text-sm ${
            materialFilter === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setMaterialFilter("file")}
          className={`px-3 py-1 rounded-md text-sm ${
            materialFilter === "file"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Files
        </button>
        <button
          onClick={() => setMaterialFilter("video")}
          className={`px-3 py-1 rounded-md text-sm ${
            materialFilter === "video"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Videos
        </button>
        <button
          onClick={() => setMaterialFilter("link")}
          className={`px-3 py-1 rounded-md text-sm ${
            materialFilter === "link"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Links
        </button>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMaterials.length === 0 ? (
          <p className="col-span-full text-gray-500 text-center py-4">No materials found for this filter.</p>
        ) : (
          filteredMaterials.map((material) => (
            <div
              key={material.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {/* Icon based on type */}
                  {getIcon(material.type)}

                  <div>
                    <h4 className="font-medium text-gray-900">
                      {material.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {material.type === "file" && material.file_type?.toUpperCase()}
                      {material.type === "file" && material.file_type && " • "}
                      Uploaded {new Date(material.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {isInstructor && (
                  <div className="flex gap-2">
                    <button
                      title="edit"
                      onClick={() => setEditingMaterial(material)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaEdit className="h-5 w-5" />
                    </button>
                    <button
                      title="delete"
                      onClick={() => handleDeleteMaterial(material.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <RiDeleteBin6Line className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Assuming 'url' is the path for all types */}
              <a
                href={material.url}
                target={material.type === "link" ? "_blank" : undefined}
                download={material.type === "file" ? (material.original_filename || true) : undefined}
                rel={material.type === "link" ? "noopener noreferrer" : undefined}
                className="mt-3 w-full px-3 py-2 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100 font-medium inline-block text-center"
              >
                {material.type === "file" ? "Download" : "Open"}
              </a>
            </div>
          ))
        )}
      </div>

      {/* Add Material Button */}
      {/* {isInstructor && (
        <button
          onClick={() => setShowAddMaterialModal(true)}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 inline-flex items-center gap-2"
        >
          <HiOutlinePlus className="h-5 w-5" />
          Add Material
        </button>
      )} */}

      {/* Edit Material Modal */}
      {editingMaterial && (
        <EditMaterialModal
          courseId={courseId}
          material={editingMaterial}
          onClose={() => setEditingMaterial(null)}
          onSuccess={onMaterialAction}
        />
      )}
    </div>
  );
};

export default CourseMaterials;