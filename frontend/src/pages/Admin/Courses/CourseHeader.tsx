import React from "react";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import {
  enrollInCourse,
  leaveCourse,
  deleteCourse,
} from "../../../api/courses";
import { PiStudentFill, PiUsersThreeBold } from "react-icons/pi";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
  LiaUserMinusSolid,
  LiaEditSolid,
} from "react-icons/lia";
import {
  MdArrowBack
} from "react-icons/md";
import { HiOutlineBookOpen, HiOutlinePlus } from "react-icons/hi";
import { VscRequestChanges } from "react-icons/vsc";

interface Course {
  id: number;
  title: string;
  privacy: string;
  current_enrolled: number;
  capacity: number;
}

interface CourseHeaderProps {
  course: Course;
  isInstructor: boolean;
  isEnrolled: boolean;
  hasPendingRequest: boolean;
  onCourseUpdate: () => void;
  setShowEditModal: (show: boolean) => void;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({
  course,
  isInstructor,
  isEnrolled,
  hasPendingRequest,
  onCourseUpdate,
  setShowEditModal,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const id = String(course.id); // Ensure ID is string for API calls

  const handleDeleteCourse = async () => {
    const idToast = toast.info(
      <div className="max-w-sm">
        <div className="mb-2">Are you sure you want to disband this course?</div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(idToast)}
            className="px-3 py-1 bg-gray-200 rounded text-sm"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(idToast);
              try {
                const res = await deleteCourse(id);
                toast.success(res.data?.message || "Course disbanded successfully");
                navigate("/courses");
              } catch (err: any) {
                console.error("Error deleting course:", err);
                toast.error(err.response?.data?.message || "Failed to disband course");
              }
            }}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
          >
            Delete
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false }
    );
  };

  const handleEnrollCourse = async () => {
    try {
      const response = await enrollInCourse(id);
      onCourseUpdate();
      toast.success(response.data.message || "Successfully enrolled!");
    } catch (err: any) {
      console.error("Error enrolling:", err);
      toast.error(err.response?.data?.message || "Failed to enroll in course");
    }
  };

  const handleLeaveCourse = async () => {
    const idToast = toast.info(
      <div className="max-w-sm">
        <div className="mb-2">Are you sure you want to leave this course?</div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(idToast)}
            className="px-3 py-1 bg-gray-200 rounded text-sm"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(idToast);
              try {
                const response = await leaveCourse(id);
                onCourseUpdate();
                toast.success(response.data.message || "Successfully left the course");
              } catch (err: any) {
                console.error("Error leaving course:", err);
                toast.error(err.response?.data?.message || "Failed to leave course");
              }
            }}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
          >
            Leave
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false }
    );
  };

  return (
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
          {isInstructor ? (
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
                    {course.privacy === "private" ? "Request to Join" : "Join Course"}
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
    </div>
  );
};

export default CourseHeader;