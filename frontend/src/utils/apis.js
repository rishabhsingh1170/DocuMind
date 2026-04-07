
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const APIS = {
  // Authentication routes (/auth)
  AUTH: {
    // POST /auth/send-otp
    SEND_OTP: "/auth/send-otp",

    // POST /auth/verify-otp-and-signup
    VERIFY_OTP_AND_SIGNUP: "/auth/verify-otp-and-signup",

    // POST /auth/signup
    // Legacy/alternate signup route present in backend.
    SIGNUP: "/auth/signup",

    // POST /auth/login
    LOGIN: "/auth/login",
    
  },

  // User routes (/users)
  USERS: {
    // GET /users/
    LIST: "/users/",

    // POST /users/{user_id}/profile-image
    UPLOAD_PROFILE_IMAGE: (userId) => `/users/${userId}/profile-image`,
  },

  // Document routes (/documents)
  DOCUMENTS: {
    // GET /documents/
    LIST: "/documents/",
  },

  // Company routes (/companies)
  // NOTE: currently no active endpoints in backend/routes/company.py.
  COMPANIES: {
    // Keep prefix for future company endpoints.
    PREFIX: "/companies",
  },

  // Chat routes (/chats)
  CHATS: {
    // POST /chats/create
    // Admin only. multipart/form-data with company_name, document_name, file.
    CREATE: "/chats/create",

    // GET /chats/
    // Auth required. Admin sees own chat, employee sees approved chats.
    LIST: "/chats/",

    // GET /chats/admin/me
    // Admin only.
    ADMIN_ME: "/chats/admin/me",

    // GET /chats/admin/access-code
    // Admin only. Returns 6-character access code for sharing.
    ADMIN_ACCESS_CODE: "/chats/admin/access-code",

    // POST /chats/access/verify-code
    // Employee only. Body: { access_code }
    VERIFY_ACCESS_CODE: "/chats/access/verify-code",

    // POST /chats/access/request
    // Employee only. Body: { chat_id, verification_token }
    REQUEST_ACCESS: "/chats/access/request",

    // GET /chats/access/requests?status=pending
    // Admin only.
    LIST_ACCESS_REQUESTS: "/chats/access/requests",

    // POST /chats/access/requests/{request_id}/decision
    // Admin only. Body: { action: "approve" | "deny" }
    REVIEW_ACCESS_REQUEST: (requestId) =>
      `/chats/access/requests/${requestId}/decision`,

    // GET /chats/{chat_id}
    // Auth required and permission-gated on backend.
    BY_ID: (chatId) => `/chats/${chatId}`,
  },
};

export default APIS;
