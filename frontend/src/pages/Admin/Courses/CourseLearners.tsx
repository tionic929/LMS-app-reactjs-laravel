import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { removeLearner, banLearnerFromComments, unbanLearnerFromComments, getCourseBannedLearners } from "../../../api/courses";
import { MdOutlineEmail, MdDeleteForever } from "react-icons/md";
import { FaBan, FaUnlock, FaUserGraduate } from "react-icons/fa";

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
  avatar_url?: string | null;
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
    const id = toast.info(
      <div className="max-w-sm">
        <div className="mb-2">Are you sure you want to remove this learner?</div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(id)}
            className="px-3 py-1 bg-gray-200 rounded text-sm"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(id);
              try {
                await removeLearner(courseId, userId);
                setDropdownOpen(null);
                onLearnerAction();
                toast.success("Learner removed successfully");
              } catch (err: any) {
                console.error("Error removing learner:", err);
                toast.error(err.response?.data?.message || "Failed to remove learner");
              }
            }}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
          >
            Remove
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false }
    );
  };

  const handleBanLearner = async (userId: number) => {
    const id = toast.info(
      <div className="max-w-sm">
        <div className="mb-2">Are you sure you want to ban this learner from commenting?</div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(id)}
            className="px-3 py-1 bg-gray-200 rounded text-sm"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(id);
              try {
                await banLearnerFromComments(courseId, userId);
                setBannedLearners((prev) => new Set(prev).add(userId));
                setDropdownOpen(null);
                toast.success("Learner banned from commenting");
              } catch (err: any) {
                console.error("Error banning learner:", err);
                toast.error(err.response?.data?.message || "Failed to ban learner");
              }
            }}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
          >
            Ban
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false }
    );
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
      toast.success("Learner unbanned from commenting");
    } catch (err: any) {
      console.error("Error unbanning learner:", err);
      toast.error(err.response?.data?.message || "Failed to unban learner");
    }
  };

  // Helper for action buttons
  const ActionButton: React.FC<{
    icon: React.ElementType;
    onClick: () => void;
    title: string;
    className?: string;
  }> = ({ icon: Icon, onClick, title, className = "" }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-md transition flex items-center justify-center ${className}`}
      title={title}
    >
      <Icon className="w-5 h-5" style={{ color: 'currentColor' }} />
    </button>
  );

  return (
    <div className="space-y-3">
      {learners.length === 0 ? (
        <div className="rounded-xl p-12 text-center text-gray-500 bg-white border border-gray-100">
          <div className="mx-auto h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center">
            <FaUserGraduate className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="mt-3 text-sm font-medium text-gray-900">No learners enrolled</h3>
          <p className="mt-1 text-sm text-gray-500">This course doesn't have any enrolled learners yet.</p>
        </div>
      ) : (
        learners.map((learner) => (
          <div
            key={learner.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-blue-200"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Learner Avatar/Initial */}
              {learner.avatar_url ? (
                <img 
                  src={learner.avatar_url} 
                  alt={`${learner.name}'s avatar`}
                  className="h-10 w-10 rounded-full object-cover flex-shrink-0 ring-2 ring-blue-100" 
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm flex-shrink-0 ring-2 ring-blue-100 bg-blue-100 text-blue-700">
                  {(() => {
                    const parts = learner.name.split(" ");
                    const first = parts[0]?.[0] || "";
                    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
                    return (first + last).toUpperCase();
                  })()}
                </div>
              )}

              {/* Learner Details */}
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {learner.name}
                  
                  {/* Status Badge */}
                  {bannedLearners.has(learner.id) && (
                    <span className="inline-flex items-center ml-3 rounded-full px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700">
                      <FaBan className="w-3 h-3 mr-1" />
                      Banned
                    </span>
                  )}
                </h3>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-600">
                  {(isInstructor || isAdmin) && (
                    <>
                      <span className="flex items-center gap-1 truncate">
                        <MdOutlineEmail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        {learner.email}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span>
                        Joined {learner.enrolled_at || new Date(learner.pivot?.created_at || learner.created_at || "").toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {(isInstructor || isAdmin) && (
              <div className="flex gap-1 ml-4 flex-shrink-0 border p-1 rounded-md bg-gray-50">
                {bannedLearners.has(learner.id) ? (
                  <ActionButton
                    icon={FaUnlock}
                    onClick={() => handleUnbanLearner(learner.id)}
                    title="Unban from commenting"
                    className="text-emerald-600 hover:bg-emerald-100"
                  />
                ) : (
                  <ActionButton
                    icon={FaBan}
                    onClick={() => handleBanLearner(learner.id)}
                    title="Ban from commenting"
                    className="text-amber-600 hover:bg-amber-100"
                  />
                )}
                
                <div className="w-px h-6 bg-gray-200 mx-1 self-center"></div>
                
                <ActionButton
                  icon={MdDeleteForever}
                  onClick={() => handleRemoveLearner(learner.id)}
                  title="Remove from course"
                  className="text-rose-600 hover:bg-rose-100"
                />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default CourseLearners;