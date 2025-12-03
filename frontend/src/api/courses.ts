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
// Find the existing addCourseMaterial function and replace it with:
export const addCourseMaterial = (courseId: string, data: FormData | any) => {
  const config =
    data instanceof FormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};

  return api.post(`/courses/${courseId}/materials`, data, config);
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
  parentCommentId?: number
) => {
  return api.post(`/courses/${courseId}/comments`, { 
    content,
    parent_comment_id: parentCommentId 
  });
};

export const updateCourseComment = async (
  courseId: string | number,
  commentId: string | number,
  content: string
) => {
  return api.put(`/courses/${courseId}/comments/${commentId}`, { content });
};

export const deleteCourseComment = async (
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

export const deleteCourseAnnouncement = async (
  courseId: string | number,
  announcementId: string | number
) => {
  return api.delete(`/courses/${courseId}/announcements/${announcementId}`);
};

// User moderation
export const banUserFromComments = async (
  courseId: string | number,
  userId: string | number
) => {
  return api.post(`/courses/${courseId}/ban-user/${userId}`);
};

export const unbanUserFromComments = async (
  courseId: string | number,
  userId: string | number
) => {
  return api.post(`/courses/${courseId}/unban-user/${userId}`);
};
