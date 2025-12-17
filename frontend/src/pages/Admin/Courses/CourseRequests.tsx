import React from "react";
import { toast } from 'react-toastify';
import { acceptJoinRequest, rejectJoinRequest } from "../../../api/courses";
import { RiCheckLine } from "react-icons/ri";
import { LiaTimesSolid } from "react-icons/lia";

interface JoinRequest {
  id: number;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
}

interface CourseRequestsProps {
  courseId: string;
  joinRequests: JoinRequest[];
  onRequestAction: () => void;
}

const CourseRequests: React.FC<CourseRequestsProps> = ({
  courseId,
  joinRequests,
  onRequestAction,
}) => {
  const handleAcceptRequest = async (requestId: number) => {
    try {
      await acceptJoinRequest(courseId, requestId);
      onRequestAction();
      toast.success("Request accepted");
    } catch (err: any) {
      console.error("Error accepting request:", err);
      toast.error(err.response?.data?.message || "Failed to accept request");
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      await rejectJoinRequest(courseId, requestId);
      onRequestAction();
      toast.success("Request rejected");
    } catch (err: any) {
      console.error("Error rejecting request:", err);
      toast.error(err.response?.data?.message || "Failed to reject request");
    }
  };

  return (
    <div className="space-y-3">
      {joinRequests.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No pending join requests.</p>
      ) : (
        joinRequests.map((request) => (
          <div key={request.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{request.user?.name || "Unknown"}</h3>
                <p className="text-sm text-gray-600">{request.user?.email || ""}</p>
                <p className="text-xs text-gray-500">
                  Requested on {new Date(request.created_at).toLocaleDateString()}
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
        ))
      )}
    </div>
  );
};

export default CourseRequests;