import React from "react";
import Modal from "./Modal";
import { IoMdInformationCircle, IoMdWarning, IoMdCloseCircle, IoMdConstruct } from "react-icons/io";

export interface AnnouncementEntity {
  id: number;
  title: string;
  content: string;
  type: string;
  date?: string;
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
      case "info":
        return { circle: "bg-blue-100 text-blue-700", icon: <IoMdInformationCircle className="w-4 h-4" /> };
      case "warning":
        return { circle: "bg-yellow-100 text-yellow-700", icon: <IoMdWarning className="w-4 h-4" /> };
      case "error":
        return { circle: "bg-red-100 text-red-700", icon: <IoMdCloseCircle className="w-4 h-4" /> };
      case "maintenance":
        return { circle: "bg-purple-100 text-purple-700", icon: <IoMdConstruct className="w-4 h-4" /> };
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

        <div className="mt-6 flex justify-between gap-2">
          <div className="mt-2 flex items-center gap-2">
            {announcement.date && (
              <span className="text-xs text-gray-500">Posted on {announcement.date}</span>
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
