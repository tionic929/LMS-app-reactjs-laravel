import React, { useState, useEffect } from "react";
import {
  addCourseAnnouncement,
  updateCourseAnnouncement,
  deleteCourseAnnouncement,
} from "../../../api/courses";
import { RiMegaphoneLine, RiDeleteBin6Line, RiEditLine } from "react-icons/ri";
import { MdMoreHoriz } from "react-icons/md";

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

interface CourseAnnouncementsProps {
  courseId: string;
  announcements: Announcement[];
  isInstructor: boolean;
  onAnnouncementAction: () => void;
}

const CourseAnnouncements: React.FC<CourseAnnouncementsProps> = ({
  courseId,
  announcements,
  isInstructor,
  onAnnouncementAction,
}) => {
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
  });
  const [editingAnnouncement, setEditingAnnouncement] = useState<{
    id: number;
    title: string;
    content: string;
  } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen && !(event.target as Element).closest('.dropdown-menu')) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) return;

    try {
      await addCourseAnnouncement(courseId, newAnnouncement);
      onAnnouncementAction();
      setNewAnnouncement({ title: "", content: "" });
      alert("Announcement posted!");
    } catch (err: any) {
      console.error("Error adding announcement:", err);
      alert(err.response?.data?.message || "Failed to post announcement");
    }
  };

  const handleDeleteAnnouncement = async (announcementId: number) => {
    try {
      await deleteCourseAnnouncement(courseId, announcementId);
      onAnnouncementAction();
      alert("Announcement deleted");
    } catch (err: any) {
      console.error("Error deleting announcement:", err);
      alert(err.response?.data?.message || "Failed to delete announcement");
    }
  };

  const handleEditAnnouncement = async () => {
    if (!editingAnnouncement) return;
    if (!editingAnnouncement.title.trim() || !editingAnnouncement.content.trim()) return;

    try {
      await updateCourseAnnouncement(courseId, editingAnnouncement.id, {
        title: editingAnnouncement.title,
        content: editingAnnouncement.content,
      });
      onAnnouncementAction();
      setEditingAnnouncement(null);
      alert("Announcement updated!");
    } catch (err: any) {
      console.error("Error updating announcement:", err);
      alert(err.response?.data?.message || "Failed to update announcement");
    }
  };

  const startEditing = (announcement: Announcement) => {
    setEditingAnnouncement({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
    });
  };

  const cancelEditing = () => {
    setEditingAnnouncement(null);
  };

  return (
    <div>
      <div className="space-y-6">
        {announcements.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No announcements have been posted yet.</p>
        ) : (
          announcements.map((announcement: any) => (
            <div
              key={announcement.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {editingAnnouncement?.id === announcement.id ? (
                    <div className="space-y-3">
                      {editingAnnouncement && (
                        <>
                      <input
                        type="text"
                        value={editingAnnouncement.title}
                        onChange={(e) =>
                          setEditingAnnouncement({
                            ...editingAnnouncement,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-semibold"
                        placeholder="Announcement Title"
                      />
                      <textarea
                        value={editingAnnouncement.content}
                        onChange={(e) =>
                          setEditingAnnouncement({
                            ...editingAnnouncement,
                            content: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={3}
                        placeholder="Announcement content"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleEditAnnouncement}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {announcement.title}
                      </h3>
                      <p className="text-gray-700 mb-2">{announcement.content}</p>
                      <p className="text-xs text-gray-500">
                        Posted on{" "}
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>
                {isInstructor && editingAnnouncement?.id !== announcement.id && (
                  <div className="relative dropdown-menu ml-4">
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === announcement.id ? null : announcement.id)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <MdMoreHoriz className="w-5 h-5 text-gray-500" />
                    </button>
                    
                    {dropdownOpen === announcement.id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <button
                          onClick={() => {
                            startEditing(announcement);
                            setDropdownOpen(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <RiEditLine className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteAnnouncement(announcement.id);
                            setDropdownOpen(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <RiDeleteBin6Line className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Announcement Form */}
      {isInstructor && (
        <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-medium mb-3">Post New Announcement</h3>
          <input
            type="text"
            value={newAnnouncement.title}
            onChange={(e) =>
              setNewAnnouncement({
                ...newAnnouncement,
                title: e.target.value,
              })
            }
            placeholder="Announcement Title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
            required
          />
          <textarea
            value={newAnnouncement.content}
            onChange={(e) =>
              setNewAnnouncement({
                ...newAnnouncement,
                content: e.target.value,
              })
            }
            placeholder="Write your announcement here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
            rows={4}
            required
          />
          <button
            onClick={handleAddAnnouncement}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
          >
            <RiMegaphoneLine className="h-4 w-4" />
            Post Announcement
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseAnnouncements;