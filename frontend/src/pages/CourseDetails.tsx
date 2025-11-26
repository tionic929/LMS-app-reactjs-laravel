import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock instructor check - in real app, this would come from auth context
  const isInstructor = true; // Set to true for demo purposes

  // Active tab state
  const [activeTab, setActiveTab] = useState<"learners" | "comments" | "announcements" | "requests">("learners");

  // Management modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: ""
  });

  // Mock data for management features
  const [joinRequests] = useState([
    { id: 1, name: "Alice Johnson", email: "alice@example.com", requestedAt: "2025-11-20" },
    { id: 2, name: "Bob Smith", email: "bob@example.com", requestedAt: "2025-11-21" },
    { id: 3, name: "Carol Davis", email: "carol@example.com", requestedAt: "2025-11-22" },
  ]);

  const [learners] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", enrolledAt: "1/16/2024", status: "active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", enrolledAt: "1/17/2024", status: "active" },
  ]);

  const [comments] = useState([
    { id: 1, author: "Alice Johnson", content: "Great course! Very informative.", postedAt: "2025-11-20", isInstructor: false },
    { id: 2, author: "Bob Smith", content: "The assignments are challenging but rewarding.", postedAt: "2025-11-21", isInstructor: false },
  ]);

  const [courseAnnouncements] = useState([
    { id: 1, title: "Welcome to the Course!", content: "Welcome everyone! Let's make this an amazing learning experience.", postedAt: "2025-11-15" },
  ]);

  // Mock course data
  const courses = [
    {
      id: 1,
      title: "Web Development Fundamentals",
      content: "Learn the basics of HTML, CSS, and JavaScript to build modern web applications.",
      author: "John Doe",
      privacy: "Public",
      currentEnrolled: "32",
      capacity: "50",
    },
  ];

  const course = courses.find((c) => c.id === parseInt(id || "0"));

  if (!course) {
    return (
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/courses")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
          >
            Back to Courses
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-auto">
        {/* Course Header */}
        <div className="bg-purple-500 text-white">
          <div className="px-6 py-4">
            {/* Back Button */}
            <button
              onClick={() => navigate("/courses")}
              className="flex items-center gap-2 text-purple-100 hover:text-white mb-4 text-sm"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Courses
            </button>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <svg
                  className="h-6 w-6"
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
                <div>
                  <h2 className="text-xl font-bold text-white">{course.title}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="bg-purple-700 text-purple-100 px-2 py-1 rounded-full text-xs font-medium">
                      {course.privacy}
                    </span>
                    <span className="text-purple-200 text-sm">
                      {course.currentEnrolled} / {course.capacity} learners
                    </span>
                  </div>
                </div>
              </div>
              {isInstructor && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="bg-gray-500 hover:bg-gray-600 text-purple-600 px-4 py-2 rounded-md text-sm font-medium border border-gray-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to disband this course?")) {
                        alert("Course disbanded");
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Disband
                  </button>
                </div>
              )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white">
          <div className="border-b border-gray-200 px-6">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("learners")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "learners"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Learners
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {learners.length}
                </span>
              </button>
              {isInstructor && (
                <button
                  onClick={() => setActiveTab("requests")}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === "requests"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Requests
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {joinRequests.length}
                  </span>
                </button>
              )}
              <button
                onClick={() => setActiveTab("comments")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "comments"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Comments
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {comments.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("announcements")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "announcements"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                Announcements
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {courseAnnouncements.length}
                </span>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="px-6 py-4">
            {/* Learners Tab */}
            {activeTab === "learners" && (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Joined</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {learners.map((learner) => (
                        <tr key={learner.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 text-sm text-gray-900">{learner.name}</td>
                          <td className="py-4 px-4 text-sm text-gray-600 flex items-center gap-2">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {learner.email}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">{learner.enrolledAt}</td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => alert(`Removed ${learner.name} from course`)}
                              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                              </svg>
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === "requests" && isInstructor && (
              <div>
                <div className="space-y-3">
                  {joinRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{request.name}</h3>
                          <p className="text-sm text-gray-600">{request.email}</p>
                          <p className="text-xs text-gray-500">Requested on {request.requestedAt}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => alert(`Accepted ${request.name}'s request`)}
                            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => alert(`Rejected ${request.name}'s request`)}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === "comments" && (
              <div>
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`font-medium ${comment.isInstructor ? 'text-blue-600' : 'text-gray-900'}`}>
                              {comment.author}
                            </span>
                            {comment.isInstructor && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                Instructor
                              </span>
                            )}
                            <span className="text-xs text-gray-500">{comment.postedAt}</span>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Comment Form */}
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-medium mb-3">Add a Comment</h3>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your comment here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
                    rows={3}
                  />
                  <button
                    onClick={() => {
                      if (newComment.trim()) {
                        alert("Comment posted!");
                        setNewComment("");
                      }
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            )}

            {/* Announcements Tab */}
            {activeTab === "announcements" && (
              <div>
                <div className="space-y-6">
                  {courseAnnouncements.map((announcement) => (
                    <div key={announcement.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{announcement.title}</h3>
                          <p className="text-gray-700 mb-2">{announcement.content}</p>
                          <p className="text-xs text-gray-500">Posted on {announcement.postedAt}</p>
                        </div>
                        {isInstructor && (
                          <button
                            onClick={() => alert("Announcement deleted")}
                            className="text-red-500 hover:text-red-700 text-sm ml-4"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Announcement Form */}
                {isInstructor && (
                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-lg font-medium mb-3">Post New Announcement</h3>
                    <input
                      type="text"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                      placeholder="Announcement Title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
                    />
                    <textarea
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                      placeholder="Write your announcement here..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
                      rows={4}
                    />
                    <button
                      onClick={() => {
                        if (newAnnouncement.title.trim() && newAnnouncement.content.trim()) {
                          alert("Announcement posted!");
                          setNewAnnouncement({ title: "", content: "" });
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Post Announcement
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Course Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Course</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Course updated!");
                setShowEditModal(false);
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Course Name</label>
                <input
                  type="text"
                  defaultValue={course.title}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  defaultValue={course.content}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Privacy</label>
                <select defaultValue={course.privacy} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Learners Limit</label>
                <input
                  type="number"
                  defaultValue={course.capacity}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Update Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default CourseDetails;