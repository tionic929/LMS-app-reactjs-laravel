import React from "react";
import { removeLearner } from "../../../api/courses";
import { MdOutlineEmail } from "react-icons/md";
import { LiaUserMinusSolid } from "react-icons/lia";

interface Learner {
  id: number;
  name: string;
  email: string;
  enrolled_at?: string;
  pivot?: {
    created_at: string;
  };
  created_at?: string;
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
  const handleRemoveLearner = async (userId: number) => {
    if (!confirm("Are you sure you want to remove this learner?")) return;

    try {
      await removeLearner(courseId, userId);
      onLearnerAction();
      alert("Learner removed successfully");
    } catch (err: any) {
      console.error("Error removing learner:", err);
      alert(err.response?.data?.message || "Failed to remove learner");
    }
  };

  return (
    <div className="overflow-x-auto">
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
              <td className="py-4 px-4">
                {(isInstructor || isAdmin) && (
                  <button
                    onClick={() => handleRemoveLearner(learner.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 font-medium"
                  >
                    <LiaUserMinusSolid className="h-4 w-4" />
                    Remove
                  </button>
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