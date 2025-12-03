import React from "react";
import Modal from "./Modal";
import { IoMdInformationCircle, IoMdCalendar } from "react-icons/io";
import { MdCampaign } from "react-icons/md";

export interface AnnouncementEntity {
  id: number;
  title: string;
  content: string;
  type: string;
  date?: string;
  audience?: 'learners' | 'instructors' | 'all';
  event_date?: string;
  event_time?: string;
  location?: string;
}

interface ViewAnnouncementModalProps {
  show: boolean;
  announcement: AnnouncementEntity | null;
  getTypeBadgeClass: (type: string) => string;
  onClose: () => void;
}

const ViewAnnouncementModal: React.FC<ViewAnnouncementModalProps> = ({ show, announcement, onClose }) => {
  if (!announcement) return null;

  const typeStyles = (type: string) => {
    switch (type) {
      case "news":
        return { circle: "bg-indigo-100 text-indigo-700", icon: <MdCampaign className="w-4 h-4" /> };
      case "event":
        return { circle: "bg-emerald-100 text-emerald-700", icon: <IoMdCalendar className="w-4 h-4" /> };
      case "general":
      default:
        return { circle: "bg-gray-100 text-gray-700", icon: <IoMdInformationCircle className="w-4 h-4" /> };
    }
  };

  const { circle, icon } = typeStyles(announcement.type);

  return (
    <Modal show={show} onClose={onClose}>
      <div className="px-1 pb-1">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${circle}`}>
            {icon}
          </span>
          {announcement.title}
        </h3>

        <div className="mt-4">
          <p className="whitespace-pre-wrap break-words text-gray-700">{announcement.content}</p>
        </div>

        {announcement.type === 'event' && (announcement.event_date || announcement.event_time || announcement.location) && (
          <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            <div className="font-medium mb-1">Event Details</div>
            {announcement.event_date && (
              <div>
                <span className="font-medium">Date:</span> {announcement.event_date}
              </div>
            )}
            {announcement.event_time && (
              <div>
                <span className="font-medium">Time:</span> {announcement.event_time}
              </div>
            )}
            {announcement.location && (
              <div>
                <span className="font-medium">Location:</span> {announcement.location}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-between gap-2">
          <div className="mt-2 flex items-center gap-2">
            {announcement.date && (
              <span className="text-xs text-gray-500">Posted on {announcement.date}</span>
            )}
            {announcement.audience && (
              <span className="text-xs text-gray-600">Audience: {announcement.audience === 'all' ? 'All' : announcement.audience === 'learners' ? 'Learners' : 'Instructors'}</span>
            )}
          </div>
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewAnnouncementModal;
