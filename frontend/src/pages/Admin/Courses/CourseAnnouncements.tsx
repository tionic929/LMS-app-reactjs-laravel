import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import {
  addCourseAnnouncement,
  updateCourseAnnouncement,
  deleteCourseAnnouncement,
} from "../../../api/courses";
import { RiDeleteBin6Line, RiEditLine } from "react-icons/ri";
import { MdMoreHoriz } from "react-icons/md";
import CourseAnnouncementViewModal from "../../../components/modals/courses/CourseAnnouncementViewModal";

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
  const [viewingAnnouncement, setViewingAnnouncement] = useState<Announcement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen !== null && !(event.target as Element).closest('.dropdown-menu')) {
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
      toast.success("Announcement posted!");
    } catch (err: any) {
      console.error("Error adding announcement:", err);
      toast.error(err.response?.data?.message || "Failed to post announcement");
    }
  };

  const handleDeleteAnnouncement = async (announcementId: number) => {
    const id = toast.info(
      <div className="max-w-sm">
        <div className="mb-2">Are you sure you want to delete this announcement?</div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(id)}
            className="px-3 py-1 bg-gray-200 rounded text-sm"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(id);
              try {
                await deleteCourseAnnouncement(courseId, announcementId);
                onAnnouncementAction();
                toast.success("Announcement deleted");
              } catch (err: any) {
                console.error("Error deleting announcement:", err);
                toast.error(err.response?.data?.message || "Failed to delete announcement");
              }
            }}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
          >
            Delete
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false }
    );
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
      toast.success("Announcement updated!");
    } catch (err: any) {
      console.error("Error updating announcement:", err);
      toast.error(err.response?.data?.message || "Failed to update announcement");
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

  const openAnnouncementModal = (announcement: Announcement) => {
    setViewingAnnouncement(announcement);
  };

  const closeAnnouncementModal = () => {
    setViewingAnnouncement(null);
  };

  return (
    <div className="space-y-5">
      {/* Add Announcement Form (top) */}
      {isInstructor && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">New announcement</h3>
              <p className="text-sm text-gray-500">Post an update for this course.</p>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={newAnnouncement.title}
              onChange={(e) =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  title: e.target.value,
                })
              }
              placeholder="Announcement title"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
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
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              rows={4}
              required
            />

            <div className="flex items-center justify-end pt-1">
              <button
                onClick={handleAddAnnouncement}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5 border-b border-gray-200">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Announcements</h3>
            <p className="text-xs text-gray-500">{announcements.length} total</p>
          </div>
        </div>

        <div className="p-0">
          {announcements.length === 0 ? (
            <div className="px-4 py-10 sm:px-5 text-center">
              <p className="text-sm text-gray-700 font-medium">No announcements yet</p>
              <p className="text-sm text-gray-500 mt-1">New posts will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {announcements.map((announcement: Announcement) => (
                <div
                  key={announcement.id}
                  onClick={() => {
                    if (editingAnnouncement?.id === announcement.id) return;
                    openAnnouncementModal(announcement);
                  }}
                  className="px-4 py-4 sm:px-5 bg-white hover:bg-gray-50 hover:shadow-sm transition-shadow transition-colors cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.target !== e.currentTarget) return;
                    if (e.key !== "Enter" && e.key !== " ") return;
                    e.preventDefault();
                    if (editingAnnouncement?.id === announcement.id) return;
                    openAnnouncementModal(announcement);
                  }}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0 flex-1">
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
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                placeholder="Announcement title"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <textarea
                                value={editingAnnouncement.content}
                                onChange={(e) =>
                                  setEditingAnnouncement({
                                    ...editingAnnouncement,
                                    content: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                rows={3}
                                placeholder="Announcement content"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    cancelEditing();
                                  }}
                                  className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-lg hover:bg-gray-300"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditAnnouncement();
                                  }}
                                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                                >
                                  Save
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="min-w-0">
                            <div className="flex items-baseline justify-between gap-3">
                              <h4 className="font-semibold text-gray-900 truncate">{announcement.title}</h4>
                              <p className="text-xs text-gray-500 flex-shrink-0">
                                {new Date(announcement.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words leading-relaxed">
                              {announcement.content}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {isInstructor && editingAnnouncement?.id !== announcement.id && (
                      <div className="relative dropdown-menu" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() =>
                            setDropdownOpen(dropdownOpen === announcement.id ? null : announcement.id)
                          }
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          aria-label="Announcement actions"
                        >
                          <MdMoreHoriz className="w-5 h-5 text-gray-500" />
                        </button>

                        {dropdownOpen === announcement.id && (
                          <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                            <button
                              onClick={() => {
                                startEditing(announcement);
                                setDropdownOpen(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <RiEditLine className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteAnnouncement(announcement.id);
                                setDropdownOpen(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <RiDeleteBin6Line className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CourseAnnouncementViewModal
        announcement={viewingAnnouncement}
        onClose={closeAnnouncementModal}
      />
    </div>
  );
};

export default CourseAnnouncements;