import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "./apiConfig";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const get = (url, config) => api.get(url, config);
const post = (url, data, config) => api.post(url, data, config);
const put = (url, data, config) => api.put(url, data, config);
const remove = (url, config) => api.delete(url, config);

// Media
export const getAllMedia = () => get(API_ENDPOINTS.MEDIA.GET_ALL);
export const getMediaById = (id) => get(API_ENDPOINTS.MEDIA.GET_ONE(id));
export const deleteMedia = (id) => remove(API_ENDPOINTS.MEDIA.DELETE(id));
export const updateMedia = (id, payload) => put(API_ENDPOINTS.MEDIA.UPDATE(id), payload);
export const updateMediaPrice = (id, price) => put(API_ENDPOINTS.MEDIA.UPDATE_PRICE(id), { price });
export const uploadMedia = (formData, config = {}) =>
  api.post(API_ENDPOINTS.MEDIA.CREATE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...config,
  });

// Auth
export const login = (credentials) => post(API_ENDPOINTS.AUTH.LOGIN, credentials);
export const register = (data) => post(API_ENDPOINTS.AUTH.REGISTER, data);
export const getUsers = () => get(API_ENDPOINTS.AUTH.GET_USERS);
export const getUser = (id) => get(API_ENDPOINTS.AUTH.GET_USER(id));
export const updateUser = (id, payload) => put(API_ENDPOINTS.AUTH.UPDATE_USER(id), payload);
export const deleteUser = (id) => remove(API_ENDPOINTS.AUTH.DELETE_USER(id));

// Payments
export const getPurchaseHistory = (userId) => get(API_ENDPOINTS.PAYMENTS.PURCHASE_HISTORY(userId));
export const getUserFavorites = () => get(API_ENDPOINTS.USERS.FAVORITES);
export const getEarnings = (photographerId) => get(API_ENDPOINTS.PAYMENTS.EARNINGS(photographerId));
export const getEarningsSummary = (photographerId) => get(API_ENDPOINTS.PAYMENTS.EARNINGS_SUMMARY(photographerId));
export const mpesa = (payload) => post(API_ENDPOINTS.PAYMENTS.MPESA, payload);
export const buy = (payload) => post(API_ENDPOINTS.PAYMENTS.BUY, payload);

// Cart
export const getCart = (userId) => get(API_ENDPOINTS.CART.GET(userId));
export const addCart = (payload) => post(API_ENDPOINTS.CART.ADD, payload);
export const removeCart = (payload) => post(API_ENDPOINTS.CART.REMOVE, payload);
export const clearCart = (userId) => remove(API_ENDPOINTS.CART.CLEAR(userId));

// Receipts / refunds
export const createReceipt = (payload) => post(API_ENDPOINTS.RECEIPTS.CREATE, payload);
export const getReceipt = (id) => get(API_ENDPOINTS.RECEIPTS.GET(id));
export const getReceiptsByUser = (userId) => get(API_ENDPOINTS.RECEIPTS.GET_USER(userId));
export const getAllAdminReceipts = () => get(API_ENDPOINTS.RECEIPTS.GET_ALL_ADMIN);

export const requestRefund = (payload) => post(API_ENDPOINTS.REFUNDS.REQUEST, payload);
export const getRefundsByUser = (userId) => get(API_ENDPOINTS.REFUNDS.GET_USER(userId));
export const approveRefund = (payload) => post(API_ENDPOINTS.REFUNDS.APPROVE, payload);
export const rejectRefund = (payload) => post(API_ENDPOINTS.REFUNDS.REJECT, payload);
export const processRefund = (payload) => post(API_ENDPOINTS.REFUNDS.PROCESS, payload);
export const getAllAdminRefunds = () => get(API_ENDPOINTS.REFUNDS.GET_ALL_ADMIN);

// Wallet
export const getWalletBalance = (userId) => get(API_ENDPOINTS.WALLET.GET_BALANCE(userId));
export const getWalletTransactions = (userId) => get(API_ENDPOINTS.WALLET.GET_TRANSACTIONS(userId));
export const addWalletFunds = (payload) => post(API_ENDPOINTS.WALLET.ADD_FUNDS, payload);

// Health/test
export const healthCheck = () => get(API_ENDPOINTS.MEDIA.GET_ALL);

export default {
  api,
  get,
  post,
  put,
  remove,
  getAllMedia,
  getMediaById,
  deleteMedia,
  updateMedia,
  updateMediaPrice,
  uploadMedia,
  login,
  register,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getPurchaseHistory,
  getUserFavorites,
  getEarnings,
  getEarningsSummary,
  mpesa,
  buy,
  getCart,
  addCart,
  removeCart,
  clearCart,
  createReceipt,
  getReceipt,
  getReceiptsByUser,
  getAllAdminReceipts,
  requestRefund,
  getRefundsByUser,
  approveRefund,
  rejectRefund,
  processRefund,
  getAllAdminRefunds,
  getWalletBalance,
  getWalletTransactions,
  addWalletFunds,
  healthCheck,
};
