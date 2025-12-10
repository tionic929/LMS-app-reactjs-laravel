import React, { useState, useEffect, useMemo } from "react";
import {
  addCourseComment,
  voteComment,
  updateComment,
  deleteComment,
} from "../../../api/courses";
import { BsSend } from "react-icons/bs";
import {
  BiUpvote,
  BiDownvote,
  BiSolidUpvote,
  BiSolidDownvote,
} from "react-icons/bi";
import { FaReply, FaEdit, FaTrash } from "react-icons/fa";
import { MdMoreHoriz } from "react-icons/md";

interface User {
  id: number;
  name: string;
  role: "admin" | "instructor" | "learner";
  avatar_url?: string | null;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  upvotes_count: number;
  downvotes_count: number;
  user_vote: "upvote" | "downvote" | null;
  user: User;
  parent_id?: number;
  reply_to_user?: User;
  replies?: Comment[];
  replies_count: number;
  is_nested_reply: boolean;
}

interface CourseCommentsProps {
  courseId: string;
  instructorId: number;
  comments: Comment[];
  onCommentAction: () => void;
  currentUserId?: number;
}

const CourseComments: React.FC<CourseCommentsProps> = ({
  courseId,
  instructorId,
  comments,
  onCommentAction,
  currentUserId,
}) => {
  const [newComment, setNewComment] = useState("");
  const [votingCommentId, setVotingCommentId] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<{
    commentId: number;
    userId: number;
    userName: string;
  } | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState<{
    commentId: number;
    content: string;
  } | null>(null);
  const [editContent, setEditContent] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [hiddenReplies, setHiddenReplies] = useState<Set<number>>(new Set());

  // Initialize hidden replies - hide all comments that have replies by default
  useEffect(() => {
    const commentsWithReplies = new Set<number>();
    const processComments = (comments: Comment[]) => {
      comments.forEach((comment) => {
        if (comment.replies_count > 0) {
          commentsWithReplies.add(comment.id);
        }
        if (comment.replies && comment.replies.length > 0) {
          processComments(comment.replies);
        }
      });
    };
    processComments(comments);
    setHiddenReplies(commentsWithReplies);
  }, [comments]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownOpen &&
        !(event.target as Element).closest(".dropdown-menu")
      ) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

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

  const handleReply = async (parentId: number, replyToUserId: number) => {
    if (!replyContent.trim()) return;

    try {
      await addCourseComment(courseId, replyContent, parentId, replyToUserId);
      onCommentAction();
      setReplyContent("");
      setReplyingTo(null);
      alert("Reply posted!");
    } catch (err: any) {
      console.error("Error adding reply:", err);
      alert(err.response?.data?.message || "Failed to post reply");
    }
  };

  const handleVote = async (
    commentId: number,
    voteType: "upvote" | "downvote"
  ) => {
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

  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim()) return;

    try {
      await updateComment(courseId, commentId, editContent);
      onCommentAction();
      setEditingComment(null);
      setEditContent("");
      alert("Comment updated!");
    } catch (err: any) {
      console.error("Error updating comment:", err);
      alert(err.response?.data?.message || "Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await deleteComment(courseId, commentId);
      onCommentAction();
      alert("Comment deleted!");
    } catch (err: any) {
      console.error("Error deleting comment:", err);
      alert(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const startEditing = (commentId: number, content: string) => {
    setEditingComment({ commentId, content });
    setEditContent(content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent("");
  };

  const toggleReplies = (commentId: number) => {
    setHiddenReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  // Flatten all comments and replies into a single array, respecting hidden replies
  const flattenComments = (
    comments: Comment[],
    hiddenReplies: Set<number>
  ): Comment[] => {
    const flattened: Comment[] = [];

    const processComment = (comment: Comment) => {
      flattened.push(comment);
      // Only include replies if this comment's replies are not hidden
      if (
        comment.replies &&
        comment.replies.length > 0 &&
        !hiddenReplies.has(comment.id)
      ) {
        comment.replies.forEach(processComment);
      }
    };

    comments.forEach(processComment);
    return flattened;
  };

  const allComments = useMemo(
    () => flattenComments(comments, hiddenReplies),
    [comments, hiddenReplies]
  );

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <div
      key={comment.id}
      className={`${
        comment.parent_id ? "ml-12 mt-4" : ""
      } border-b border-gray-200 pb-4`}
    >
      <div className="flex gap-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {comment.user?.avatar_url ? (
            <img
              src={comment.user.avatar_url}
              alt={`${comment.user.name}'s avatar`}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm flex-shrink-0 ring-2 ring-gray-100 ${
                comment.user?.role === "admin"
                  ? "bg-purple-100 text-purple-700"
                  : comment.user?.role === "instructor"
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {comment.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </div>

        {/* Comment content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span
                className={`font-medium ${
                  comment.user?.id === instructorId
                    ? "text-green-600"
                    : "text-gray-900"
                }`}
              >
                {comment.user?.name || "Unknown User"}
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

            {/* Dropdown menu */}
            {(currentUserId === comment.user?.id ||
              currentUserId === instructorId) && (
              <div className="relative dropdown-menu">
                <button
                  onClick={() =>
                    setDropdownOpen(
                      dropdownOpen === comment.id ? null : comment.id
                    )
                  }
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <MdMoreHoriz className="w-5 h-5 text-gray-500" />
                </button>

                {dropdownOpen === comment.id && (
                  <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <button
                      onClick={() => {
                        startEditing(comment.id, comment.content);
                        setDropdownOpen(null);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FaEdit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteComment(comment.id);
                        setDropdownOpen(null);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <FaTrash className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Comment content or edit form */}
          {editingComment?.commentId === comment.id ? (
            <div className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black text-sm"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEditComment(comment.id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center gap-1"
                >
                  <BsSend className="h-3 w-3" />
                  Save
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700">
              {comment.reply_to_user && comment.is_nested_reply && (
                <span className="text-blue-600 font-medium mr-1">
                  @{comment.reply_to_user.name}
                </span>
              )}
              {comment.content}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-4 mt-2">
            {/* Vote buttons - horizontal */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleVote(comment.id, "upvote")}
                disabled={votingCommentId === comment.id}
                className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                  comment.user_vote === "upvote"
                    ? "text-blue-600"
                    : "text-gray-500"
                } ${
                  votingCommentId === comment.id
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                title="Upvote"
              >
                {comment.user_vote === "upvote" ? (
                  <BiSolidUpvote className="w-4 h-4" />
                ) : (
                  <BiUpvote className="w-4 h-4" />
                )}
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[20px] text-center">
                {comment.upvotes_count - comment.downvotes_count}
              </span>
              <button
                onClick={() => handleVote(comment.id, "downvote")}
                disabled={votingCommentId === comment.id}
                className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                  comment.user_vote === "downvote"
                    ? "text-red-600"
                    : "text-gray-500"
                } ${
                  votingCommentId === comment.id
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                title="Downvote"
              >
                {comment.user_vote === "downvote" ? (
                  <BiSolidDownvote className="w-4 h-4" />
                ) : (
                  <BiDownvote className="w-4 h-4" />
                )}
              </button>
            </div>

            <button
              onClick={() =>
                setReplyingTo({
                  commentId: isReply ? comment.id : comment.id,
                  userId: comment.user.id,
                  userName: comment.user.name,
                })
              }
              className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1"
            >
              <FaReply className="w-3 h-3" />
              Reply
            </button>

            {/* Toggle replies button - only show for main comments with replies */}
            {!comment.parent_id && comment.replies_count > 0 && (
              <button
                onClick={() => toggleReplies(comment.id)}
                className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1"
              >
                {hiddenReplies.has(comment.id) ? (
                  <>
                    <span className="text-xs">▼</span>
                    Load {comment.replies_count}{" "}
                    {comment.replies_count === 1 ? "reply" : "replies"}
                  </>
                ) : (
                  <>
                    <span className="text-xs">▲</span>
                    Hide replies
                  </>
                )}
              </button>
            )}
          </div>

          {/* Reply form */}
          {replyingTo?.commentId === comment.id && (
            <div className="mt-3 ml-0">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Reply to ${replyingTo.userName}...`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black text-sm"
                rows={2}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleReply(comment.id, replyingTo.userId)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center gap-1"
                >
                  <BsSend className="h-3 w-3" />
                  Reply
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent("");
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="space-y-6">
        {allComments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No comments yet. Be the first to post!
          </p>
        ) : (
          allComments.map((comment) => renderComment(comment, false))
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
