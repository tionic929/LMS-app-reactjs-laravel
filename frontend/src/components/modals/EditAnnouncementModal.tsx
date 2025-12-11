import React, { useEffect, useState } from "react";
import Modal from "./Modal";

export interface AnnouncementEntity {
  id: number;
  title: string;
  content: string;
  type: string;
  audience?: 'learners' | 'instructors' | 'all';
}

interface EditAnnouncementModalProps {
  show: boolean;
  announcement: AnnouncementEntity | null;
  onClose: () => void;
  onSubmit: (id: number, payload: { title: string; content: string; type: string; audience?: 'learners' | 'instructors' | 'all'; event_date?: string; event_time?: string; location?: string }) => Promise<void>;
}

const EditAnnouncementModal: React.FC<EditAnnouncementModalProps> = ({ show, announcement, onClose, onSubmit }) => {
  const [title, setTitle] = useState(announcement?.title ?? "");
  const [content, setContent] = useState(announcement?.content ?? "");
  const [type, setType] = useState(announcement?.type ?? "general");
  const [audience, setAudience] = useState<'learners' | 'instructors' | 'all'>(announcement?.audience ?? 'all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventDate, setEventDate] = useState<string>(announcement?.event_date ?? "");
  const [eventTime, setEventTime] = useState<string>(announcement?.event_time ?? "");
  const [location, setLocation] = useState<string>(announcement?.location ?? "");

  useEffect(() => {
    setTitle(announcement?.title ?? "");
    setContent(announcement?.content ?? "");
    setType(announcement?.type ?? "general");
    setAudience(announcement?.audience ?? 'all');
    setEventDate(announcement?.event_date ?? "");
    setEventTime(announcement?.event_time ?? "");
    setLocation(announcement?.location ?? "");
  }, [announcement]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement) return;

    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      const payload: { title: string; content: string; type: string; audience?: 'learners' | 'instructors' | 'all'; event_date?: string; event_time?: string; location?: string } = { title: title.trim(), content: content.trim(), type, audience };
      if (type === 'event') {
        if (!eventDate || !eventTime || !location.trim()) {
          setError("Event date, time, and location are required for Upcoming Event announcements");
          setLoading(false);
          return;
        }
        payload.event_date = eventDate;
        payload.event_time = eventTime;
        payload.location = location.trim();
      } else {
        payload.event_date = undefined;
        payload.event_time = undefined;
        payload.location = undefined;
      }
      await onSubmit(announcement.id, payload);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to update announcement";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} title="Edit Announcement">
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <form onSubmit={handleUpdate} className="space-y-3">
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
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditAnnouncementModal;
