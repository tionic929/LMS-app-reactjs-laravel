import api from "./axios";

// Course API functions
export const getCourses = async (privacy?: string) => {
  const params = privacy ? { privacy } : {};
  return api.get("/courses", { params });
};

export const getCourse = async (id: string | number) => {
  return api.get(`/courses/${id}`);
};

export const createCourse = async (data: {
  title: string;
  content?: string;
  privacy: "public" | "private";
  capacity: number;
}) => {
  return api.post("/courses", data);
};

export const updateCourse = async (
  id: string | number,
  data: {
    title?: string;
    content?: string;
    privacy?: "public" | "private";
    capacity?: number;
  }
) => {
  return api.put(`/courses/${id}`, data);
};

export const deleteCourse = async (id: string | number) => {
  return api.delete(`/courses/${id}`);
};

// Enrollment
export const enrollInCourse = async (courseId: string | number) => {
  return api.post(`/courses/${courseId}/enroll`);
};

export const leaveCourse = async (courseId: string | number) => {
  return api.post(`/courses/${courseId}/leave`);
};

// Learner management
export const getCourseLearners = async (courseId: string | number) => {
  return api.get(`/courses/${courseId}/learners`);
};

export const removeLearner = async (
  courseId: string | number,
  userId: string | number
) => {
  return api.delete(`/courses/${courseId}/learners/${userId}`);
};

// Join request management
export const getCourseJoinRequests = async (courseId: string | number) => {
  return api.get(`/courses/${courseId}/join-requests`);
};

export const acceptJoinRequest = async (
  courseId: string | number,
  requestId: string | number
) => {
  return api.post(`/courses/${courseId}/join-requests/${requestId}/accept`);
};

export const rejectJoinRequest = async (
  courseId: string | number,
  requestId: string | number
) => {
  return api.post(`/courses/${courseId}/join-requests/${requestId}/reject`);
};

// Material management
export const addCourseMaterial = async (
  courseId: string | number,
  data: {
    title: string;
    type: "file" | "video" | "link";
    file_type?: string;
    url: string;
    description?: string;
  }
) => {
  return api.post(`/courses/${courseId}/materials`, data);
};

export const deleteCourseMaterial = async (
  courseId: string | number,
  materialId: string | number
) => {
  return api.delete(`/courses/${courseId}/materials/${materialId}`);
};

// Comment management
export const addCourseComment = async (
  courseId: string | number,
  content: string,
  parentId?: number,
  replyToUserId?: number
) => {
  return api.post(`/courses/${courseId}/comments`, {
    content,
    parent_id: parentId,
    reply_to_user_id: replyToUserId,
  });
};

export const voteComment = async (
  courseId: string | number,
  commentId: string | number,
  voteType: "upvote" | "downvote"
) => {
  return api.post(`/courses/${courseId}/comments/${commentId}/vote`, {
    vote_type: voteType,
  });
};

export const updateComment = async (
  courseId: string | number,
  commentId: string | number,
  content: string
) => {
  return api.put(`/courses/${courseId}/comments/${commentId}`, {
    content,
  });
};

export const deleteComment = async (
  courseId: string | number,
  commentId: string | number
) => {
  return api.delete(`/courses/${courseId}/comments/${commentId}`);
};

// Announcement management
export const addCourseAnnouncement = async (
  courseId: string | number,
  data: {
    title: string;
    content: string;
  }
) => {
  return api.post(`/courses/${courseId}/announcements`, data);
};

export const updateCourseAnnouncement = async (
  courseId: string | number,
  announcementId: string | number,
  data: {
    title: string;
    content: string;
  }
) => {
  return api.put(`/courses/${courseId}/announcements/${announcementId}`, data);
};

export const deleteCourseAnnouncement = async (
  courseId: string | number,
  announcementId: string | number
) => {
  return api.delete(`/courses/${courseId}/announcements/${announcementId}`);
};

// Course comment banning
export const banLearnerFromComments = async (
  courseId: string | number,
  userId: number,
  reason?: string
) => {
  return api.post(`/courses/${courseId}/bans/${userId}`, { reason });
};

export const unbanLearnerFromComments = async (
  courseId: string | number,
  userId: number
) => {
  return api.delete(`/courses/${courseId}/bans/${userId}`);
};

export const getCourseBannedLearners = async (courseId: string | number) => {
  return api.get(`/courses/${courseId}/bans`);
};
