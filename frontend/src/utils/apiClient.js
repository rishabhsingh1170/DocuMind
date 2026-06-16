/**
 * API Client Utility
 * Handles all HTTP requests with automatic authentication and error handling
 */

import { API_BASE_URL, APIS } from "./apis";

/**
 * Get the stored JWT token from localStorage
 */
export const getToken = () => {
  try {
    const authData = localStorage.getItem("auth");
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.access_token;
    }
  } catch (error) {
    console.error("Error retrieving token:", error);
  }
  return null;
};

/**
 * Store auth data in localStorage
 */
export const setAuthData = (authResponse) => {
  try {
    localStorage.setItem("auth", JSON.stringify(authResponse));
  } catch (error) {
    console.error("Error storing auth data:", error);
  }
};

/**
 * Clear auth data from localStorage
 */
export const clearAuthData = () => {
  try {
    localStorage.removeItem("auth");
  } catch (error) {
    console.error("Error clearing auth data:", error);
  }
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
  try {
    const authData = localStorage.getItem("auth");
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.user;
    }
  } catch (error) {
    console.error("Error retrieving user:", error);
  }
  return null;
};

/**
 * Generic fetch wrapper with automatic auth header
 */
const fetchWithAuth = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add authorization header if token exists
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle HTTP errors
    if (!response.ok) {
      const error = new Error(
        data.detail || data.message || `HTTP ${response.status}`,
      );
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

/**
 * Dedicated fetch for multipart/form-data (file uploads)
 */
const fetchMultipartWithAuth = async (endpoint, formData, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { ...options.headers };

  // Add authorization header if token exists
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      method: options.method || "POST",
      headers,
      body: formData,
    });

    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = new Error(
        data.detail || data.message || `HTTP ${response.status}`,
      );
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// ==================== Auth API Endpoints ====================

export const authAPI = {
  /**
   * Send OTP to email for signup verification
   */
  sendOTP: (email) =>
    fetchWithAuth(APIS.AUTH.SEND_OTP, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  /**
   * Verify OTP and complete signup
   */
  verifyOTPAndSignup: (email, otp, name, password, role, profileUrl) => {
    const payload = {
      email: String(email || "").trim(),
      otp: String(otp || "").trim(),
      name: String(name || "").trim(),
      password,
      role,
    };

    // Send optional fields only when present as non-empty strings.
    if (typeof profileUrl === "string" && profileUrl.trim()) {
      payload.profile_url = profileUrl.trim();
    }

    return fetchWithAuth(APIS.AUTH.VERIFY_OTP_AND_SIGNUP, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Login with email and password
   */
  login: (email, password) =>
    fetchWithAuth(APIS.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  /**
   * Send OTP for forgot-password flow
   */
  sendForgotPasswordOTP: (email) =>
    fetchWithAuth(APIS.AUTH.FORGOT_PASSWORD_SEND_OTP, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  /**
   * Verify OTP and reset password
   */
  resetPasswordWithOTP: (email, otp, newPassword) =>
    fetchWithAuth(APIS.AUTH.FORGOT_PASSWORD_RESET, {
      method: "POST",
      body: JSON.stringify({
        email: String(email || "").trim(),
        otp: String(otp || "").trim(),
        new_password: newPassword,
      }),
    }),
};

// ==================== User API Endpoints ====================

export const userAPI = {
  /**
   * Get all users
   */
  listUsers: () => fetchWithAuth(APIS.USERS.LIST),

  /**
   * Upload user profile image
   */
  uploadProfileImage: (userId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetchMultipartWithAuth(
      APIS.USERS.UPLOAD_PROFILE_IMAGE(userId),
      formData,
      {
        method: "POST",
      },
    );
  },

  /**
   * Delete the currently authenticated account
   */
  deleteMyAccount: () =>
    fetchWithAuth(APIS.USERS.DELETE_ME, {
      method: "DELETE",
    }),
};

// ==================== Document API Endpoints ====================

export const documentAPI = {
  /**
   * Get all documents
   */
  listDocuments: () => fetchWithAuth(APIS.DOCUMENTS.LIST),
};

// ==================== Chat API Endpoints ====================

export const chatAPI = {
  /**
   * Create a new chat (admin only)
   */
  createChat: (companyName, documentName, file) => {
    const formData = new FormData();
    formData.append("company_name", companyName);
    formData.append("document_name", documentName);
    formData.append("file", file);
    return fetchMultipartWithAuth(APIS.CHATS.CREATE, formData, {
      method: "POST",
    });
  },

  /**
   * List chats accessible to current user
   */
  listChats: () => fetchWithAuth(APIS.CHATS.LIST),

  /**
   * Get admin's own chat
   */
  getAdminChat: () => fetchWithAuth(APIS.CHATS.ADMIN_ME),

  /**
   * Get chat access code
   */
  getAccessCode: () => fetchWithAuth(APIS.CHATS.ADMIN_ACCESS_CODE),

  /**
   * Verify access code
   */
  verifyAccessCode: (accessCode) =>
    fetchWithAuth(APIS.CHATS.VERIFY_ACCESS_CODE, {
      method: "POST",
      body: JSON.stringify({ access_code: accessCode }),
    }),

  /**
   * Request chat access
   */
  requestAccess: (chatId, verificationToken) =>
    fetchWithAuth(APIS.CHATS.REQUEST_ACCESS, {
      method: "POST",
      body: JSON.stringify({
        chat_id: chatId,
        verification_token: verificationToken,
      }),
    }),

  /**
   * List access requests (admin only)
   */
  listAccessRequests: (status = "pending") =>
    fetchWithAuth(`${APIS.CHATS.LIST_ACCESS_REQUESTS}?status=${status}`),

  /**
   * Review access request (admin only)
   */
  reviewAccessRequest: (requestId, action) =>
    fetchWithAuth(APIS.CHATS.REVIEW_ACCESS_REQUEST(requestId), {
      method: "POST",
      body: JSON.stringify({ action }),
    }),

  /**
   * Revoke employee access to a chat (admin only)
   */
  revokeAccess: (chatId, employeeId) =>
    fetchWithAuth(APIS.CHATS.REVOKE_ACCESS(chatId, employeeId), {
      method: "DELETE",
    }),

  /**
   * Get chat by ID
   */
  getChat: (chatId) => fetchWithAuth(APIS.CHATS.BY_ID(chatId)),

  /**
   * Ask a question to the chat
   */
  ask: (chatId, question, topK = 4) =>
    fetchWithAuth(APIS.CHATS.ASK(chatId), {
      method: "POST",
      body: JSON.stringify({
        question,
        top_k: topK,
      }),
    }),

  /**
   * Delete a chat
   */
  deleteChat: (chatId) =>
    fetchWithAuth(APIS.CHATS.DELETE(chatId), {
      method: "DELETE",
    }),
};

export default {
  getToken,
  setAuthData,
  clearAuthData,
  getCurrentUser,
  authAPI,
  userAPI,
  documentAPI,
  chatAPI,
};
