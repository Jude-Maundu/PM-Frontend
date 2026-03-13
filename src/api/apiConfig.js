/**
 * API Configuration File
 * Central location for all API endpoints
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 
                    //  "https://pm-backend-1-0s8f.onrender.com/api";
                      "https://pm-backend-1-0.onrender.com/api";

// Alternative: For local development, use:
// const API_BASE_URL = "http://localhost:4000/api";

const API_ENDPOINTS = {
  // ==================== AUTH ====================
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    GET_USERS: `${API_BASE_URL}/auth/users`,
    GET_USER: (id) => `${API_BASE_URL}/auth/users/${id}`,
    UPDATE_USER: (id) => `${API_BASE_URL}/auth/users/${id}`,
    DELETE_USER: (id) => `${API_BASE_URL}/auth/users/${id}`,
    UPDATE_PHONE: (id) => `${API_BASE_URL}/auth/photographers/${id}/phone`,
  },

  // ==================== MEDIA ====================
  MEDIA: {
    GET_ALL: `${API_BASE_URL}/media`,
    GET_ONE: (id) => `${API_BASE_URL}/media/${id}`,
    GET_PROTECTED: (id) => `${API_BASE_URL}/media/${id}/protected`,
    CREATE: `${API_BASE_URL}/media`,
    UPDATE: (id) => `${API_BASE_URL}/media/${id}`,
    UPDATE_PRICE: (id) => `${API_BASE_URL}/media/${id}/price`,
    DELETE: (id) => `${API_BASE_URL}/media/${id}`,
  },

  // ==================== PAYMENTS ====================
  PAYMENTS: {
    MPESA: `${API_BASE_URL}/payments/mpesa`,
    CALLBACK: `${API_BASE_URL}/payments/callback`,
    BUY: `${API_BASE_URL}/payments/buy`,
    PURCHASE_HISTORY: (userId) => `${API_BASE_URL}/payments/purchase-history/${userId}`,
    EARNINGS: (photographerId) => `${API_BASE_URL}/payments/earnings/${photographerId}`,
    EARNINGS_SUMMARY: (photographerId) => `${API_BASE_URL}/payments/earnings-summary/${photographerId}`,
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
  },
};

export { API_BASE_URL, API_ENDPOINTS };
