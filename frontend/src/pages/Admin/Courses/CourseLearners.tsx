import React, { useState, useEffect } from "react";
import { removeLearner, banLearnerFromComments, unbanLearnerFromComments, getCourseBannedLearners } from "../../../api/courses";
import { MdOutlineEmail, MdMoreVert } from "react-icons/md";
import { LiaUserMinusSolid } from "react-icons/lia";
import { FaBan, FaUnlock } from "react-icons/fa";

interface Learner {
  id: number;
  name: string;
  email: string;
  enrolled_at?: string;
  pivot?: {
    created_at: string;
  };
  created_at?: string;
  is_banned?: boolean;
}

interface CourseLearnersProps {
  courseId: string;
  learners: Learner[];
  isInstructor: boolean;
  isAdmin: boolean;
  onLearnerAction: () => void;
}

const CourseLearners: React.FC<CourseLearnersProps> = ({
  courseId,
  learners,
  isInstructor,
  isAdmin,
  onLearnerAction,
}) => {
  const [bannedLearners, setBannedLearners] = useState<Set<number>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  // Fetch banned learners on mount
  useEffect(() => {
    const fetchBannedLearners = async () => {
      if (isInstructor || isAdmin) {
        try {
          const response = await getCourseBannedLearners(courseId);
          const bannedIds = new Set<number>(response.data.map((ban: any) => ban.user_id as number));
          setBannedLearners(bannedIds);
        } catch (err) {
          console.error("Error fetching banned learners:", err);
        }
      }
    };
    fetchBannedLearners();
  }, [courseId, isInstructor, isAdmin, learners]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen && !(event.target as Element).closest(".dropdown-menu")) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleRemoveLearner = async (userId: number) => {
    if (!confirm("Are you sure you want to remove this learner?")) return;

    try {
      await removeLearner(courseId, userId);
      setDropdownOpen(null);
      onLearnerAction();
      alert("Learner removed successfully");
    } catch (err: any) {
      console.error("Error removing learner:", err);
      alert(err.response?.data?.message || "Failed to remove learner");
    }
  };

  const handleBanLearner = async (userId: number) => {
    if (!confirm("Are you sure you want to ban this learner from commenting?")) return;

    try {
      await banLearnerFromComments(courseId, userId);
      setBannedLearners((prev) => new Set(prev).add(userId));
      setDropdownOpen(null);
      alert("Learner banned from commenting");
    } catch (err: any) {
      console.error("Error banning learner:", err);
      alert(err.response?.data?.message || "Failed to ban learner");
    }
  };

  const handleUnbanLearner = async (userId: number) => {
    try {
      await unbanLearnerFromComments(courseId, userId);
      setBannedLearners((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      setDropdownOpen(null);
      alert("Learner unbanned from commenting");
    } catch (err: any) {
      console.error("Error unbanning learner:", err);
      alert(err.response?.data?.message || "Failed to unban learner");
    }
  };

  return (
    <div className="overflow-visible">
    <div className="overflow-visible">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Name
            </th>
            {isInstructor || isAdmin ? (
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Email
              </th>
            ) : null}
            {isInstructor || isAdmin ? (
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Joined
              </th>
            ) : null}
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              {(isInstructor || isAdmin) ? "Actions" : ""}
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
              {isInstructor || isAdmin ? (
                <td className="py-4 px-4 text-sm text-gray-600 flex items-center gap-2">
                  <MdOutlineEmail className="h-4 w-4 text-gray-400" />
                  {learner.email}
                </td>
              ) : null}
              {isInstructor || isAdmin ? (
                <td className="py-4 px-4 text-sm text-gray-600">
                  {learner.enrolled_at ||
                    new Date(
                      learner.pivot?.created_at || learner.created_at || ""
                    ).toLocaleDateString()}
                </td>
              ) : null}
              <td className="py-4 px-4 relative">
                {(isInstructor || isAdmin) && (
                  <div className="flex items-center gap-2">
                    {bannedLearners.has(learner.id) && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                        Banned
                      </span>
                    )}
                    <div className="relative dropdown-menu">
                      <button
                        onClick={() => setDropdownOpen(dropdownOpen === learner.id ? null : learner.id)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <MdMoreVert className="h-5 w-5 text-gray-500" />
                      </button>
                      
                      {dropdownOpen === learner.id && (
                        <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                          {bannedLearners.has(learner.id) ? (
                            <button
                              onClick={() => handleUnbanLearner(learner.id)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 rounded-t-md"
                            >
                              <FaUnlock className="h-3 w-3" />
                              Unban from commenting
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBanLearner(learner.id)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 rounded-t-md"
                            >
                              <FaBan className="h-3 w-3" />
                              Ban from commenting
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveLearner(learner.id)}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-200 rounded-b-md"
                          >
                            <LiaUserMinusSolid className="h-4 w-4" />
                            Remove from course
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseLearners;