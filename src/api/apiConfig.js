/**
 * API Configuration File
 * Central location for all API endpoints
 */
// FORCE USE ONLINE SERVER - Remove localhost fallback
const ONLINE_API_BASE_URL = "https://pm-backend-f3b6.onrender.com/api";

// Public site URL — used for shareable portfolio links.
// Resolves to the current origin automatically (works on localhost AND production frontend).
export const SITE_URL =
  process.env.REACT_APP_SITE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");

// Override to always use online server
const API_BASE_URL = ONLINE_API_BASE_URL;

console.log("[API] Using API_BASE_URL:", API_BASE_URL);

// Optional: Check if server is reachable (for debugging)
if (typeof window !== "undefined") {
  fetch(`${API_BASE_URL}/health`)
    .then(res => res.json())
    .then(data => console.log("[API] Backend health check:", data))
    .catch(err => console.warn("[API] Backend not reachable:", err.message));
}

const API_ENDPOINTS = {
  // ==================== AUTH ====================
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    GET_USERS: `${API_BASE_URL}/auth/users`,
    GET_USER: (id) => `${API_BASE_URL}/auth/users/${id}`,
    UPDATE_USER: (id) => `${API_BASE_URL}/auth/users/${id}`,
    DELETE_USER: (id) => `${API_BASE_URL}/auth/users/${id}`,
    CHANGE_PASSWORD: (id) => `${API_BASE_URL}/auth/users/${id}/change-password`,
    UPDATE_PHONE: (id) => `${API_BASE_URL}/auth/photographers/${id}/phone`,
  },

  USERS: {
    FAVORITES: {
      GET: (userId) => `${API_BASE_URL}/users/favorites/${userId}`,
      DELETE: (userId, mediaId) => `${API_BASE_URL}/users/favorites/${userId}/${mediaId}`,
      ADD: `${API_BASE_URL}/users/favorites/add`,
    },
  },

  // ==================== MEDIA ====================
  MEDIA: {
    GET_ALL: `${API_BASE_URL}/media`,
    GET_MY: `${API_BASE_URL}/media/mine`,
    GET_ONE: (id) => `${API_BASE_URL}/media/${id}`,
    GET_PROTECTED: (id) => `${API_BASE_URL}/media/${id}/protected`,
    CREATE: `${API_BASE_URL}/media`,
    UPDATE: (id) => `${API_BASE_URL}/media/${id}`,
    UPDATE_PRICE: (id) => `${API_BASE_URL}/media/${id}/price`,
    DELETE: (id) => `${API_BASE_URL}/media/${id}`,
    ALBUM_ACCESS_CREATE: (albumId) => `${API_BASE_URL}/media/album/${albumId}/access`,
    ALBUM_ACCESS_VIEW: (albumId, token) => `${API_BASE_URL}/media/album/${albumId}/access/${token}`,
    ALBUM_ACCESS_HISTORY: (albumId) => `${API_BASE_URL}/media/album/${albumId}/access`,
    CREATE_ALBUM: `${API_BASE_URL}/media/album`,
    GET_ALBUMS: `${API_BASE_URL}/media/albums`,
    GET_PUBLIC_ALBUMS: `${API_BASE_URL}/media/albums/public`,
    GET_ALBUM: (albumId) => `${API_BASE_URL}/media/album/${albumId}`,
    GET_PUBLIC_GALLERY: (albumId) => `${API_BASE_URL}/media/album/${albumId}/public`,
    GET_PUBLIC_ALBUM: (albumId) => `${API_BASE_URL}/media/album/${albumId}/public`,
    ADD_PHOTOS_TO_ALBUM: (albumId) => `${API_BASE_URL}/media/album/${albumId}/add`,
    REMOVE_PHOTO_FROM_ALBUM: (albumId, mediaId) => `${API_BASE_URL}/media/album/${albumId}/remove/${mediaId}`,
    GET_ALBUM_PHOTOS: (albumId) => `${API_BASE_URL}/media/album/${albumId}/media`,
    UPDATE_PAYOUT_PHONE: (userId) => `${API_BASE_URL}/auth/photographers/${userId}/phone`,
    FACE_SEARCH: `${API_BASE_URL}/media/face-search`,
    UPDATE_ALBUM: (albumId) => `${API_BASE_URL}/media/album/${albumId}`,
    DELETE_ALBUM: (albumId) => `${API_BASE_URL}/media/album/${albumId}`,
    BULK_UPLOAD: `${API_BASE_URL}/media/album/bulk-upload`,
    BULK_UPLOAD_FALLBACK: `${API_BASE_URL}/media/bulk-upload`,
    TRENDING: `${API_BASE_URL}/media/trending`,
    FILTER: `${API_BASE_URL}/media/filter`,
    FILTER_CATEGORY: (cat) => `${API_BASE_URL}/media/filter/${cat}`,
    GET_SIMILAR: (id) => `${API_BASE_URL}/media/${id}/similar`,
  },

  // ==================== PAYMENTS ====================
  PAYMENTS: {
    MPESA: `${API_BASE_URL}/payments/mpesa`,
    CALLBACK: `${API_BASE_URL}/payments/callback`,
    BUY: `${API_BASE_URL}/payments/buy`,
    PURCHASE_HISTORY: (userId) => `${API_BASE_URL}/payments/purchase-history/${userId}`,
    EARNINGS: (photographerId) => `${API_BASE_URL}/payments/earnings/${photographerId}`,
    EARNINGS_SUMMARY: (photographerId) => `${API_BASE_URL}/payments/earnings-summary/${photographerId}`,
    TRANSACTIONS: (userId) => `${API_BASE_URL}/payments/transactions/${userId}`,
    ADMIN_DASHBOARD: `${API_BASE_URL}/payments/admin/dashboard`,
  },

  // ==================== CART ====================
  CART: {
    GET: (userId) => `${API_BASE_URL}/payments/cart/${userId}`,
    ADD: `${API_BASE_URL}/payments/cart/add`,
    REMOVE: `${API_BASE_URL}/payments/cart/remove`,
    CLEAR: (userId) => `${API_BASE_URL}/payments/cart/${userId}`,
  },

  // ==================== RECEIPTS ====================
  RECEIPTS: {
    CREATE: `${API_BASE_URL}/payments/receipt/create`,
    GET: (receiptId) => `${API_BASE_URL}/payments/receipt/${receiptId}`,
    GET_USER: (userId) => `${API_BASE_URL}/payments/receipts/${userId}`,
    GET_ALL_ADMIN: `${API_BASE_URL}/payments/admin/receipts`,
  },

  // ==================== REFUNDS ====================
  REFUNDS: {
    REQUEST: `${API_BASE_URL}/payments/refund/request`,
    GET_USER: (userId) => `${API_BASE_URL}/payments/refunds/${userId}`,
    APPROVE: `${API_BASE_URL}/payments/refund/approve`,
    REJECT: `${API_BASE_URL}/payments/refund/reject`,
    PROCESS: `${API_BASE_URL}/payments/refund/process`,
    GET_ALL_ADMIN: `${API_BASE_URL}/payments/admin/refunds`,
  },

  // ==================== WALLET ====================
  WALLET: {
    GET_BALANCE: (userId) => `${API_BASE_URL}/payments/wallet/${userId}`,
    GET_TRANSACTIONS: (userId) => `${API_BASE_URL}/payments/transactions/${userId}`,
    ADD_FUNDS: `${API_BASE_URL}/payments/wallet/add`,
    BUY_ALBUM: (albumId) => `${API_BASE_URL}/payments/album/${albumId}/buy`,
    CHECK_ALBUM_PURCHASED: (albumId) => `${API_BASE_URL}/payments/album/${albumId}/purchased`,
  },

  // ==================== ADMIN ====================
  ADMIN: {
    BASE: `${API_BASE_URL}/admin`,
    SETTINGS: `${API_BASE_URL}/admin/settings`,
    UPDATE_SETTINGS: `${API_BASE_URL}/admin/settings`,
    PLATFORM_FEE: `${API_BASE_URL}/admin/settings/platform-fee`,
    PAYOUT: `${API_BASE_URL}/admin/settings/payout`,
    TEST_EMAIL: `${API_BASE_URL}/admin/settings/test-email`,
    CLEAR_CACHE: `${API_BASE_URL}/admin/clear-cache`,
    MAINTENANCE_MODE: `${API_BASE_URL}/admin/maintenance-mode`,
    AUDIT_PURCHASES: `${API_BASE_URL}/admin/audit/purchases`,
    // User management
    BAN_USER: (id) => `${API_BASE_URL}/admin/users/${id}/ban`,
    SET_ROLE: (id) => `${API_BASE_URL}/admin/users/${id}/role`,
    VERIFY_USER: (id) => `${API_BASE_URL}/admin/users/${id}/verify`,
    // Withdrawals
    GET_WITHDRAWALS: `${API_BASE_URL}/admin/withdrawals`,
    PROCESS_WITHDRAWAL: (id) => `${API_BASE_URL}/admin/withdrawals/${id}/process`,
    // Albums
    GET_ALBUMS: `${API_BASE_URL}/admin/albums`,
    DELETE_ALBUM: (id) => `${API_BASE_URL}/admin/albums/${id}`,
    // Share links
    GET_SHARES: `${API_BASE_URL}/admin/shares`,
    REVOKE_SHARE: (token) => `${API_BASE_URL}/admin/shares/${token}`,
    // Wallets
    GET_WALLETS: `${API_BASE_URL}/admin/wallets`,
    ADJUST_WALLET: (userId) => `${API_BASE_URL}/admin/wallets/${userId}/adjust`,
    // Analytics
    ANALYTICS_OVERVIEW: `${API_BASE_URL}/admin/analytics/overview`,
    ANALYTICS_REVENUE: `${API_BASE_URL}/admin/analytics/revenue`,
    ANALYTICS_SIGNUPS: `${API_BASE_URL}/admin/analytics/signups`,
    ANALYTICS_TOP_PHOTOGRAPHERS: `${API_BASE_URL}/admin/analytics/top-photographers`,
    EXPORT_USERS: `${API_BASE_URL}/admin/export/users`,
    EXPORT_TRANSACTIONS: `${API_BASE_URL}/admin/export/transactions`,
    MODERATION_LIST: `${API_BASE_URL}/admin/moderation`,
    MODERATION_APPROVE: (id) => `${API_BASE_URL}/admin/moderation/${id}/approve`,
    MODERATION_REJECT: (id) => `${API_BASE_URL}/admin/moderation/${id}/reject`,
  },

  // ==================== SHARE ====================
  SHARE: {
    GENERATE: `${API_BASE_URL}/share/generate`,
    ACCESS: (token) => `${API_BASE_URL}/share/${token}`,
    DOWNLOAD: (token) => `${API_BASE_URL}/share/${token}/download`,
    LIST: `${API_BASE_URL}/share/list`,
    STATS: (token) => `${API_BASE_URL}/share/${token}/stats`,
    REVOKE: (token) => `${API_BASE_URL}/share/${token}/revoke`,
    PURCHASE: (token) => `${API_BASE_URL}/share/${token}/purchase`,
    PAYMENT_STATUS: (token, requestId) => `${API_BASE_URL}/share/${token}/payment/${requestId}`,
  },

  // ==================== NOTIFICATIONS ====================
  NOTIFICATIONS: {
    GET: `${API_BASE_URL}/notifications`,
    GET_UNREAD: `${API_BASE_URL}/notifications?unreadOnly=true`,
    MARK_READ: (id) => `${API_BASE_URL}/notifications/${id}/read`,
    MARK_ALL_READ: `${API_BASE_URL}/notifications/read/all`,
    DELETE: (id) => `${API_BASE_URL}/notifications/${id}`,
    SEND_SHARE: `${API_BASE_URL}/notifications/share/send`,
    SEARCH_USERS: `${API_BASE_URL}/notifications/share/search-recipients`,
    ADMIN_SHARES: `${API_BASE_URL}/notifications/admin/shares`,
    ADMIN_STATS: `${API_BASE_URL}/notifications/admin/stats`,
  },

  // ==================== MESSAGING ====================
  MESSAGING: {
    GET_CONVERSATIONS: `${API_BASE_URL}/messages/conversations`,
    GET_CONVERSATION: (otherUserId) => `${API_BASE_URL}/messages/conversations/${otherUserId}`,
    GET_MESSAGES: (conversationId) => `${API_BASE_URL}/messages/conversations/${conversationId}/messages`,
    SEND_MESSAGE: `${API_BASE_URL}/messages/`,
    EDIT_MESSAGE: (messageId) => `${API_BASE_URL}/messages/${messageId}`,
    DELETE_MESSAGE: (messageId) => `${API_BASE_URL}/messages/${messageId}`,
    MARK_READ: (conversationId) => `${API_BASE_URL}/messages/conversations/${conversationId}/read`,
    ARCHIVE: (conversationId) => `${API_BASE_URL}/messages/conversations/${conversationId}/archive`,
    UNARCHIVE: (conversationId) => `${API_BASE_URL}/messages/conversations/${conversationId}/unarchive`,
    ADD_REACTION: (messageId) => `${API_BASE_URL}/messages/${messageId}/reactions`,
    REMOVE_REACTION: (messageId) => `${API_BASE_URL}/messages/${messageId}/reactions`,
  },

  // ==================== PORTFOLIO ====================
  PORTFOLIO: {
    GET_MY: `${API_BASE_URL}/portfolio/me`,
    SAVE: `${API_BASE_URL}/portfolio`,
    GET_PUBLIC: (username) => `${API_BASE_URL}/portfolio/${username}`,
    ADMIN_GET_ALL: `${API_BASE_URL}/portfolio/admin/all`,
    ADMIN_TOGGLE_PUBLISH: (id) => `${API_BASE_URL}/portfolio/admin/${id}/toggle-publish`,
    ADMIN_PREVIEW: (id) => `${API_BASE_URL}/portfolio/admin/${id}/preview`,
    ADMIN_DELETE: (id) => `${API_BASE_URL}/portfolio/admin/${id}`,
  },

  // ==================== WITHDRAWALS ====================
  WITHDRAWALS: {
    REQUEST: `${API_BASE_URL}/withdrawals/request`,
    GET_MY: `${API_BASE_URL}/withdrawals/my`,
    GET_ALL: `${API_BASE_URL}/withdrawals/all`,
    PROCESS: (id) => `${API_BASE_URL}/withdrawals/${id}/process`,
  },

  // ==================== REVIEWS ====================
  REVIEWS: {
    CREATE: `${API_BASE_URL}/reviews`,
    BY_PHOTOGRAPHER: (id) => `${API_BASE_URL}/reviews/photographer/${id}`,
    BY_MEDIA: (id) => `${API_BASE_URL}/reviews/media/${id}`,
    DELETE: (id) => `${API_BASE_URL}/reviews/${id}`,
  },

  // ==================== REFERRAL ====================
  REFERRAL: {
    MY_CODE: `${API_BASE_URL}/referral/my-code`,
    STATS: `${API_BASE_URL}/referral/stats`,
  },

  // ==================== PROOFING ====================
  PROOFING: {
    CREATE: `${API_BASE_URL}/proofing`,
    MY_GALLERIES: `${API_BASE_URL}/proofing/my`,
    GET: (token) => `${API_BASE_URL}/proofing/${token}`,
    APPROVE_PHOTO: (token, mediaId) => `${API_BASE_URL}/proofing/${token}/approve/${mediaId}`,
    DELETE: (id) => `${API_BASE_URL}/proofing/${id}`,
  },
};

export { API_BASE_URL, API_ENDPOINTS };