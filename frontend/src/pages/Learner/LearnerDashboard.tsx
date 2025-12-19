import React, { useEffect, useState } from 'react';
import { getCourses, leaveCourse } from '../../api/courses';
import { listAnnouncements } from '../../api/announcements';
import type { Announcement } from '../../api/announcements';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Bell, TrendingUp, Award } from 'lucide-react';
import { toast } from 'react-toastify';

export const LearnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // fetch only courses the user is enrolled in
        const res = await (await import('../../api/courses')).getMyCourses();
        const enrolled = res.data || [];
        if (mounted) setCourses(enrolled);

        const ann = await listAnnouncements();
        const learnerAnns = ann.filter((a) => !a.audience || a.audience === 'all' || a.audience === 'learners');
        if (mounted) setAnnouncements(learnerAnns.slice(0, 5));
      } catch (e: any) {
        console.error(e);
        if (mounted) setError(e.response?.data?.message || 'Failed to load data');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const handleLeave = async (courseId: number) => {
    const confirmed = await new Promise<boolean>((resolve) => {
      const id = toast.info(
        <div className="max-w-sm">
          <div className="mb-2">Are you sure you want to leave this course?</div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                toast.dismiss(id);
                resolve(false);
              }}
              className="px-3 py-1 bg-gray-200 rounded text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(id);
                resolve(true);
              }}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm"
            >
              Leave
            </button>
          </div>
        </div>,
        { autoClose: false, closeOnClick: false }
      );
    });

    if (!confirmed) return;
    
    try {
      await leaveCourse(courseId);
      setCourses((c) => c.filter((x) => x.id !== courseId));
      toast.success('Successfully left the course');
    } catch (e) {
      toast.error('Failed to leave course');
    }
  };

  // Stats data
  const stats = [
    { 
      icon: BookOpen, 
      label: "Enrolled Courses", 
      value: courses.length.toString(), 
      trend: "Active learning", 
      color: "bg-blue-500" 
    },
    { 
      icon: Bell, 
      label: "New Announcements", 
      value: announcements.length.toString(), 
      trend: "Last 7 days", 
      color: "bg-green-500" 
    },
    { 
      icon: TrendingUp, 
      label: "Learning Streak", 
      value: "5 days", 
      trend: "Keep it up!", 
      color: "bg-purple-500" 
    },
    { 
      icon: Award, 
      label: "Achievements", 
      value: "12", 
      trend: "View all", 
      color: "bg-yellow-500" 
    },
  ];

  const StatCard: React.FC<{
    icon: React.ElementType;
    label: string;
    value: string;
    trend: string;
    color: string;
  }> = ({ icon: Icon, label, value, trend, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-40 transition hover:shadow-2xl hover:scale-[1.02] duration-300 border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color} text-white shadow-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2 truncate">{trend}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            {getTimeGreeting()}, {user?.name?.split(' ')[0] || 'Learner'}! 👋
          </h1>
          <p className="text-gray-600">Track your learning journey and stay updated with your courses</p>
        </div>


        {loading ? (
          <div className="animate-pulse">
            {/* Stats skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-lg h-40 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-28 mb-3"></div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-10 w-10 bg-gray-200 rounded-full" />
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-24 mt-4" />
                </div>
              ))}
            </div>

            {/* Main Content Grid skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Courses skeleton */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-6 bg-gray-200 rounded w-48" />
                    <div className="h-4 bg-gray-200 rounded w-24" />
                  </div>

                  <div className="space-y-4">
                    {[...Array(3)].map((_, idx) => (
                      <div key={idx} className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4">
                        <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-blue-500 to-indigo-500 opacity-30"></div>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="space-y-2">
                              <div className="h-3 bg-gray-200 rounded w-full"></div>
                              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                            <div className="h-8 w-28 bg-gray-200 rounded" />
                            <div className="h-8 w-20 bg-gray-200 rounded" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Announcements skeleton */}
              <aside className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-5 w-5 bg-gray-200 rounded" />
                    <div className="h-6 bg-gray-200 rounded w-36" />
                  </div>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Courses */}
              <div className="lg:col-span-2 space-y-6">
                {/* My Courses */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      My Courses
                    </h2>
                    <button
                      onClick={() => navigate('/courses')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Browse All →
                    </button>
                  </div>
                  
                  {courses.length === 0 ? (
                    <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-200">
                      <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                      <p className="text-gray-500 mb-4">Start your learning journey today!</p>
                      <button
                        onClick={() => navigate('/courses')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                      >
                        Explore Courses
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {courses.map((c) => {
                        const progress = c.progress ?? (c.completed_lessons && c.total_lessons ? Math.round((c.completed_lessons / c.total_lessons) * 100) : undefined);
                        const lastAccess = c.last_accessed || c.pivot?.last_accessed;
                        return (
                          <div
                            key={c.id}
                            className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all duration-200"
                          >
                            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-blue-500 to-indigo-500"></div>
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <button
                                  className="text-left flex-1 min-w-0"
                                  onClick={() => navigate(`/courses/${c.id}`)}
                                >
                                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition mb-1 line-clamp-1">
                                    {c.title}
                                  </h3>
                                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{c.content}</p>
                                  {c.instructor && (
                                    <p className="text-xs text-gray-500">
                                      Instructor: {c.instructor.name}
                                    </p>
                                  )}

                                  {typeof progress === 'number' && (
                                    <div className="mt-3">
                                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                        <span>Progress</span>
                                        <span className="font-medium">{progress}%</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${progress}%` }} />
                                      </div>
                                    </div>
                                  )}

                                  {lastAccess && (
                                    <div className="mt-2 text-xs text-gray-400">Last active: {formatRelativeTime(lastAccess)}</div>
                                  )}
                                </button>
                                <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                                  <button
                                    onClick={() => navigate(`/courses/${c.id}`)}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition whitespace-nowrap"
                                  >
                                    Continue
                                  </button>
                                  <button
                                    onClick={() => handleLeave(c.id)}
                                    className="px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition whitespace-nowrap"
                                  >
                                    Leave
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Announcements & Info */}
              <aside className="space-y-6">
                {/* Recent Announcements */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Recent Announcements</h3>
                  </div>
                  {announcements.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm">No announcements yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {announcements.map((a) => (
                        <div
                          key={a.id}
                          className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-md transition cursor-pointer"
                          onClick={() => navigate('/announcements')}
                        >
                          <div className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                            {a.title}
                          </div>
                          <div className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {a.content}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(a.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                      {announcements.length >= 5 && (
                        <button
                          onClick={() => navigate('/announcements')}
                          className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
                        >
                          View All Announcements →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

  // Small helper: time-based greeting
  const getTimeGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Helper: relative time display
  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const diff = Date.now() - d.getTime();
      const sec = Math.floor(diff / 1000);
      const min = Math.floor(sec / 60);
      const hr = Math.floor(min / 60);
      const day = Math.floor(hr / 24);
      if (sec < 60) return 'Just now';
      if (min < 60) return `${min}m ago`;
      if (hr < 24) return `${hr}h ago`;
      if (day < 7) return `${day}d ago`;
      return d.toLocaleDateString();
    } catch {
      return '';
    }
  };



export default LearnerDashboard;