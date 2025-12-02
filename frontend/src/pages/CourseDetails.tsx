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
  updateCourseComment,
  deleteCourseComment,
  addCourseAnnouncement,
  deleteCourseAnnouncement,
  banUserFromComments,
  unbanUserFromComments,
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
import AddMaterialModal from "../components/modals/courses/AddMaterialModal";

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState<
    "learners" | "comments" | "announcements" | "requests" | "materials"
  >("learners");

  // Management modals state
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
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
      setIsAdmin(data.is_admin || false);
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

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await updateCourse(id, editForm);
      await fetchCourseData();
      setShowEditModal(false);
      alert("Course updated successfully!");
    } catch (err: any) {
      console.error("Error updating course:", err);
      alert(err.response?.data?.message || "Failed to update course");
    }
  };

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

  const handleUpdateCourseComment = async (
    commentId: number,
    updatedText: string
  ) => {
    if (!id || !updatedText.trim()) return;

    try {
      await updateCourseComment(id, commentId, updatedText);
      await fetchCourseData();
      setEditingCommentId(null);
      alert("Comment updated!");
    } catch (err: any) {
      console.error("Error updating comment:", err);
      alert(err.response?.data?.message || "Failed to update comment");
    }
  };

  const handleDeleteCourseComment = async (commentId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteCourseComment(id!, commentId);
      fetchCourseData();
    } catch (error) {
      console.error("Error deleting comment:", error);
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

  const handleBanUser = async (userId: number) => {
    if (!id) return;
    if (!confirm("Are you sure you want to ban this user from commenting?"))
      return;

    try {
      await banUserFromComments(id, userId);
      await fetchCourseData();
      alert("User banned from commenting");
    } catch (err: any) {
      console.error("Error banning user:", err);
      alert(err.response?.data?.message || "Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId: number) => {
    if (!id) return;

    try {
      await unbanUserFromComments(id, userId);
      await fetchCourseData();
      alert("User unbanned from commenting");
    } catch (err: any) {
      console.error("Error unbanning user:", err);
      alert(err.response?.data?.message || "Failed to unban user");
    }
  };

  if (loading) {
    return (
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-gray-600">Loading course...</p>
        </div>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Course Not Found"}
          </h1>
          <p className="text-gray-600 mb-6">
            The course you're looking for doesn't exist or you don't have access
            to it.
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
                    {course.current_enrolled} / {course.capacity} learners
                  </span>
                </div>
              </div>
            </div>
            {isInstructor || isAdmin ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="bg-gray-500 hover:bg-gray-600 text-white-600 px-4 py-2 rounded-md text-sm font-medium border border-gray-400 flex items-center gap-2"
                >
                  <LiaEditSolid className="h-5 w-5" />
                  Edit
                </button>
                <button
                  onClick={handleDeleteCourse}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center gap-1"
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
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md text-sm font-medium inline-flex items-center gap-2"
                    >
                      <LiaUserMinusSolid className="h-5 w-5" />
                      Leave Course
                    </button>
                  ) : hasPendingRequest ? (
                    <button
                      disabled
                      className="bg-gray-400 text-white px-6 py-2 rounded-md text-sm font-medium inline-flex items-center gap-2 cursor-not-allowed"
                    >
                      <VscRequestChanges className="h-5 w-5" />
                      Request Pending
                    </button>
                  ) : course && course.current_enrolled >= course.capacity ? (
                    <button
                      disabled
                      className="bg-gray-400 text-white px-6 py-2 rounded-md text-sm font-medium cursor-not-allowed"
                    >
                      Course Full
                    </button>
                  ) : (
                    <button
                      onClick={handleEnrollCourse}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium inline-flex items-center gap-2"
                    >
                      <HiOutlinePlus className="h-5 w-5" />
                      {course?.privacy === "private"
                        ? "Request to Join"
                        : "Join Course"}
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium inline-flex items-center gap-2"
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
              {(isInstructor || isAdmin || isEnrolled) && (
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
              )}
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
                        {(isInstructor || isAdmin) && (
                          <>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Email
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Joined
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Actions
                            </th>
                          </>
                        )}
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
                          {(isInstructor || isAdmin) && (
                            <>
                              <td className="py-4 px-4 text-sm text-gray-600 flex items-center gap-2">
                                <MdOutlineEmail className="h-4 w-4 text-gray-400" />
                                {learner.email}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                {learner.enrolled_at ||
                                  new Date(
                                    learner.pivot?.created_at ||
                                      learner.created_at
                                  ).toLocaleDateString()}
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex flex-col gap-2">
                                  {/* Remove learner button for instructors/admins */}
                                  {(isInstructor || isAdmin) && (
                                    <button
                                      onClick={() =>
                                        handleRemoveLearner(learner.id)
                                      }
                                      className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 font-medium"
                                    >
                                      <LiaUserMinusSolid className="h-4 w-4" />
                                      Remove
                                    </button>
                                  )}

                                  {/* Ban/Unban from comments - only for admins */}
                                  {isAdmin &&
                                    (learner.comment_banned ? (
                                      <button
                                        onClick={() =>
                                          handleUnbanUser(learner.id)
                                        }
                                        className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 font-medium"
                                      >
                                        <RiCheckLine className="h-4 w-4" />
                                        Unban Comments
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          handleBanUser(learner.id)
                                        }
                                        className="flex items-center gap-1 px-3 py-1 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 font-medium"
                                      >
                                        <RiDeleteBin6Line className="h-4 w-4" />
                                        Ban Comments
                                      </button>
                                    ))}

                                  {/* Show banned status */}
                                  {learner.comment_banned && (
                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-md font-medium">
                                      Banned from comments
                                    </span>
                                  )}
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === "requests" &&
              (isInstructor || isAdmin) &&
              course?.privacy === "private" && (
                <div>
                  <div className="space-y-3">
                    {joinRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">
                              {request.user?.name || "Unknown"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {request.user?.email || ""}
                            </p>
                            <p className="text-xs text-gray-500">
                              Requested on{" "}
                              {new Date(
                                request.created_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAcceptRequest(request.id)}
                              className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 font-medium inline-flex items-center gap-1"
                            >
                              <RiCheckLine className="h-4 w-4" />
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.id)}
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
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
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
                                  material.file_type?.toUpperCase()}
                                {material.type === "file" &&
                                  material.file_type &&
                                  " • "}
                                Uploaded{" "}
                                {new Date(
                                  material.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {isInstructor && (
                            <button
                              onClick={() => handleDeleteMaterial(material.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <RiDeleteBin6Line className="h-5 w-5" />
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            if (material.url) {
                              // For files, trigger download
                              if (material.type === "file") {
                                const link = document.createElement("a");
                                link.href = `http://localhost:8000${material.url}`;
                                link.download = material.title;
                                link.target = "_blank";
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              } else {
                                // For videos and links, open in new tab
                                window.open(material.url, "_blank");
                              }
                            }
                          }}
                          className="mt-3 w-full px-3 py-2 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100 font-medium"
                        >
                          {material.type === "file" ? "Download" : "Open"}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === "comments" && (
              <div>
                <div className="space-y-6">
                  {comments.map((comment) => {
                    const isOwnComment = comment.user?.id === user?.id;

                    return (
                      <div
                        key={comment.id}
                        className={`pb-4 ${
                          isOwnComment
                            ? "bg-blue-50 -mx-4 px-4 py-3 rounded-lg"
                            : "border-b border-gray-200"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`font-medium ${
                                  isInstructor
                                    ? "text-blue-600"
                                    : isOwnComment
                                    ? "text-green-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {comment.user?.name || "Unknown User"}
                              </span>

                              {isOwnComment && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                  You
                                </span>
                              )}

                              {isInstructor && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  Instructor
                                </span>
                              )}

                              <span className="text-xs text-gray-500">
                                {new Date(
                                  comment.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            {editingCommentId === comment.id ? (
                              <div className="mt-2">
                                <textarea
                                  value={editCommentText}
                                  onChange={(e) =>
                                    setEditCommentText(e.target.value)
                                  }
                                  className="w-full px-3 py-2 border rounded-md text-black"
                                  rows={3}
                                />
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() =>
                                      handleUpdateCourseComment(
                                        comment.id,
                                        editCommentText
                                      )
                                    }
                                    className="px-3 py-1 bg-blue-500 text-white rounded-md"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingCommentId(null)}
                                    className="px-3 py-1 bg-gray-500 text-white rounded-md"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-700">{comment.content}</p>
                            )}
                            {comment.user_id === user?.id ||
                            isInstructor ||
                            isAdmin ? (
                              <div className="mt-2">
                                {editingCommentId !== comment.id && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingCommentId(comment.id);
                                      setEditCommentText(comment.content);
                                    }}
                                    className="px-3 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 font-medium inline-flex items-center gap-1"
                                  >
                                    <RiDeleteBin6Line className="h-4 w-4" />
                                    Update
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteCourseComment(comment.id)
                                    }
                                    className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 font-medium inline-flex items-center gap-1"
                                  >
                                    <RiDeleteBin6Line className="h-4 w-4" />
                                    Delete
                                  </button>
                                </>
                                )}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Comment Form */}
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-medium mb-3">Add a Comment</h3>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your comment here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 text-black"
                    rows={3}
                  />
                  <button
                    onClick={handleAddComment}
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
                  {announcements.map((announcement: any) => (
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
                            Posted on{" "}
                            {new Date(
                              announcement.created_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        {isInstructor && (
                          <button
                            onClick={() =>
                              handleDeleteAnnouncement(announcement.id)
                            }
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 text-black"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 text-black"
                      rows={4}
                    />
                    <button
                      onClick={handleAddAnnouncement}
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
            <form onSubmit={handleUpdateCourse}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
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
                  value={editForm.content}
                  onChange={(e) =>
                    setEditForm({ ...editForm, content: e.target.value })
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
                  value={editForm.privacy}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
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
                  Learners Limit
                </label>
                <input
                  type="number"
                  value={editForm.capacity}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      capacity: parseInt(e.target.value),
                    })
                  }
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
        <AddMaterialModal
          courseId={id!}
          onClose={() => setShowAddMaterialModal(false)}
          onSuccess={fetchCourseData}
        />
      )}
    </main>
  );
};

export default CourseDetails;
