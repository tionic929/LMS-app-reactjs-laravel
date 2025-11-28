import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { MdAnnouncement, MdDelete } from "react-icons/md";
import { IoIosAddCircle } from "react-icons/io";
import { ImFilesEmpty } from "react-icons/im";
import { FaEdit } from "react-icons/fa";

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  date?: string;
  created_at?: string;
}

const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();

  // Only admins can access this page
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState("info");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editType, setEditType] = useState("info");
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const client = axios.create({ baseURL: "http://localhost:8000/api", withCredentials: true });
  client.defaults.xsrfCookieName = "XSRF-TOKEN";
  client.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

  const ensureCsrf = async () => {
    try {
      await axios.get("http://localhost:8000/sanctum/csrf-cookie", { withCredentials: true });

      const getCookie = (name: string) => {
        const match = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]*)"));
        return match ? decodeURIComponent(match[2]) : null;
      };

      const xsrf = getCookie("XSRF-TOKEN");

      if (xsrf) {
        client.defaults.headers.common["X-XSRF-TOKEN"] = xsrf;
      }

      // Debug only in development
      // eslint-disable-next-line no-console
      console.debug("ensureCsrf: XSRF cookie=", xsrf, "client header=", client.defaults.headers.common["X-XSRF-TOKEN"]);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.debug("Failed to fetch CSRF cookie via /sanctum/csrf-cookie", e);
    }
  };

  const getAnnouncementStyles = (type: string) => {
    switch (type) {
      case "info":
        return {
          headerColor: "bg-blue-500",
          borderColor: "border-blue-500",
          badgeColor: "bg-blue-700",
          badgeTextColor: "text-blue-100",
        };

      case "warning":
        return {
          headerColor: "bg-yellow-500",
          borderColor: "border-yellow-500",
          badgeColor: "bg-yellow-600",
          badgeTextColor: "text-yellow-100",
        };

      case "success":
        return {
          headerColor: "bg-green-500",
          borderColor: "border-green-500",
          badgeColor: "bg-green-700",
          badgeTextColor: "text-green-100",
        };

      default:
        return {
          headerColor: "bg-gray-500",
          borderColor: "border-gray-500",
          badgeColor: "bg-gray-700",
          badgeTextColor: "text-gray-100",
        };
    }
  };

  // Normalize various response shapes into Announcement[]
  const normalizeAnnouncements = (raw: any): Announcement[] => {
    if (!raw) return [];

    let arr: any[] = [];

    if (Array.isArray(raw)) arr = raw;
    else if (Array.isArray(raw.data)) arr = raw.data;
    else if (Array.isArray(raw.announcements)) arr = raw.announcements;
    else if (raw && typeof raw === "object") {
      if (raw.data && !Array.isArray(raw.data) && typeof raw.data === "object") arr = [raw.data];
      else arr = [raw];
    }

    return arr.map((a: any) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      type: a.type ?? "info",
      date: a.date ?? (a.created_at ? new Date(a.created_at).toLocaleDateString() : undefined),
      created_at: a.created_at,
    }));
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await client.get("/announcements");
      const data = normalizeAnnouncements(res.data);
      setAnnouncements(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createAnnouncement = async () => {
    setCreateError(null);

    if (!newTitle.trim() || !newContent.trim()) {
      setCreateError("Title and content are required");
      return;
    }

    setCreating(true);

    try {
      const payload = { title: newTitle.trim(), content: newContent.trim(), type: newType };
      await ensureCsrf();

      const res = await client.post("/announcements", payload);
      const created = normalizeAnnouncements(res.data)[0];

      if (created) setAnnouncements((prev) => [created, ...prev]);
      else void fetchAnnouncements();

      setNewTitle("");
      setNewContent("");
      setNewType("info");
      setIsAddOpen(false);
    } catch (err: any) {
      setCreateError(err?.response?.data?.message ?? err?.message ?? "Failed to create announcement");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (a: Announcement) => {
    setEditId(a.id);
    setEditTitle(a.title);
    setEditContent(a.content);
    setEditType(a.type ?? "info");
    setEditError(null);
    setIsEditOpen(true);
  };

  const updateAnnouncement = async () => {
    if (!editId) return;

    setEditError(null);

    if (!editTitle.trim() || !editContent.trim()) {
      setEditError("Title and content are required");
      return;
    }

    setEditing(true);

    try {
      const payload = { title: editTitle.trim(), content: editContent.trim(), type: editType };
      await ensureCsrf();

      const res = await client.put(`/announcements/${editId}`, payload);
      const updated = normalizeAnnouncements(res.data)[0];

      if (updated) setAnnouncements((prev) => prev.map((p) => (p.id === editId ? updated : p)));
      else void fetchAnnouncements();

      setIsEditOpen(false);
      setEditId(null);
    } catch (err: any) {
      setEditError(err?.response?.data?.message ?? err?.message ?? "Failed to update announcement");
    } finally {
      setEditing(false);
    }
  };

  const deleteAnnouncement = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await ensureCsrf();
      await client.delete(`/announcements/${id}`);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message ?? err?.message ?? "Failed to delete announcement");
    }
  };

  const filterOptions = [
    { label: "All", value: "all", color: "gray" },
    { label: "Info", value: "info", color: "blue" },
    { label: "Warning", value: "warning", color: "yellow" },
    { label: "Success", value: "success", color: "green" },
  ];

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesFilter = activeFilter === "all" || announcement.type === activeFilter;
    const matchesSearch =
      announcement.title.toLowerCase().includes(query.toLowerCase()) || announcement.content.toLowerCase().includes(query.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Announcements</h1>
            <p className="text-sm text-gray-500">Stay updated with the latest news and updates</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search announcements..."
              className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              title="filter"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[100px]"
            >
              {filterOptions.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsAddOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium shadow-sm"
            >
              <IoIosAddCircle className="h-4 w-4" />
              Add Announcement
            </button>
          </div>
        </div>

        <div className="mb-4">
          {loading ? (
            <p className="text-sm text-gray-600">Loading announcements...</p>
          ) : error ? (
            <div className="text-sm text-red-600">
              <p className="mb-2">Error: {error}</p>
              <button onClick={() => void fetchAnnouncements()} className="text-blue-500 hover:text-blue-600 text-sm font-medium">
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

        <div className="flex flex-col gap-6">
          {filteredAnnouncements.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <ImFilesEmpty className="mx-auto h-12 w-12" />
              </div>

              <div className="mx-auto max-w-md">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
                <p className="text-gray-500">{query ? `No announcements match "${query}"` : `No ${activeFilter} announcements available`}</p>

                {(query || activeFilter !== "all") && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setActiveFilter("all");
                    }}
                    className="mt-4 text-blue-500 hover:text-blue-600 text-sm font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredAnnouncements.map((announcement: Announcement) => {
              const styles = getAnnouncementStyles(announcement.type);

              return (
                <div
                  key={announcement.id}
                  className={`w-full bg-white rounded-lg shadow-xl hover:shadow-2xl border-b-4 ${styles.borderColor} overflow-hidden flex flex-col`}
                >
                  <div className="flex-1">
                    <div className={`${styles.headerColor} text-white px-6 py-4 rounded-t-lg`}>
                      <div className="flex items-center justify-center">
                        <MdAnnouncement className="h-12 w-12 mr-4" />
                        <h2 className="text-xl font-semibold break-words">{announcement.title}</h2>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex gap-2 mb-3">
                        <span className={`${styles.badgeColor} ${styles.badgeTextColor} px-2 py-1 rounded-full text-xs font-medium capitalize`}>
                          {announcement.type}
                        </span>
                      </div>

                      <div className="mb-3">
                        <p className="text-gray-600 whitespace-pre-wrap break-words max-h-40 overflow-auto">{announcement.content}</p>
                      </div>

                      <div className="flex justify-end">
                        <span className="text-xs text-gray-500">Posted on {announcement.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(announcement);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors duration-200 border-r border-gray-200"
                      title="Edit announcement"
                    >
                      <FaEdit className="h-4 w-4" />
                      <span className="text-sm font-medium">Edit</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void deleteAnnouncement(announcement.id, announcement.title);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors duration-200"
                      title="Delete announcement"
                    >
                      <MdDelete className="h-4 w-4" />
                      <span className="text-sm font-medium">Delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add Modal */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-40" onClick={() => setIsAddOpen(false)} />
            <div className="bg-white rounded-lg shadow-xl z-10 w-full max-w-lg mx-4">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium">Create Announcement</h3>
              </div>

              <div className="p-6">
                {createError && <p className="text-sm text-red-600 mb-3">{createError}</p>}

                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="mt-1 mb-3 block w-full rounded-md border border-gray-200 px-3 py-2" />

                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} className="mt-1 mb-3 block w-full rounded-md border border-gray-200 px-3 py-2" rows={4} />

                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select value={newType} onChange={(e) => setNewType(e.target.value)} className="mt-1 mb-3 block w-full rounded-md border border-gray-200 px-3 py-2">
                  {filterOptions.filter((f) => f.value !== "all").map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>

                <div className="flex justify-end gap-2">
                  <button onClick={() => setIsAddOpen(false)} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm" disabled={creating}>
                    Cancel
                  </button>

                  <button onClick={() => void createAnnouncement()} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm" disabled={creating}>
                    {creating ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-40" onClick={() => setIsEditOpen(false)} />
            <div className="bg-white rounded-lg shadow-xl z-10 w-full max-w-lg mx-4">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium">Edit Announcement</h3>
              </div>

              <div className="p-6">
                {editError && <p className="text-sm text-red-600 mb-3">{editError}</p>}

                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="mt-1 mb-3 block w-full rounded-md border border-gray-200 px-3 py-2" />

                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="mt-1 mb-3 block w-full rounded-md border border-gray-200 px-3 py-2" rows={4} />

                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select value={editType} onChange={(e) => setEditType(e.target.value)} className="mt-1 mb-3 block w-full rounded-md border border-gray-200 px-3 py-2">
                  {filterOptions.filter((f) => f.value !== "all").map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>

                <div className="flex justify-end gap-2">
                  <button onClick={() => setIsEditOpen(false)} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm" disabled={editing}>
                    Cancel
                  </button>

                  <button onClick={() => void updateAnnouncement()} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm" disabled={editing}>
                    {editing ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AnnouncementsPage;
