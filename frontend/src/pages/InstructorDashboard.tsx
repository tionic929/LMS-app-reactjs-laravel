import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import type { AxiosError } from "axios";
import { motion, type Variants } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { getInstructorDashboard } from "../api/courses";

type ApiErrorResponse = {
  message?: string;
};

type InstructorDashboardLearner = {
  id: number;
  name: string;
  email: string;
  enrolled_at?: string | null;
  status: string;
};

type InstructorDashboardCourse = {
  id: number;
  title: string;
  privacy: "public" | "private" | string;
  capacity: number;
  current_enrolled: number;
  active_learners_count: number;
  learners: InstructorDashboardLearner[];
};

type InstructorDashboardResponse = {
  metrics: {
    total_courses: number;
    total_enrolled: number;
  };
  courses: InstructorDashboardCourse[];
};

type ChartPoint = {
  name: string;
  enrolled: number;
};

const MetricCard = ({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: number;
  subtitle?: string;
}) => (
  <motion.div
    whileHover={{ y: -3, scale: 1.01 }}
    transition={{ type: "spring", stiffness: 350, damping: 26 }}
    className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ring-1 ring-black/5"
  >
    <div className="relative flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        {subtitle ? <p className="mt-1 text-xs text-gray-500">{subtitle}</p> : null}
      </div>

      <div className="rounded-xl bg-indigo-50 px-3 py-2 ring-1 ring-indigo-100">
        <p className="text-2xl font-extrabold tracking-tight text-gray-900 tabular-nums">{value.toLocaleString()}</p>
      </div>
    </div>

    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-indigo-600/70" />
    <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-fuchsia-500/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-60" />
    <div className="pointer-events-none absolute -bottom-12 -left-10 h-28 w-28 rounded-full bg-indigo-500/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-60" />
  </motion.div>
);

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
};

const truncate = (value: string, max: number) => (value.length > max ? `${value.slice(0, Math.max(0, max - 1))}…` : value);

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.03 } },
};

type DashboardTooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: unknown;
};

const DashboardTooltip = ({ active, payload, label }: DashboardTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const value = payload[0]?.value ?? 0;
  const labelText = typeof label === "string" ? label : String(label ?? "");

  return (
    <div className="rounded-xl border border-white/10 bg-gray-900/95 px-3 py-2 text-white shadow-lg backdrop-blur">
      <p className="max-w-[320px] text-xs font-semibold text-white/80">{labelText}</p>
      <p className="mt-1 text-sm font-extrabold tabular-nums">{Number(value).toLocaleString()}</p>
    </div>
  );
};

const InstructorDashboard = () => {
  const { user } = useAuth();

  const [data, setData] = useState<InstructorDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getInstructorDashboard();
        if (!isMounted) return;
        setData(res.data);
      } catch (error: unknown) {
        if (!isMounted) return;
        const err = error as AxiosError<ApiErrorResponse | string>;
        const status = err.response?.status;
        const data = err.response?.data;

        const serverMessage =
          typeof data === "string"
            ? undefined
            : (data as ApiErrorResponse | undefined)?.message;

        if (status === 401) {
          setError("You are not logged in. Please login again.");
        } else if (status === 403) {
          setError(serverMessage || "Forbidden.");
        } else {
          setError(serverMessage || "Failed to load instructor dashboard.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    run();
    return () => {
      isMounted = false;
    };
  }, []);

  const chartData: ChartPoint[] = useMemo(() => {
    const courses = data?.courses ?? [];
    return courses.map((c) => ({
      name: c.title,
      enrolled: Number(c.active_learners_count ?? 0),
    }));
  }, [data]);

  const chartHeight = useMemo(() => {
    return Math.max(280, chartData.length * 44);
  }, [chartData.length]);

  if (user?.role !== "instructor") {
    return (
      <main className="flex-1 overflow-auto bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">This dashboard is available for instructors only.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-auto bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-indigo-100/30" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="relative overflow-hidden rounded-3xl border border-indigo-900/10 bg-indigo-700 p-6 shadow-sm"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">Instructor Dashboard</h1>
              <p className="mt-2 text-white/80">Your courses, enrollments, and student lists.</p>
            </div>

            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/courses"
                  className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white/15"
                >
                  View Courses
                </Link>
              </motion.div>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-white/0" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-white/30" />
        </motion.div>

        {loading && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="h-4 w-40 rounded bg-gray-100" />
              <div className="mt-3 h-9 w-28 rounded bg-gray-100" />
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="h-4 w-44 rounded bg-gray-100" />
              <div className="mt-3 h-9 w-32 rounded bg-gray-100" />
            </div>
            <div className="sm:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ring-1 ring-black/5">
              <div className="h-5 w-56 rounded bg-gray-100" />
              <div className="mt-5 h-64 w-full rounded-xl bg-gray-50" />
            </div>
          </div>
        )}

        {!loading && error && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mt-6 rounded-2xl border border-red-200 bg-white p-6 text-red-700 shadow-sm ring-1 ring-black/5"
          >
            <p className="text-sm font-semibold">Unable to load dashboard</p>
            <p className="mt-2 text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        {!loading && !error && data && (
          <>
            <motion.div variants={stagger} initial="hidden" animate="show" className="mt-6 space-y-6">
              <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <MetricCard title="Your Courses" subtitle="Active courses you own" value={data.metrics.total_courses} />
                <MetricCard
                  title="Total Enrolled Students"
                  subtitle="Across your active courses"
                  value={data.metrics.total_enrolled}
                />
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-black/5"
              >
                <div className="flex flex-col gap-2 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold tracking-tight text-gray-900">Students per Course</h2>
                    <p className="mt-1 text-sm text-gray-600">Enrollment count for each of your active courses.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
                      Active learners
                    </span>
                  </div>
                </div>

                {chartData.length === 0 ? (
                  <div className="px-6 py-8">
                    <p className="text-sm text-gray-600">No active courses found.</p>
                  </div>
                ) : (
                  <div className="px-2 py-4 sm:px-6">
                    <div className="rounded-xl bg-indigo-50/60 p-2 ring-1 ring-gray-100">
                      <div className="text-indigo-600">
                        <ResponsiveContainer width="100%" height={chartHeight} debounce={200}>
                          <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 16, left: 40, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                            <YAxis
                              type="category"
                              dataKey="name"
                              width={240}
                              tickLine={false}
                              axisLine={false}
                              tick={{ fill: "currentColor", fontSize: 12 }}
                              className="text-gray-700"
                              tickFormatter={(v) => truncate(String(v ?? ""), 28)}
                            />
                            <Tooltip content={<DashboardTooltip />} />
                            <Bar
                              dataKey="enrolled"
                              name="Enrolled"
                              fill="currentColor"
                              radius={[0, 10, 10, 0]}
                              animationDuration={520}
                              animationEasing="ease-out"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              <motion.div variants={fadeUp} className="space-y-4">
                {data.courses.map((course) => (
                  <motion.div
                    key={course.id}
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 320, damping: 26 }}
                    className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-black/5"
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-indigo-600/70" />
                    <div className="border-b border-gray-100 p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              to={`/courses/${course.id}`}
                              className="truncate text-lg font-extrabold tracking-tight text-gray-900 decoration-indigo-400/60 underline-offset-4 hover:underline"
                              title={course.title}
                            >
                              {course.title}
                            </Link>
                            <span
                              className={
                                course.privacy === "public"
                                  ? "inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200"
                                  : "inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200"
                              }
                            >
                              {course.privacy}
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-gray-600">
                            Capacity <span className="font-semibold text-gray-900 tabular-nums">{course.capacity}</span>
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <div className="rounded-xl bg-indigo-50 px-4 py-3 ring-1 ring-indigo-100">
                            <p className="text-xs font-semibold text-gray-500">Enrolled</p>
                            <p className="mt-0.5 text-xl font-extrabold text-gray-900 tabular-nums">{course.active_learners_count}</p>
                          </div>
                          <div className="rounded-xl bg-fuchsia-50 px-4 py-3 ring-1 ring-fuchsia-100">
                            <p className="text-xs font-semibold text-gray-500">Current Count</p>
                            <p className="mt-0.5 text-xl font-extrabold text-gray-900 tabular-nums">{course.current_enrolled}</p>
                          </div>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Link
                              to={`/courses/${course.id}`}
                              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                            >
                              Open
                            </Link>
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-extrabold tracking-tight text-gray-900">Enrolled Students</h3>
                          <p className="mt-1 text-xs text-gray-500">Students enrolled in this course.</p>
                        </div>
                        <p className="text-xs font-semibold text-gray-600 tabular-nums">{course.learners.length.toLocaleString()} total</p>
                      </div>

                      {course.learners.length === 0 ? (
                        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                          <p className="text-sm text-gray-600">No enrolled students.</p>
                        </div>
                      ) : (
                        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-100">
                          <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Enrolled</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                              {course.learners.map((learner) => (
                                <tr key={learner.id} className="transition-colors hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{learner.name}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{learner.email}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{learner.status || "—"}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600 tabular-nums">{formatDate(learner.enrolled_at)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </>
        )}
      </div>
    </main>
  );
};

export default InstructorDashboard;
