import React, { useState } from "react";
import {
  addCourseAnnouncement,
  deleteCourseAnnouncement,
} from "../../../api/courses";
import { RiMegaphoneLine, RiDeleteBin6Line } from "react-icons/ri";

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
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {announcement.title}
                  </h3>
                  <p className="text-gray-700 mb-2">{announcement.content}</p>
                  <p className="text-xs text-gray-500">
                    Posted on{" "}
                    {new Date(announcement.created_at).toLocaleDateString()}
                  </p>
                </div>
                {isInstructor && (
                  <button
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 font-medium ml-4 inline-flex items-center gap-1"
                  >
                    <RiDeleteBin6Line className="h-4 w-4" />
                    Delete
                  </button>
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