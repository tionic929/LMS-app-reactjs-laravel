import React, { useEffect, useState } from 'react';
import { getCourses, leaveCourse } from '../../api/courses';
import { listAnnouncements } from '../../api/announcements';
import type { Announcement } from '../../api/announcements';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
    if (!confirm('Leave this course?')) return;
    try {
      await leaveCourse(courseId);
      setCourses((c) => c.filter((x) => x.id !== courseId));
    } catch (e) {
      alert('Failed to leave course');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Learner Dashboard</h1>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold">My Courses ({courses.length})</h2>
              {courses.length === 0 ? (
                <p className="text-sm text-gray-500 mt-2">You are not enrolled in any courses yet.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {courses.map((c) => (
                    <li key={c.id} className="flex items-center justify-between p-3 border rounded">
                      <button className="text-left flex-1" onClick={() => navigate(`/courses/${c.id}`)}>
                        <div className="font-medium">{c.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-2">{c.content}</div>
                      </button>
                      <div className="ml-4 flex items-center gap-2">
                        <button onClick={() => navigate(`/courses/${c.id}`)} className="px-3 py-1 rounded bg-blue-600 text-white text-sm">Open</button>
                        <button onClick={() => handleLeave(c.id)} className="px-3 py-1 rounded bg-red-100 text-red-700 text-sm">Leave</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
              <div className="mt-3 flex gap-3">
                <button onClick={() => navigate('/courses')} className="px-4 py-2 rounded bg-indigo-600 text-white">Browse Courses</button>
                <button onClick={() => navigate('/account/update')} className="px-4 py-2 rounded bg-gray-200">Update Profile</button>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium">Announcements</h3>
              {announcements.length === 0 ? (
                <p className="text-sm text-gray-500 mt-2">No announcements.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {announcements.map((a) => (
                    <li key={a.id} className="p-2 border rounded">
                      <div className="text-sm font-semibold">{a.title}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-3">{a.content}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default LearnerDashboard;