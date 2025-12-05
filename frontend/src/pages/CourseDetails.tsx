import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  leaveCourse,
  removeLearner,
  acceptJoinRequest,
  rejectJoinRequest,
  deleteCourseMaterial,
  updateCourseMaterial,
  addCourseComment,
  updateCourseComment,
  deleteCourseComment,
  addCourseAnnouncement,
  updateCourseAnnouncement,
  deleteCourseAnnouncement,
  banUserFromComments,
  unbanUserFromComments,
} from "../api/courses";
import { PiStudentFill, PiUsersThreeBold } from "react-icons/pi";
import { RiDeleteBin6Line, RiCheckLine, RiMegaphoneLine } from "react-icons/ri";
import {
  LiaTimesSolid,
  LiaUserMinusSolid,
  LiaEditSolid,
} from "react-icons/lia";
import {
  MdArrowBack,
  MdOutlineEmail,
  // MdOutlineSlowMotionVideo,
} from "react-icons/md";
import { HiOutlineBookOpen, HiOutlinePlus } from "react-icons/hi";
import { HiArrowTurnDownRight } from "react-icons/hi2";
import {
  FaRegFileAlt,
  FaRegCommentDots,
  FaChevronDown,
  FaChevronUp,
  FaRegPlayCircle,
} from "react-icons/fa";
import { FaLink } from "react-icons/fa6";
import { VscRequestChanges } from "react-icons/vsc";
import { BsSend } from "react-icons/bs";
import AddMaterialModal from "../components/modals/courses/AddMaterialModal";
import { formatDistanceToNow } from "date-fns";
import {
  voteCourseComment,
  removeVoteFromCourseComment,
  getCourseCommentVote,
} from "../api/courses";
import {
  BiUpvote,
  BiSolidUpvote,
  BiDownvote,
  BiSolidDownvote,
} from "react-icons/bi";

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_id: number;
  parent_comment_id?: number;
  user?: {
    id: number;
    name: string;
  };
  replies?: Comment[];
  votes?: {
    upvotes: number;
    downvotes: number;
    user_vote?: "up" | "down" | null;
  };
}

interface CommentItemProps {
  comment: Comment;
  courseId: string;
  course: Course;
  user: any;
  isInstructor: boolean;
  isAdmin: boolean;
  isReply?: boolean;
  isNestedReply?: boolean;
  onReply: (parentId: number, content: string) => void;
  onEdit: (commentId: number, content: string) => void;
  onDelete: (commentId: number) => void;
  onRefresh: () => void;
  setComments: React.Dispatch<React.SetStateAction<any[]>>;
  updateCommentVote: (
    comments: Comment[],
    commentId: number,
    voteData: any
  ) => Comment[];
  editingCommentId: number | null;
  editCommentText: string;
  setEditingCommentId: (id: number | null) => void;
  setEditCommentText: (text: string) => void;
  visibleReplies?: Record<number, number>;
  onLoadMoreReplies?: (commentId: number) => void;
  onToggleReplies?: (commentId: number) => void;
  depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  courseId,
  course,
  user,
  isInstructor,
  isAdmin,
  isReply = false,
  isNestedReply = false,
  onReply,
  onEdit,
  onDelete,
  onRefresh,
  setComments,
  updateCommentVote,
  editingCommentId,
  editCommentText,
  setEditingCommentId,
  setEditCommentText,
  visibleReplies = {},
  onLoadMoreReplies,
  onToggleReplies,
  depth = 0,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyingToReplyId, setReplyingToReplyId] = useState<number | null>(
    null
  );
  const [replyToReplyContent, setReplyToReplyContent] = useState("");

  const isOwnComment = comment.user?.id === user?.id;

  // Flatten all nested replies into a single array for display
  const flattenReplies = (replies: Comment[]): Comment[] => {
    let flattened: Comment[] = [];
    replies.forEach((reply) => {
      flattened.push(reply);
      if (reply.replies && reply.replies.length > 0) {
        flattened = flattened.concat(flattenReplies(reply.replies));
      }
    });
    return flattened;
  };

  const allReplies = comment.replies ? flattenReplies(comment.replies) : [];

  // Find the parent comment user for context in replies to replies
  const getReplyContext = () => {
    if (!isReply || !comment.parent_comment_id) return null;

    // Find the parent comment in the course comments
    const findParentComment = (comments: Comment[]): Comment | null => {
      for (const c of comments) {
        if (c.id === comment.parent_comment_id) return c;
        if (c.replies) {
          const found = findParentComment(c.replies);
          if (found) return found;
        }
      }
      return null;
    };

    const parentComment = findParentComment(course.comments || []);
    return parentComment?.user?.name || null;
  };

  const replyContext = getReplyContext();

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    }
  };

  const initializeReplyToReply = (replyId: number, replyUserName: string) => {
    setReplyingToReplyId(replyId);
    setReplyToReplyContent(`@${replyUserName} `);
  };

  const handleReplyToReplySubmit = () => {
    if (replyToReplyContent.trim() && replyingToReplyId) {
      onReply(replyingToReplyId, replyToReplyContent);
      setReplyToReplyContent("");
      setReplyingToReplyId(null);
    }
  };

  // Initialize reply content with @mention for replies to replies
  const initializeReplyForm = () => {
    if (isReply && comment.user?.name) {
      setReplyContent(`@${comment.user.name} `);
    } else {
      setReplyContent("");
    }
    setShowReplyForm(true);
  };

  const handleVote = async (voteType: "up" | "down") => {
    try {
      let voteData;
      if (comment.votes?.user_vote === voteType) {
        // Remove vote
        await removeVoteFromCourseComment(courseId, comment.id);
        voteData = {
          upvotes: Math.max(
            0,
            (comment.votes?.upvotes || 0) - (voteType === "up" ? 1 : 0)
          ),
          downvotes: Math.max(
            0,
            (comment.votes?.downvotes || 0) - (voteType === "down" ? 1 : 0)
          ),
          user_vote: null,
        };
      } else {
        // Add or change vote
        await voteCourseComment(courseId, comment.id, voteType);
        const wasOppositeVote =
          comment.votes?.user_vote === (voteType === "up" ? "down" : "up");
        voteData = {
          upvotes:
            (comment.votes?.upvotes || 0) +
            (voteType === "up" ? 1 : wasOppositeVote ? 0 : 0) -
            (voteType === "down" && wasOppositeVote ? 1 : 0),
          downvotes:
            (comment.votes?.downvotes || 0) +
            (voteType === "down" ? 1 : wasOppositeVote ? 0 : 0) -
            (voteType === "up" && wasOppositeVote ? 1 : 0),
          user_vote: voteType,
        };
      }
      setComments((prevComments) =>
        updateCommentVote(prevComments, comment.id, voteData)
      );
    } catch (error) {
      console.error("Error voting on comment:", error);
      // Optionally revert the optimistic update on error
    }
  };

  return (
    <div
      className={`mt-4 ${isReply && !isNestedReply ? "ml-10" : ""} ${
        !isReply && "border-b border-gray-200"
      }`}
    >
      <div
        className={`pb-4 ${
          isOwnComment ? "bg-blue-50 -mx-4 px-4 py-3 rounded-lg" : ""
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`font-medium ${
                  isOwnComment ? "text-green-600" : "text-gray-900"
                }`}
              >
                {comment.user?.name || "Unknown User"}
              </span>

              {isOwnComment && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  You
                </span>
              )}

              {comment.user?.id === course?.instructor_id && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  Instructor
                </span>
              )}

              {replyContext && (
                <span className="text-xs text-gray-600 italic">
                  replying to @{replyContext}
                </span>
              )}

              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {editingCommentId === comment.id ? (
              <div className="mt-2">
                <textarea
                  value={editCommentText}
                  onChange={(e) => setEditCommentText(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black"
                  rows={3}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onEdit(comment.id, editCommentText)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCommentId(null)}
                    className="px-3 py-1 bg-gray-500 text-white rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700">{comment.content}</p>
            )}

            {/* Action buttons */}
            <div className="mt-2 flex items-center gap-2">
              {/*Voting Buttons */}
              <div className="flex items-center gap-2 mr-4">
                <button
                  onClick={() => handleVote("up")}
                  className={`flex items-center gap-1 ${
                    comment.votes?.user_vote === "up"
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {comment.votes?.user_vote === "up" ? (
                    <BiSolidUpvote />
                  ) : (
                    <BiUpvote />
                  )}{" "}
                  {comment.votes?.upvotes || 0}
                </button>

                <button
                  onClick={() => handleVote("down")}
                  className={`flex items-center gap-1 ${
                    comment.votes?.user_vote === "down"
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {comment.votes?.user_vote === "down" ? (
                    <BiSolidDownvote />
                  ) : (
                    <BiDownvote />
                  )}{" "}
                  {comment.votes?.downvotes || 0}
                </button>
              </div>
              <button
                onClick={() => initializeReplyForm()}
                className="text-blue-500 text-sm hover:text-white font-medium rounded-full hover:bg-blue-500 hover:ring-blue-300 transition px-2 py-1"
              >
                Reply
              </button>

              {comment.user_id === user?.id &&
                editingCommentId !== comment.id && (
                  <>
                    <button
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditCommentText(comment.content);
                      }}
                      className="px-3 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 font-medium inline-flex items-center gap-1"
                    >
                      <RiDeleteBin6Line className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(comment.id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 font-medium inline-flex items-center gap-1"
                    >
                      <RiDeleteBin6Line className="h-4 w-4" />
                      Delete
                    </button>
                  </>
                )}
            </div>

            {/* Reply form */}
            {showReplyForm && (
              <div className="mt-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={
                    isReply
                      ? `Reply to @${comment.user?.name}...`
                      : "Write a reply..."
                  }
                  className="w-full px-3 py-2 border rounded-md text-black"
                  rows={2}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleReplySubmit}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => setShowReplyForm(false)}
                    className="px-3 py-1 bg-gray-500 text-white rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render replies - flatten all nested replies to same level */}
      {allReplies.length > 0 && depth === 0 && (
        <div className="mt-0">
          <div className="mb-4 flex items-center gap-2">
            {(visibleReplies[comment.id] || 0) === 0 ? (
              <button
                onClick={() => onLoadMoreReplies?.(comment.id)}
                className="text-blue-500 text-sm hover:text-blue-700 font-medium inline-flex items-center gap-2 ml-1 mb-1"
              >
                <FaChevronDown className="w-4 h-4" />
                {allReplies.length} replies
              </button>
            ) : (
              <button
                onClick={() => onToggleReplies?.(comment.id)}
                className="text-blue-500 text-sm hover:text-blue-700 font-medium inline-flex items-center gap-2 ml-1 mb-1"
              >
                <FaChevronUp className="w-4 h-4" />
                {allReplies.length} replies
              </button>
            )}
          </div>
          {allReplies.slice(0, visibleReplies[comment.id] || 0).map((reply) => (
            <div
              key={reply.id}
              className="mt-4 ml-10 border-b border-gray-100 pb-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900">
                  {reply.user?.name || "Unknown User"}
                </span>
                {reply.user?.id === user?.id && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                    You
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(reply.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              {editingCommentId === reply.id ? (
                <div className="mt-2">
                  <textarea
                    value={editCommentText}
                    onChange={(e) => setEditCommentText(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-black"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => onEdit(reply.id, editCommentText)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCommentId(null)}
                      className="px-3 py-1 bg-gray-500 text-white rounded-md"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700">{reply.content}</p>
              )}

              {/* Action buttons for flattened replies */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center gap-2 mr-4">
                  <button
                    onClick={async () => {
                      try {
                        let voteData;
                        if (reply.votes?.user_vote === "up") {
                          await removeVoteFromCourseComment(courseId, reply.id);
                          voteData = {
                            upvotes: Math.max(
                              0,
                              (reply.votes?.upvotes || 0) - 1
                            ),
                            downvotes: reply.votes?.downvotes || 0,
                            user_vote: null,
                          };
                        } else {
                          await voteCourseComment(courseId, reply.id, "up");
                          const wasOppositeVote =
                            reply.votes?.user_vote === "down";
                          voteData = {
                            upvotes: (reply.votes?.upvotes || 0) + 1,
                            downvotes:
                              (reply.votes?.downvotes || 0) -
                              (wasOppositeVote ? 1 : 0),
                            user_vote: "up",
                          };
                        }
                        setComments((prevComments) =>
                          updateCommentVote(prevComments, reply.id, voteData)
                        );
                      } catch (error) {
                        console.error("Error voting:", error);
                      }
                    }}
                    className={`flex items-center gap-1 ${
                      reply.votes?.user_vote === "up"
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {reply.votes?.user_vote === "up" ? (
                      <BiSolidUpvote />
                    ) : (
                      <BiUpvote />
                    )}{" "}
                    {reply.votes?.upvotes || 0}
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        let voteData;
                        if (reply.votes?.user_vote === "down") {
                          await removeVoteFromCourseComment(courseId, reply.id);
                          voteData = {
                            upvotes: reply.votes?.upvotes || 0,
                            downvotes: Math.max(
                              0,
                              (reply.votes?.downvotes || 0) - 1
                            ),
                            user_vote: null,
                          };
                        } else {
                          await voteCourseComment(courseId, reply.id, "down");
                          const wasOppositeVote =
                            reply.votes?.user_vote === "up";
                          voteData = {
                            upvotes:
                              (reply.votes?.upvotes || 0) -
                              (wasOppositeVote ? 1 : 0),
                            downvotes: (reply.votes?.downvotes || 0) + 1,
                            user_vote: "down",
                          };
                        }
                        setComments((prevComments) =>
                          updateCommentVote(prevComments, reply.id, voteData)
                        );
                      } catch (error) {
                        console.error("Error voting:", error);
                      }
                    }}
                    className={`flex items-center gap-1 ${
                      reply.votes?.user_vote === "down"
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {reply.votes?.user_vote === "down" ? (
                      <BiSolidDownvote />
                    ) : (
                      <BiDownvote />
                    )}{" "}
                    {reply.votes?.downvotes || 0}
                  </button>
                </div>
                <button
                  onClick={() =>
                    initializeReplyToReply(reply.id, reply.user?.name || "")
                  }
                  className="text-blue-500 text-sm hover:text-white font-medium rounded-full hover:bg-blue-500 hover:ring-blue-300 transition px-2 py-1"
                >
                  Reply
                </button>

                {reply.user_id === user?.id &&
                  editingCommentId !== reply.id && (
                    <>
                      <button
                        onClick={() => {
                          setEditingCommentId(reply.id);
                          setEditCommentText(reply.content);
                        }}
                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 font-medium inline-flex items-center gap-1"
                      >
                        <RiDeleteBin6Line className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(reply.id)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 font-medium inline-flex items-center gap-1"
                      >
                        <RiDeleteBin6Line className="h-4 w-4" />
                        Delete
                      </button>
                    </>
                  )}
              </div>

              {/* Reply to reply form */}
              {replyingToReplyId === reply.id && (
                <div className="mt-3">
                  <textarea
                    value={replyToReplyContent}
                    onChange={(e) => setReplyToReplyContent(e.target.value)}
                    placeholder={`Reply to @${reply.user?.name}...`}
                    className="w-full px-3 py-2 border rounded-md text-black"
                    rows={2}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleReplyToReplySubmit}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => {
                        setReplyingToReplyId(null);
                        setReplyToReplyContent("");
                      }}
                      className="px-3 py-1 bg-gray-500 text-white rounded-md"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {(visibleReplies[comment.id] || 0) > 0 &&
            allReplies.length > (visibleReplies[comment.id] || 0) && (
              <div className="mt-2 mb-2 flex items-center gap-2">
                <button
                  onClick={() => onLoadMoreReplies?.(comment.id)}
                  className="text-blue-500 text-sm hover:text-blue-700 font-medium inline-flex items-center gap-1 ml-5 mb-1"
                >
                  <HiArrowTurnDownRight className="w-4 h-4" />
                  Show more replies
                </button>
              </div>
            )}
        </div>
      )}

      {/* Keep nested rendering for depth > 0 (shouldn't happen with flattening, but keep as fallback) */}
      {comment.replies && comment.replies.length > 0 && depth > 0 && (
        <div className="mt-4">
          {comment.replies
            .slice(0, visibleReplies[comment.id] || 1)
            .map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                courseId={courseId}
                course={course}
                user={user}
                isInstructor={isInstructor}
                isAdmin={isAdmin}
                isReply={true}
                isNestedReply={isReply}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onRefresh={onRefresh}
                setComments={setComments}
                updateCommentVote={updateCommentVote}
                editingCommentId={editingCommentId}
                editCommentText={editCommentText}
                setEditingCommentId={setEditingCommentId}
                setEditCommentText={setEditCommentText}
                visibleReplies={visibleReplies}
                onLoadMoreReplies={onLoadMoreReplies}
                onToggleReplies={onToggleReplies}
                depth={depth + 1}
              />
            ))}
          {comment.replies &&
            comment.replies.length > (visibleReplies[comment.id] || 1) && (
              <div
                className={`mt-2 ${isReply && !isNestedReply ? "ml-10" : ""}`}
              >
                <button
                  onClick={() => onLoadMoreReplies?.(comment.id)}
                  className="text-blue-500 text-sm hover:text-blue-700 font-medium"
                >
                  Load more replies
                </button>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

interface Course {
  id: number;
  instructor_id: number;
  title: string;
  content: string;
  instructor_name: string;
  privacy: string;
  current_enrolled: number;
  capacity: number;
  status: string;
  active_learners?: any[];
  join_requests?: any[];
  materials?: any[];
  comments?: any[];
  announcements?: any[];
}

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [isInstructor, setIsInstructor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState<
    "learners" | "comments" | "announcements" | "requests" | "materials"
  >("learners");

  // Management modals state
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showEditMaterialModal, setShowEditMaterialModal] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<number | null>(
    null
  );
  const [editMaterialForm, setEditMaterialForm] = useState({
    title: "",
    description: "",
    url: "",
  });
  const [materialFilter, setMaterialFilter] = useState<
    "all" | "file" | "video" | "link"
  >("all");
  const [newComment, setNewComment] = useState("");
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
  });
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<number | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState({
    title: "",
    content: "",
  });

  // Edit form state
  const [editForm, setEditForm] = useState<{
    title: string;
    content: string;
    privacy: "public" | "private";
    capacity: number;
  }>({
    title: "",
    content: "",
    privacy: "public",
    capacity: 50,
  });

  // Data states
  const [learners, setLearners] = useState<any[]>([]);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Pagination states
  const [visibleComments, setVisibleComments] = useState(10);
  const [visibleReplies, setVisibleReplies] = useState<{
    [commentId: number]: number;
  }>({});
  const COMMENTS_PER_LOAD = 10;

  // Pagination handlers
  const handleLoadMoreComments = () => {
    setVisibleComments((prev) => prev + COMMENTS_PER_LOAD);
  };

  const handleLoadMoreReplies = (commentId: number) => {
    setVisibleReplies((prev) => ({
      ...prev,
      [commentId]: (prev[commentId] || 0) + 10,
    }));
  };

  const handleToggleReplies = (commentId: number) => {
    setVisibleReplies((prev) => ({
      ...prev,
      [commentId]: (prev[commentId] || 0) > 0 ? 0 : 10,
    }));
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getCourse(id);
      const data = response.data;

      setCourse(data.course);
      setIsInstructor(data.is_instructor);
      setIsAdmin(data.is_admin || false);
      setIsEnrolled(data.is_enrolled || false);
      setHasPendingRequest(data.has_pending_request || false);

      // Set data from course relationships
      setLearners(data.course.active_learners || []);
      setJoinRequests(data.course.join_requests || []);
      setMaterials(data.course.materials || []);
      setComments(data.course.comments || []);
      setAnnouncements(data.course.announcements || []);

      // Reset pagination when data is refreshed
      setVisibleComments(10);
      setVisibleReplies({});

      // Initialize edit form
      setEditForm({
        title: data.course.title,
        content: data.course.content || "",
        privacy: data.course.privacy,
        capacity: data.course.capacity,
      });
    } catch (err: any) {
      console.error("Error fetching course:", err);
      setError(err.response?.data?.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for asynchronous updates
  const updateCommentVote = (
    comments: Comment[],
    commentId: number,
    voteData: any
  ): Comment[] => {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          votes: {
            ...comment.votes,
            ...voteData,
          },
        };
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: updateCommentVote(comment.replies, commentId, voteData),
        };
      }
      return comment;
    });
  };

  const addCommentToList = (
    comments: Comment[],
    newComment: Comment
  ): Comment[] => {
    if (newComment.parent_comment_id) {
      // It's a reply, find the parent and add to its replies
      return comments.map((comment) => {
        if (comment.id === newComment.parent_comment_id) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newComment],
          };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: addCommentToList(comment.replies, newComment),
          };
        }
        return comment;
      });
    } else {
      // It's a top-level comment
      return [...comments, newComment];
    }
  };

  const updateCommentInList = (
    comments: Comment[],
    commentId: number,
    updatedContent: string
  ): Comment[] => {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          content: updatedContent,
        };
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: updateCommentInList(
            comment.replies,
            commentId,
            updatedContent
          ),
        };
      }
      return comment;
    });
  };

  const removeCommentFromList = (
    comments: Comment[],
    commentId: number
  ): Comment[] => {
    return comments
      .filter((comment) => comment.id !== commentId)
      .map((comment) => {
        if (comment.replies) {
          return {
            ...comment,
            replies: removeCommentFromList(comment.replies, commentId),
          };
        }
        return comment;
      });
  };

  // Helper function for optimistic material updates
  const addMaterialOptimistically = (
    materials: any[],
    newMaterial: any
  ): any[] => {
    // Check if this is replacing an optimistic material (same title and temp ID)
    const existingIndex = materials.findIndex((m) => m.id === newMaterial.id);
    if (existingIndex >= 0) {
      // Replace the optimistic material with real data
      const updatedMaterials = [...materials];
      updatedMaterials[existingIndex] = newMaterial;
      return updatedMaterials;
    } else {
      // Add new material
      return [...materials, newMaterial];
    }
  };

  const updateMaterialInList = (
    materials: any[],
    materialId: number,
    updatedMaterial: any
  ): any[] => {
    return materials.map((material) =>
      material.id === materialId
        ? { ...material, ...updatedMaterial }
        : material
    );
  };

  const handleMaterialAdded = (material: any) => {
    setMaterials((prev) => addMaterialOptimistically(prev, material));
  };

  const handleEditMaterial = (materialId: number) => {
    // Prevent editing materials with temporary IDs (timestamps)
    if (materialId > 1000000000000) {
      // Timestamp IDs are > 1 trillion
      alert("Please wait for the material to finish uploading before editing.");
      return;
    }

    const material = materials.find((m) => m.id === materialId);
    if (material) {
      setEditingMaterialId(materialId);
      setEditMaterialForm({
        title: material.title,
        description: material.description || "",
        url: material.url || "",
      });
      setShowEditMaterialModal(true);
    }
  };

  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !editingMaterialId) return;

    // Store original material for potential rollback
    const originalMaterial = materials.find((m) => m.id === editingMaterialId);

    // Optimistic update
    setMaterials((prev) =>
      updateMaterialInList(prev, editingMaterialId, editMaterialForm)
    );
    setShowEditMaterialModal(false);
    setEditingMaterialId(null);
    setEditMaterialForm({
      title: "",
      description: "",
      url: "",
    });

    try {
      await updateCourseMaterial(id, editingMaterialId, editMaterialForm);
    } catch (err: any) {
      console.error("Error updating material:", err);
      // Revert optimistic update
      if (originalMaterial) {
        setMaterials((prev) =>
          updateMaterialInList(prev, editingMaterialId, originalMaterial)
        );
      }
      setShowEditMaterialModal(true);
      setEditingMaterialId(editingMaterialId);
      alert(err.response?.data?.message || "Failed to update material");
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await updateCourse(id, editForm);
      await fetchCourseData();
      setShowEditModal(false);
      alert("Course updated successfully!");
    } catch (err: any) {
      console.error("Error updating course:", err);
      alert(err.response?.data?.message || "Failed to update course");
    }
  };

  const handleDeleteCourse = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to disband this course?")) return;

    try {
      await deleteCourse(id);
      alert("Course disbanded successfully");
      navigate("/courses");
    } catch (err: any) {
      console.error("Error deleting course:", err);
      alert(err.response?.data?.message || "Failed to disband course");
    }
  };

  const handleRemoveLearner = async (userId: number) => {
    if (!id) return;
    if (!confirm("Are you sure you want to remove this learner?")) return;

    try {
      await removeLearner(id, userId);
      await fetchCourseData();
      alert("Learner removed successfully");
    } catch (err: any) {
      console.error("Error removing learner:", err);
      alert(err.response?.data?.message || "Failed to remove learner");
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    if (!id) return;

    try {
      await acceptJoinRequest(id, requestId);
      await fetchCourseData();
      alert("Request accepted");
    } catch (err: any) {
      console.error("Error accepting request:", err);
      alert(err.response?.data?.message || "Failed to accept request");
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    if (!id) return;

    try {
      await rejectJoinRequest(id, requestId);
      await fetchCourseData();
      alert("Request rejected");
    } catch (err: any) {
      console.error("Error rejecting request:", err);
      alert(err.response?.data?.message || "Failed to reject request");
    }
  };

  const handleEnrollCourse = async () => {
    if (!id) return;

    try {
      const response = await enrollInCourse(id);
      await fetchCourseData();
      alert(response.data.message || "Successfully enrolled!");
    } catch (err: any) {
      console.error("Error enrolling:", err);
      alert(err.response?.data?.message || "Failed to enroll in course");
    }
  };

  const handleLeaveCourse = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to leave this course?")) return;

    try {
      const response = await leaveCourse(id);
      await fetchCourseData();
      alert(response.data.message || "Successfully left the course");
    } catch (err: any) {
      console.error("Error leaving course:", err);
      alert(err.response?.data?.message || "Failed to leave course");
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    if (!id) return;

    // Prevent deleting materials with temporary IDs (timestamps)
    if (materialId > 1000000000000) {
      // Timestamp IDs are > 1 trillion
      alert(
        "Please wait for the material to finish uploading before deleting."
      );
      return;
    }

    if (!confirm("Are you sure you want to delete this material?")) return;

    // Store the material for potential rollback
    const materialToDelete = materials.find((m) => m.id === materialId);

    // Optimistic update
    setMaterials((prev) => prev.filter((m) => m.id !== materialId));

    try {
      await deleteCourseMaterial(id, materialId);
    } catch (err: any) {
      console.error("Error deleting material:", err);
      // Revert optimistic update
      if (materialToDelete) {
        setMaterials((prev) => [...prev, materialToDelete]);
      }
      alert(err.response?.data?.message || "Failed to delete material");
    }
  };

  const handleAddComment = async () => {
    if (!id || !newComment.trim()) return;

    const tempComment = {
      id: Date.now(), // Temporary ID
      content: newComment,
      created_at: new Date().toISOString(),
      user_id: user?.id || 0,
      parent_comment_id: null,
      user: user ? { id: user.id, name: user.name } : undefined,
      replies: [],
      votes: {
        upvotes: 0,
        downvotes: 0,
        user_vote: null,
      },
    };

    // Optimistic update
    setComments((prev) => [...prev, tempComment]);
    setNewComment("");

    // Ensure the new comment is visible
    setVisibleComments((prev) => Math.max(prev, comments.length + 1));

    try {
      const response = await addCourseComment(id, newComment);
      // Update with real data from server
      if (response.data?.comment) {
        setComments((prev) =>
          prev.map((c) => (c.id === tempComment.id ? response.data.comment : c))
        );
      }
    } catch (err: any) {
      console.error("Error adding comment:", err);
      // Revert optimistic update
      setComments((prev) => prev.filter((c) => c.id !== tempComment.id));
      setNewComment(newComment); // Restore the text
      alert(err.response?.data?.message || "Failed to post comment");
    }
  };

  const handleAddReply = async (parentCommentId: number, content: string) => {
    if (!id || !content.trim()) return;

    const tempReply = {
      id: Date.now(), // Temporary ID
      content: content,
      created_at: new Date().toISOString(),
      user_id: user?.id || 0,
      parent_comment_id: parentCommentId,
      user: user ? { id: user.id, name: user.name } : undefined,
      replies: [],
      votes: {
        upvotes: 0,
        downvotes: 0,
        user_vote: null,
      },
    };

    // Optimistic update
    setComments((prev) => addCommentToList(prev, tempReply));

    // Update visibleReplies to show the new reply
    // setVisibleReplies(prev => ({
    //   ...prev,
    //   [parentCommentId]: (prev[parentCommentId] || 1) + 1
    // }));

    try {
      const response = await addCourseComment(id, content, parentCommentId);
      // Update with real data from server
      if (response.data?.comment) {
        setComments((prev) => {
          // Remove temp reply and add real one
          const withoutTemp = removeCommentFromList(prev, tempReply.id);
          return addCommentToList(withoutTemp, response.data.comment);
        });
      }
    } catch (err: any) {
      console.error("Error adding reply:", err);
      // Revert optimistic update
      setComments((prev) => removeCommentFromList(prev, tempReply.id));
      alert(err.response?.data?.message || "Failed to post reply");
    }
  };

  const handleUpdateCourseComment = async (
    commentId: number,
    updatedText: string
  ) => {
    if (!id || !updatedText.trim()) return;

    // Store original text for potential rollback
    const originalText = editCommentText;

    // Optimistic update
    setComments((prev) => updateCommentInList(prev, commentId, updatedText));
    setEditingCommentId(null);
    setEditCommentText("");

    try {
      await updateCourseComment(id, commentId, updatedText);
    } catch (err: any) {
      console.error("Error updating comment:", err);
      // Revert optimistic update
      setComments((prev) => updateCommentInList(prev, commentId, originalText));
      setEditingCommentId(commentId);
      setEditCommentText(originalText);
      alert(err.response?.data?.message || "Failed to update comment");
    }
  };

  const handleDeleteCourseComment = async (commentId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmDelete) {
      return;
    }

    // Store the comment for potential rollback (simplified - just proceed with delete)
    // Optimistic update
    setComments((prev) => removeCommentFromList(prev, commentId));

    try {
      await deleteCourseComment(id!, commentId);
    } catch (error) {
      console.error("Error deleting comment:", error);
      // For delete, we can't easily rollback, so just refetch on error
      fetchCourseData();
    }
  };

  const handleAddAnnouncement = async () => {
    if (!id || !newAnnouncement.title.trim() || !newAnnouncement.content.trim())
      return;

    try {
      await addCourseAnnouncement(id, newAnnouncement);
      await fetchCourseData();
      setNewAnnouncement({ title: "", content: "" });
      alert("Announcement posted!");
    } catch (err: any) {
      console.error("Error adding announcement:", err);
      alert(err.response?.data?.message || "Failed to post announcement");
    }
  };

  const handleDeleteAnnouncement = async (announcementId: number) => {
    if (!id) return;

    try {
      await deleteCourseAnnouncement(id, announcementId);
      await fetchCourseData();
      alert("Announcement deleted");
    } catch (err: any) {
      console.error("Error deleting announcement:", err);
      alert(err.response?.data?.message || "Failed to delete announcement");
    }
  };

  const handleEditAnnouncement = async () => {
    if (!id || !editingAnnouncementId) return;

    if (!editingAnnouncement.title.trim() || !editingAnnouncement.content.trim()) {
      alert("Please fill in both title and content");
      return;
    }

    try {
      await updateCourseAnnouncement(id, editingAnnouncementId, editingAnnouncement);
      await fetchCourseData();
      setEditingAnnouncementId(null);
      setEditingAnnouncement({ title: "", content: "" });
      alert("Announcement updated");
    } catch (err: any) {
      console.error("Error updating announcement:", err);
      alert(err.response?.data?.message || "Failed to update announcement");
    }
  };

  const startEditingAnnouncement = (announcement: any) => {
    setEditingAnnouncementId(announcement.id);
    setEditingAnnouncement({
      title: announcement.title,
      content: announcement.content,
    });
  };

  const cancelEditingAnnouncement = () => {
    setEditingAnnouncementId(null);
    setEditingAnnouncement({ title: "", content: "" });
  };

  const handleBanUser = async (userId: number) => {
    if (!id) return;
    if (!confirm("Are you sure you want to ban this user from commenting?"))
      return;

    try {
      await banUserFromComments(id, userId);
      await fetchCourseData();
      alert("User banned from commenting");
    } catch (err: any) {
      console.error("Error banning user:", err);
      alert(err.response?.data?.message || "Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId: number) => {
    if (!id) return;

    try {
      await unbanUserFromComments(id, userId);
      await fetchCourseData();
      alert("User unbanned from commenting");
    } catch (err: any) {
      console.error("Error unbanning user:", err);
      alert(err.response?.data?.message || "Failed to unban user");
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
            The course you're looking for doesn't exist or you don't have access
            to it.
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

  return (
    <main className="flex-1 overflow-auto">
      {/* Course Header */}
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
            {isInstructor || isAdmin ? (
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
                      {course?.privacy === "private"
                        ? "Request to Join"
                        : "Join Course"}
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

        {/* Tabs */}
        <div className="bg-white">
          <div className="border-b border-gray-200 px-6">
            <nav className="flex">
              {(isInstructor || isAdmin || isEnrolled) && (
                <button
                  onClick={() => setActiveTab("learners")}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === "learners"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <PiUsersThreeBold className="h-4 w-4" />
                  Learners
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {learners.length}
                  </span>
                </button>
              )}
              {isInstructor && course?.privacy === "private" && (
                <button
                  onClick={() => setActiveTab("requests")}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === "requests"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <VscRequestChanges className="h-4 w-4" />
                  Requests
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {joinRequests.length}
                  </span>
                </button>
              )}
              <button
                onClick={() => setActiveTab("materials")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "materials"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FaRegFileAlt className="h-4 w-4" />
                Materials
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {materials.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("comments")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "comments"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FaRegCommentDots className="h-4 w-4" />
                Comments
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {comments.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("announcements")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "announcements"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <RiMegaphoneLine className="h-4 w-4" />
                Announcements
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {announcements.length}
                </span>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="px-6 py-4">
            {/* Learners Tab */}
            {activeTab === "learners" && (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Name
                        </th>
                        {(isInstructor || isAdmin) && (
                          <>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Email
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Joined
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Actions
                            </th>
                          </>
                        )}
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
                          {(isInstructor || isAdmin) && (
                            <>
                              <td className="py-4 px-4 text-sm text-gray-600 flex items-center gap-2">
                                <MdOutlineEmail className="h-4 w-4 text-gray-400" />
                                {learner.email}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                {learner.enrolled_at ||
                                  new Date(
                                    learner.pivot?.created_at ||
                                      learner.created_at
                                  ).toLocaleDateString()}
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex gap-2">
                                  {/* Remove learner button for instructors/admins */}
                                  {(isInstructor || isAdmin) && (
                                    <button
                                      onClick={() =>
                                        handleRemoveLearner(learner.id)
                                      }
                                      className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 font-medium"
                                    >
                                      <LiaUserMinusSolid className="h-4 w-4" />
                                      Remove
                                    </button>
                                  )}

                                  {/* Ban/Unban from comments - only for admins */}
                                  {(isAdmin || isInstructor) &&
                                    (learner.pivot?.comment_banned ? (
                                      <button
                                        onClick={() =>
                                          handleUnbanUser(learner.id)
                                        }
                                        className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 font-medium"
                                      >
                                        <RiCheckLine className="h-4 w-4" />
                                        Unban Comments
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          handleBanUser(learner.id)
                                        }
                                        className="flex items-center gap-1 px-3 py-1 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 font-medium"
                                      >
                                        <RiDeleteBin6Line className="h-4 w-4" />
                                        Ban Comments
                                      </button>
                                    ))}

                                  {/* Show banned status */}
                                  {learner.comment_banned && (
                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-md font-medium">
                                      Banned from comments
                                    </span>
                                  )}
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === "requests" &&
              (isInstructor || isAdmin) &&
              course?.privacy === "private" && (
                <div>
                  <div className="space-y-3">
                    {joinRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">
                              {request.user?.name || "Unknown"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {request.user?.email || ""}
                            </p>
                            <p className="text-xs text-gray-500">
                              Requested on{" "}
                              {new Date(
                                request.created_at
                              ).toLocaleDateString()}
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
                    ))}
                  </div>
                </div>
              )}

            {/* Materials Tab */}
            {activeTab === "materials" && (
              <div>
                {/* Category Filter */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMaterialFilter("all")}
                      className={`px-3 py-1 rounded-md text-sm ${
                        materialFilter === "all"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setMaterialFilter("file")}
                      className={`px-3 py-1 rounded-md text-sm ${
                        materialFilter === "file"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Files
                    </button>
                    <button
                      onClick={() => setMaterialFilter("video")}
                      className={`px-3 py-1 rounded-md text-sm ${
                        materialFilter === "video"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Videos
                    </button>
                    <button
                      onClick={() => setMaterialFilter("link")}
                      className={`px-3 py-1 rounded-md text-sm ${
                        materialFilter === "link"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Links
                    </button>
                  </div>
                  {/* Add Material Button */}
                  {isInstructor && (
                    <button
                      onClick={() => setShowAddMaterialModal(true)}
                      className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 inline-flex items-center gap-2"
                    >
                      <HiOutlinePlus className="h-5 w-5" />
                      Add Material
                    </button>
                  )}
                </div>

                {/* Materials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {materials
                    .filter(
                      (m) =>
                        materialFilter === "all" || m.type === materialFilter
                    )
                    .map((material) => (
                      <div
                        key={material.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {/* Icon based on type */}
                            {material.type === "file" && (
                              <FaRegFileAlt className="h-10 w-10 text-blue-500" />
                            )}
                            {material.type === "video" && (
                              <FaRegPlayCircle className="h-10 w-10 text-red-500" />
                            )}
                            {material.type === "link" && (
                              <FaLink className="h-10 w-10 text-green-500" />
                            )}

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900">
                                  {material.title}
                                </h4>
                                {material.id > 1000000000000 && (
                                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                    Uploading...
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {material.type === "file" &&
                                  material.file_type?.toUpperCase()}
                                {material.type === "file" &&
                                  material.file_type &&
                                  " • "}
                                Uploaded{" "}
                                {new Date(
                                  material.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {isInstructor && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditMaterial(material.id)}
                                className="text-blue-500 hover:text-blue-700"
                                title="Edit material"
                              >
                                <LiaEditSolid className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteMaterial(material.id)
                                }
                                className="text-red-500 hover:text-red-700"
                                title="Delete material"
                              >
                                <RiDeleteBin6Line className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            if (material.url) {
                              // For files, trigger download
                              if (material.type === "file") {
                                const link = document.createElement("a");
                                link.href = `http://localhost:8000${material.url}`;
                                link.download = material.title;
                                link.target = "_blank";
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              } else {
                                // For videos and links, open in new tab
                                window.open(material.url, "_blank");
                              }
                            }
                          }}
                          className="mt-3 w-full px-3 py-2 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100 font-medium"
                        >
                          {material.type === "file" ? "Download" : "Open"}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === "comments" && (
              <div>
                <div className="space-y-6">
                  {comments.slice(0, visibleComments).map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      courseId={id!}
                      course={course!}
                      user={user}
                      isInstructor={isInstructor}
                      isAdmin={isAdmin}
                      isReply={false}
                      isNestedReply={false}
                      onReply={handleAddReply}
                      onEdit={handleUpdateCourseComment}
                      onDelete={handleDeleteCourseComment}
                      onRefresh={fetchCourseData}
                      setComments={setComments}
                      updateCommentVote={updateCommentVote}
                      editingCommentId={editingCommentId}
                      editCommentText={editCommentText}
                      setEditingCommentId={setEditingCommentId}
                      setEditCommentText={setEditCommentText}
                      visibleReplies={visibleReplies}
                      onLoadMoreReplies={handleLoadMoreReplies}
                      onToggleReplies={handleToggleReplies}
                      depth={0}
                    />
                  ))}
                </div>

                {/* Load More Comments Button */}
                {comments.length > visibleComments && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={handleLoadMoreComments}
                      className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium"
                    >
                      Load More Comments
                    </button>
                  </div>
                )}

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
            )}

            {/* Announcements Tab */}
            {activeTab === "announcements" && (
              <div>
                {/* Empty State */}
                {announcements.length === 0 && !isInstructor && (
                  <div className="text-center py-12">
                    <RiMegaphoneLine className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Announcements Yet
                    </h3>
                    <p className="text-gray-500">
                      Check back later for course announcements from your instructor.
                    </p>
                  </div>
                )}

                {/* Announcements List */}
                <div className="space-y-4">
                  {announcements
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((announcement: any) => (
                    <div
                      key={announcement.id}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      {editingAnnouncementId === announcement.id ? (
                        <div className="p-5">
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Title
                            </label>
                            <input
                              type="text"
                              value={editingAnnouncement.title}
                              onChange={(e) =>
                                setEditingAnnouncement({
                                  ...editingAnnouncement,
                                  title: e.target.value,
                                })
                              }
                              placeholder="Announcement Title"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Content
                            </label>
                            <textarea
                              value={editingAnnouncement.content}
                              onChange={(e) =>
                                setEditingAnnouncement({
                                  ...editingAnnouncement,
                                  content: e.target.value,
                                })
                              }
                              placeholder="Write your announcement here..."
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                              rows={4}
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleEditAnnouncement}
                              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm inline-flex items-center gap-2"
                            >
                              <RiCheckLine className="h-4 w-4" />
                              Save Changes
                            </button>
                            <button
                              onClick={cancelEditingAnnouncement}
                              className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium shadow-sm inline-flex items-center gap-2"
                            >
                              <LiaTimesSolid className="h-4 w-4" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                                <RiMegaphoneLine className="h-6 w-6 text-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {announcement.title}
                                  </h3>
                                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">
                                    {announcement.content}
                                  </p>
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>
                                      {new Date(announcement.created_at).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                                {isInstructor && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => startEditingAnnouncement(announcement)}
                                      className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium shadow-sm transition-colors"
                                      title="Edit announcement"
                                    >
                                      <LiaEditSolid className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteAnnouncement(announcement.id)
                                      }
                                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium shadow-sm transition-colors"
                                      title="Delete announcement"
                                    >
                                      <RiDeleteBin6Line className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Announcement Form */}
                {isInstructor && (
                  <div className="mt-8 bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <RiMegaphoneLine className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Create New Announcement
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newAnnouncement.title}
                          onChange={(e) =>
                            setNewAnnouncement({
                              ...newAnnouncement,
                              title: e.target.value,
                            })
                          }
                          placeholder="e.g., Important Update, New Assignment, etc."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Content <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={newAnnouncement.content}
                          onChange={(e) =>
                            setNewAnnouncement({
                              ...newAnnouncement,
                              content: e.target.value,
                            })
                          }
                          placeholder="Write your announcement details here..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400"
                          rows={5}
                        />
                      </div>
                      <button
                        onClick={handleAddAnnouncement}
                        disabled={!newAnnouncement.title.trim() || !newAnnouncement.content.trim()}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium shadow-sm flex items-center justify-center gap-2 transition-colors"
                      >
                        <RiMegaphoneLine className="h-5 w-5" />
                        Post Announcement
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Course Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Course</h2>
            <form onSubmit={handleUpdateCourse}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.content}
                  onChange={(e) =>
                    setEditForm({ ...editForm, content: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Privacy
                </label>
                <select
                  value={editForm.privacy}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      privacy: e.target.value as "public" | "private",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Learners Limit
                </label>
                <input
                  type="number"
                  value={editForm.capacity}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      capacity: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-md inline-flex items-center gap-2"
                >
                  <LiaTimesSolid className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 inline-flex items-center gap-2"
                >
                  <RiCheckLine className="h-4 w-4" />
                  Update Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Material Modal */}
      {showAddMaterialModal && (
        <AddMaterialModal
          courseId={id!}
          onClose={() => setShowAddMaterialModal(false)}
          onMaterialAdded={handleMaterialAdded}
        />
      )}

      {/* Edit Material Modal */}
      {showEditMaterialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Material</h2>
            <form onSubmit={handleUpdateMaterial}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editMaterialForm.title}
                  onChange={(e) =>
                    setEditMaterialForm({
                      ...editMaterialForm,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={editMaterialForm.description}
                  onChange={(e) =>
                    setEditMaterialForm({
                      ...editMaterialForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                  rows={3}
                />
              </div>
              {materials.find((m) => m.id === editingMaterialId)?.type !==
                "file" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">URL</label>
                  <input
                    type="url"
                    value={editMaterialForm.url}
                    onChange={(e) =>
                      setEditMaterialForm({
                        ...editMaterialForm,
                        url: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                    required
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditMaterialModal(false);
                    setEditingMaterialId(null);
                    setEditMaterialForm({
                      title: "",
                      description: "",
                      url: "",
                    });
                  }}
                  className="px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded-md inline-flex items-center gap-2"
                >
                  <LiaTimesSolid className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 inline-flex items-center gap-2"
                >
                  <RiCheckLine className="h-4 w-4" />
                  Update Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default CourseDetails;
