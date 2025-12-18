import React, { useEffect, useRef, useState } from "react";
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
  onRequestAction?: () => void;
}

const CourseRequests: React.FC<CourseRequestsProps> = ({
  courseId,
  joinRequests,
  onRequestAction,
}) => {
  // Local copy of requests so we can optimistically update UI without forcing
  // the parent to reload/refresh. We'll process accept/reject actions via a
  // simple FIFO queue so instructors can continuously act on requests.
  const [localRequests, setLocalRequests] = useState<JoinRequest[]>(joinRequests || []);

  useEffect(() => {
    setLocalRequests(joinRequests || []);
  }, [joinRequests]);

  type QueueItem = { id: number; action: "accept" | "reject" };
  const queueRef = useRef<QueueItem[]>([]);
  const processingRef = useRef(false);
  const [queuedIds, setQueuedIds] = useState<Set<number>>(new Set());

  const enqueue = (item: QueueItem) => {
    queueRef.current.push(item);
    setQueuedIds((s) => new Set(s).add(item.id));
    processQueue();
  };

  const processQueue = async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    while (queueRef.current.length > 0) {
      const item = queueRef.current.shift()!;
      try {
        if (item.action === "accept") {
          await acceptJoinRequest(courseId, item.id);
          toast.success("Request accepted");
        } else {
          await rejectJoinRequest(courseId, item.id);
          toast.success("Request rejected");
        }
      } catch (err: any) {
        console.error(`Error processing ${item.action} for ${item.id}:`, err);
        toast.error(err?.response?.data?.message || `Failed to ${item.action} request`);
        // Revert optimistic removal by refetching or re-adding the request locally
        // Here we simply re-add a placeholder so instructor can retry.
        setLocalRequests((prev) => {
          // if the request already exists, don't duplicate
          if (prev.find((r) => r.id === item.id)) return prev;
          // create a minimal placeholder until parent data refreshes
          return [
            { id: item.id, created_at: new Date().toISOString(), user: { name: "Unknown", email: "" } },
            ...prev,
          ];
        });
      } finally {
        setQueuedIds((s) => {
          const copy = new Set(s);
          copy.delete(item.id);
          return copy;
        });
      }
    }
    processingRef.current = false;

    // We intentionally do not call `onRequestAction` automatically here to avoid
    // any parent-driven full refresh/reload behavior. The UI stays optimistic
    // and instructors can continue processing requests. If you want a manual
    // refresh button or auto-refresh behavior, we can add that later.
  };

  const handleAcceptRequest = (requestId: number) => {
    // optimistic remove from list and enqueue
    setLocalRequests((prev) => prev.filter((r) => r.id !== requestId));
    enqueue({ id: requestId, action: "accept" });
  };

  const handleRejectRequest = (requestId: number) => {
    setLocalRequests((prev) => prev.filter((r) => r.id !== requestId));
    enqueue({ id: requestId, action: "reject" });
  };

  return (
    <div className="space-y-3">
      {localRequests.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No pending join requests.</p>
      ) : (
        localRequests.map((request) => (
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
                  disabled={queuedIds.has(request.id)}
                  className={`px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 font-medium inline-flex items-center gap-1 ${queuedIds.has(request.id) ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <RiCheckLine className="h-4 w-4" />
                  {queuedIds.has(request.id) ? 'Queued...' : 'Accept'}
                </button>
                <button
                  onClick={() => handleRejectRequest(request.id)}
                  disabled={queuedIds.has(request.id)}
                  className={`px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 font-medium inline-flex items-center gap-1 ${queuedIds.has(request.id) ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <LiaTimesSolid className="h-4 w-4" />
                  {queuedIds.has(request.id) ? 'Queued...' : 'Reject'}
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