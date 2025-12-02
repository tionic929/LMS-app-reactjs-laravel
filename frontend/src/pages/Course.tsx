import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getCourses, createCourse } from "../api/courses";
import { HiOutlineBookOpen, HiOutlinePlus } from "react-icons/hi";
import AddCourseModal, { type AddCoursePayload } from "../components/modals/AddCourseModal";
import { PiUsersThreeBold } from "react-icons/pi";
import { MdLockOutline, MdOutlinePublic, MdArrowBack } from "react-icons/md";
import "../App.css";

interface Course {
  id: number;
  title: string;
  content: string;
  instructor_name: string;
  privacy: string;
  current_enrolled: number;
  capacity: number;
}

const Course: React.FC = () => {
  const [query, setQuery] = useState("");
  const [privacyFilter, setPrivacyFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Modal create handler
  const handleAddCourse = async (payload: AddCoursePayload) => {
    try {
      await createCourse(payload);
      await fetchCourses();
      alert("Course created successfully!");
    } catch (err: any) {
      console.error("Error creating course:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCourses();
      setCourses(response.data);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      setError(err.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  // Inline create handler removed; using AddCourseModal with onSubmit

  const privacyFilterOptions = [
    { label: "All Privacy", value: "all" },
    { label: "Public", value: "public" },
    { label: "Private", value: "private" },
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesPrivacy =
      privacyFilter === "all" || course.privacy === privacyFilter;
    const matchesSearch =
      course.title.toLowerCase().includes(query.toLowerCase()) ||
      course.content.toLowerCase().includes(query.toLowerCase());
    return matchesPrivacy && matchesSearch;
  });

  return (
    <main className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
        {user?.role === "instructor" && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
          >
            <HiOutlinePlus className="w-5 h-5" /> Add New
          </button>
        )}
      </div>

      {/* Explorer Bar (matched to announcements) */}
      <div className="rounded-2xl p-6 border border-transparent bg-gradient-to-r from-indigo-50 to-purple-50 shadow-sm mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0 md:max-w-xl">
            <div className="relative">
              <svg className="absolute top-1/2 left-4 -translate-y-1/2 w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses by title or content..."
                className="w-full pl-12 pr-4 py-3 rounded-full text-sm bg-white/80 backdrop-blur border border-indigo-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {privacyFilterOptions.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setPrivacyFilter(filter.value)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors border ${privacyFilter === filter.value
                    ? "bg-indigo-600 text-white border-indigo-600 shadow"
                    : "bg-white/70 text-gray-700 border-indigo-100 hover:bg-white"
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <p className="text-sm text-gray-600">Loading courses...</p>
          ) : error ? (
            <div className="text-sm text-red-600">
              <p className="mb-2">Error: {error}</p>
              <button onClick={fetchCourses} className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">Retry</button>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Showing {filteredCourses.length} of {courses.length} courses
              {privacyFilter !== "all" && ` (filtered by ${privacyFilter})`}
              {query && ` (search: "${query}")`}
            </p>
          )}
        </div>
      </div>
        {/* Add New Course Modal (standardized) */}
        <AddCourseModal show={showModal} onClose={() => setShowModal(false)} onSubmit={handleAddCourse} />

        {loading ? (
          <div className="text-center py-12 text-gray-500 text-lg">
            <p className="text-gray-600">Loading courses...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchCourses}
              className="mt-4 text-blue-700 hover:text-blue-800 text-sm font-medium"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {filteredCourses.length} of {courses.length} courses
                {privacyFilter !== "all" && ` (${privacyFilter})`}
                {query && ` (search: "${query}")`}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length === 0 ? (
            // Empty state when no results
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="text-gray-400 mb-4">
                <MdArrowBack className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No courses found
              </h3>
              <p className="text-gray-500">
                {query
                  ? `No courses match "${query}"`
                  : `No ${
                      privacyFilter !== "all" ? privacyFilter : ""
                    } courses available`}
              </p>
              {(query || privacyFilter !== "all") && (
                <button
                  onClick={() => {
                    setQuery("");
                    setPrivacyFilter("all");
                  }}
                  className="mt-4 text-blue-700 hover:text-blue-800 text-sm font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            // Render filtered courses
            filteredCourses.map((course) => {
              const styles = {
                headerColor: "bg-blue-700/70",
                borderColor: "border-blue-900/70",
                badgeColor: "bg-blue-800/70",
                badgeTextColor: "text-white",
              };

              return (
                <div
                  key={course.id}
                  className={`cursor-pointer group rounded-xl bg-white border shadow-sm transition hover:shadow-md ${styles.borderColor}`}
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  {/* Main card content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="text-base font-semibold text-gray-900 truncate">{course.title}</h2>
                        <p className="mt-2 text-sm text-gray-700 line-clamp-3 whitespace-pre-wrap break-words">
                          {course.content}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <HiOutlineBookOpen className="h-8 w-8 text-indigo-600" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles.badgeColor} ${styles.badgeTextColor} inline-flex items-center gap-1`}>
                        {course.privacy === "public" ? (
                          <>
                            <MdOutlinePublic className="h-3 w-3" /> Public
                          </>
                        ) : (
                          <>
                            <MdLockOutline className="h-3 w-3" /> Private
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <footer className="px-5 py-3 border-t bg-gray-50/60 flex items-center justify-between gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${(course.current_enrolled / course.capacity) * 100}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-500 shrink-0 flex items-center gap-2">
                      <span>by {course.instructor_name}</span>
                      <span className="flex items-center gap-1">
                        <PiUsersThreeBold className="h-4 w-4" />
                        {course.current_enrolled} / {course.capacity}
                      </span>
                    </div>
                  </footer>
                </div>
              );
            })
          )}
        </div>
          </>
        )}
    </main>
  );
};

export default Course;
