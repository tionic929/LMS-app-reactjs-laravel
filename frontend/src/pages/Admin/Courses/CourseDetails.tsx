import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { getCourse } from "../../../api/courses";
import { MdArrowBack } from "react-icons/md";
import CourseHeader from "../Courses/CourseHeader";
import CourseTabs from "../Courses/CourseTabs";
import CourseLearners from "../Courses/CourseLearners";
import CourseRequests from "../Courses/CourseRequests";
import CourseMaterials from "../Courses/CourseMaterials";
import CourseComments from "../Courses/CourseComments";
import CourseAnnouncements from "../Courses/CourseAnnouncements";
import EditCourseModal from "../../../components/modals/courses/EditCourseModal";
import AddMaterialModal from "../../../components/modals/courses/AddMaterialModal";

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
    <main className="flex-1 overflow-auto">
      {/* Course Header - Uses local state and fetch function */}
      <CourseHeader
        course={course}
        isInstructor={isInstructor}
        isEnrolled={isEnrolled}
        hasPendingRequest={hasPendingRequest}
        onCourseUpdate={fetchCourseData}
        setShowEditModal={setShowEditModal}
      />

      {/* Course Tabs - Manages tab state */}
      <CourseTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isInstructor={isInstructor}
        learnersCount={learners.length}
        requestsCount={joinRequests.length}
        materialsCount={materials.length}
        commentsCount={comments.length}
        announcementsCount={announcements.length}
      >
        {renderTabContent()}
      </CourseTabs>


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
    </main>
  );
};

export default CourseDetails;