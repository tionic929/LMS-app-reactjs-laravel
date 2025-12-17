import React from "react";

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

interface CourseAnnouncementViewModalProps {
  announcement: Announcement | null;
  onClose: () => void;
}

const CourseAnnouncementViewModal: React.FC<CourseAnnouncementViewModalProps> = ({
  announcement,
  onClose,
}) => {
  if (!announcement) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="View announcement"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-gray-900/40" />

      <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-start justify-between gap-3 px-4 py-3.5 sm:px-5 border-b border-gray-200">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900 break-words">{announcement.title}</h3>
            <p className="text-xs text-gray-500 mt-1">
              Posted on {new Date(announcement.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>

        <div className="px-4 py-4 sm:px-5 max-h-[70vh] overflow-auto">
          <p className="text-sm text-gray-800 whitespace-pre-wrap break-words leading-relaxed">{announcement.content}</p>
        </div>
      </div>
    </div>
  );
};

export default CourseAnnouncementViewModal;
