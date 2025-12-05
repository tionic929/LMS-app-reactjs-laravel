import React, { useEffect, useMemo, useRef, useState } from "react";
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

  // Card renderer extracted for reuse in each column
  const renderCard = (announcement: Announcement) => (
    <article
      onClick={() => openView(announcement)}
      className={`cursor-pointer group rounded-xl bg-white border shadow-sm transition hover:shadow-md ${getTypeAccentBar(announcement.type)} h-80 flex flex-col`}
    >
      <div className="p-5 flex-1 overflow-hidden flex flex-col min-h-0">
        {/* Card header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">
              {announcement.title}
            </h3>
            <div className="mt-1">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getTypeBadgeClass(announcement.type)}`}>
                <TypeIcon type={announcement.type} />
                {announcement.type === 'event' ? 'Upcoming Event' : announcement.type === 'news' ? 'News' : 'General'}
              </span>
            </div>
          </div>
        </div>
        {/* Card body */}
        <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap break-words pr-1 flex-1 min-h-0">
          {announcement.content}
        </div>
        {announcement.type === 'event' && ((announcement as any).event_date || (announcement as any).event_time || (announcement as any).location) && (
          <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            <div className="font-medium mb-2">Event Details</div>
            {(announcement as any).event_date && (
              <div className="flex items-center gap-2">
                <IoMdCalendar className="w-4 h-4" />
                <span className="font-medium">Date:</span> {(announcement as any).event_date}
              </div>
            )}
            {(announcement as any).event_time && (
              <div className="flex items-center gap-2">
                {/* clock icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 8v5l3 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /></svg>
                <span className="font-medium">Time:</span> {(announcement as any).event_time}
              </div>
            )}
            {(announcement as any).location && (
              <div className="flex items-center gap-2">
                {/* map-pin icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s7-7.333 7-12a7 7 0 10-14 0c0 4.667 7 12 7 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" /></svg>
                <span className="font-medium">Location:</span> {(announcement as any).location}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Card footer */}
      <footer className="px-5 py-3 border-t bg-gray-50/60 flex items-center justify-between gap-2">
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {announcement.date && (
            <span className="text-xs text-gray-500">Posted on {announcement.date}</span>
          )}
          {user?.role === 'admin' && (announcement as any) && (
            <span className="text-xs text-gray-500">Audience: {(announcement as any).audience === 'all' ? 'All' : (announcement as any).audience === 'learners' ? 'Learners' : 'Instructors'}</span>
          )}
        </div>
        {user?.role === 'admin' && (
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
  );

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

  const handleCreateAnnouncement = async (payload: { title: string; content: string; type: string; audience: 'learners' | 'instructors' | 'all'; event_date?: string; event_time?: string; location?: string }) => {
    const created = await createAnnouncement(payload);
    if (created) setAnnouncements((prev) => [created, ...prev]);
    else await fetchAnnouncements();
    setIsAddOpen(false);
  };

  const openView = (a: Announcement) => {
    setViewAnnouncement(a);
    setIsViewOpen(true);
    stopAutoScrollImmediately();
  };

  const openEdit = (a: Announcement) => {
    setEditId(a.id);
    setEditTitle(a.title);
    setEditContent(a.content);
    setEditType(a.type ?? "general");
    setEditAudience((a as any).audience ?? 'all');
    setIsEditOpen(true);
    stopAutoScrollImmediately();
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

  // Split into columns by type
  const newsAnnouncements = filteredAnnouncements.filter((a) => a.type === 'news');
  const eventAnnouncements = filteredAnnouncements.filter((a) => a.type === 'event');
  const generalAnnouncements = filteredAnnouncements.filter((a) => a.type === 'general');

  // Detect if last item is fully visible
  const isLastFullyVisible = (el: HTMLUListElement) => {
    const containerRect = el.getBoundingClientRect();
    const lastItem = el.lastElementChild as HTMLElement | null;
    if (!lastItem) return false;
    const lastItemRect = lastItem.getBoundingClientRect();
    return lastItemRect.bottom <= containerRect.bottom + 0.5;
  };

  // Only scroll to top when user attempts to scroll further AFTER reaching bottom
  const handleWheelAutoScroll: React.WheelEventHandler<HTMLUListElement> = (e) => {
    const el = e.currentTarget as HTMLUListElement;
    const lastVisible = isLastFullyVisible(el);
    const tryingToScrollDown = e.deltaY > 0;

    if (lastVisible && tryingToScrollDown) {
      // Prevent default scroll and jump to top smoothly
      e.preventDefault();
      el.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Continuous auto-scroll setup per list (always active)
  const newsListRef = useRef<HTMLUListElement | null>(null);
  const eventsListRef = useRef<HTMLUListElement | null>(null);
  const generalListRef = useRef<HTMLUListElement | null>(null);

  const newsPausedRef = useRef<boolean>(false);
  const eventsPausedRef = useRef<boolean>(false);
  const generalPausedRef = useRef<boolean>(false);

  const newsTimerRef = useRef<number | null>(null);
  const eventsTimerRef = useRef<number | null>(null);
  const generalTimerRef = useRef<number | null>(null);

  const newsIndexRef = useRef<number>(0);
  const eventsIndexRef = useRef<number>(0);
  const generalIndexRef = useRef<number>(0);

  const pausedAllRef = useRef<boolean>(false);

  const stopAutoScrollImmediately = () => {
    pausedAllRef.current = true;
    if (newsTimerRef.current) { window.clearTimeout(newsTimerRef.current); newsTimerRef.current = null; }
    if (eventsTimerRef.current) { window.clearTimeout(eventsTimerRef.current); eventsTimerRef.current = null; }
    if (generalTimerRef.current) { window.clearTimeout(generalTimerRef.current); generalTimerRef.current = null; }
  };

  const CARD_DWELL_MS = 5000; // delay before moving to next card

  const queueAutoScroll = (
    el: HTMLUListElement,
    pausedRef: React.MutableRefObject<boolean>,
    timerRef: React.MutableRefObject<number | null>,
    indexRef: React.MutableRefObject<number>,
  ) => {
    // if paused, reschedule shortly without moving
    if (pausedRef.current || pausedAllRef.current) {
      timerRef.current = window.setTimeout(() => queueAutoScroll(el, pausedRef, timerRef, indexRef), 300);
      return;
    }

    timerRef.current = window.setTimeout(() => {
      const children = Array.from(el.children) as HTMLElement[];
      if (children.length === 0) return;

      // Compute next index deterministically to avoid snapping oscillation
      const nextIndex = (indexRef.current + 1) % children.length;
      const nextEl = children[nextIndex];

      // Temporarily disable scroll snap while programmatically scrolling
      const previousSnap = el.style.scrollSnapType;
      el.style.scrollSnapType = 'none';

      nextEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Restore snap after a short delay (matches smooth duration)
      window.setTimeout(() => {
        el.style.scrollSnapType = previousSnap || '';
      }, 500);

      // Advance index for next tick
      indexRef.current = nextIndex;

      // Schedule next movement again to keep it continuous
      queueAutoScroll(el, pausedRef, timerRef, indexRef);
    }, CARD_DWELL_MS);
  };

  useEffect(() => {
    // Start auto-scroll loops when lists are rendered
    // Reset indices when list sizes change
    newsIndexRef.current = 0;
    eventsIndexRef.current = 0;
    generalIndexRef.current = 0;

    if (newsListRef.current) queueAutoScroll(newsListRef.current, newsPausedRef, newsTimerRef, newsIndexRef);
    if (eventsListRef.current) queueAutoScroll(eventsListRef.current, eventsPausedRef, eventsTimerRef, eventsIndexRef);
    if (generalListRef.current) queueAutoScroll(generalListRef.current, generalPausedRef, generalTimerRef, generalIndexRef);
    // Cleanup timers on unmount or list changes
    return () => {
      if (newsTimerRef.current) window.clearTimeout(newsTimerRef.current);
      if (eventsTimerRef.current) window.clearTimeout(eventsTimerRef.current);
      if (generalTimerRef.current) window.clearTimeout(generalTimerRef.current);
    };
  }, [newsAnnouncements.length, eventAnnouncements.length, generalAnnouncements.length]);

  // Keep global pause synced with modal visibility
  useEffect(() => {
    pausedAllRef.current = isViewOpen || isEditOpen;
  }, [isViewOpen, isEditOpen]);

  // Resume auto-scroll when modals close (and timers were cleared)
  useEffect(() => {
    const shouldResume = !isViewOpen && !isEditOpen;
    if (!shouldResume) return;

    if (newsListRef.current && !newsTimerRef.current) {
      queueAutoScroll(newsListRef.current, newsPausedRef, newsTimerRef, newsIndexRef);
    }
    if (eventsListRef.current && !eventsTimerRef.current) {
      queueAutoScroll(eventsListRef.current, eventsPausedRef, eventsTimerRef, eventsIndexRef);
    }
    if (generalListRef.current && !generalTimerRef.current) {
      queueAutoScroll(generalListRef.current, generalPausedRef, generalTimerRef, generalIndexRef);
    }
  }, [isViewOpen, isEditOpen]);

  // Hover handlers to pause/resume auto-scroll immediately per list
  const makeHoverHandlers = (
    pausedRef: React.MutableRefObject<boolean>,
    timerRef: React.MutableRefObject<number | null>,
    listRef: React.MutableRefObject<HTMLUListElement | null>,
    indexRef: React.MutableRefObject<number>
  ) => ({
    onMouseEnter: () => {
      // Mark paused and cancel any pending movement immediately
      pausedRef.current = true;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    },
    onMouseLeave: () => {
      // Resume if not globally paused and no timer scheduled
      pausedRef.current = false;
      if (!pausedAllRef.current && listRef.current && !timerRef.current) {
        queueAutoScroll(listRef.current, pausedRef, timerRef, indexRef);
      }
    },
  });

  return (
    <main className="max-w-7xl mx-auto p-6">
      <header className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
            <p className="mt-1 text-sm text-gray-600">Latest updates, news, and upcoming events for learners and instructors.</p>
          </div>
          <div className="flex flex-col items-end gap-3 w-full max-w-3xl">
            {user?.role === "admin" && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
                >
                  <IoIosAddCircle className="w-5 h-5" /> New Announcement
                </button>
                <div className="flex items-center gap-1">
                  {audienceOptions.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setAudienceFilter(f.value as any)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors border ${audienceFilter === f.value
                        ? "bg-purple-600 text-white border-purple-600 shadow"
                        : "bg-white/70 text-gray-700 border-indigo-100 hover:bg-white"
                        }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="w-full">
              <div className="relative">
                <svg className="absolute top-1/2 left-4 -translate-y-1/2 w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search announcements..."
                  className="w-full pl-12 pr-4 py-3 rounded-full text-sm bg-white/80 backdrop-blur border border-indigo-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Grid by Type */}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* News Column */}
            <section>
              <h2 className="text-lg font-semibold text-indigo-800 mb-1 inline-flex items-center gap-2"><MdCampaign className="w-5 h-5" /> News</h2>
              <p className="text-xs text-gray-500 mb-2">Scroll here for more News</p>
              {newsAnnouncements.length === 0 ? (
                <p className="text-sm text-gray-500">No news announcements.</p>
              ) : (
                <ul ref={newsListRef} onWheel={handleWheelAutoScroll} {...makeHoverHandlers(newsPausedRef, newsTimerRef, newsListRef, newsIndexRef)} className="space-y-4 h-80 overflow-y-auto pr-2 snap-y snap-mandatory scroll-smooth scroll-hidden">
                  {newsAnnouncements.map((announcement) => (
                    <li key={announcement.id} className="snap-start">
                      {renderCard(announcement)}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Upcoming Events Column */}
            <section>
              <h2 className="text-lg font-semibold text-emerald-800 mb-1 inline-flex items-center gap-2"><IoMdCalendar className="w-5 h-5" /> Upcoming Events</h2>
              <p className="text-xs text-gray-500 mb-2">Scroll here for more Upcoming Events</p>
              {eventAnnouncements.length === 0 ? (
                <p className="text-sm text-gray-500">No upcoming events.</p>
              ) : (
                <ul ref={eventsListRef} onWheel={handleWheelAutoScroll} {...makeHoverHandlers(eventsPausedRef, eventsTimerRef, eventsListRef, eventsIndexRef)} className="space-y-4 h-80 overflow-y-auto pr-2 snap-y snap-mandatory scroll-smooth scroll-hidden">
                  {eventAnnouncements.map((announcement) => (
                    <li key={announcement.id} className="snap-start">
                      {renderCard(announcement)}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* General Column */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-1 inline-flex items-center gap-2"><IoMdInformationCircle className="w-5 h-5" /> General</h2>
              <p className="text-xs text-gray-500 mb-2">Scroll here for more General announcements</p>
              {generalAnnouncements.length === 0 ? (
                <p className="text-sm text-gray-500">No general announcements.</p>
              ) : (
                <ul ref={generalListRef} onWheel={handleWheelAutoScroll} {...makeHoverHandlers(generalPausedRef, generalTimerRef, generalListRef, generalIndexRef)} className="space-y-4 h-80 overflow-y-auto pr-2 snap-y snap-mandatory scroll-smooth scroll-hidden">
                  {generalAnnouncements.map((announcement) => (
                    <li key={announcement.id} className="snap-start">
                      {renderCard(announcement)}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
      <div className="mt-4">
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
              {user?.role === 'admin' && audienceFilter !== 'all' && ` (audience: ${audienceFilter})`}
            </p>
          )}
        </div>
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
