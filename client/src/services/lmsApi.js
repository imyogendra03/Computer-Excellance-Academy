import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getToken = (role = "user") => {
  if (role === "admin") {
    return localStorage.getItem("adminToken") || localStorage.getItem("token");
  }

  return localStorage.getItem("token") || localStorage.getItem("userToken");
};

const authConfig = (role = "user") => ({
  headers: {
    Authorization: `Bearer ${getToken(role)}`,
  },
});

const isFormData = (value) =>
  typeof FormData !== "undefined" && value instanceof FormData;

const withAdminFallback = async (primaryRequest, fallbackRequest) => {
  try {
    return await primaryRequest();
  } catch (error) {
    if (error?.response?.status === 404 && typeof fallbackRequest === "function") {
      return fallbackRequest();
    }
    throw error;
  }
};

export const getUserId = () => {
  const stored = localStorage.getItem("userData");
  const parsed = stored ? JSON.parse(stored) : null;
  if (localStorage.getItem("userId")) return localStorage.getItem("userId");
  if (parsed?.id || parsed?._id) return parsed?.id || parsed?._id;

  const token = localStorage.getItem("token") || localStorage.getItem("userToken");
  if (!token) return "";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id || "";
  } catch {
    return "";
  }
};

export const lmsApi = {
  getBatches: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/batch`);
    return response.data?.data || [];
  },

  getBatchPreview: async (batchId) => {
    const response = await axios.get(`${API_BASE_URL}/api/batch/preview/${batchId}`);
    return response.data?.data || null;
  },

  getMyBatches: async (userId) => {
    const response = await axios.get(
      `${API_BASE_URL}/api/examinee/${userId}/my-batches`,
      authConfig("user")
    );
    return response.data?.data || [];
  },

  getBatchContent: async (batchId, role = "user") => {
    const response = await axios.get(
      `${API_BASE_URL}/api/content/batch/${batchId}`,
      authConfig(role)
    );
    return response.data?.data;
  },

  getRecentlyViewed: async () => {
    const response = await axios.get(
      `${API_BASE_URL}/api/user/recently-viewed`,
      authConfig("user")
    );
    return response.data?.data || [];
  },

  updateProgress: async (payload) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/progress/update`,
      payload,
      authConfig("user")
    );
    return response.data?.data;
  },

  getAdminBatchMeta: async (batchId) => {
    const response = await axios.get(
      `${API_BASE_URL}/api/admin/content/meta/${batchId}`,
      authConfig("admin")
    );
    return response.data?.data;
  },

  createContent: async (payload) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/admin/content`,
      payload,
      {
        ...authConfig("admin"),
        ...(isFormData(payload) ? {} : { headers: { ...authConfig("admin").headers } }),
      }
    );
    return response.data?.data;
  },

  deleteContent: async (contentId) => {
    const response = await axios.delete(
      `${API_BASE_URL}/api/admin/content/${contentId}`,
      authConfig("admin")
    );
    return response.data;
  },

  updateContent: async (contentId, payload) => {
    const response = await axios.put(
      `${API_BASE_URL}/api/admin/content/${contentId}`,
      payload,
      {
        ...authConfig("admin"),
        ...(isFormData(payload) ? {} : { headers: { ...authConfig("admin").headers } }),
      }
    );
    return response.data;
  },

  getMyPaymentHistory: async () => {
    const uid = getUserId();
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/payment/my`,
        authConfig("user")
      );
      return response.data?.data || [];
    } catch (error) {
      // Backward compatibility for older backends where /my may be unavailable.
      if (error?.response?.status === 404 && uid) {
        const fallback = await axios.get(
          `${API_BASE_URL}/api/payment/user/${uid}`,
          authConfig("user")
        );
        return fallback.data?.data || [];
      }
      throw error;
    }
  },

  recordBatchExplore: async (batchId) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/payment/explore`,
      { batchId },
      authConfig("user")
    );
    return response.data?.data || null;
  },

  markPaymentFailed: async (payload) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/payment/fail`,
      payload,
      authConfig("user")
    );
    return response.data?.data || null;
  },

  createSubject: async (payload) => {
    const response = await withAdminFallback(
      () =>
        axios.post(
          `${API_BASE_URL}/api/admin/subject`,
          payload,
          authConfig("admin")
        ),
      () =>
        axios.post(
          `${API_BASE_URL}/api/subject`,
          payload,
          authConfig("admin")
        )
    );
    return response.data?.data;
  },

  deleteSubject: async (subjectId) => {
    const response = await withAdminFallback(
      () =>
        axios.delete(
          `${API_BASE_URL}/api/admin/subject/${subjectId}`,
          authConfig("admin")
        ),
      () =>
        axios.delete(
          `${API_BASE_URL}/api/subject/${subjectId}`,
          authConfig("admin")
        )
    );
    return response.data;
  },

  updateSubject: async (subjectId, payload) => {
    const response = await withAdminFallback(
      () =>
        axios.put(
          `${API_BASE_URL}/api/admin/subject/${subjectId}`,
          payload,
          authConfig("admin")
        ),
      () =>
        axios.put(
          `${API_BASE_URL}/api/subject/${subjectId}`,
          payload,
          authConfig("admin")
        )
    );
    return response.data?.data;
  },

  // Chapter management
  createChapter: async (payload) => {
    const response = await withAdminFallback(
      () =>
        axios.post(
          `${API_BASE_URL}/api/admin/chapter`,
          payload,
          authConfig("admin")
        ),
      () =>
        axios.post(
          `${API_BASE_URL}/api/chapter`,
          payload,
          authConfig("admin")
        )
    );
    return response.data?.data;
  },

  updateChapter: async (chapterId, payload) => {
    const response = await withAdminFallback(
      () =>
        axios.put(
          `${API_BASE_URL}/api/admin/chapter/${chapterId}`,
          payload,
          authConfig("admin")
        ),
      () =>
        axios.put(
          `${API_BASE_URL}/api/chapter/${chapterId}`,
          payload,
          authConfig("admin")
        )
    );
    return response.data?.data;
  },

  deleteChapter: async (chapterId) => {
    const response = await withAdminFallback(
      () =>
        axios.delete(
          `${API_BASE_URL}/api/admin/chapter/${chapterId}`,
          authConfig("admin")
        ),
      () =>
        axios.delete(
          `${API_BASE_URL}/api/chapter/${chapterId}`,
          authConfig("admin")
        )
    );
    return response.data;
  },
};
