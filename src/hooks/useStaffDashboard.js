import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../api/apiConfig";
import { useSocket } from "./useSocket";
import { getStoredUser } from "../utils/auth";

const CACHE_PREFIX = "staff-dashboard-cache:";

function readCache(role) {
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${role}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(role, value) {
  try {
    sessionStorage.setItem(`${CACHE_PREFIX}${role}`, JSON.stringify(value));
  } catch {
    // ignore cache failures
  }
}

export function useStaffDashboard(role) {
  const user = useMemo(() => getStoredUser(), []);
  const userId = user?._id || user?.id || null;
  const socket = useSocket(userId);
  const cached = useMemo(() => readCache(role), [role]);

  const [data, setData] = useState(cached?.data || null);
  const [loading, setLoading] = useState(!cached?.data);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(cached?.generatedAt || null);

  const fetchDashboard = useCallback(async (mode = "refresh") => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Missing authentication token");
      setLoading(false);
      return;
    }

    if (mode === "initial") {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const res = await axios.get(API_ENDPOINTS.ADMIN.STAFF_DASHBOARD(role), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = {
        data: res.data?.data || null,
        generatedAt: res.data?.generatedAt || new Date().toISOString(),
      };
      setData(payload.data);
      setLastUpdated(payload.generatedAt);
      setError(null);
      writeCache(role, payload);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [role]);

  useEffect(() => {
    fetchDashboard(cached?.data ? "refresh" : "initial");
  }, [fetchDashboard, cached?.data]);

  useEffect(() => {
    if (!socket) return undefined;

    let refreshTimer = null;
    const triggerRefresh = (payload = {}) => {
      if (payload.role && payload.role !== role && payload.role !== "admin") return;
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        fetchDashboard("refresh");
      }, 250);
    };

    socket.on("staff:dashboard:refresh", triggerRefresh);
    socket.on("notification", triggerRefresh);
    socket.on("new_message", triggerRefresh);
    socket.on("user_online", triggerRefresh);
    socket.on("user_offline", triggerRefresh);

    return () => {
      clearTimeout(refreshTimer);
      socket.off("staff:dashboard:refresh", triggerRefresh);
      socket.off("notification", triggerRefresh);
      socket.off("new_message", triggerRefresh);
      socket.off("user_online", triggerRefresh);
      socket.off("user_offline", triggerRefresh);
    };
  }, [socket, role, fetchDashboard]);

  return {
    data,
    loading,
    refreshing,
    error,
    lastUpdated,
    refresh: fetchDashboard,
  };
}

export default useStaffDashboard;
