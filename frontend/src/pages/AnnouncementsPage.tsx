import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { MdDelete, MdCampaign } from "react-icons/md";
import { IoMdInformationCircle, IoMdCalendar } from "react-icons/io";
import { IoIosAddCircle } from "react-icons/io";
import { ImFilesEmpty } from "react-icons/im";
import { FaEdit } from "react-icons/fa";
import AddAnnouncementModal from "../components/modals/AddAnnouncementModal";
import EditAnnouncementModal from "../components/modals/EditAnnouncementModal";
import ViewAnnouncementModal from "../components/modals/ViewAnnouncementModal";
import type { Announcement } from "../api/announcements";
import { toast } from 'react-toastify';
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
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'learners' | 'instructors'>('all');

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
  const [editType, setEditType] = useState("general");
  const [editAudience, setEditAudience] = useState<'learners' | 'instructors' | 'all'>('all');

  // View modal
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewAnnouncement, setViewAnnouncement] = useState<Announcement | null>(null);

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case "news":
        return "bg-indigo-100 text-indigo-800";
      case "general":
        return "bg-gray-100 text-gray-800";
      case "event":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeAccentBar = (type: string) => {
    switch (type) {
      case "news":
        return "border-l-4 border-indigo-500";
      case "general":
        return "border-l-4 border-gray-400";
      case "event":
        return "border-l-4 border-emerald-500";
      default:
        return "border-l-4 border-gray-400";
    }
  };

  const TypeIcon: React.FC<{ type: string }> = ({ type }) => {
    const common = "w-5 h-5";
    switch (type) {
      case "news":
        return <MdCampaign className={`${common} text-indigo-600`} />;
      case "event":
        return <IoMdCalendar className={`${common} text-emerald-600`} />;
      case "general":
      default:
        return <IoMdInformationCircle className={`${common} text-gray-600`} />;
    }
  };

  const canCreate = user?.role === "admin" || user?.role === "instructor";
  const canModerateAnnouncement = (a: Announcement) =>
    user?.role === "admin" ||
    (user?.role === "instructor" && Number((a as any).created_by) === user.id);

  const audienceLabel = (aud?: "learners" | "instructors" | "all") => {
    if (!aud || aud === "all") return "All";
    if (aud === "learners") return "Learners";
    return "Instructors";
  };

  // Feed card renderer
  const renderCard = (announcement: Announcement) => {
    const contentText = ((announcement as any)?.content ?? "").toString().trim();
    const preview = contentText.length > 260 ? `${contentText.slice(0, 260)}…` : contentText;
    const audience = (announcement as any).audience as "learners" | "instructors" | "all" | undefined;

    const hasEventDetails =
      announcement.type === "event" &&
      (((announcement as any).event_date || (announcement as any).event_time || (announcement as any).location) as any);

    return (
      <article
        onClick={() => openView(announcement)}
        className={`cursor-pointer group rounded-xl bg-white border shadow-sm transition hover:shadow-md ${getTypeAccentBar(announcement.type)}`}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getTypeBadgeClass(
                    announcement.type
                  )}`}
                >
                  <TypeIcon type={announcement.type} />
                  {announcement.type === "event"
                    ? "Event"
                    : announcement.type === "news"
                      ? "News"
                      : "General"}
                </span>
                {user?.role === "admin" ? (
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-purple-50 text-purple-800 border border-purple-100">
                    Audience: {audienceLabel(audience)}
                  </span>
                ) : null}
              </div>

              <h3 className="mt-2 text-lg font-semibold text-gray-900 break-words">
                {announcement.title}
              </h3>
            </div>

            {canModerateAnnouncement(announcement) ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(announcement);
                  }}
                  className="rounded-lg border border-indigo-100 bg-white px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                  title="Edit announcement"
                >
                  <span className="inline-flex items-center gap-2">
                    <FaEdit className="w-4 h-4" /> Edit
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void deleteAnnouncement(announcement.id, announcement.title);
                  }}
                  className="rounded-lg border border-red-100 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                  title="Delete announcement"
                >
                  <span className="inline-flex items-center gap-2">
                    <MdDelete className="w-4 h-4" /> Delete
                  </span>
                </button>
              </div>
            ) : null}
          </div>

          <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap break-words">
            {preview || <span className="text-gray-400">No content</span>}
            {contentText.length > 260 ? (
              <span className="ml-1 text-indigo-700 font-medium">Read more</span>
            ) : null}
          </div>

          {hasEventDetails ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              {(announcement as any).event_date ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-emerald-800">
                  <IoMdCalendar className="w-4 h-4" />
                  {(announcement as any).event_date}
                </span>
              ) : null}
              {(announcement as any).event_time ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-emerald-800">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 8v5l3 1"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  {(announcement as any).event_time}
                </span>
              ) : null}
              {(announcement as any).location ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-emerald-800">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 21s7-7.333 7-12a7 7 0 10-14 0c0 4.667 7 12 7 12z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  {(announcement as any).location}
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-600">
            <span>
              Posted by {(announcement as any)?.creator?.name ?? `User #${(announcement as any)?.created_by ?? "N/A"}`}
            </span>
            {announcement.date ? <span>Posted on {announcement.date}</span> : null}
          </div>
        </div>
      </article>
    );
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

  const handleUpdateAnnouncement = async (
    id: number,
    payload: { title: string; content: string; type: string; audience?: 'learners' | 'instructors' | 'all'; event_date?: string; event_time?: string; location?: string }
  ) => {
    const result = await updateAnnouncement(id, payload);
    if (result?.announcement) {
      setAnnouncements((prev) => prev.map((p) => (p.id === id ? result.announcement! : p)));
    } else {
      await fetchAnnouncements();
    }

    if (result?.message) {
      toast.success(result.message, { position: 'top-right' });
    }
  };

  const deleteAnnouncement = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const msg = await apiDeleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      if (msg) toast.success(msg, { position: 'top-right' });
    } catch (e) {
      const backendMsg = (e as any)?.response?.data?.message;
      if (backendMsg) toast.error(backendMsg, { position: 'top-right' });
    }
  };

  const handleCreateAnnouncement = async (payload: { title: string; content: string; type: string; audience: 'learners' | 'instructors' | 'all'; event_date?: string; event_time?: string; location?: string }) => {
    const result = await createAnnouncement(payload);
    if (result?.announcement) {
      setAnnouncements((prev) => [result.announcement!, ...prev]);
    } else {
      await fetchAnnouncements();
    }

    if (result?.message) {
      toast.success(result.message, { position: 'top-right' });
    }

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
    setEditType(a.type ?? "general");
    setEditAudience((a as any).audience ?? 'all');
    setIsEditOpen(true);
  };

  useEffect(() => {
    void fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const audienceOptions = [
    { label: "All audiences", value: 'all' },
    { label: "Learners", value: 'learners' },
    { label: "Instructors", value: 'instructors' },
  ];

  const filteredAnnouncements = useMemo(() => {
    const q = query.trim().toLowerCase();
    return announcements.filter((a) => {
      const typeOk = activeFilter === "all" || a.type === activeFilter;
      if (!typeOk) return false;
      // role visibility
      const audience = (a as any).audience as 'learners' | 'instructors' | 'all' | undefined;
      if (user?.role === 'learner' && audience && audience !== 'learners' && audience !== 'all') return false;
      if (user?.role === 'instructor' && audience && audience !== 'instructors' && audience !== 'all') return false;
      // admin audience filter
      if (user?.role === 'admin' && audienceFilter !== 'all' && audience && audience !== audienceFilter) return false;
      if (!q) return true;
      return (
        (a.title ?? "").toLowerCase().includes(q) ||
        (a.content ?? "").toLowerCase().includes(q)
      );
    });
  }, [announcements, activeFilter, query, user?.role, audienceFilter]);

  const newsAnnouncements = filteredAnnouncements.filter((a) => a.type === "news");
  const eventAnnouncements = filteredAnnouncements.filter((a) => a.type === "event");
  const generalAnnouncements = filteredAnnouncements.filter((a) => a.type === "general");

  const clearAllFilters = () => {
    setQuery("");
    setActiveFilter("all");
    setAudienceFilter("all");
  };

  return (
    <main className="max-w-7xl mx-auto p-6">
      <header className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
            <p className="mt-1 text-sm text-gray-600">
              Latest updates, news, and upcoming events for learners and instructors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canCreate ? (
              <button
                onClick={() => setIsAddOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
              >
                <IoIosAddCircle className="w-5 h-5" /> New Announcement
              </button>
            ) : null}
            <button
              onClick={() => void fetchAnnouncements()}
              className="inline-flex items-center rounded-lg border border-indigo-100 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
              title="Refresh announcements"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Overview */}
      {loading ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </section>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="text-xs font-medium text-gray-500">Visible</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{filteredAnnouncements.length}</div>
            <div className="mt-1 text-xs text-gray-600">of {announcements.length} total announcements</div>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="text-xs font-medium text-indigo-700 inline-flex items-center gap-2">
              <MdCampaign className="w-4 h-4" /> News
            </div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{newsAnnouncements.length}</div>
            <div className="mt-1 text-xs text-gray-600">Updates and important notices</div>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="text-xs font-medium text-emerald-700 inline-flex items-center gap-2">
              <IoMdCalendar className="w-4 h-4" /> Events
            </div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{eventAnnouncements.length}</div>
            <div className="mt-1 text-xs text-gray-600">Upcoming schedules and sessions</div>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="text-xs font-medium text-gray-700 inline-flex items-center gap-2">
              <IoMdInformationCircle className="w-4 h-4" /> General
            </div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{generalAnnouncements.length}</div>
            <div className="mt-1 text-xs text-gray-600">General announcements and reminders</div>
          </div>
        </section>
      )}

      {/* Content */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8">
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="p-5 border-b">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Announcement Feed</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Click any item to view full details.
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredAnnouncements.length}</span> of {announcements.length}
                </div>
              </div>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-xl bg-white border shadow-sm border-l-4 border-gray-300">
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                              <div className="h-5 bg-gray-200 rounded-full w-28"></div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-full"></div>
                              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-9 w-20 bg-gray-200 rounded-lg"></div>
                            <div className="h-9 w-24 bg-gray-200 rounded-lg"></div>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <div className="h-6 bg-gray-200 rounded-full w-32"></div>
                          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                        </div>
                        <div className="mt-4 flex gap-4">
                          <div className="h-3 bg-gray-200 rounded w-28"></div>
                          <div className="h-3 bg-gray-200 rounded w-32"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-sm text-red-600">
                  <p className="mb-2">Error: {error}</p>
                  <button
                    onClick={() => void fetchAnnouncements()}
                    className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredAnnouncements.length === 0 ? (
                <div className="rounded-xl p-10 text-center text-gray-500 border border-dashed border-gray-300 bg-white/60">
                  <ImFilesEmpty className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {query ? `No announcements match "${query}"` : `No ${activeFilter} announcements available`}
                  </p>
                  {(query || activeFilter !== "all" || (user?.role === "admin" && audienceFilter !== "all")) ? (
                    <button
                      onClick={clearAllFilters}
                      className="mt-4 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                    >
                      Clear filters
                    </button>
                  ) : null}
                </div>
              ) : (
                <ul className="space-y-4">
                  {filteredAnnouncements.map((announcement) => (
                    <li key={announcement.id}>{renderCard(announcement)}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <aside className="lg:col-span-4 space-y-6">
          {/* Filters */}
          <section className="rounded-xl border bg-white shadow-sm">
            <div className="p-5 border-b">
              <h3 className="text-base font-semibold text-gray-900">Filters</h3>
              <p className="mt-1 text-sm text-gray-600">Narrow down what you see.</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-800">Search</label>
                <div className="mt-2 relative">
                  <svg
                    className="absolute top-1/2 left-4 -translate-y-1/2 w-5 h-5 text-indigo-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by title or content..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl text-sm bg-white border border-indigo-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-800">Type</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { label: "All", value: "all" },
                    { label: "News", value: "news" },
                    { label: "Events", value: "event" },
                    { label: "General", value: "general" },
                  ].map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setActiveFilter(f.value)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors border ${
                        activeFilter === f.value
                          ? "bg-indigo-600 text-white border-indigo-600 shadow"
                          : "bg-white text-gray-700 border-indigo-100 hover:bg-indigo-50"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {user?.role === "admin" ? (
                <div>
                  <div className="text-sm font-medium text-gray-800">Audience</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {audienceOptions.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setAudienceFilter(f.value as any)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors border ${
                          audienceFilter === f.value
                            ? "bg-purple-600 text-white border-purple-600 shadow"
                            : "bg-white text-gray-700 border-indigo-100 hover:bg-indigo-50"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="flex items-center justify-between">
                <button
                  onClick={clearAllFilters}
                  className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
                >
                  Clear all
                </button>
                <div className="text-xs text-gray-500">
                  {activeFilter !== "all" ? `Type: ${activeFilter}` : "Type: all"}
                  {query ? ` • Query: “${query.trim()}”` : ""}
                  {user?.role === "admin" && audienceFilter !== "all" ? ` • Audience: ${audienceFilter}` : ""}
                </div>
              </div>
            </div>
          </section>

          {/* Upcoming events */}
          <section className="rounded-xl border bg-white shadow-sm">
            <div className="p-5 border-b flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900 inline-flex items-center gap-2">
                  <IoMdCalendar className="w-5 h-5 text-emerald-700" /> Upcoming events
                </h3>
                <p className="mt-1 text-sm text-gray-600">Quick look at event announcements.</p>
              </div>
              <button
                onClick={() => setActiveFilter("event")}
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                View all
              </button>
            </div>
            <div className="p-5">
              {eventAnnouncements.length === 0 ? (
                <p className="text-sm text-gray-600">No upcoming events right now.</p>
              ) : (
                <ul className="space-y-3">
                  {eventAnnouncements.slice(0, 3).map((a) => (
                    <li key={a.id}>
                      <button
                        onClick={() => openView(a)}
                        className="w-full text-left rounded-lg border border-emerald-100 bg-emerald-50/50 p-4 hover:bg-emerald-50"
                      >
                        <div className="text-sm font-semibold text-gray-900">{a.title}</div>
                        <div className="mt-1 text-xs text-gray-600">
                          {(a as any).event_date ? `Date: ${(a as any).event_date}` : ""}
                          {(a as any).event_time ? ` • Time: ${(a as any).event_time}` : ""}
                          {(a as any).location ? ` • Location: ${(a as any).location}` : ""}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Viewer context */}
          <section className="rounded-xl border bg-white shadow-sm">
            <div className="p-5">
              <div className="text-sm font-semibold text-gray-900">Viewing as</div>
              <div className="mt-1 text-sm text-gray-700">
                {user?.role ? user.role : "Guest"}
              </div>
              <div className="mt-3 text-xs text-gray-600">
                {user?.role === "admin"
                  ? "Admins can create, edit, and delete any announcement, and filter by audience."
                  : user?.role === "instructor"
                    ? "Instructors can create announcements and manage their own posts."
                    : "Learners can view announcements relevant to them."}
              </div>
            </div>
          </section>
        </aside>
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
        announcement={editId ? { id: editId, title: editTitle, content: editContent, type: editType, audience: editAudience } : null}
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
