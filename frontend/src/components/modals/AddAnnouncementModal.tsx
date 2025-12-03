import React, { useState } from "react";
import Modal from "./Modal";

export interface AnnouncementForm {
  title: string;
  content: string;
  type: string;
  audience: 'learners' | 'instructors' | 'all';
  event_date?: string;
  event_time?: string;
  location?: string;
}

interface AddAnnouncementModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (payload: AnnouncementForm) => Promise<void>;
}

const AddAnnouncementModal: React.FC<AddAnnouncementModalProps> = ({ show, onClose, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("general");
  const [audience, setAudience] = useState<'learners' | 'instructors' | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventDate, setEventDate] = useState<string>("");
  const [eventTime, setEventTime] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      const payload: AnnouncementForm = { title: title.trim(), content: content.trim(), type, audience };
      if (type === 'event') {
        if (!eventDate || !eventTime || !location.trim()) {
          setError("Event date, time, and location are required for Upcoming Event announcements");
          setLoading(false);
          return;
        }
        payload.event_date = eventDate;
        payload.event_time = eventTime;
        payload.location = location.trim();
      }
      await onSubmit(payload);
      setTitle("");
      setContent("");
      setType("general");
      setAudience('all');
      setEventDate("");
      setEventTime("");
      setLocation("");
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to create announcement";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} title="Create Announcement">
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <form onSubmit={handleCreate} className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <label className="block text-sm font-medium text-gray-700">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="general">General</option>
          <option value="news">News</option>
          <option value="event">Upcoming Event</option>
        </select>

        {type === 'event' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Event Date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Event Time</label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Room 204, Zoom link"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </>
        )}

        <label className="block text-sm font-medium text-gray-700">Audience</label>
        <select
          value={audience}
          onChange={(e) => setAudience(e.target.value as 'learners' | 'instructors' | 'all')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">All</option>
          <option value="learners">Learners</option>
          <option value="instructors">Instructors</option>
        </select>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm disabled:opacity-50">
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddAnnouncementModal;
