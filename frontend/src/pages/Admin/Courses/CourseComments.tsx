import React, { useState } from "react";
import { addCourseComment, voteComment } from "../../../api/courses";
import { BsSend } from "react-icons/bs";
import { BiUpvote, BiDownvote, BiSolidUpvote, BiSolidDownvote } from "react-icons/bi";

interface Comment {
  id: number;
  content: string;
  created_at: string;
  upvotes_count: number;
  downvotes_count: number;
  user_vote: "upvote" | "downvote" | null;
  user: {
    id: number;
    name: string;
  };
}

interface CourseCommentsProps {
  courseId: string;
  instructorId: number;
  comments: Comment[];
  onCommentAction: () => void;
}

const CourseComments: React.FC<CourseCommentsProps> = ({
  courseId,
  instructorId,
  comments,
  onCommentAction,
}) => {
  const [newComment, setNewComment] = useState("");
  const [votingCommentId, setVotingCommentId] = useState<number | null>(null);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addCourseComment(courseId, newComment);
      onCommentAction();
      setNewComment("");
      alert("Comment posted!");
    } catch (err: any) {
      console.error("Error adding comment:", err);
      alert(err.response?.data?.message || "Failed to post comment");
    }
  };

  const handleVote = async (commentId: number, voteType: "upvote" | "downvote") => {
    setVotingCommentId(commentId);
    try {
      await voteComment(courseId, commentId, voteType);
      onCommentAction(); // Refresh comments to get updated vote counts
    } catch (err: any) {
      console.error("Error voting:", err);
      alert(err.response?.data?.message || "Failed to vote");
    } finally {
      setVotingCommentId(null);
    }
  };

  return (
    <div>
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No comments yet. Be the first to post!</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="border-b border-gray-200 pb-4"
            >
              <div className="flex gap-4">
                {/* Vote buttons */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => handleVote(comment.id, "upvote")}
                    disabled={votingCommentId === comment.id}
                    className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                      comment.user_vote === "upvote" ? "text-blue-600" : "text-gray-500"
                    } ${votingCommentId === comment.id ? "opacity-50 cursor-not-allowed" : ""}`}
                    title="Upvote"
                  >
                    {comment.user_vote === "upvote" ? (
                      <BiSolidUpvote className="w-5 h-5" />
                    ) : (
                      <BiUpvote className="w-5 h-5" />
                    )}
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    {comment.upvotes_count - comment.downvotes_count}
                  </span>
                  <button
                    onClick={() => handleVote(comment.id, "downvote")}
                    disabled={votingCommentId === comment.id}
                    className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                      comment.user_vote === "downvote" ? "text-red-600" : "text-gray-500"
                    } ${votingCommentId === comment.id ? "opacity-50 cursor-not-allowed" : ""}`}
                    title="Downvote"
                  >
                    {comment.user_vote === "downvote" ? (
                      <BiSolidDownvote className="w-5 h-5" />
                    ) : (
                      <BiDownvote className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Comment content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`font-medium ${
                        comment.user?.id === instructorId
                          ? "text-blue-600"
                          : "text-gray-900"
                      }`}
                    >
                      {comment.user?.name || 'Unknown User'}
                    </span>
                    {comment.user?.id === instructorId && (
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
          ))
        )}
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
  );
};

export default CourseComments;