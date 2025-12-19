import React, { useState, useEffect, useMemo, use } from "react";
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
import { FaReply, FaEdit, FaTrash, FaRegCommentDots } from "react-icons/fa";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import { MdMoreHoriz } from "react-icons/md";
import { useAuth } from "../../../contexts/AuthContext";
import { echo } from "../../../echo";
import { toast } from "react-toastify";

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

// Helper: format relative time
const formatRelativeTime = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Just now";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  } catch {
    return "Just now";
  }
};

const CourseComments: React.FC<CourseCommentsProps> = ({
  courseId,
  instructorId,
  comments,
  onCommentAction,
  currentUserId,
}) => {
  const { user: currentUser } = useAuth();
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
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const tempIdRef = React.useRef<number>(-1);

  // Recursive helpers used across handlers
  const existsInList = (list: Comment[], id: number): boolean => {
    for (const c of list) {
      if (c.id === id) return true;
      if (c.replies && existsInList(c.replies, id)) return true;
    }
    return false;
  };

  const removeMatching = (list: Comment[], predicate: (c: Comment) => boolean): Comment[] => {
    return list
      .filter((c) => !predicate(c))
      .map((c) => ({ ...c, replies: c.replies ? removeMatching(c.replies, predicate) : c.replies }));
  };

  const appendReplyRec = (list: Comment[], parentId: number, incoming: Comment): { list: Comment[]; found: boolean } => {
    let found = false;
    const out = list.map((c) => {
      if (c.id === parentId) {
        found = true;
        const replies = c.replies ? [...c.replies, incoming] : [incoming];
        return { ...c, replies, replies_count: (c.replies_count || 0) + 1 };
      }
      if (c.replies && c.replies.length) {
        const res = appendReplyRec(c.replies, parentId, incoming);
        if (res.found) {
          found = true;
          return { ...c, replies: res.list };
        }
      }
      return c;
    });
    return { list: out, found };
  };

  const insertCommentLocal = (newComment: Comment) => {
    // Helpers: recursive existence and remove-anywhere
    const exists = (list: Comment[], id: number): boolean => {
      for (const c of list) {
        if (c.id === id) return true;
        if (c.replies && exists(c.replies, id)) return true;
      }
      return false;
    };

    const removeById = (list: Comment[], id: number): Comment[] => {
      return list
        .filter((c) => c.id !== id)
        .map((c) => ({ ...c, replies: c.replies ? removeById(c.replies, id) : c.replies }));
    };

    const appendReply = (list: Comment[], parentId: number, incoming: Comment): { list: Comment[]; found: boolean } => {
      let found = false;
      const out = list.map((c) => {
        if (c.id === parentId) {
          found = true;
          const replies = c.replies ? [...c.replies, incoming] : [incoming];
          return { ...c, replies, replies_count: (c.replies_count || 0) + 1 };
        }
        if (c.replies && c.replies.length) {
          const res = appendReply(c.replies, parentId, incoming);
          if (res.found) {
            found = true;
            return { ...c, replies: res.list };
          }
        }
        return c;
      });
      return { list: out, found };
    };

    setLocalComments((prev) => {
      // remove any existing occurrences of this id to avoid duplicates
      let base = removeById(prev, newComment.id);

      if (newComment.parent_id) {
        // also remove stray duplicates of this reply before inserting
        base = removeById(base, newComment.id);
        const res = appendReply(base, newComment.parent_id, newComment);
        if (res.found) {
          // reveal parent replies when a new reply is added
          setHiddenReplies((s) => {
            const ns = new Set(s);
            ns.delete(newComment.parent_id!);
            return ns;
          });
          return res.list;
        }
        // parent not found in current list; append as top-level fallback
        return [newComment, ...base];
      }

      return [newComment, ...base];
    });
  };

  const updateCommentLocal = (updated: Comment) => {
    if (updated.parent_id) {
      setLocalComments((prev) =>
        prev.map((c) => {
          if (c.id === updated.parent_id && c.replies) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === updated.id ? updated : r
              ),
            };
          }
          return c;
        })
      );
    } else {
      setLocalComments((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    }
  };

  const removeCommentLocal = (Id: number, parentId?: number) => {
    if (parentId) {
      setLocalComments((prev) =>
        prev.map((c) => {
          if (c.id === parentId && c.replies) {
            return {
              ...c,
              replies: c.replies.filter((r) => r.id !== Id),
              replies_count: Math.max((c.replies_count || 1) - 1, 0),
            };
          }
          return c;
        })
      );
    } else {
      setLocalComments((prev) => prev.filter((c) => c.id !== Id));
    }
  };

  // Initialize hidden replies - hide only top-level comments that have replies by default
  useEffect(() => {
    const commentsWithReplies = new Set<number>();
    comments.forEach((comment) => {
      if (comment.replies_count > 0) {
        commentsWithReplies.add(comment.id);
      }
    });
    setHiddenReplies(commentsWithReplies);
  }, [comments]);

  const confirmWithToast = (message: string) => {
    return new Promise<boolean>((resolve) => {
      const id = toast.info(
        <div className="max-w-sm">
          <div className="mb-2">{message}</div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                toast.dismiss(id);
                resolve(false);
              }}
              className="px-3 py-1 bg-gray-200 rounded text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(id);
                resolve(true);
              }}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm"
            >
              Delete
            </button>
          </div>
        </div>,
        { autoClose: false, closeOnClick: false }
      );
    });
  };

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

  useEffect(() => {
    const channel = echo.channel(`course.${courseId}`);

    channel.listen("CommentEvent", (e: any) => {
      console.debug("CommentEvent received:", e);
      const incoming: Comment = e.comment;

      // Ensure user info exists to avoid Unknown User displays
      if (!incoming.user) {
        incoming.user = incoming.user || {
          id: (e.user_id as number) || 0,
          name: (incoming as any).user_name || "Unknown User",
          role: "learner",
        } as User;
      }

      if (["created", "added"].includes(e.action)) {
        setLocalComments((prev) => {
          // helper to check existence recursively
          const exists = (list: Comment[], id: number): boolean => {
            for (const c of list) {
              if (c.id === id) return true;
              if (c.replies && exists(c.replies, id)) return true;
            }
            return false;
          };

          if (exists(prev, incoming.id)) return prev;

          // remove any matching stubs (negative id) by content+user anywhere in tree
          const filtered = removeMatching(prev, (c) => c.id < 0 && c.content === incoming.content && c.user?.id === incoming.user?.id);

          // append reply to nested parent if possible
          const appendReply = (list: Comment[], parentId: number, incomingComment: Comment): { list: Comment[]; found: boolean } => {
            let found = false;
            const out = list.map((c) => {
              if (c.id === parentId) {
                found = true;
                const replies = c.replies ? [...c.replies, incomingComment] : [incomingComment];
                return { ...c, replies, replies_count: (c.replies_count || 0) + 1 };
              }
              if (c.replies && c.replies.length) {
                const res = appendReply(c.replies, parentId, incomingComment);
                if (res.found) {
                  found = true;
                  return { ...c, replies: res.list };
                }
              }
              return c;
            });
            return { list: out, found };
          };

          if (incoming.parent_id) {
            const res = appendReplyRec(filtered, incoming.parent_id, incoming);
            if (res.found) {
              // reveal parent replies
              setHiddenReplies((s) => {
                const ns = new Set(s);
                ns.delete(incoming.parent_id!);
                return ns;
              });
              return res.list;
            }
            // parent not found, fallback to top-level
            return [incoming, ...filtered];
          }

          return [incoming, ...filtered];
        });
        return;
      }

      if (e.action === "updated") updateCommentLocal(incoming);
      if (e.action === "deleted") removeCommentLocal(incoming.id, incoming.parent_id);
    });

    return () => {
      echo.leaveChannel(`course.${courseId}`);
    };
  }, [courseId]);

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      // optimistic stub
      const tempId = tempIdRef.current--;
      const stub: Comment = {
        id: tempId,
        content: newComment,
        created_at: new Date().toISOString(),
        upvotes_count: 0,
        downvotes_count: 0,
        user_vote: null,
        user: (currentUser as User) || { id: 0, name: 'You', role: 'learner' },
        parent_id: undefined,
        reply_to_user: undefined,
        replies: [],
        replies_count: 0,
        is_nested_reply: false,
      } as Comment;
      insertCommentLocal(stub);
      setNewComment("");

      const res = await addCourseComment(courseId, newComment);
      const created: Comment = res.data.comment ?? res.data;

      // Replace the specific stub and remove any other temporary stubs recursively
      setLocalComments((prev) => {
        // remove stubs by tempId OR content+user anywhere
        const filtered = removeMatching(prev, (c) => c.id < 0 && (c.id === tempId || (c.content === created.content && c.user?.id === created.user?.id)));

        // ensure created isn't already present anywhere
        if (existsInList(filtered, created.id)) return filtered;

        return [created, ...filtered];
      });
      toast.success("Comment posted!");
    } catch (err: any) {
      console.error("Error adding comment:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to post comment";

      // Show special message for banned users
      if (errorMessage.includes("banned")) {
        toast.info(
          "You are banned from commenting in this course. Please contact the instructor if you believe this is an error."
        );
      } else {
        toast.error(errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  const handleReply = async (parentId: number, replyToUserId: number) => {
    if (!replyContent.trim()) return;

    try {
      // optimistic stub for reply
      const tempId = tempIdRef.current--;
      const stub: Comment = {
        id: tempId,
        content: replyContent,
        created_at: new Date().toISOString(),
        upvotes_count: 0,
        downvotes_count: 0,
        user_vote: null,
        user: (currentUser as User) || { id: 0, name: 'You', role: 'learner' },
        parent_id: parentId,
        reply_to_user: replyingTo ? { id: replyingTo.userId, name: replyingTo.userName, role: 'learner' } : undefined,
        replies: [],
        replies_count: 0,
        is_nested_reply: true,
      } as Comment;
      insertCommentLocal(stub);
      setReplyContent("");
      setReplyingTo(null);

      const res = await addCourseComment(courseId, replyContent, parentId, replyToUserId);
      const created: Comment = res.data.comment ?? res.data;

      setLocalComments((prev) => {
        // remove the stub and any other matching stubs recursively
        const withoutStubs = removeMatching(prev, (c) => c.id < 0 && (c.id === tempId || (c.content === created.content && c.user?.id === created.user?.id)));

        // If parent exists in list (nested), attach created to its replies
        if (created.parent_id) {
          const res = appendReplyRec(withoutStubs, created.parent_id, created);
          if (res.found) {
            // reveal replies
            setHiddenReplies((s) => {
              const ns = new Set(s);
              ns.delete(created.parent_id!);
              return ns;
            });
            return res.list;
          }
        }

        // ensure created isn't present anywhere
        if (existsInList(withoutStubs, created.id)) return withoutStubs;

        // Fallback: insert created at top-level
        return [created, ...withoutStubs];
      });
      toast.success("Reply posted!");
    } catch (err: any) {
      console.error("Error adding reply:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to post reply";

      // Show special message for banned users
      if (errorMessage.includes("banned")) {
        toast.info(
          "You are banned from commenting in this course. Please contact the instructor if you believe this is an error."
        );
      } else {
        toast.error(errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  // helper: find and update comment anywhere (top-level or nested)
const updateCommentById = (list: Comment[], id: number, updater: (c: Comment) => Comment) : Comment[] => {
  return list.map(c => {
    if (c.id === id) return updater(c);
    if (c.replies && c.replies.length) {
      return { ...c, replies: updateCommentById(c.replies, id, updater) };
    }
    return c;
  });
};

const handleVote = async (commentId: number, voteType: "upvote" | "downvote") => {
  if (votingCommentId) return;
  setVotingCommentId(commentId);

  // snapshot to allow revert
  const snapshot = JSON.parse(JSON.stringify(localComments)) as Comment[];

  // find current comment
  const findComment = (list: Comment[], id: number): Comment | null => {
    for (const c of list) {
      if (c.id === id) return c;
      if (c.replies?.length) {
        const r = findComment(c.replies, id);
        if (r) return r;
      }
    }
    return null;
  };
  const current = findComment(localComments, commentId);
  if (!current) {
    setVotingCommentId(null);
    return;
  }

  const prevVote = current.user_vote; // 'upvote' | 'downvote' | null
  const newVote = prevVote === voteType ? null : voteType;

  // compute counts delta
  const upDelta = (prevVote === "upvote" ? -1 : 0) + (newVote === "upvote" ? 1 : 0);
  const downDelta = (prevVote === "downvote" ? -1 : 0) + (newVote === "downvote" ? 1 : 0);

  // optimistic update
  setLocalComments(prev =>
    updateCommentById(prev, commentId, (c) => ({
      ...c,
      user_vote: newVote,
      upvotes_count: Math.max((c.upvotes_count || 0) + upDelta, 0),
      downvotes_count: Math.max((c.downvotes_count || 0) + downDelta, 0),
    }))
  );

  try {
    // call API; prefer to use response counts if returned
    const res = await voteComment(courseId, commentId, voteType);
    if (res?.data) {
      const serverComment: Partial<Comment> = res.data;
      // merge server data if available
      setLocalComments(prev =>
        updateCommentById(prev, commentId, (c) => ({ ...c, ...serverComment } as Comment))
      );
    }
  } catch (err: any) {
    // revert on error
    setLocalComments(snapshot);
    toast.error(err.response?.data?.message || "Failed to vote");
  } finally {
    setVotingCommentId(null);
  }
};

  const countTotalReplies = (comment: Comment): number => {
    if (!comment.replies || comment.replies.length === 0) return 0;

    let total = comment.replies.length;
    comment.replies.forEach((reply) => {
      total += countTotalReplies(reply);
    });
    return total;
  };

  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim()) return;

    try {
      // await updateComment(courseId, commentId, editContent);
      // onCommentAction();
      const res = await updateComment(courseId, commentId, editContent);
      const updated: Comment = res.data.comment ?? res.data;
      updateCommentLocal(updated);
      setEditingComment(null);
      setEditContent("");
      toast.success("Comment updated!");
      toast.success("Comment updated!");
    } catch (err: any) {
      console.error("Error updating comment:", err);
      toast.error(err.response?.data?.message || "Failed to update comment");
      toast.error(err.response?.data?.message || "Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const confirmed = await confirmWithToast('Are you sure you want to delete this comment?');
    if (!confirmed) return;

    try {
      await deleteComment(courseId, commentId);
      const comment = localComments.find((c) => c.id === commentId) || allComments.find((c) => c.id === commentId);
      const parentId = comment?. parent_id;
      removeCommentLocal(commentId, parentId);
      // setLocalComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success("Comment deleted!");
    } catch (err: any) {
      console.error("Error deleting comment:", err);
      toast.error(err.response?.data?.message || "Failed to delete comment");
      toast.error(err.response?.data?.message || "Failed to delete comment");
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
    const idMap = new Map<number, Comment>();

    const processComment = (
      comment: Comment,
      depth: number = 0,
      parent?: Comment
    ) => {
      // Compute a display name for replies: prefer explicit reply_to_user, otherwise fall back to parent user
      const displayName =
        comment.reply_to_user?.name || parent?.user?.name || null;
      (comment as any)._replyToDisplayName = displayName;
      // record depth so frontend can determine nested replies
      (comment as any)._depth = depth;

      flattened.push(comment);
      idMap.set(comment.id, comment);

      // Only include replies if this comment's replies are not hidden
      if (
        comment.replies &&
        comment.replies.length > 0 &&
        !hiddenReplies.has(comment.id)
      ) {
        // Process each reply recursively, passing current comment as parent
        comment.replies.forEach((reply) =>
          processComment(reply, depth + 1, comment)
        );
      }
    };

    comments.forEach((comment) => processComment(comment, 0));
    return flattened;
  };

  const allComments = useMemo(
    () => flattenComments(localComments, hiddenReplies),
    [localComments, hiddenReplies]
  );

  useEffect(() => {
    // debug: detect duplicate ids in flattened comments
    const seen = new Map<number, number>();
    allComments.forEach((c) => seen.set(c.id, (seen.get(c.id) || 0) + 1));
    const duplicates = Array.from(seen.entries()).filter(([, count]) => count > 1);
    if (duplicates.length) {
      console.warn('Duplicate comment IDs in flattened list:', duplicates);
    }
  }, [allComments]);

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
                {formatRelativeTime(comment.created_at)}
              </span>
            </div>

            {/* Dropdown menu */}
            {currentUserId === comment.user?.id && (
              <div className="relative dropdown-menu">
                <button
                  type="button"
                  onClick={() =>
                    setDropdownOpen(
                      dropdownOpen === comment.id ? null : comment.id
                    )
                  }
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <MdMoreHoriz className="w-5 h-5 text-gray-500" />
                </button>

                {dropdownOpen === comment.id && comment.id >= 0 && (
                  <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <button
                      type="button"
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
                      type="button"
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
                  type="button"
                  onClick={() => comment.id >= 0 && handleEditComment(comment.id)}
                  disabled={comment.id < 0}
                  className={`px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center gap-1 ${comment.id < 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <BsSend className="h-3 w-3" />
                  Save
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700">
              {(() => {
                const depth = (comment as any)._depth ?? 0;
                const displayName =
                  comment.reply_to_user?.name ||
                  (comment as any)._replyToDisplayName;
                // show @username only for nested replies (depth >= 2)
                return depth >= 2 && displayName ? (
                  <span className="text-blue-600 font-medium mr-1">
                    @{displayName}
                  </span>
                ) : null;
              })()}
              {comment.content}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-4 mt-2">
            {/* Vote buttons - horizontal */}
            <div className="flex items-center gap-1">
              <button
                type="button"
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
                {(comment.upvotes_count || 0) - (comment.downvotes_count || 0)}
              </span>
              <button
                type="button"
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
              type="button"
                onClick={() => {
                  if (comment.id < 0) return; // disable replying to optimistic stub
                  if (!comment.user) return;
                  setReplyingTo({
                    commentId: comment.id,
                    userId: comment.user.id || 0,
                    userName: comment.user.name || "User",
                  });
                }}
              className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1"
            >
              <FaReply className="w-3 h-3" />
              Reply
            </button>

            {/* Toggle replies button - only show for main comments with replies */}
            {!comment.parent_id && comment.replies_count > 0 && (
              <button
                type="button"
                onClick={() => toggleReplies(comment.id)}
                className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1"
              >
                {hiddenReplies.has(comment.id) ? (
                  <>
                    <span className="text-xs">
                      <FaAngleDown />
                    </span>
                    Load {countTotalReplies(comment)}{" "}
                    {countTotalReplies(comment) === 1 ? "reply" : "replies"}
                  </>
                ) : (
                  <>
                    <span className="text-xs">
                      <FaAngleUp />
                    </span>
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
                placeholder={`Reply to ${replyingTo?.userName ?? ""}...`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black text-sm"
                rows={2}
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleReply(comment.id, replyingTo.userId)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center gap-1"
                >
                  <BsSend className="h-3 w-3" />
                  Reply
                </button>
                <button
                  type="button"
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
    <div className="max-w-4xl mx-auto">
      {/* Add Comment Form - Moved to Top */}
      <div className="mb-8 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex gap-3">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            {currentUser?.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt="Your avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  currentUser?.role === "admin"
                    ? "bg-purple-500"
                    : currentUser?.role === "instructor"
                    ? "bg-green-500"
                    : "bg-blue-500"
                }`}
              >
                {currentUser?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>

          {/* Comment Input */}
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-0 py-2 border-0 border-b-2 border-gray-200 rounded-none text-black placeholder-gray-500 focus:border-blue-500 focus:ring-0 resize-none transition-colors focus:outline-none"
              rows={1}
              onFocus={(e) => {
                e.target.rows = 3;
              }}
              onBlur={(e) => {
                if (!newComment.trim()) {
                  e.target.rows = 1;
                }
              }}
            />
            {newComment.trim() && (
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setNewComment("")}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Comment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="space-y-6">
        {localComments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4 justify-center flex">
              <FaRegCommentDots />
            </div>
            <p className="text-gray-500 text-lg">No comments yet</p>
            <p className="text-gray-400 text-sm">
              Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {localComments.length}{" "}
                {localComments.length === 1 ? "Comment" : "Comments"}
              </h3>
            </div>
            {allComments.map((comment) => (
              <div key={`c-${comment.id}`}>{renderComment(comment, !!comment.parent_id)}</div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default CourseComments;
