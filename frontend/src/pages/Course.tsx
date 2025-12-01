import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getCourses, createCourse } from "../api/courses";
import { HiOutlineBookOpen, HiOutlinePlus } from "react-icons/hi";
import { RiCheckLine } from "react-icons/ri";
import { LiaTimesSolid } from "react-icons/lia";
import { PiUsersThreeBold } from "react-icons/pi";
import { MdLockOutline, MdOutlinePublic, MdArrowBack } from "react-icons/md";

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

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    privacy: "public" as "public" | "private",
    capacity: 50,
  });

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

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCourse(formData);
      await fetchCourses();
      setShowModal(false);
      setFormData({ title: "", content: "", privacy: "public", capacity: 50 });
      alert("Course created successfully!");
    } catch (err: any) {
      console.error("Error creating course:", err);
      alert(err.response?.data?.message || "Failed to create course");
    }
  };

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
    <main className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Courses</h1>
            <p className="text-sm text-gray-500">
              Explore and Manage your courses
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses..."
              className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={privacyFilter}
              onChange={(e) => setPrivacyFilter(e.target.value)}
              className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[110px]"
            >
              {privacyFilterOptions.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
            {user?.role === "instructor" && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center gap-2 text-sm font-medium shadow-sm"
              >
                <HiOutlinePlus className="w-5 h-5" />
                Add New
              </button>
            )}
          </div>
        </div>
        &nbsp;
        {/* Add New Course Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add New Course</h2>
              <form onSubmit={handleCreateCourse}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Privacy
                  </label>
                  <select
                    value={formData.privacy}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        privacy: e.target.value as "public" | "private",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min={1}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 inline-flex items-center gap-2"
                  >
                    <LiaTimesSolid className="w-5 h-5" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 inline-flex items-center gap-2"
                  >
                    <RiCheckLine className="w-5 h-5" />
                    Add Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading courses...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchCourses}
              className="mt-4 text-blue-500 hover:text-blue-600 text-sm font-medium"
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
            <div className="col-span-full text-center py-12">
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
                  className="mt-4 text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            // Render filtered courses
            filteredCourses.map((course) => {
              const styles = {
                headerColor: "bg-purple-500",
                borderColor: "border-purple-500",
                badgeColor: "bg-purple-700",
                badgeTextColor: "text-purple-100",
              };

              return (
                <div
                  key={course.id}
                  className={`bg-white rounded-md shadow-xl hover:shadow-2xl border-b-4 ${styles.borderColor} overflow-hidden flex flex-col cursor-pointer`}
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  {/* Main card content */}
                  <div className="flex-1">
                    {/* Colored header section */}
                    <div
                      className={`${styles.headerColor} text-white px-6 py-4 rounded-t-lg`}
                    >
                      <div className="flex items-center justify-center">
                        <HiOutlineBookOpen className="h-10 w-10 mr-2" />
                      </div>
                    </div>

                    {/* Card content */}
                    <div className="p-6">
                      <h2 className="font-bold mb-1">{course.title}</h2>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {course.content}
                      </p>
                      <div className="flex gap-2">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          {course.privacy === "public" ? (
                            <>
                              <MdOutlinePublic className="h-3 w-3" />
                              Public
                            </>
                          ) : (
                            <>
                              <MdLockOutline className="h-3 w-3" />
                              Private
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-3">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${
                            (course.current_enrolled / course.capacity) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>by {course.instructor_name}</span>
                      <span className="flex items-center gap-1">
                        <PiUsersThreeBold className="h-4 w-4" />
                        {course.current_enrolled} / {course.capacity}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Course;
