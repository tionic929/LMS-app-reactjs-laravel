import React from "react";
import { useState } from "react";

const AnnouncementsPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const getAnnouncementStyles = (type: string) => {
    switch (type) {
      case "info":
        return {
          headerColor: "bg-blue-500",
          borderColor: "border-blue-500",
          badgeColor: "bg-blue-700",
          badgeTextColor: "text-blue-100",
        };
      case "warning":
        return {
          headerColor: "bg-yellow-500",
          borderColor: "border-yellow-500",
          badgeColor: "bg-yellow-600",
          badgeTextColor: "text-yellow-100",
        };
      case "success":
        return {
          headerColor: "bg-green-500",
          borderColor: "border-green-500",
          badgeColor: "bg-green-700",
          badgeTextColor: "text-green-100",
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
      title: "Welcome to Our Learning Management System",
      content:
        "We're excited to have you join our LMS platform. Here you'll find all the tools and resources you need for your learning journey.",
      type: "info",
      date: "November 24, 2025",
    },
    {
      id: 2,
      title: "System Maintenance Scheduled",
      content:
        "The system will be undergoing maintenance this weekend. Please save your work and log out before the scheduled time.",
      type: "warning",
      date: "November 25, 2025",
    },
    {
      id: 3,
      title: "New Course Available: Advanced React",
      content:
        "We have added a new advanced React course to help you deepen your understanding and skills.",
      type: "success",
      date: "November 26, 2025",
    },
    {
        id: 4, 
        title: "Holiday Schedule Announcement",
        content:
          "Please be informed of the upcoming holiday schedule. The LMS will be accessible, but support services will be limited.",
        type: "info",
        date: "November 27, 2025",
    }
  ];

  const filterOptions = [
    { label: "All", value: "all", color: "gray" },
    { label: "Info", value: "info", color: "blue" },
    { label: "Warning", value: "warning", color: "yellow" },
    { label: "Success", value: "success", color: "green" },
  ];

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesFilter =
      activeFilter === "all" || announcement.type === activeFilter;
    const matchesSearch =
      announcement.title.toLowerCase().includes(query.toLowerCase()) ||
      announcement.content.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Announcements
          </h1>
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search announcements..."
              className="w-60 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>
        &nbsp;
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredAnnouncements.length} of {announcements.length}{" "}
            announcements
            {activeFilter !== "all" && ` (filtered by ${activeFilter})`}
            {query && ` (search: "${query}")`}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnnouncements.length === 0 ? (
            // Empty state when no results
            <div className="text-center py-12">
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
                  : `No ${activeFilter} announcements available`}
              </p>
              {(query || activeFilter !== "all") && (
                <button
                  onClick={() => {
                    setQuery("");
                    setActiveFilter("all");
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
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <span
                          className={`${styles.badgeColor} ${styles.badgeTextColor} px-2 py-1 rounded-full text-xs font-medium capitalize`}
                        >
                          {announcement.type}
                        </span>
                        <span className="text-xs opacity-90">
                          Posted on {announcement.date}
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold">
                        {announcement.title}
                      </h2>
                    </div>
                  </div>

                    {/* Card content */}
                    <div className="p-6">
                      <p className="text-gray-600 mb-3">{announcement.content}</p>
                    </div>
                  </div>

                  {/* Action buttons at bottom */}
                  <div className="flex border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Edit announcement: ${announcement.title}`);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors duration-200 border-r border-gray-200"
                      title="Edit announcement"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="text-sm font-medium">Edit</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete "${announcement.title}"?`)) {
                          alert(`Delete announcement: ${announcement.title}`);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors duration-200"
                      title="Delete announcement"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="text-sm font-medium">Delete</span>
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

export default AnnouncementsPage;
