import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Course: React.FC = () => {
  const [query, setQuery] = useState("");
  const [privacyFilter, setPrivacyFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const courses = [
    {
      id: 1,
      title: "Webdevelopment Course Bootcamp",
      content:
        "Learn HTML, CSS, JavaScript, and the latest web development technologies in our comprehensive bootcamp",
      author: "John Doe",
      privacy: "public",
      currentEnrolled: "23",
      capacity: "50",
    },
    {
      id: 2,
      title: "Tech Enthusiasts Hub",
      content:
        "The system will be undergoing maintenance this weekend. Please save your work and log out before the scheduled time.",
      author: "Jane Smith",
      privacy: "public",
      currentEnrolled: "15",
      capacity: "100",
    },
    {
      id: 3,
      title: "Advanced React",
      content:
        "We have added a new advanced React course to help you deepen your understanding and skills.",
      author: "Alice Johnson",
      privacy: "private",
      currentEnrolled: "10",
      capacity: "30",
    },
  ];

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
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium shadow-sm"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New
            </button>
          </div>
        </div>
        &nbsp;

        {/* Add New Course Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add New Course</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Course added!"); // Replace with actual add logic
                  setShowModal(false);
                }}
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Privacy
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    defaultValue={50}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Add Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
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
                        <svg
                          className="h-12 w-12"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
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
                              <svg
                                className="h-3 w-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Public
                            </>
                          ) : (
                            <>
                              <svg
                                className="h-3 w-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                              Private
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-3">
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      {/* <span>by {course.author}</span> */}
                      <span className="flex items-center gap-1">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        {course.currentEnrolled} / {course.capacity}{" "}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
};

export default Course;
