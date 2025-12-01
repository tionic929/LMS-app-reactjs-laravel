import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { IoMdInformationCircle, IoMdWarning, IoMdCloseCircle, IoMdConstruct } from "react-icons/io";
import { IoIosAddCircle } from "react-icons/io";
import { ImFilesEmpty } from "react-icons/im";
import { FaEdit } from "react-icons/fa";
import AddAnnouncementModal from "../components/modals/AddAnnouncementModal";
import EditAnnouncementModal from "../components/modals/EditAnnouncementModal";
import ViewAnnouncementModal from "../components/modals/ViewAnnouncementModal";
import type { Announcement } from "../api/announcements";
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement as apiDeleteAnnouncement,
} from "../api/announcements";

const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();

  // Allow admins, instructors, and learners to access; others redirected
  // if (!user || !['admin', 'instructor', 'learner'].includes(user.role)) {
  //   return <Navigate to="/" replace />;
  // }
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add modal
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editType, setEditType] = useState("info");

  // View modal
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewAnnouncement, setViewAnnouncement] = useState<Announcement | null>(null);

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-100 text-blue-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeAccentBar = (type: string) => {
    switch (type) {
      case "info":
        return "border-l-4 border-blue-500";
      case "warning":
        return "border-l-4 border-yellow-500";
      case "error":
        return "border-l-4 border-red-500";
      case "maintenance":
        return "border-l-4 border-purple-500";
      default:
        return "border-l-4 border-gray-400";
    }
  };

  const getTypeDotClass = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-500";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      case "maintenance":
        return "bg-purple-500";
      default:
        return "bg-gray-400";
    }
  };

  const TypeIcon: React.FC<{ type: string }> = ({ type }) => {
    const common = "w-5 h-5";
    switch (type) {
      case "info":
        return <IoMdInformationCircle className={`${common} text-blue-600`} />;
      case "warning":
        return <IoMdWarning className={`${common} text-yellow-600`} />;
      case "error":
        return <IoMdCloseCircle className={`${common} text-red-600`} />;
      case "maintenance":
        return <IoMdConstruct className={`${common} text-purple-600`} />;
      default:
        return <IoMdInformationCircle className={`${common} text-gray-500`} />;
    }
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await listAnnouncements();
      setAnnouncements(items);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAnnouncement = async (id: number, payload: { title: string; content: string; type: string }) => {
    const updated = await updateAnnouncement(id, payload);
    if (updated) setAnnouncements((prev) => prev.map((p) => (p.id === id ? updated : p)));
    else await fetchAnnouncements();
  };

  const deleteAnnouncement = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await apiDeleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      // no-op
    }
  };

  const handleCreateAnnouncement = async (payload: { title: string; content: string; type: string }) => {
    const created = await createAnnouncement(payload);
    if (created) setAnnouncements((prev) => [created, ...prev]);
    else await fetchAnnouncements();
    setIsAddOpen(false);
  };

  const openView = (a: Announcement) => {
    setViewAnnouncement(a);
    setIsViewOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setEditId(a.id);
    setEditTitle(a.title);
    setEditContent(a.content);
    setEditType(a.type ?? "info");
    setIsEditOpen(true);
  };

  useEffect(() => {
    void fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Info", value: "info" },
    { label: "Warning", value: "warning" },
    { label: "Error", value: "error" },
    { label: "Maintenance", value: "maintenance" },
  ];

  const filteredAnnouncements = useMemo(() => {
    const q = query.trim().toLowerCase();
    return announcements.filter((a) => {
      const typeOk = activeFilter === "all" || a.type === activeFilter;
      if (!typeOk) return false;
      if (!q) return true;
      return (
        (a.title ?? "").toLowerCase().includes(q) ||
        (a.content ?? "").toLowerCase().includes(q)
      );
    });
  }, [announcements, activeFilter, query]);

  return (
    <main className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Announcements
        </h1>
        {user.role === "admin" && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
          >
            <IoIosAddCircle className="w-5 h-5" /> New Announcement
          </button>
        )}
      </div>

      {/* Explorer Bar */}
      <div className="rounded-2xl p-6 border border-transparent bg-gradient-to-r from-indigo-50 to-purple-50 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0 md:max-w-xl">
            <div className="relative">
              <svg className="absolute top-1/2 left-4 -translate-y-1/2 w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search announcements by title or content..."
                className="w-full pl-12 pr-4 py-3 rounded-full text-sm bg-white/80 backdrop-blur border border-indigo-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {filterOptions.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors border ${activeFilter === f.value
                    ? "bg-indigo-600 text-white border-indigo-600 shadow"
                    : "bg-white/70 text-gray-700 border-indigo-100 hover:bg-white"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <p className="text-sm text-gray-600">Loading announcements...</p>
          ) : error ? (
            <div className="text-sm text-red-600">
              <p className="mb-2">Error: {error}</p>
              <button onClick={() => void fetchAnnouncements()} className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
                Retry
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Showing {filteredAnnouncements.length} of {announcements.length} announcements
              {activeFilter !== "all" && ` (filtered by ${activeFilter})`}
              {query && ` (search: "${query}")`}
            </p>
          )}
        </div>
      </div>

      {/* Timeline List Design */}
      <div className="pt-6">
        {filteredAnnouncements.length === 0 ? (
          <div className="rounded-xl p-10 text-center text-gray-500 border border-dashed border-gray-300 bg-white/60">
            <ImFilesEmpty className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {query ? `No announcements match "${query}"` : `No ${activeFilter} announcements available`}
            </p>
            {(query || activeFilter !== "all") && (
              <button
                onClick={() => { setQuery(""); setActiveFilter("all"); }}
                className="mt-4 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-200 via-gray-200 to-transparent" aria-hidden="true" />
            <ul className="space-y-5">
              {filteredAnnouncements.map((announcement: Announcement) => (
                <li key={announcement.id} className="relative pl-12">
                  <span className={`absolute left-3 top-3 w-3 h-3 rounded-full ring-4 ring-white ${getTypeDotClass(announcement.type)}`} />
                  <article
                    onClick={() => openView(announcement)}
                    className={`cursor-pointer group rounded-xl bg-white border shadow-sm transition hover:shadow-md ${getTypeAccentBar(announcement.type)}`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 truncate">
                            {announcement.title}
                          </h3>
                        </div>
                        <div className="shrink-0">
                          <TypeIcon type={announcement.type} />
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-gray-700 line-clamp-3 whitespace-pre-wrap break-words">
                        {announcement.content}
                      </p>
                    </div>
                    <footer className="px-5 py-3 border-t bg-gray-50/60 flex items-center justify-between gap-2">
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {announcement.date && (
                          <span className="text-xs text-gray-500">Posted on {announcement.date}</span>
                        )}
                      </div>
                      {user.role === 'admin' && (
                        <div className='flex-1 align-right flex justify-end gap-4'>
                          <button
                            onClick={(e) => { e.stopPropagation(); openEdit(announcement); }}
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium inline-flex items-center gap-1"
                            title="Edit announcement"
                          >
                            <FaEdit className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); void deleteAnnouncement(announcement.id, announcement.title); }}
                            className="text-red-600 hover:text-red-700 text-sm font-medium inline-flex items-center gap-1"
                            title="Delete announcement"
                          >
                            <MdDelete className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      )}
                    </footer>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AddAnnouncementModal
        show={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleCreateAnnouncement}
      />

      {/* Edit Modal */}
      <EditAnnouncementModal
        show={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        announcement={editId ? { id: editId, title: editTitle, content: editContent, type: editType } : null}
        onSubmit={handleUpdateAnnouncement}
      />

      {/* View Modal */}
      <ViewAnnouncementModal
        show={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        announcement={viewAnnouncement}
        getTypeBadgeClass={getTypeBadgeClass}
      />
    </main>
  );
};

export default AnnouncementsPage;
