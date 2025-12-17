import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { getCourse, enrollInCourse, leaveCourse, deleteCourse } from "../../../api/courses";
import { MdArrowBack, MdEdit, MdPeople, MdLibraryBooks, MdComment, MdAnnouncement } from "react-icons/md";
import { FaUserGraduate, FaLock, FaGlobe } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import CourseTabs from "../Courses/CourseTabs";
import { toast } from 'react-toastify';
import CourseLearners from "../Courses/CourseLearners";
import CourseRequests from "../Courses/CourseRequests";
import CourseMaterials from "../Courses/CourseMaterials";
import CourseComments from "../Courses/CourseComments";
import CourseAnnouncements from "../Courses/CourseAnnouncements";
import EditCourseModal from "../../../components/modals/courses/EditCourseModal";
import AddMaterialModal from "../../../components/modals/courses/AddMaterialModal";

// Enhanced stat card with icon
const StatCard: React.FC<{ label: string; value: string | number; icon: React.ElementType }> = ({ label, value, icon: Icon }) => (
  <div className="p-4 rounded-lg bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

// Interface Definitions (Kept in main file for clarity, but could be moved to a shared 'types' file)
interface CourseType {
  id: number;
  instructor_id: number;
  title: string;
  content: string;
  instructor_name: string;
  privacy: "public" | "private";
  current_enrolled: number;
  capacity: number;
  status: string;
  active_learners?: any[];
  join_requests?: any[];
  materials?: any[];
  comments?: any[];
  announcements?: any[];
}

type ActiveTab = "learners" | "comments" | "announcements" | "requests" | "materials";

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const courseId = id || "";

  const [course, setCourse] = useState<CourseType | null>(null);
  const [isInstructor, setIsInstructor] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>("learners");

  // Management modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);

  // Data states
  const [learners, setLearners] = useState<any[]>([]);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Edit form state initialization from course data
  const editFormInitialState = useMemo(() => ({
    title: course?.title || "",
    content: course?.content || "",
    privacy: course?.privacy || "public",
    capacity: course?.capacity || 50,
  }), [course]);


  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getCourse(courseId);
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

    } catch (err: any) {
      console.error("Error fetching course:", err);
      setError(err.response?.data?.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const confirmWithToast = (message: string) => {
    return new Promise<boolean>((resolve) => {
      const id = toast.info(
        <div className="max-w-sm">
          <div className="mb-2">{message}</div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                toast.dismiss(id);
                resolve(false);
              }}
              className="px-3 py-1 bg-gray-200 rounded text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(id);
                resolve(true);
              }}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm"
            >
              Delete
            </button>
          </div>
        </div>,
        { autoClose: false, closeOnClick: false }
      );
    });
  };

  const handleDisbandCourse = async () => {
    const first = await confirmWithToast('Are you sure you want to disband this course? This action cannot be undone.');
    if (!first) return;
    const second = await confirmWithToast('This is your last chance to cancel. Disbanding will remove the course for all learners.');
    if (!second) return;

    try {
      const res = await deleteCourse(courseId);
      toast.success(res.data?.message || "Course disbanded successfully");
      navigate("/courses");
    } catch (err: any) {
      console.error("Error disbanding course:", err);
      toast.error(err.response?.data?.message || "Failed to disband course");
    }
  };

  const handleEnrollCourse = async () => {
    if (!courseId) return;

    try {
      const response = await enrollInCourse(courseId);
      await fetchCourseData();
      toast.success(response.data.message || "Successfully enrolled!");
    } catch (err: any) {
      console.error("Error enrolling:", err);
      toast.error(err.response?.data?.message || "Failed to enroll in course");
    }
  };

  const handleLeaveCourse = async () => {
    if (!courseId) return;
    const confirmed = await confirmWithToast('Are you sure you want to leave this course?');
    if (!confirmed) return;

    try {
      const response = await leaveCourse(courseId);
      await fetchCourseData();
      toast.success(response.data.message || "Successfully left the course");
    } catch (err: any) {
      console.error("Error leaving course:", err);
      toast.error(err.response?.data?.message || "Failed to leave course");
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
            The course you're looking for doesn't exist or you don't have access to it.
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

  // Helper function to render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "learners":
        return (
          <CourseLearners
            courseId={courseId}
            learners={learners}
            isInstructor={isInstructor}
            isAdmin={user?.role === 'admin'}
            onLearnerAction={fetchCourseData}
          />
        );
      case "requests":
        return isInstructor ? (
          <CourseRequests
            courseId={courseId}
            joinRequests={joinRequests}
            onRequestAction={fetchCourseData}
          />
        ) : null;
      case "materials":
        return (
          <CourseMaterials
            courseId={courseId}
            materials={materials}
            isInstructor={isInstructor}
            onMaterialAction={fetchCourseData}
            setShowAddMaterialModal={setShowAddMaterialModal}
          />
        );
      case "comments":
        return (
          <CourseComments
            courseId={courseId}
            instructorId={course.instructor_id}
            comments={comments}
            onCommentAction={fetchCourseData}
            currentUserId={user?.id}
          />
        );
      case "announcements":
        return (
          <CourseAnnouncements
            courseId={courseId}
            announcements={announcements}
            isInstructor={isInstructor}
            onAnnouncementAction={fetchCourseData}
          />
        );
      default:
        return null;
    }
  };


  return (
    <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumb and Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/courses")}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <MdArrowBack className="h-5 w-5" />
            Back to Courses
          </button>
          <div className="text-sm text-gray-500">
            Course Management Dashboard
          </div>
        </div>

        {/* Hero Section with Course Title and Key Actions */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <FaUserGraduate className="h-6 w-6 text-indigo-600" />
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  {course.title}
                </h1>
              </div>
              <p className="text-gray-600 mb-4">
                Manage learners, content, and engagement for this course.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  course.privacy === "public"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}>
                  {course.privacy === "public" ? <FaGlobe className="h-4 w-4" /> : <FaLock className="h-4 w-4" />}
                  {course.privacy === "public" ? "Public" : "Private"}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                  Status: {course.status}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {isInstructor ? (
                <>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <MdEdit className="h-4 w-4" />
                    Edit Course
                  </button>
                  <button
                    onClick={() => setShowAddMaterialModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <MdLibraryBooks className="h-4 w-4" />
                    Add Material
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  {user?.role === 'admin' ? (
                    <button
                      onClick={handleDisbandCourse}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <RiDeleteBin6Line className="h-4 w-4" />
                      Disband Course
                    </button>
                  ) : isEnrolled ? (
                    <button
                      onClick={handleLeaveCourse}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Leave Course
                    </button>
                  ) : hasPendingRequest ? (
                    <button
                      disabled
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                    >
                      Request Pending
                    </button>
                  ) : course && course.current_enrolled >= course.capacity ? (
                    <button
                      disabled
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                    >
                      Course Full
                    </button>
                  ) : (
                    <button
                      onClick={handleEnrollCourse}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      {course?.privacy === "private" ? "Request to Join" : "Join Course"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Enrollment Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Enrolled Students</span>
              <span className="text-sm text-gray-500">
                {course.current_enrolled ?? 0} / {course.capacity ?? 0} learners
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                style={{
                  width: course.capacity ? `${Math.min((course.current_enrolled / course.capacity) * 100, 100)}%` : '0%'
                }}
              ></div>
            </div>
          </div>
        </section>

        {/* Management Layout: Overview + Tabs on Left, Stats on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Overview and Tabs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Overview Card */}
            <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MdLibraryBooks className="h-5 w-5 text-indigo-600" />
                Course Description
              </h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                {course.content ? (
                  <div dangerouslySetInnerHTML={{ __html: course.content }} />
                ) : (
                  <p className="text-gray-500 italic">No description provided.</p>
                )}
              </div>
            </section>

            {/* Tabs Section */}
            <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <CourseTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isInstructor={isInstructor}
                isPrivate={course.privacy === "private"}
                learnersCount={learners.length}
                requestsCount={joinRequests.length}
                materialsCount={materials.length}
                commentsCount={comments.length}
                announcementsCount={announcements.length}
              >
                <div className="p-6">{renderTabContent()}</div>
              </CourseTabs>
            </section>
          </div>

          {/* Right Column: Enhanced Stats Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MdPeople className="h-5 w-5 text-indigo-600" />
                Course Metrics
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <StatCard label="Enrolled Learners" value={course.current_enrolled ?? 0} icon={MdPeople} />
                <StatCard label="Course Capacity" value={course.capacity ?? "-"} icon={FaUserGraduate} />
                <StatCard label="Materials" value={materials.length} icon={MdLibraryBooks} />
                <StatCard label="Comments" value={comments.length} icon={MdComment} />
                <StatCard label="Announcements" value={announcements.length} icon={MdAnnouncement} />
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <FaUserGraduate className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{course.instructor_name}</p>
                  <p className="text-sm text-gray-500">Course Instructor</p>
                </div>
              </div>
            </section>
          </aside>
        </div>

        {/* Modals */}
        {showEditModal && (
          <EditCourseModal
            courseId={courseId}
            initialData={editFormInitialState}
            onClose={() => setShowEditModal(false)}
            onSuccess={fetchCourseData}
          />
        )}

        {showAddMaterialModal && (
          <AddMaterialModal
            courseId={courseId}
            onClose={() => setShowAddMaterialModal(false)}
            onSuccess={fetchCourseData}
          />
        )}
      </div>
    </main>
  );
};

export default CourseDetails;