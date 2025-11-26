import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PiStudentFill } from "react-icons/pi";
import { RiDeleteBin6Line, RiCheckLine, RiMegaphoneLine } from "react-icons/ri";
import {
  LiaTimesSolid,
  LiaUserMinusSolid,
  LiaEditSolid,
} from "react-icons/lia";
import {
  MdArrowBack,
  MdOutlineEmail,
  MdOutlineSlowMotionVideo,
} from "react-icons/md";
import { HiOutlineBookOpen, HiOutlinePlus } from "react-icons/hi";
import { FaUsers, FaRegFileAlt, FaRegCommentDots } from "react-icons/fa";
import { FaLink } from "react-icons/fa6";
import { VscRequestChanges } from "react-icons/vsc";
import { BsSend } from "react-icons/bs";

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock instructor check - in real app, this would come from auth context
  const isInstructor = true; // Set to true for demo purposes

  // Active tab state
  const [activeTab, setActiveTab] = useState<
    "learners" | "comments" | "announcements" | "requests" | "materials"
  >("learners");

  // Management modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [materialType, setMaterialType] = useState<"file" | "video" | "link">(
    "file"
  );
  const [materialFilter, setMaterialFilter] = useState<
    "all" | "file" | "video" | "link"
  >("all");
  const [newComment, setNewComment] = useState("");
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
  });

  // Mock data for management features
  const [joinRequests] = useState([
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      requestedAt: "2025-11-20",
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob@example.com",
      requestedAt: "2025-11-21",
    },
    {
      id: 3,
      name: "Carol Davis",
      email: "carol@example.com",
      requestedAt: "2025-11-22",
    },
  ]);

  const [learners] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      enrolledAt: "1/16/2024",
      status: "active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      enrolledAt: "1/17/2024",
      status: "active",
    },
  ]);

  const [comments] = useState([
    {
      id: 1,
      author: "Alice Johnson",
      content: "Great course! Very informative.",
      postedAt: "2025-11-20",
      isInstructor: false,
    },
    {
      id: 2,
      author: "Bob Smith",
      content: "The assignments are challenging but rewarding.",
      postedAt: "2025-11-21",
      isInstructor: false,
    },
  ]);

  const [courseAnnouncements] = useState([
    {
      id: 1,
      title: "Welcome to the Course!",
      content:
        "Welcome everyone! Let's make this an amazing learning experience.",
      postedAt: "2025-11-15",
    },
  ]);

  const [materials] = useState([
    {
      id: 1,
      title: "Course Syllabus",
      type: "file" as const,
      fileType: "pdf",
      url: "/files/syllabus.pdf",
      uploadedAt: "2025-11-20",
    },
    {
      id: 2,
      title: "Introduction Video",
      type: "video" as const,
      url: "https://youtube.com/watch?v=example",
      uploadedAt: "2025-11-21",
    },
    {
      id: 3,
      title: "HTML Documentation",
      type: "link" as const,
      url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
      uploadedAt: "2025-11-22",
    },
  ]);

  // Mock course data
  const courses = [
    {
      id: 1,
      title: "Web Development Fundamentals",
      content:
        "Learn the basics of HTML, CSS, and JavaScript to build modern web applications.",
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Course Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The course you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/courses")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md inline-flex items-center gap-2"
          >
            <MdArrowBack className="h-5 w-5" />
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
            <MdArrowBack className="h-5 w-5" />
            Back to Courses
          </button>
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-4">
              <HiOutlineBookOpen className="h-10 w-10 text-white-200" />
              <div>
                <h2 className="text-xl font-bold text-white">{course.title}</h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className="bg-purple-700 text-purple-100 px-2 py-1 rounded-full text-xs font-medium">
                    {course.privacy}
                  </span>

                  <span className="text-white-200 text-sm inline-flex items-center gap-1">
                    <PiStudentFill className="text-white-200 h-5 w-5" />
                    {course.currentEnrolled} / {course.capacity} learners
                  </span>
                </div>
              </div>
            </div>
            {isInstructor && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="bg-gray-500 hover:bg-gray-600 text-white-600 px-4 py-2 rounded-md text-sm font-medium border border-gray-400 flex items-center gap-2"
                >
                  <LiaEditSolid className="h-5 w-5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm("Are you sure you want to disband this course?")
                    ) {
                      alert("Course disbanded");
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center gap-1"
                >
                  <RiDeleteBin6Line className="h-5 w-5" />
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
                <FaUsers className="h-4 w-4" />
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
                  <VscRequestChanges className="h-4 w-4" />
                  Requests
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {joinRequests.length}
                  </span>
                </button>
              )}
              <button
                onClick={() => setActiveTab("materials")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "materials"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FaRegFileAlt className="h-4 w-4" />
                Materials
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {materials.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("comments")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "comments"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FaRegCommentDots className="h-4 w-4" />
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
                <RiMegaphoneLine className="h-4 w-4" />
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
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Joined
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {learners.map((learner) => (
                        <tr
                          key={learner.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-4 text-sm text-gray-900">
                            {learner.name}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600 flex items-center gap-2">
                            <MdOutlineEmail className="h-4 w-4 text-gray-400" />
                            {learner.email}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {learner.enrolledAt}
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() =>
                                alert(`Removed ${learner.name} from course`)
                              }
                              className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 font-medium"
                            >
                              <LiaUserMinusSolid className="h-4 w-4" />
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
                          <p className="text-sm text-gray-600">
                            {request.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            Requested on {request.requestedAt}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              alert(`Accepted ${request.name}'s request`)
                            }
                            className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 font-medium inline-flex items-center gap-1"
                          >
                            <RiCheckLine className="h-4 w-4" />
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              alert(`Rejected ${request.name}'s request`)
                            }
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 font-medium inline-flex items-center gap-1"
                          >
                            <LiaTimesSolid className="h-4 w-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Materials Tab */}
            {activeTab === "materials" && (
              <div>
                {/* Category Filter */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setMaterialFilter("all")}
                    className={`px-3 py-1 rounded-md text-sm ${
                      materialFilter === "all"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setMaterialFilter("file")}
                    className={`px-3 py-1 rounded-md text-sm ${
                      materialFilter === "file"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Files
                  </button>
                  <button
                    onClick={() => setMaterialFilter("video")}
                    className={`px-3 py-1 rounded-md text-sm ${
                      materialFilter === "video"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Videos
                  </button>
                  <button
                    onClick={() => setMaterialFilter("link")}
                    className={`px-3 py-1 rounded-md text-sm ${
                      materialFilter === "link"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Links
                  </button>
                </div>

                {/* Materials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {materials
                    .filter(
                      (m) =>
                        materialFilter === "all" || m.type === materialFilter
                    )
                    .map((material) => (
                      <div
                        key={material.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {/* Icon based on type */}
                            {material.type === "file" && (
                              <FaRegFileAlt className="h-10 w-10 text-blue-500" />
                            )}
                            {material.type === "video" && (
                              <MdOutlineSlowMotionVideo className="h-10 w-10 text-red-500" />
                            )}
                            {material.type === "link" && (
                              <FaLink className="h-10 w-10 text-green-500" />
                            )}

                            <div>
                              <h4 className="font-medium text-gray-900">
                                {material.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {material.type === "file" &&
                                  material.fileType?.toUpperCase()}
                                {material.type === "file" && " • "}
                                Uploaded {material.uploadedAt}
                              </p>
                            </div>
                          </div>

                          {isInstructor && (
                            <button
                              onClick={() =>
                                alert(`Deleted material: ${material.title}`)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <RiDeleteBin6Line className="h-5 w-5" />
                            </button>
                          )}
                        </div>

                        <button className="mt-3 w-full px-3 py-2 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100 font-medium">
                          {material.type === "file" ? "Download" : "Open"}
                        </button>
                      </div>
                    ))}
                </div>

                {/* Add Material Button */}
                {isInstructor && (
                  <button
                    onClick={() => setShowAddMaterialModal(true)}
                    className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 inline-flex items-center gap-2"
                  >
                    <HiOutlinePlus className="h-5 w-5" />
                    Add Material
                  </button>
                )}
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === "comments" && (
              <div>
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border-b border-gray-200 pb-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`font-medium ${
                                comment.isInstructor
                                  ? "text-blue-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {comment.author}
                            </span>
                            {comment.isInstructor && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                Instructor
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {comment.postedAt}
                            </span>
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
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                  >
                    <BsSend className="h-4 w-4" />
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
                    <div
                      key={announcement.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {announcement.title}
                          </h3>
                          <p className="text-gray-700 mb-2">
                            {announcement.content}
                          </p>
                          <p className="text-xs text-gray-500">
                            Posted on {announcement.postedAt}
                          </p>
                        </div>
                        {isInstructor && (
                          <button
                            onClick={() => alert("Announcement deleted")}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 font-medium ml-4 inline-flex items-center gap-1"
                          >
                            <RiDeleteBin6Line className="h-4 w-4" />
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
                    <h3 className="text-lg font-medium mb-3">
                      Post New Announcement
                    </h3>
                    <input
                      type="text"
                      value={newAnnouncement.title}
                      onChange={(e) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          title: e.target.value,
                        })
                      }
                      placeholder="Announcement Title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
                    />
                    <textarea
                      value={newAnnouncement.content}
                      onChange={(e) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          content: e.target.value,
                        })
                      }
                      placeholder="Write your announcement here..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
                      rows={4}
                    />
                    <button
                      onClick={() => {
                        if (
                          newAnnouncement.title.trim() &&
                          newAnnouncement.content.trim()
                        ) {
                          alert("Announcement posted!");
                          setNewAnnouncement({ title: "", content: "" });
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                    >
                      <RiMegaphoneLine className="h-4 w-4" />
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
                <label className="block text-sm font-medium mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  defaultValue={course.title}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  defaultValue={course.content}
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
                  defaultValue={course.privacy}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Learners Limit
                </label>
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
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-md inline-flex items-center gap-2"
                >
                  <LiaTimesSolid className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 inline-flex items-center gap-2"
                >
                  <RiCheckLine className="h-4 w-4" />
                  Update Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Material Modal */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Course Material</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Material uploaded!");
                setShowAddMaterialModal(false);
              }}
            >
              {/* Material Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Material Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMaterialType("file")}
                    className={`flex-1 px-3 py-2 rounded-md text-sm ${
                      materialType === "file"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    File
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaterialType("video")}
                    className={`flex-1 px-3 py-2 rounded-md text-sm ${
                      materialType === "video"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaterialType("link")}
                    className={`flex-1 px-3 py-2 rounded-md text-sm ${
                      materialType === "link"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Link
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              {materialType === "file" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Upload File
                  </label>
                  <input
                    type="file"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                  />
                </div>
              )}

              {(materialType === "video" || materialType === "link") && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Description (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMaterialModal(false)}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-md inline-flex items-center gap-2"
                >
                  <LiaTimesSolid className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 inline-flex items-center gap-2"
                >
                  <RiCheckLine className="h-4 w-4" />
                  Upload
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
