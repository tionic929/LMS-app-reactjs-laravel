import { useEffect, useMemo, useState, type ElementType } from "react";
import { Link } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from "recharts";
import type { AxiosError } from "axios";
import { Activity, BookOpen, Clock, MessageSquare, Users } from "lucide-react";
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
    active_courses: number;
    pending_requests: number;
    total_enrolled: number;
  };
  courses: InstructorDashboardCourse[];
};

type ChartPoint = {
  name: string;
  enrolled: number;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: unknown;
};

const ChartTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const value = payload[0]?.value ?? 0;
  const labelText = typeof label === "string" ? label : String(label ?? "");

  return (
    <div className="rounded-lg bg-gray-900 px-3 py-2 text-white shadow-lg">
      <p className="max-w-[320px] text-xs font-semibold text-white/80">{labelText}</p>
      <p className="mt-1 text-sm font-extrabold tabular-nums">{Number(value).toLocaleString()}</p>
    </div>
  );
};

type StatCardProps = {
  icon: ElementType;
  label: string;
  value: string;
  trend: string;
  color: string;
};

const StatCard = ({ icon: Icon, label, value, trend, color }: StatCardProps) => (
  <div
    className={
      "relative overflow-hidden rounded-2xl p-6 shadow-lg flex flex-col justify-between h-40 " +
      "transition-all duration-300 ease-out " +
      "hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 active:shadow-lg " +
      "motion-reduce:transition-none " +
      color
    }
  >
    <div className="flex justify-between items-start gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white/85">{label}</p>
        <p className="mt-1 text-3xl font-extrabold text-white tabular-nums">{value}</p>
      </div>
      <div className="shrink-0 rounded-2xl bg-white/15 p-3 shadow-sm ring-1 ring-white/20 backdrop-blur">
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
    <p className="mt-2 truncate text-xs font-medium text-white/75">{trend}</p>
    <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
  </div>
);

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
};

const truncate = (value: string, max: number) => (value.length > max ? `${value.slice(0, Math.max(0, max - 1))}…` : value);

const InstructorDashboard = () => {
  const { user } = useAuth();

  // Static per requirement (no backend integration yet)
  const unreadCommentsCount = 7;

  const [data, setData] = useState<InstructorDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    return courses
      .map((c) => ({
        name: c.title,
        enrolled: Number(c.active_learners_count ?? 0),
      }))
      .sort((a, b) => b.enrolled - a.enrolled);
  }, [data]);

  const chartHeight = useMemo(() => {
    return Math.max(280, chartData.length * 44);
  }, [chartData.length]);

  if (user?.role !== "instructor") {
    return (
      <div className="min-h-screen bg-gray-50 p-6 sm:p-5">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-lg transition-shadow duration-300 hover:shadow-xl">
            <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">This dashboard is available for instructors only.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-5">
      <div
        className={
          "mx-auto max-w-7xl transition-all duration-500 ease-out motion-reduce:transition-none " +
          (mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")
        }
      >
        <div className="mb-6 flex items-center justify-between gap-4 border-b pb-2">
          <h1 className="text-4xl font-extrabold text-gray-900">Dashboard</h1>
          <Link
            to="/courses"
            className={
              "inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow " +
              "transition-all duration-200 ease-out hover:bg-gray-800 hover:-translate-y-0.5 active:translate-y-0 active:shadow " +
              "motion-reduce:transition-none"
            }
          >
            View Courses
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg h-40 animate-pulse">
                <div className="h-4 w-40 rounded bg-gray-100" />
                <div className="mt-3 h-9 w-28 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-red-200 text-red-700 transition-shadow duration-300 hover:shadow-xl">
            <p className="text-sm font-semibold">Unable to load dashboard</p>
            <p className="mt-2 text-sm text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && data && (
          <>
            <div>
              {/* --- 1. Top Level Statistics Cards (Instructor) --- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
                <StatCard
                  icon={BookOpen}
                  label="Your Courses"
                  value={data.metrics.total_courses.toLocaleString()}
                  trend="All courses you own"
                  color="bg-emerald-600"
                />
                <StatCard
                  icon={Activity}
                  label="Active Courses"
                  value={data.metrics.active_courses.toLocaleString()}
                  trend="Currently running"
                  color="bg-indigo-600"
                />
                <StatCard
                  icon={Users}
                  label="Total Enrolled Students"
                  value={data.metrics.total_enrolled.toLocaleString()}
                  trend="Across your active courses"
                  color="bg-emerald-600"
                />
                <StatCard
                  icon={Clock}
                  label="Pending Requests"
                  value={data.metrics.pending_requests.toLocaleString()}
                  trend="Awaiting your review"
                  color="bg-amber-600"
                />
                <StatCard
                  icon={MessageSquare}
                  label="Unread Comments"
                  value={unreadCommentsCount.toLocaleString()}
                  trend="Static for now"
                  color="bg-gray-900"
                />
              </div>

              {/* --- 2. Charts --- */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 motion-reduce:transition-none">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">Students per Course</h2>

                  {chartData.length === 0 ? (
                    <div className="py-6">
                      <p className="text-sm text-gray-600">No active courses found.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={chartHeight} debounce={200}>
                      <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis type="number" allowDecimals={false} stroke="#374151" />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={240}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "#374151", fontSize: 12 }}
                          tickFormatter={(v) => truncate(String(v ?? ""), 28)}
                        />
                        <Tooltip
                          content={<ChartTooltip />}
                        />
                        <Bar
                          dataKey="enrolled"
                          name="Enrolled"
                          fill="#2563eb"
                          radius={[0, 10, 10, 0]}
                          barSize={18}
                          animationDuration={900}
                          animationEasing="ease-out"
                        >
                          <LabelList dataKey="enrolled" position="right" fill="#111827" fontSize={12} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 motion-reduce:transition-none">
                  <div className="flex items-baseline justify-between gap-3 mb-4">
                    <h2 className="text-xl font-semibold text-gray-700">Courses</h2>
                    <span className="text-xs text-gray-500 tabular-nums">{data.courses.length.toLocaleString()} total</span>
                  </div>

                  {data.courses.length === 0 ? (
                    <div className="py-6">
                      <p className="text-sm text-gray-600">No courses found.</p>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto pr-1">
                      <div className="divide-y divide-gray-100">
                        {data.courses.map((course) => (
                          <Link
                            key={course.id}
                            to={`/courses/${course.id}`}
                            className={
                              "group relative block overflow-hidden rounded-xl py-3 pl-4 pr-2 -mx-2 " +
                              "transition-all duration-200 ease-out " +
                              "hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-sm hover:ring-1 hover:ring-gray-200 " +
                              "active:translate-y-0 active:shadow-none motion-reduce:transition-none"
                            }
                            title={course.title}
                          >
                            <span
                              aria-hidden="true"
                              className={
                                "absolute left-0 top-2 bottom-2 w-1 rounded-full transition-all duration-200 ease-out " +
                                "group-hover:w-1.5 motion-reduce:transition-none " +
                                (course.privacy === "public" ? "bg-emerald-600" : "bg-amber-600")
                              }
                            />
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-gray-950">{course.title}</p>
                                <div className="mt-1 flex items-center gap-2">
                                  <span
                                    className={
                                      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold text-white " +
                                      (course.privacy === "public" ? "bg-emerald-600" : "bg-amber-600")
                                    }
                                  >
                                    {course.privacy}
                                  </span>
                                </div>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="text-xs font-semibold text-gray-500">Enrolled</p>
                                <p className="text-base font-extrabold text-gray-900 tabular-nums">
                                  {Number(course.active_learners_count ?? 0).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <Link
                      to="/courses"
                      className={
                        "inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow " +
                        "transition-all duration-200 ease-out hover:bg-gray-800 hover:-translate-y-0.5 active:translate-y-0 active:shadow " +
                        "motion-reduce:transition-none"
                      }
                    >
                      View all courses
                    </Link>
                  </div>
                </div>
              </div>

              {/* --- 3. Course Cards + Learners --- */}
              <div className="space-y-6">
                {data.courses.map((course) => (
                  <div
                    key={course.id}
                    className={
                      "bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ease-out " +
                      "hover:shadow-2xl hover:-translate-y-0.5 motion-reduce:transition-none"
                    }
                  >
                    <div
                      className={
                        "p-6 border-b border-gray-100 " +
                        (course.privacy === "public" ? "bg-emerald-600" : "bg-amber-600")
                      }
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              to={`/courses/${course.id}`}
                              className="truncate text-lg font-extrabold tracking-tight text-white hover:underline"
                              title={course.title}
                            >
                              {course.title}
                            </Link>
                            <span
                              className={
                                course.privacy === "public"
                                  ? "inline-flex items-center rounded-full bg-white/15 px-2 py-1 text-xs font-semibold text-white ring-1 ring-white/25"
                                  : "inline-flex items-center rounded-full bg-white/15 px-2 py-1 text-xs font-semibold text-white ring-1 ring-white/25"
                              }
                            >
                              {course.privacy}
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-white/85">
                            Capacity <span className="font-semibold text-white tabular-nums">{course.capacity}</span>
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <div className="rounded-xl bg-white/15 px-4 py-3 ring-1 ring-white/20">
                            <p className="text-xs font-semibold text-white/80">Enrolled</p>
                            <p className="mt-0.5 text-xl font-extrabold text-white tabular-nums">{course.active_learners_count}</p>
                          </div>
                          <div className="rounded-xl bg-white/15 px-4 py-3 ring-1 ring-white/20">
                            <p className="text-xs font-semibold text-white/80">Current Count</p>
                            <p className="mt-0.5 text-xl font-extrabold text-white tabular-nums">{course.current_enrolled}</p>
                          </div>
                          <Link
                            to={`/courses/${course.id}`}
                            className={
                              "inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow " +
                              "transition-all duration-200 ease-out hover:bg-gray-800 hover:-translate-y-0.5 active:translate-y-0 active:shadow " +
                              "motion-reduce:transition-none"
                            }
                          >
                            Open
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700">Enrolled Students</h3>
                          <p className="mt-1 text-xs text-gray-500">Students enrolled in this course.</p>
                        </div>
                        <p className="text-xs font-semibold text-gray-600 tabular-nums">{course.learners.length.toLocaleString()} total</p>
                      </div>

                      {course.learners.length === 0 ? (
                        <div className="mt-4 rounded-lg bg-gray-50 p-4">
                          <p className="text-sm text-gray-600">No enrolled students.</p>
                        </div>
                      ) : (
                        <div className="mt-4 overflow-x-auto rounded-lg border border-gray-100">
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
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;
