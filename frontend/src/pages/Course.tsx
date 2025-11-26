import React from "react";
import { useState } from "react";

const Course: React.FC = () => {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [privacyFilter, setPrivacyFilter] = useState("all");

  const getAnnouncementStyles = (type: string) => {
    switch (type) {
      case "course":
        return {
          headerColor: "bg-purple-500",
          borderColor: "border-purple-500",
          badgeColor: "bg-purple-700",
          badgeTextColor: "text-purple-100",
        };
      case "community":
        return {
          headerColor: "bg-teal-500",
          borderColor: "border-teal-500",
          badgeColor: "bg-teal-700",
          badgeTextColor: "text-teal-100",
        };
      default:
        return {
          headerColor: "bg-gray-500",
          borderColor: "border-gray-500",
          badgeColor: "bg-gray-700",
          badgeTextColor: "text-gray-100",
        };
    }
  };

  const announcements = [
    {
      id: 1,
      title: "Webdevelopment Course Bootcamp",
      content:
        "Learn HTML, CSS, JavaScript, and the latest web development technologies in our comprehensive bootcamp",
      author: "John Doe",
      type: "course",
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
      type: "community",
      privacy: "public",
      currentEnrolled: "15",
      capacity: "100",
    },
    {
      id: 3,
      title: "New Course Available: Advanced React",
      content:
        "We have added a new advanced React course to help you deepen your understanding and skills.",
      author: "Alice Johnson",
      type: "course",
      privacy: "private",
      currentEnrolled: "10",
      capacity: "30",
    },
    {
        id: 4,
        title: "Nursing Turukan Group",
        content:
          "Join our Nursing Turukan community to connect with fellow nursing students and professionals with turukan resources and support.",
        author: "Joy Garcia",
        type: "community",
        privacy: "private",
        currentEnrolled: "100",
        capacity: "150",
    },
    {
        id: 5,
        title: "Pilosophy Course Launch",
        content:
          "Our new Pilosophy course is now live! Enroll today to start your journey into philosophical thinking and critical analysis.",
          author: "Jose Rizal",
          type: "course",
          privacy: "public",
          currentEnrolled: "22",
          capacity: "50",
    },
    {
        id: 6,
        title: "SKwela Barangay Student Group",
        content:
          "For student SK officers and members, join our SKwela Barangay Student Group to collaborate on projects and initiatives for our community.",
          author: "Andrei Santos",
          type: "community",
          privacy: "public",
          currentEnrolled: "53",
          capacity: "100",
    }
  ];

  const filterOptions = [
    { label: "All", value: "all", color: "gray" },
    { label: "Course", value: "course", color: "purple" },
    { label: "Community", value: "community", color: "teal" },
  ];

  const privacyFilterOptions = [
    { label: "All Privacy", value: "all" },
    { label: "Public", value: "public" },
    { label: "Private", value: "private" },
  ];

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesFilter =
      activeFilter === "all" || announcement.type === activeFilter;
    const matchesPrivacy =
      privacyFilter === "all" || announcement.privacy === privacyFilter;
    const matchesSearch =
      announcement.title.toLowerCase().includes(query.toLowerCase()) ||
      announcement.content.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesPrivacy && matchesSearch;
  });

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Communities & Courses
            </h1>
            <p className="text-sm text-gray-500">
              Explore and Manage your spaces
            </p>
          </div>
        </div>
        &nbsp;
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses or communities..."
            className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[100px]"
          >
            {filterOptions.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
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
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium shadow-sm">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Search
          </button>
        </div>
        &nbsp;
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredAnnouncements.length} of {announcements.length}{" "}
            announcements
            {activeFilter !== "all" && ` (filtered by ${activeFilter})`}
            {privacyFilter !== "all" && ` (${privacyFilter})`}
            {query && ` (search: "${query}")`}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnnouncements.length === 0 ? (
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
                No announcements found
              </h3>
              <p className="text-gray-500">
                {query
                  ? `No announcements match "${query}"`
                  : `No ${activeFilter !== "all" ? activeFilter : ""}${
                      activeFilter !== "all" && privacyFilter !== "all"
                        ? " and "
                        : ""
                    }${
                      privacyFilter !== "all" ? privacyFilter : ""
                    } announcements available`}
              </p>
              {(query || activeFilter !== "all" || privacyFilter !== "all") && (
                <button
                  onClick={() => {
                    setQuery("");
                    setActiveFilter("all");
                    setPrivacyFilter("all");
                  }}
                  className="mt-4 text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            // Render filtered announcements
            filteredAnnouncements.map((announcement) => {
              const styles = getAnnouncementStyles(announcement.type);

              return (
                <div
                  key={announcement.id}
                  className={`bg-white rounded-lg shadow-xl hover:shadow-2xl border-b-4 ${styles.borderColor} overflow-hidden flex flex-col`}
                >
                  {/* Main card content */}
                  <div className="flex-1">
                    {/* Colored header section */}
                    <div
                      className={`${styles.headerColor} text-white px-6 py-4 rounded-t-lg`}
                    >
                      <div className="flex items-center justify-center">
                        {announcement.type === "course" ? (
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
                        ) : (
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
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Card content */}
                    <div className="p-6">
                      <div className="flex gap-2 mb-3">
                        <span
                          className={`${styles.badgeColor} ${styles.badgeTextColor} px-2 py-1 rounded-full text-xs font-medium capitalize`}
                        >
                          {announcement.type}
                        </span>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          {announcement.privacy === "public" ? (
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
                      <h2 className="text-lg font-bold">
                        {announcement.title}
                      </h2>
                      &nbsp;
                      <p className="text-gray-600 mb-3">
                        {announcement.content}
                      </p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>by {announcement.author}</span>
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
                          {announcement.currentEnrolled}/{announcement.capacity}{" "}
                          Learners
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons at bottom */}
                  <div className="flex border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`View details: ${announcement.title}`);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors duration-200 border-r border-gray-200"
                      title="View details"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span className="text-sm font-medium">View Details</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Manage: ${announcement.title}`);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-700 transition-colors duration-200"
                      title="Manage"
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
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-sm font-medium">Manage</span>
                    </button>
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
