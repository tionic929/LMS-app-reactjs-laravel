import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import React, { 
  useEffect, 
  useState, 
  useCallback, 
  lazy, 
  Suspense, 
  memo, 
  useRef 
} from "react";

import {
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaInbox,
  FaRegEye,
} from "react-icons/fa";
import {
  getInstructorApplications,
  approveInstructorApplication,
  rejectInstructorApplication,
  getApplicationRates,
  type InstructorApplication,
  type InstructorAnalytics,
  type ApplicationRates,
  getInstructorAnalytics,
} from "../../../api/instructorApplications";

import ConfirmationModal from "../../../components/modals/ConfirmationModal";
import type { ConfirmPayload } from "../../../components/modals/ConfirmationModal";

import { HiBadgeCheck } from "react-icons/hi";
const analytics: InstructorAnalytics = await getInstructorAnalytics();
const { totalPending } = analytics;

const ViewUserModal = lazy(() => import("../../../components/modals/ViewUserModal"));

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rejected: "bg-rose-50 text-rose-600 border-rose-100",
    pending: "bg-amber-50 text-amber-600 border-amber-100",
  };
  return styles[status] || styles.pending;
};

const getAvatarDetails = (app: InstructorApplication) => {
  const fullName = app.user ? `${app.user.name}` : (app.name || "Unknown");
  const initials = fullName.split(" ").map((n) => n[0]).join("").toUpperCase() || "??";
  const rawAvatar = app.user?.avatar_url || app.user?.avatar;
  const avatarSrc = rawAvatar?.startsWith("http") ? rawAvatar : rawAvatar ? `http://localhost:8000/storage/${rawAvatar}` : null;
  return { fullName, initials, avatarSrc };
};

const ApplicationCard = memo(({ app, activeTab, onView, onAction }: any) => {
  const { fullName, initials, avatarSrc } = getAvatarDetails(app);
  const status = app.status || "pending";

  return (
    <div className="flex-shrink-0 w-[380px] bg-slate-50/50 rounded-2xl border border-white shadow-2xl shadow-slate-300/50 p-6 flex flex-col justify-between transition-transform duration-200 hover:scale-[1.01]">
      <div className="flex gap-5">
        <div className="h-24 w-24 rounded-2xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm">
          {avatarSrc ? (
            <img 
              src={avatarSrc} 
              alt="" 
              className="h-full w-full object-cover" 
              onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${initials}&background=cbd5e1&color=475569`; }}
            />
          ) : (
            <span className="text-2xl font-bold text-slate-300">{initials}</span>
          )}
        </div>

        <div className="flex-1 min-w-0 py-1">
          <div className="flex flex-col">
            <h3 className="text-base font-black text-slate-800 truncate">{fullName}</h3>
            <p className="text-xs text-slate-500 truncate font-medium mt-1">{app.user?.email || app.email}</p>
          </div>
          <span className={`inline-block mt-3 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${getStatusBadge(status)}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200/50 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400">ID: #{app.id}</span>
        <div className="flex gap-2">
          <button title="viewBtn" onClick={() => onView(app)} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all">
            <FaEye size={14} />
          </button>
          {activeTab === "pending" && (
            <>
              <button title="approveBtn" onClick={() => onAction(app.id, "approve")} className="p-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all">
                <FaCheckCircle size={14} />
              </button>
              <button title="rejectBtn" onClick={() => onAction(app.id, "reject")} className="p-2.5 rounded-xl bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 transition-all">
                <FaTimesCircle size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

const InterviewingCard = memo(({ app, activeTab, onView, onAction }: any) => {
  const { fullName, initials, avatarSrc } = getAvatarDetails(app);
  const status = app.status || "pending";

  return (
    <div className="flex-shrink-0 w-[380px] bg-slate-50/50 rounded-2xl border border-white shadow-2xl shadow-slate-300/50 p-6 flex flex-col justify-between transition-transform duration-200 hover:scale-[1.01]">
      <div className="flex gap-5">
        <div className="h-24 w-24 rounded-2xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm">
          {avatarSrc ? (
            <img 
              src={avatarSrc} 
              alt="" 
              className="h-full w-full object-cover" 
              onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${initials}&background=cbd5e1&color=475569`; }}
            />
          ) : (
            <span className="text-2xl font-bold text-slate-300">{initials}</span>
          )}
        </div>

        <div className="flex-1 min-w-0 py-1">
          <div className="flex flex-col">
            <h3 className="text-base font-black text-slate-800 truncate">{fullName}</h3>
            <p className="text-xs text-slate-500 truncate font-medium mt-1">{app.user?.email || app.email}</p>
          </div>
          <span className={`inline-block mt-3 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${getStatusBadge(status)}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200/50 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400">ID: #{app.id}</span>
        <div className="flex gap-2">
          <button title="viewBtn" onClick={() => onView(app)} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all">
            <FaEye size={14} />
          </button>
          {activeTab === "pending" && (
            <>
              <button title="approveBtn" onClick={() => onAction(app.id, "approve")} className="p-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all">
                <FaCheckCircle size={14} />
              </button>
              <button title="rejectBtn" onClick={() => onAction(app.id, "reject")} className="p-2.5 rounded-xl bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 transition-all">
                <FaTimesCircle size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

// MAIN PAGE COMPONENT
const InstructorApplications: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [applications, setApplications] = useState<InstructorApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewUser, setViewUser] = useState<InstructorApplication | null>(null);
  const [confirm, setConfirm] = useState<ConfirmPayload | null>(null);

  const [showSkeleton, setShowSkeleton] = useState(true);
  const hasAnimatedRef = useRef(false);

  const [applicationRates, setApplicationRates] = useState<ApplicationRates[]>([]);

  const handleConfirm = () => {
    fetchApplications(activeTab, currentPage);
  }

  // Smooth mouse-wheel horizontal scroll logic
  useEffect(() => {
      const el = scrollRef.current;
      if (el) {
        const onWheel = (e: WheelEvent) => {
          if (e.deltaY === 0) return;
          e.preventDefault();
          el.scrollTo({
            left: el.scrollLeft + e.deltaY * 2.5,
            behavior: "smooth"
          });
        };
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
      }
    }, [loading, applications]);

  const fetchApplications = useCallback(async (status: string, page: number) => {
    setLoading(true);
    try {
      const res = await getInstructorApplications(status, page);
      setApplications(res.data ?? res);
      setTotalPages(res.total_pages ?? 1);
    } catch { toast.error("Fetch Error"); }
    finally { setLoading(false); }
  }, []);

  const fetchApplicationRates = useCallback(async () => {
    try {
      const rates = await getApplicationRates();
      setApplicationRates(rates);
      console.log("Application Rates:", rates);
      } catch (error) {
        console.error("Error fetching application rates:", error);
      }
    }, []);
  

  useEffect(() =>{
    if(!loading && !hasAnimatedRef.current){
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, 300);
      return () => clearTimeout(timer);
    }
    if (loading) {
      hasAnimatedRef.current = false;
      setShowSkeleton(true);
    }
  }, [loading]);

  useEffect(() => {
    fetchApplications(activeTab, currentPage);
    fetchApplicationRates();
  }, [activeTab, currentPage, fetchApplications, fetchApplicationRates]);

  return (
    <main className="min-h-screen bg-slate- text-slate-900 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto space-y-6 px-6">

        {/* HORIZONTAL SCROLL AREA */}
        <section className="">
          <div className="flex gap-4 items-center justify-between p-6">
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-4xl font-semibold text-gray-900">Applications</h1>
                    <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-600 px-2 py-0.5 text-xs font-semibold border border-indigo-100">
                        <HiBadgeCheck className="w-4 h-4 mr-1"/> Admin Panel
                    </span>
                </div>
                {applicationRates[0] && (
                  <span className="text-md font-medium text-gray-500/80">{applicationRates[0].approvalRate ?? "N/A"}% approval rate this month ({applicationRates[0].month ?? "N/A"})</span>
                )}
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-6 min-w-[320px]">
                <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner">
                   <FaInbox size={24} />
                </div>
                <div>
                   <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Queue Status</p>
                   <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                     {totalPending} <span className="text-sm font-medium text-slate-500 uppercase tracking-tighter">Pending Apps</span>
                   </h2>
                </div>
            </div>

            {/* <button className="h-[104px] px-8 bg-slate-900 rounded-[2rem] text-white flex flex-col justify-center gap-1 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 group">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity">Quick Action</span>
                <span className="text-sm font-black">Go to Interviewing</span>
            </button> */}
          </div>
          <div className="flex justify-between items-center ml-[22px]">
            <div className="flex bg-slate-50/50 p-1.5 rounded-tr-2xl rounded-tl-2xl border border-slate-200 shadow-inner">
              {(["pending", "approved", "rejected"] as const).map(tab => (
                <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                  activeTab === tab ? "bg-white text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-700"
                }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        
        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory p-10 rounded-3xl bg-slate-50/50 border border-slate-200 shadow-inner-md"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex gap-8"
              >
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-[380px] h-[220px] bg-white animate-pulse rounded-2xl border border-slate-100"
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex gap-8"
              >
                {applications.length === 0 ? (
                  <div className="w-full h-[300px] flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                    <FaInbox size={48} className="text-slate-200 mb-4" />
                    <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">
                      Queue is currently empty
                    </p>
                  </div>
                ) : (
                  applications.map((app) => (
                    <motion.div
                      key={app.id}
                      className="snap-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <ApplicationCard
                        app={app}
                        activeTab={activeTab}
                        onView={setViewUser}
                        onAction={(id: number, action: "approve" | "reject") =>
                          setConfirm({ id, action })
                        }
                      />
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        </section>

        {/* TABLE SECTION */}
        <section className="mt-12">
            <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Detailed View</h3>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Showing {applications.length} results</span>
            </div>
            
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                      <th className="px-8 py-4">Applicant Information</th>
                      <th className="px-8 py-4">Status Label</th>
                      <th className="px-8 py-4 text-right">Quick View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {applications.map(app => (
                      <tr key={app.id} className="group hover:bg-slate-50/80 transition-all">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-400 font-bold text-xs border border-slate-200 group-hover:border-slate-300 transition-colors">
                                {getAvatarDetails(app).initials}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[14px] font-bold text-slate-800 truncate group-hover:text-slate-900">
                                    {app.user?.name || app.name}
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium truncate">
                                    {app.user?.email || app.email}
                                </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border tracking-tighter shadow-sm ${getStatusBadge(app.status || 'pending')}`}>
                            {app.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            title="ViewUser"
                            onClick={() => setViewUser(app)} 
                            className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all group/btn"
                          >
                            <FaRegEye size={18} className="group-hover/btn:scale-110 transition-transform" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
        </section>
      </div>

      {/* Confirmation Modal */}
      {confirm && (
        <ConfirmationModal
          confirm={confirm}
          setConfirm={setConfirm}
          onSuccess={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <Suspense fallback={null}>
        <ViewUserModal show={!!viewUser} user={viewUser?.user ?? null} onClose={() => setViewUser(null)} onSuccess={() => fetchApplications(activeTab, currentPage)} />
      </Suspense>
    </main>
  );
};

export default InstructorApplications;