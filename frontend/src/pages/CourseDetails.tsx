import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  leaveCourse,
  removeLearner,
  acceptJoinRequest,
  rejectJoinRequest,
  addCourseMaterial,
  deleteCourseMaterial,
  addCourseComment,
  addCourseAnnouncement,
  deleteCourseAnnouncement,
} from "../api/courses";
import { PiStudentFill, PiUsersThreeBold } from "react-icons/pi";
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
import { FaRegFileAlt, FaRegCommentDots } from "react-icons/fa";
import { FaLink } from "react-icons/fa6";
import { VscRequestChanges } from "react-icons/vsc";
import { BsSend } from "react-icons/bs";
import "../App.css";
import EditCourseModal from "../components/modals/EditCourseModal";
import AddMaterialModal from "../components/modals/AddMaterialModal";

interface Course {
  id: number;
  instructor_id: number;
  title: string;
  content: string;
  instructor_name: string;
  privacy: string;
  current_enrolled: number;
  capacity: number;
  status: string;
  active_learners?: any[];
  join_requests?: any[];
  materials?: any[];
  comments?: any[];
  announcements?: any[];
}

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [isInstructor, setIsInstructor] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState<
    "learners" | "comments" | "announcements" | "requests" | "materials"
  >("learners");

  // Management modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [materialFilter, setMaterialFilter] = useState<
    "all" | "file" | "video" | "link"
  >("all");
  const [newComment, setNewComment] = useState("");
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
  });

  // Edit form state
  const [editForm, setEditForm] = useState<{
    title: string;
    content: string;
    privacy: "public" | "private";
    capacity: number;
  }>({
    title: "",
    content: "",
    privacy: "public",
    capacity: 50,
  });

  // Material form handled by AddMaterialModal

  // Data states
  const [learners, setLearners] = useState<any[]>([]);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getCourse(id);
      const data = response.data;

      setCourse(data.course);
      setIsInstructor(data.is_instructor);
      setIsEnrolled(data.is_enrolled || false);
      setHasPendingRequest(data.has_pending_request || false);

      // Set data from course relationships
      setLearners(data.course.active_learners || []);
      setJoinRequests(data.course.join_requests || []);
      setMaterials(data.course.materials || []);
      setComments(data.course.comments || []);
      setAnnouncements(data.course.announcements || []);

      // Initialize edit form
      setEditForm({
        title: data.course.title,
        content: data.course.content || "",
        privacy: data.course.privacy,
        capacity: data.course.capacity,
      });
    } catch (err: any) {
      console.error("Error fetching course:", err);
      setError(err.response?.data?.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  // Edit handled by EditCourseModal

  const handleDeleteCourse = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to disband this course?")) return;

    try {
      await deleteCourse(id);
      alert("Course disbanded successfully");
      navigate("/courses");
    } catch (err: any) {
      console.error("Error deleting course:", err);
      alert(err.response?.data?.message || "Failed to disband course");
    }
  };

  const handleRemoveLearner = async (userId: number) => {
    if (!id) return;
    if (!confirm("Are you sure you want to remove this learner?")) return;

    try {
      await removeLearner(id, userId);
      await fetchCourseData();
      alert("Learner removed successfully");
    } catch (err: any) {
      console.error("Error removing learner:", err);
      alert(err.response?.data?.message || "Failed to remove learner");
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    if (!id) return;

    try {
      await acceptJoinRequest(id, requestId);
      await fetchCourseData();
      alert("Request accepted");
    } catch (err: any) {
      console.error("Error accepting request:", err);
      alert(err.response?.data?.message || "Failed to accept request");
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    if (!id) return;

    try {
      await rejectJoinRequest(id, requestId);
      await fetchCourseData();
      alert("Request rejected");
    } catch (err: any) {
      console.error("Error rejecting request:", err);
      alert(err.response?.data?.message || "Failed to reject request");
    }
  };

  const handleEnrollCourse = async () => {
    if (!id) return;

    try {
      const response = await enrollInCourse(id);
      await fetchCourseData();
      alert(response.data.message || "Successfully enrolled!");
    } catch (err: any) {
      console.error("Error enrolling:", err);
      alert(err.response?.data?.message || "Failed to enroll in course");
    }
  };

  const handleLeaveCourse = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to leave this course?")) return;

    try {
      const response = await leaveCourse(id);
      await fetchCourseData();
      alert(response.data.message || "Successfully left the course");
    } catch (err: any) {
      console.error("Error leaving course:", err);
      alert(err.response?.data?.message || "Failed to leave course");
    }
  };

  // Add material handled by AddMaterialModal

  const handleDeleteMaterial = async (materialId: number) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this material?")) return;

    try {
      await deleteCourseMaterial(id, materialId);
      await fetchCourseData();
      alert("Material deleted");
    } catch (err: any) {
      console.error("Error deleting material:", err);
      alert(err.response?.data?.message || "Failed to delete material");
    }
  };

  const handleAddComment = async () => {
    if (!id || !newComment.trim()) return;

    try {
      await addCourseComment(id, newComment);
      await fetchCourseData();
      setNewComment("");
      alert("Comment posted!");
    } catch (err: any) {
      console.error("Error adding comment:", err);
      alert(err.response?.data?.message || "Failed to post comment");
    }
  };

  const handleAddAnnouncement = async () => {
    if (!id || !newAnnouncement.title.trim() || !newAnnouncement.content.trim())
      return;

    try {
      await addCourseAnnouncement(id, newAnnouncement);
      await fetchCourseData();
      setNewAnnouncement({ title: "", content: "" });
      alert("Announcement posted!");
    } catch (err: any) {
      console.error("Error adding announcement:", err);
      alert(err.response?.data?.message || "Failed to post announcement");
    }
  };

  const handleDeleteAnnouncement = async (announcementId: number) => {
    if (!id) return;

    try {
      await deleteCourseAnnouncement(id, announcementId);
      await fetchCourseData();
      alert("Announcement deleted");
    } catch (err: any) {
      console.error("Error deleting announcement:", err);
      alert(err.response?.data?.message || "Failed to delete announcement");
    }
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-sm text-gray-600">Loading course...</p>
        </div>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{error || "Course Not Found"}</h1>
          <p className="text-sm text-gray-600 mb-6">The course you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate("/courses")}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
          >
            <MdArrowBack className="h-5 w-5" /> Back to Courses
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-0">
      {/* Course Header */}
      <div className="bg-indigo-600 text-white">
        <div className="px-6 py-4">
          {/* Back Button */}
          <button
            onClick={() => navigate("/courses")}
            className="flex items-center gap-2 text-indigo-100 hover:text-white mb-4 text-sm"
          >
            <MdArrowBack className="h-5 w-5" />
            Back to Courses
          </button>
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-4">
              <HiOutlineBookOpen className="h-10 w-10 text-white/90" />
              <div>
                <h2 className="text-xl font-bold text-white">{course.title}</h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className="bg-indigo-700 text-indigo-100 px-2 py-1 rounded-full text-xs font-medium">
                    {course.privacy}
                  </span>

                  <span className="text-white/90 text-sm inline-flex items-center gap-1">
                    <PiStudentFill className="text-white/90 h-5 w-5" />
                    {course.current_enrolled} / {course.capacity} learners
                  </span>
                </div>
              </div>
            </div>
            {isInstructor ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/20 border border-white/30 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-white/30"
                >
                  <LiaEditSolid className="h-5 w-5" />
                  Edit
                </button>
                <button
                  onClick={handleDeleteCourse}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-red-700"
                >
                  <RiDeleteBin6Line className="h-5 w-5" />
                  Disband
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                {user ? (
                  isEnrolled ? (
                    <button
                      onClick={handleLeaveCourse}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-red-700"
                    >
                      <LiaUserMinusSolid className="h-5 w-5" />
                      Leave Course
                    </button>
                  ) : hasPendingRequest ? (
                    <button
                      disabled
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-400 px-3 py-2 text-sm font-semibold text-white cursor-not-allowed"
                    >
                      <VscRequestChanges className="h-5 w-5" />
                      Request Pending
                    </button>
                  ) : course && course.current_enrolled >= course.capacity ? (
                    <button
                      disabled
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-400 px-3 py-2 text-sm font-semibold text-white cursor-not-allowed"
                    >
                      Course Full
                    </button>
                  ) : (
                    <button
                      onClick={handleEnrollCourse}
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
                    >
                      <HiOutlinePlus className="h-5 w-5" />
                      {course?.privacy === "private" ? "Request to Join" : "Join Course"}
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
                  >
                    Login to Join
                  </button>
                )}
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
                <PiUsersThreeBold className="h-4 w-4" />
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
                  {announcements.length}
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
                            {learner.enrolled_at || new Date(learner.pivot?.created_at || learner.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleRemoveLearner(learner.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 font-medium"
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
                    <div key={request.id} className="rounded-xl bg-white border shadow-sm p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{request.user?.name || 'Unknown'}</h3>
                          <p className="text-sm text-gray-600">
                            {request.user?.email || ''}
                          </p>
                          <p className="text-xs text-gray-500">
                            Requested on {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptRequest(request.id)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 font-medium inline-flex items-center gap-1"
                          >
                            <RiCheckLine className="h-4 w-4" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 font-medium inline-flex items-center gap-1"
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
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors border ${materialFilter === "all" ? "bg-indigo-600 text-white border-indigo-600 shadow" : "bg-white/70 text-gray-700 border-indigo-100 hover:bg-white"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setMaterialFilter("file")}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors border ${materialFilter === "file" ? "bg-indigo-600 text-white border-indigo-600 shadow" : "bg-white/70 text-gray-700 border-indigo-100 hover:bg-white"}`}
                  >
                    Files
                  </button>
                  <button
                    onClick={() => setMaterialFilter("video")}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors border ${materialFilter === "video" ? "bg-indigo-600 text-white border-indigo-600 shadow" : "bg-white/70 text-gray-700 border-indigo-100 hover:bg-white"}`}
                  >
                    Videos
                  </button>
                  <button
                    onClick={() => setMaterialFilter("link")}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors border ${materialFilter === "link" ? "bg-indigo-600 text-white border-indigo-600 shadow" : "bg-white/70 text-gray-700 border-indigo-100 hover:bg-white"}`}
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
                        className="rounded-xl bg-white border shadow-sm p-4 hover:shadow-md transition"
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
                                  material.file_type?.toUpperCase()}
                                {material.type === "file" && material.file_type && " • "}
                                Uploaded {new Date(material.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {isInstructor && (
                            <button
                              onClick={() => handleDeleteMaterial(material.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <RiDeleteBin6Line className="h-5 w-5" />
                            </button>
                          )}
                        </div>

                        <button className="mt-3 w-full px-3 py-2 bg-indigo-50 text-indigo-600 rounded-md text-sm hover:bg-indigo-100 font-medium">
                          {material.type === "file" ? "Download" : "Open"}
                        </button>
                      </div>
                    ))}
                </div>

                {/* Add Material Button */}
                {isInstructor && (
                  <button
                    onClick={() => setShowAddMaterialModal(true)}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
                  >
                    <HiOutlinePlus className="h-5 w-5" /> Add Material
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
                                comment.user?.id === course.instructor_id
                                  ? "text-blue-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {comment.user?.name || 'Unknown User'}
                            </span>
                            {comment.user?.id === course.instructor_id && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                Instructor
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(comment.created_at).toLocaleDateString()}
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
                    className="w-full px-3 py-2 border border-indigo-100 rounded-md mb-3 text-black bg-white/80 backdrop-blur focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                  />
                  <button
                    onClick={handleAddComment}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
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
                <div className="rounded-xl bg-white border shadow-sm">
                  <div className="p-5 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
                    <span className="text-sm text-gray-600">
                      {announcements.length === 0
                        ? "No announcements yet"
                        : `${announcements.length} item${announcements.length > 1 ? 's' : ''}`}
                    </span>
                  </div>
                  {announcements.length === 0 ? (
                    <div className="px-5 pb-5">
                      <div className="rounded-lg p-8 text-center text-gray-500 border border-dashed border-gray-300 bg-white/60">
                        <RiMegaphoneLine className="mx-auto h-10 w-10 text-gray-400" />
                        <h4 className="mt-2 text-sm font-medium text-gray-900">No announcements found</h4>
                        <p className="mt-1 text-sm text-gray-500">Announcements posted by the instructor will appear here.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {announcements.map((announcement: any) => (
                        <div key={announcement.id} className="px-5 py-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <h4 className="text-base font-semibold text-gray-900 truncate">{announcement.title}</h4>
                              <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap break-words">{announcement.content}</p>
                              <span className="mt-2 block text-xs text-gray-500">Posted on {new Date(announcement.created_at).toLocaleDateString()}</span>
                            </div>
                            {isInstructor && (
                              <button
                                onClick={() => handleDeleteAnnouncement(announcement.id)}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 font-medium inline-flex items-center gap-1 shrink-0"
                                title="Delete announcement"
                              >
                                <RiDeleteBin6Line className="h-4 w-4" /> Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {isInstructor && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-3">Post New Announcement</h3>
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
                      className="w-full px-3 py-2 border border-indigo-100 rounded-md mb-3 bg-white/80 backdrop-blur focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
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
                      className="w-full px-3 py-2 border border-indigo-100 rounded-md mb-3 bg-white/80 backdrop-blur focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      rows={4}
                    />
                    <button
                      onClick={handleAddAnnouncement}
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
                    >
                      <RiMegaphoneLine className="h-4 w-4" /> Post Announcement
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Course Modal (standardized) */}
      <EditCourseModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        initial={{
          title: editForm.title,
          content: editForm.content,
          privacy: editForm.privacy,
          capacity: editForm.capacity,
        }}
        onSubmit={async (payload) => {
          if (!id) return;
          await updateCourse(id, payload);
          await fetchCourseData();
          alert("Course updated successfully!");
        }}
      />

      {/* Add Material Modal (standardized) */}
      <AddMaterialModal
        show={showAddMaterialModal}
        onClose={() => setShowAddMaterialModal(false)}
        onSubmit={async (payload) => {
          if (!id) return;
          await addCourseMaterial(id, payload);
          await fetchCourseData();
          alert("Material added successfully!");
        }}
      />
    </main>
  );
};

export default CourseDetails;
